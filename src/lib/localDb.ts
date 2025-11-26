import localforage from 'localforage';

// Database configuration
const promptsDB = localforage.createInstance({
  name: 'PromptCraftDB',
  storeName: 'prompts',
  description: 'Stores saved prompts with metadata and versions',
});

const versionsDB = localforage.createInstance({
  name: 'PromptCraftDB',
  storeName: 'versions',
  description: 'Stores version history for prompts',
});

// Types
export interface PromptMetadata {
  id: string;
  name: string;
  json: Record<string, unknown>;
  toon: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  description?: string;
}

export interface PromptVersion {
  id: string;
  promptId: string;
  version: number;
  json: Record<string, unknown>;
  toon: string;
  createdAt: number;
  changes?: string;
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Save a new prompt
 */
export async function savePrompt(
  name: string,
  json: Record<string, unknown>,
  toon: string,
  tags: string[] = [],
  description?: string
): Promise<PromptMetadata> {
  const id = generateId();
  const now = Date.now();

  const metadata: PromptMetadata = {
    id,
    name,
    json,
    toon,
    createdAt: now,
    updatedAt: now,
    tags,
    description,
  };

  await promptsDB.setItem(id, metadata);

  // Save initial version
  await saveVersion(id, json, toon, 'Initial version');

  return metadata;
}

/**
 * Update an existing prompt
 */
export async function updatePrompt(
  id: string,
  updates: Partial<Omit<PromptMetadata, 'id' | 'createdAt'>>
): Promise<PromptMetadata> {
  const existing = await promptsDB.getItem<PromptMetadata>(id);
  if (!existing) {
    throw new Error('Prompt not found');
  }

  const updated: PromptMetadata = {
    ...existing,
    ...updates,
    updatedAt: Date.now(),
  };

  await promptsDB.setItem(id, updated);

  // Save new version if JSON or TOON changed
  if (updates.json || updates.toon) {
    await saveVersion(
      id,
      updates.json || existing.json,
      updates.toon || existing.toon,
      'Updated'
    );
  }

  return updated;
}

/**
 * Get a prompt by ID
 */
export async function getPrompt(id: string): Promise<PromptMetadata | null> {
  return await promptsDB.getItem<PromptMetadata>(id);
}

/**
 * Get all prompts
 */
export async function getAllPrompts(): Promise<PromptMetadata[]> {
  const prompts: PromptMetadata[] = [];
  await promptsDB.iterate<PromptMetadata, void>((value) => {
    prompts.push(value);
  });
  return prompts.sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Delete a prompt and its versions
 */
export async function deletePrompt(id: string): Promise<void> {
  await promptsDB.removeItem(id);

  // Delete all versions
  const versions = await getVersions(id);
  for (const version of versions) {
    await versionsDB.removeItem(`${id}-${version.version}`);
  }
}

/**
 * Search prompts by name or tags
 */
export async function searchPrompts(query: string): Promise<PromptMetadata[]> {
  const allPrompts = await getAllPrompts();
  const lowerQuery = query.toLowerCase();

  return allPrompts.filter(
    (prompt) =>
      prompt.name.toLowerCase().includes(lowerQuery) ||
      prompt.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      prompt.description?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Save a new version of a prompt
 */
async function saveVersion(
  promptId: string,
  json: Record<string, unknown>,
  toon: string,
  changes: string
): Promise<PromptVersion> {
  const versions = await getVersions(promptId);
  const version = versions.length + 1;
  const id = `${promptId}-${version}`;

  const versionData: PromptVersion = {
    id,
    promptId,
    version,
    json,
    toon,
    createdAt: Date.now(),
    changes,
  };

  await versionsDB.setItem(id, versionData);
  return versionData;
}

/**
 * Get all versions of a prompt
 */
export async function getVersions(promptId: string): Promise<PromptVersion[]> {
  const versions: PromptVersion[] = [];
  await versionsDB.iterate<PromptVersion, void>((value) => {
    if (value.promptId === promptId) {
      versions.push(value);
    }
  });
  return versions.sort((a, b) => b.version - a.version);
}

/**
 * Restore a specific version
 */
export async function restoreVersion(
  promptId: string,
  version: number
): Promise<PromptMetadata> {
  const versionData = await versionsDB.getItem<PromptVersion>(`${promptId}-${version}`);
  if (!versionData) {
    throw new Error('Version not found');
  }

  return await updatePrompt(promptId, {
    json: versionData.json,
    toon: versionData.toon,
  });
}

/**
 * Duplicate a prompt
 */
export async function duplicatePrompt(id: string): Promise<PromptMetadata> {
  const original = await getPrompt(id);
  if (!original) {
    throw new Error('Prompt not found');
  }

  return await savePrompt(
    `${original.name} (Copy)`,
    original.json,
    original.toon,
    original.tags,
    original.description
  );
}

/**
 * Export prompt as JSON file
 */
export function exportPrompt(prompt: PromptMetadata): string {
  return JSON.stringify(prompt, null, 2);
}

/**
 * Import prompt from JSON
 */
export async function importPrompt(jsonString: string): Promise<PromptMetadata> {
  const data = JSON.parse(jsonString);
  return await savePrompt(
    data.name || 'Imported Prompt',
    data.json || {},
    data.toon || '',
    data.tags || [],
    data.description
  );
}
