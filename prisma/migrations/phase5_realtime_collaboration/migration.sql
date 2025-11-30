

-- Comment table for inline commenting
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "workspaceId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "location" JSONB NOT NULL, -- { type: 'json' | 'toon' | 'rule', path?: string, line?: number, nodeId?: string }
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "parentId" TEXT, -- For threaded replies
    "mentions" TEXT[], -- User IDs mentioned in comment
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "Comment_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE,
    CONSTRAINT "Comment_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE,
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE CASCADE
);

-- Indexes for Comment table
CREATE INDEX "Comment_workspaceId_idx" ON "Comment"("workspaceId");
CREATE INDEX "Comment_promptId_idx" ON "Comment"("promptId");
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");
CREATE INDEX "Comment_resolved_idx" ON "Comment"("resolved");
CREATE INDEX "Comment_createdAt_idx" ON "Comment"("createdAt");

-- Collaborative session tracking (for CRDT state persistence)
CREATE TABLE "CollaborativeSession" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "promptId" TEXT NOT NULL,
    "ydocState" BYTEA, -- Y.js document state
    "version" INTEGER NOT NULL DEFAULT 0,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "CollaborativeSession_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE
);

-- Unique constraint: one session per prompt
CREATE UNIQUE INDEX "CollaborativeSession_promptId_key" ON "CollaborativeSession"("promptId");
CREATE INDEX "CollaborativeSession_lastSyncedAt_idx" ON "CollaborativeSession"("lastSyncedAt");

-- Collaboration history for tracking who changed what
CREATE TABLE "CollaborationHistory" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "promptId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "changeType" TEXT NOT NULL, -- 'json_edit', 'toon_edit', 'rule_add', 'rule_delete', etc.
    "changePath" TEXT, -- JSON path or line number
    "oldValue" TEXT,
    "newValue" TEXT,
    "metadata" JSONB, -- Additional context
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "CollaborationHistory_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE,
    CONSTRAINT "CollaborationHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "CollaborationHistory_promptId_idx" ON "CollaborationHistory"("promptId");
CREATE INDEX "CollaborationHistory_userId_idx" ON "CollaborationHistory"("userId");
CREATE INDEX "CollaborationHistory_createdAt_idx" ON "CollaborationHistory"("createdAt");

-- Add new audit actions for realtime collaboration
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'COMMENT_ADDED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'COMMENT_RESOLVED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'COMMENT_DELETED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'REALTIME_SESSION_JOINED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'REALTIME_SESSION_LEFT';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'COLLABORATIVE_EDIT';

-- Row Level Security Policies

-- Comments: Users can only see comments in workspaces they're members of
ALTER TABLE "Comment" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments in their workspaces"
    ON "Comment" FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM "WorkspaceMember"
            WHERE "WorkspaceMember"."workspaceId" = "Comment"."workspaceId"
            AND "WorkspaceMember"."userId" = current_setting('app.current_user_id', true)::text
        )
    );

CREATE POLICY "Users can create comments in their workspaces"
    ON "Comment" FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "WorkspaceMember"
            WHERE "WorkspaceMember"."workspaceId" = "Comment"."workspaceId"
            AND "WorkspaceMember"."userId" = current_setting('app.current_user_id', true)::text
        )
    );

CREATE POLICY "Users can update their own comments"
    ON "Comment" FOR UPDATE
    USING ("userId" = current_setting('app.current_user_id', true)::text);

CREATE POLICY "Users can delete their own comments or admins can delete any"
    ON "Comment" FOR DELETE
    USING (
        "userId" = current_setting('app.current_user_id', true)::text
        OR EXISTS (
            SELECT 1 FROM "WorkspaceMember"
            WHERE "WorkspaceMember"."workspaceId" = "Comment"."workspaceId"
            AND "WorkspaceMember"."userId" = current_setting('app.current_user_id', true)::text
            AND "WorkspaceMember"."role" IN ('OWNER', 'ADMIN')
        )
    );

-- Collaborative Sessions: Only workspace members can access
ALTER TABLE "CollaborativeSession" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sessions in their workspace prompts"
    ON "CollaborativeSession" FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM "Prompt"
            INNER JOIN "WorkspaceMember" ON "Prompt"."workspaceId" = "WorkspaceMember"."workspaceId"
            WHERE "Prompt"."id" = "CollaborativeSession"."promptId"
            AND "WorkspaceMember"."userId" = current_setting('app.current_user_id', true)::text
        )
    );

CREATE POLICY "Users can update sessions in their workspace prompts"
    ON "CollaborativeSession" FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM "Prompt"
            INNER JOIN "WorkspaceMember" ON "Prompt"."workspaceId" = "WorkspaceMember"."workspaceId"
            WHERE "Prompt"."id" = "CollaborativeSession"."promptId"
            AND "WorkspaceMember"."userId" = current_setting('app.current_user_id', true)::text
            AND "WorkspaceMember"."role" IN ('OWNER', 'ADMIN', 'MEMBER')
        )
    );

-- Collaboration History: Read-only for workspace members
ALTER TABLE "CollaborationHistory" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view collaboration history in their workspaces"
    ON "CollaborationHistory" FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM "Prompt"
            INNER JOIN "WorkspaceMember" ON "Prompt"."workspaceId" = "WorkspaceMember"."workspaceId"
            WHERE "Prompt"."id" = "CollaborationHistory"."promptId"
            AND "WorkspaceMember"."userId" = current_setting('app.current_user_id', true)::text
        )
    );
