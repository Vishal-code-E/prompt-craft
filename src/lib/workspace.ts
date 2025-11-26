import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { MemberRole, WorkspacePlan } from './types';

export { MemberRole, WorkspacePlan };

export interface WorkspaceWithRole {
  id: string;
  name: string;
  plan: WorkspacePlan;
  role: MemberRole;
  ownerId: string;
}

/**
 * Get current user session or throw error
 */
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
}

/**
 * Get user's workspaces with their roles
 */
export async function getUserWorkspaces(userId: string): Promise<WorkspaceWithRole[]> {
  const workspaces = await prisma.workspace.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
      ],
    },
    include: {
      members: {
        where: { userId },
      },
    },
  });

  type WorkspaceQueryResult = typeof workspaces[number];

  return workspaces.map((workspace: WorkspaceQueryResult) => ({
    id: workspace.id,
    name: workspace.name,
    plan: workspace.plan,
    role: workspace.ownerId === userId ? MemberRole.OWNER : workspace.members[0]?.role || MemberRole.VIEWER,
    ownerId: workspace.ownerId,
  }));
}

/**
 * Check if user has access to workspace with minimum role
 */
export async function checkWorkspaceAccess(
  userId: string,
  workspaceId: string,
  minimumRole: MemberRole = MemberRole.VIEWER
): Promise<boolean> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: {
        where: { userId },
      },
    },
  });

  if (!workspace) return false;
  
  // Owner has all access
  if (workspace.ownerId === userId) return true;

  const member = workspace.members[0];
  if (!member) return false;

  const roleHierarchy: Record<MemberRole, number> = {
    [MemberRole.OWNER]: 4,
    [MemberRole.ADMIN]: 3,
    [MemberRole.MEMBER]: 2,
    [MemberRole.VIEWER]: 1,
  };

  return roleHierarchy[member.role as MemberRole] >= roleHierarchy[minimumRole];
}

/**
 * Get workspace with user's role
 */
export async function getWorkspaceWithRole(
  userId: string,
  workspaceId: string
): Promise<WorkspaceWithRole | null> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: {
        where: { userId },
      },
    },
  });

  if (!workspace) return null;

  const isOwner = workspace.ownerId === userId;
  const role = isOwner ? MemberRole.OWNER : workspace.members[0]?.role;

  if (!role) return null;

  return {
    id: workspace.id,
    name: workspace.name,
    plan: workspace.plan,
    role,
    ownerId: workspace.ownerId,
  };
}

/**
 * Check if workspace can create more prompts based on plan
 */
export async function checkPromptLimit(workspaceId: string): Promise<boolean> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      _count: {
        select: { prompts: true },
      },
    },
  });

  if (!workspace) return false;

  const limits: Record<WorkspacePlan, number> = {
    [WorkspacePlan.FREE]: 10,
    [WorkspacePlan.PRO]: 500,
    [WorkspacePlan.TEAM]: Infinity,
  };

  return workspace._count.prompts < limits[workspace.plan as WorkspacePlan];
}

/**
 * Check if workspace can create public shares based on plan
 */
export function canCreatePublicShare(plan: WorkspacePlan): boolean {
  return plan !== WorkspacePlan.FREE;
}

/**
 * Get user's default workspace or create one
 */
export async function getOrCreateDefaultWorkspace(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { defaultWorkspace: true },
  });

  if (user?.defaultWorkspaceId && user.defaultWorkspace) {
    return user.defaultWorkspaceId;
  }

  // Find or create a workspace
  const existingWorkspace = await prisma.workspace.findFirst({
    where: { ownerId: userId },
  });

  if (existingWorkspace) {
    await prisma.user.update({
      where: { id: userId },
      data: { defaultWorkspaceId: existingWorkspace.id },
    });
    return existingWorkspace.id;
  }

  // Create new workspace
  const newWorkspace = await prisma.workspace.create({
    data: {
      name: 'My Workspace',
      ownerId: userId,
      plan: WorkspacePlan.FREE,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { defaultWorkspaceId: newWorkspace.id },
  });

  return newWorkspace.id;
}
