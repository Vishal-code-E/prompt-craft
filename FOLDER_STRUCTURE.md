# Phase 2: Complete Folder Structure

## Project Structure

```
prompt-craft/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate/
│   │   │   │   └── route.ts ✨ NEW - Main AI generation endpoint
│   │   │   ├── classify/
│   │   │   │   └── route.ts ✨ NEW - Classification endpoint
│   │   │   ├── auth/
│   │   │   └── contact/
│   │   ├── about/
│   │   ├── contact/
│   │   ├── pricing/
│   │   ├── products/
│   │   ├── signup/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── providers.tsx
│   │
│   ├── components/
│   │   ├── builder/
│   │   │   ├── QuickPromptGenerator.tsx 🔄 UPDATED - AI integration
│   │   │   ├── JSONPreviewPanel.tsx 🔄 UPDATED - Added TOON tab
│   │   │   └── FineTuneSection.tsx
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── ...
│   │   ├── footer.tsx
│   │   ├── global-navbar.tsx
│   │   └── ...
│   │
│   ├── lib/
│   │   ├── llm.ts ✨ NEW - Multi-provider LLM wrapper
│   │   ├── parser.ts ✨ NEW - LLM response parser
│   │   ├── normalizer.ts ✨ NEW - Data normalizer
│   │   ├── validator.ts ✨ NEW - Zod validation schemas
│   │   ├── toon.ts ✨ NEW - TOON DSL generator
│   │   ├── firebase-admin.ts
│   │   └── utils.ts
│   │
│   ├── store/
│   │   └── promptStore.ts 🔄 UPDATED - AI state & actions
│   │
│   ├── types/
│   │   └── prompt.ts ✨ NEW - Type definitions
│   │
│   └── utils/
│       └── buildJSON.ts
│
├── public/
│   └── ...
│
├── Documentation/
│   ├── PHASE2_SETUP.md ✨ NEW - Setup guide
│   ├── INFERENCE_PROMPT.md ✨ NEW - LLM prompt documentation
│   └── README.md
│
├── Configuration Files/
│   ├── package.json 🔄 UPDATED - New dependencies
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── tailwind.config.js
│   ├── components.json
│   └── .gitignore
│
└── Environment/
    └── .env.local ⚠️ USER ACTION REQUIRED - Add API key
```

---

## New Files Created (Phase 2)

### Backend (7 files)
1. `/src/app/api/generate/route.ts` - Main generation endpoint
2. `/src/app/api/classify/route.ts` - Classification endpoint
3. `/src/lib/llm.ts` - Multi-provider LLM wrapper
4. `/src/lib/parser.ts` - LLM response parser
5. `/src/lib/normalizer.ts` - Data normalizer
6. `/src/lib/validator.ts` - Zod validation
7. `/src/lib/toon.ts` - TOON DSL generator

### Types (1 file)
8. `/src/types/prompt.ts` - Type definitions

### Documentation (2 files)
9. `/PHASE2_SETUP.md` - Setup guide
10. `/INFERENCE_PROMPT.md` - LLM prompt documentation

---

## Modified Files (Phase 2)

### Frontend (3 files)
1. `/src/components/builder/QuickPromptGenerator.tsx` - Added API integration
2. `/src/components/builder/JSONPreviewPanel.tsx` - Added TOON tab
3. `/src/store/promptStore.ts` - Added AI state & actions

### Configuration (1 file)
4. `/package.json` - Added dependencies (openai, zod, @anthropic-ai/sdk)

---

## Dependencies Added

```json
{
  "dependencies": {
    "openai": "^4.0.0",
    "zod": "^3.22.0",
    "@anthropic-ai/sdk": "^0.9.0"
  }
}
```

---

## Key Directories

### `/src/app/api/` - API Routes
All Next.js API endpoints for backend functionality

### `/src/lib/` - Core Libraries
Reusable utilities and AI processing logic

### `/src/components/builder/` - Builder Components
UI components for the prompt builder interface

### `/src/store/` - State Management
Zustand stores for global state

### `/src/types/` - TypeScript Types
Centralized type definitions

---

## File Size Summary

| File | Lines | Purpose |
|------|-------|---------|
| `llm.ts` | ~280 | Multi-provider LLM wrapper |
| `parser.ts` | ~180 | LLM response parsing |
| `normalizer.ts` | ~150 | Data normalization |
| `validator.ts` | ~80 | Zod schemas |
| `toon.ts` | ~280 | TOON DSL generation |
| `generate/route.ts` | ~90 | Main API endpoint |
| `classify/route.ts` | ~130 | Classification endpoint |
| `prompt.ts` | ~60 | Type definitions |
| `QuickPromptGenerator.tsx` | ~120 | AI-powered generator UI |
| `JSONPreviewPanel.tsx` | ~130 | Preview with tabs |
| `promptStore.ts` | ~160 | Enhanced store |

**Total:** ~1,660 lines of production code

---

## Import Graph

```
QuickPromptGenerator.tsx
    ↓
/api/generate
    ↓
llm.ts → parser.ts → normalizer.ts → validator.ts
    ↓                                      ↓
toon.ts ←─────────────────────────────────┘
    ↓
JSONPreviewPanel.tsx
```

---

## Next Steps

1. ✅ Review folder structure
2. ⚠️ Add API key to `.env.local`
3. ✅ Restart dev server
4. ✅ Test in browser at `/builder`
5. ✅ Verify all features work

---

## Quick Reference

### To add API key:
```bash
echo "OPENAI_API_KEY=your_key_here" >> .env.local
```

### To restart dev server:
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### To test API:
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"input": "Create a story"}'
```
