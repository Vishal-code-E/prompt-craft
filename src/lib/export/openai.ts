/**
 * Generate OpenAI API payload from prompt JSON
 */
export function generateOpenAIPayload(promptJson: Record<string, unknown>): {
  payload: Record<string, unknown>;
  curl: string;
} {
  const systemPrompt = buildSystemPrompt(promptJson);
  const userPrompt = buildUserPrompt(promptJson);

  const limits = promptJson.limits as Record<string, unknown> | undefined;
  const maxWords = limits?.maxWords as number | undefined;
  
  const payload = {
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    temperature: 0.7,
    max_tokens: maxWords ? maxWords * 2 : 2000,
  };

  const curl = `curl https://api.openai.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $OPENAI_API_KEY" \\
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


export function generateOpenAICode(promptJson: Record<string, unknown>): string {
  const systemPrompt = buildSystemPrompt(promptJson);
  
  const limits = promptJson.limits as Record<string, unknown> | undefined;
  const maxWords = limits?.maxWords as number | undefined;

  return `import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateContent() {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: ${JSON.stringify(systemPrompt)},
      },
      {
        role: 'user',
        content: 'Your input here',
      },
    ],
    temperature: 0.7,
    max_tokens: ${maxWords ? maxWords * 2 : 2000},
  });

  return completion.choices[0].message.content;
}

generateContent().then(console.log);`;
}
