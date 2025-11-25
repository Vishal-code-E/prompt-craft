# Phase 2: AI-Powered Prompt Builder - Setup Guide

## Environment Configuration

Phase 2 requires an LLM API key to function. You need to configure **ONE** of the following providers:

### Option 1: OpenAI (Recommended)

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to `.env.local`:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### Option 2: Anthropic Claude

1. Get your API key from [Anthropic Console](https://console.anthropic.com/)
2. Add to `.env.local`:
   ```
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

### Option 3: Google Gemini (Coming Soon)

```
GOOGLE_API_KEY=your_google_api_key_here
```

### Option 4: Cohere (Coming Soon)

```
COHERE_API_KEY=your_cohere_api_key_here
```

### Option 5: Local Model (Coming Soon)

```
LOCAL_MODEL_ENDPOINT=http://localhost:11434
```

## Available Models

### OpenAI
- `gpt-4o` (default, recommended)
- `gpt-4-turbo`
- `gpt-4`
- `gpt-3.5-turbo`

### Anthropic
- `claude-3-5-sonnet-20241022` (default, recommended)
- `claude-3-opus-20240229`
- `claude-3-sonnet-20240229`

## Testing the API

Once configured, test the generation endpoint:

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"input": "Create a sci-fi story about a robot discovering emotions, 100-150 words, no cussing"}'
```

Expected response:
```json
{
  "success": true,
  "json": { ... },
  "toon": "STORY { ... }"
}
```

## Features

- **Natural Language → JSON**: Convert plain English to structured prompt format
- **TOON DSL Generation**: Automatic generation of TOON domain-specific language
- **Multi-Provider Support**: Switch between OpenAI, Anthropic, and more
- **Intelligent Parsing**: Extracts rules, genres, limits, and moderation settings
- **Auto-Population**: Generated data automatically fills the builder UI

## Architecture

```
User Input (Natural Language)
    ↓
/api/generate
    ↓
LLM Inference (llm.ts)
    ↓
Parser (parser.ts)
    ↓
Normalizer (normalizer.ts)
    ↓
Validator (validator.ts)
    ↓
JSON Output + TOON DSL (toon.ts)
    ↓
Frontend (QuickPromptGenerator → Zustand Store → JSONPreviewPanel)
```

## Troubleshooting

### "API key not configured" error
- Ensure `.env.local` exists in project root
- Verify the API key is correctly formatted
- Restart the dev server after adding environment variables

### "Module not found" errors
- Run `npm install` to ensure all dependencies are installed
- Check that `openai`, `zod`, and `@anthropic-ai/sdk` are in `package.json`

### TypeScript errors
- These are expected during development
- The dev server will auto-rebuild and resolve them
- If persistent, try `rm -rf .next && npm run dev`
