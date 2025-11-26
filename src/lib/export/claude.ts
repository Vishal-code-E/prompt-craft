/**
 * Generate Claude API payload from prompt JSON
 */
export function generateClaudePayload(promptJson: Record<string, unknown>): {
  payload: Record<string, unknown>;
  curl: string;
} {
  const systemPrompt = buildSystemPrompt(promptJson);
  const userPrompt = buildUserPrompt(promptJson);

  const payload = {
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: getMaxTokens(promptJson),
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    system: systemPrompt,
    temperature: 0.7,
  };

  const curl = `curl https://api.anthropic.com/v1/messages \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: $ANTHROPIC_API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -d '${JSON.stringify(payload, null, 2)}'`;

  return { payload, curl };
}

/**
 * Build system prompt from JSON
 */
function buildSystemPrompt(promptJson: Record<string, unknown>): string {
  const parts: string[] = [];

  if (promptJson.task) {
    parts.push(`Task: ${promptJson.task}`);
  }

  if (Array.isArray(promptJson.rules) && promptJson.rules.length > 0) {
    parts.push(`\nRules:\n${promptJson.rules.map((r: string) => `- ${r}`).join('\n')}`);
  }

  if (promptJson.storyConfig) {
    const config = promptJson.storyConfig as Record<string, unknown>;
    parts.push(`\nStory Configuration:`);
    if (config.genre) parts.push(`Genre: ${config.genre}`);
    if (config.plot) parts.push(`Plot: ${config.plot}`);
    if (Array.isArray(config.specifics) && config.specifics.length > 0) {
      parts.push(`Specifics:\n${config.specifics.map((s: string) => `- ${s}`).join('\n')}`);
    }
  }

  if (promptJson.moderation) {
    const mod = promptJson.moderation as Record<string, unknown>;
    parts.push(`\nModeration:`);
    parts.push(`Allow Vulgar Content: ${mod.allowVulgar ? 'Yes' : 'No'}`);
    parts.push(`Allow Cussing: ${mod.allowCussing ? 'Yes' : 'No'}`);
  }

  if (promptJson.limits) {
    const limits = promptJson.limits as Record<string, unknown>;
    parts.push(`\nLimits:`);
    if (limits.minWords) parts.push(`Minimum Words: ${limits.minWords}`);
    if (limits.maxWords) parts.push(`Maximum Words: ${limits.maxWords}`);
    if (limits.maxChapters) parts.push(`Maximum Chapters: ${limits.maxChapters}`);
    if (limits.uniqueness) parts.push(`Uniqueness: ${limits.uniqueness}%`);
  }

  return parts.join('\n');
}

/**
 * Build user prompt
 */
function buildUserPrompt(promptJson: Record<string, unknown>): string {
  return promptJson.task as string || 'Generate content based on the system instructions.';
}

/**
 * Get max tokens based on prompt limits
 */
function getMaxTokens(promptJson: Record<string, unknown>): number {
  const limits = promptJson.limits as Record<string, unknown> | undefined;
  if (limits && typeof limits.maxWords === 'number') {
    return Math.min(limits.maxWords * 2, 4096);
  }
  return 2000;
}

/**
 * Generate code example for Claude SDK
 */
export function generateClaudeCode(promptJson: Record<string, unknown>): string {
  const systemPrompt = buildSystemPrompt(promptJson);
  const userPrompt = buildUserPrompt(promptJson);
  const maxTokens = getMaxTokens(promptJson);

  return `import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function generateContent() {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: ${maxTokens},
    messages: [
      {
        role: 'user',
        content: ${JSON.stringify(userPrompt)},
      },
    ],
    system: ${JSON.stringify(systemPrompt)},
    temperature: 0.7,
  });

  return message.content[0].text;
}

generateContent().then(console.log);`;
}
