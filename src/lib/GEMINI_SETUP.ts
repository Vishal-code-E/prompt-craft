/**
 * GOOGLE GEMINI FLASH 1.5 SETUP GUIDE
 * 
 * Quick reference for setting up Google Gemini Flash 1.5
 */

export const GEMINI_SETUP = {

    step1: {
        title: 'Get Google AI API Key',
        url: 'https://aistudio.google.com/app/apikey',
        steps: [
            '1. Go to https://aistudio.google.com/app/apikey',
            '2. Sign in with your Google account',
            '3. Click "Create API Key"',
            '4. Copy the generated key',
        ],
    },

    step2: {
        title: 'Add to .env.local',
        envVar: 'GOOGLE_GENERATIVE_AI_API_KEY',
        example: 'GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...',
        note: 'Make sure to add this to your .env.local file',
    },

    step3: {
        title: 'Restart Dev Server',
        commands: [
            'Press Ctrl+C to stop the server',
            'Run: npm run dev',
        ],
    },

    usage: {
        title: 'How to Use',
        description: 'When generating prompts, select:',
        provider: 'google',
        model: 'gemini-1.5-flash',
        benefits: [
            '✅ Fast response times',
            '✅ Cost-effective',
            '✅ High quality outputs',
            '✅ JSON mode support',
        ],
    },

    models: {
        'gemini-1.5-flash': {
            name: 'Gemini 1.5 Flash',
            speed: 'Very Fast',
            cost: 'Low',
            recommended: true,
            description: 'Best for quick iterations and development',
        },
        'gemini-1.5-pro': {
            name: 'Gemini 1.5 Pro',
            speed: 'Fast',
            cost: 'Medium',
            recommended: false,
            description: 'More capable for complex tasks',
        },
        'gemini-pro': {
            name: 'Gemini Pro',
            speed: 'Medium',
            cost: 'Low',
            recommended: false,
            description: 'Previous generation model',
        },
    },

    pricing: {
        'gemini-1.5-flash': {
            input: '$0.075 per 1M tokens',
            output: '$0.30 per 1M tokens',
            note: 'Extremely cost-effective',
        },
    },
};

export const ENV_TEMPLATE = `
# ============================================================================
# GOOGLE GEMINI AI (Recommended for Phase 2)
# ============================================================================
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...your-key-here

# ============================================================================
# Alternative AI Providers (Optional)
# ============================================================================
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
`;

console.log('🚀 Google Gemini Flash 1.5 is now configured!');
console.log('📝 Add GOOGLE_GENERATIVE_AI_API_KEY to your .env.local');
console.log('🔗 Get your key: https://aistudio.google.com/app/apikey');
