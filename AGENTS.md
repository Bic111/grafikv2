# AGENTS.md - Kontekst Projektu dla Modeli Językowych

Ten plik zawiera połączone instrukcje dla modeli AI (Gemini i Claude) pracujących nad projektem Grafikv2.


This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Grafikv2** is a modern Next.js 16 application using React 19, TypeScript, and Tailwind CSS 4. This is currently a starter template with essential infrastructure in place but limited custom application code.

**Tech Stack:**
- **Framework:** Next.js 16 (App Router)
- **Runtime:** React 19
- **Language:** TypeScript (strict mode enabled)
- **Styling:** Tailwind CSS 4
- **Package Manager:** npm
- **Linting:** ESLint (next + core-web-vitals + typescript rules)

## Essential Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Create production build
npm start        # Run production server
npm run lint     # Run ESLint checks
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages and layouts
│   ├── layout.tsx    # Root layout (metadata, fonts, global styles)
│   └── page.tsx      # Home page (/)
└── (add more as needed)

Configuration files:
├── tsconfig.json           # TypeScript settings (path alias: @/* → src/*)
├── eslint.config.mjs       # ESLint configuration
├── next.config.ts          # Next.js configuration
├── postcss.config.mjs      # PostCSS (Tailwind)
└── tailwind.config.ts      # Tailwind CSS (inferred from postcss plugin)
```

## TypeScript Configuration

- **Target:** ES2017
- **Strict Mode:** Enabled
- **Path Alias:** `@/*` resolves to `src/*` — use this for all internal imports
- **JSX Transform:** React 19 (automatic)

**Example:**
```typescript
// ✅ Correct
import { Button } from '@/components/Button';

// ❌ Avoid
import { Button } from '../../components/Button';
```

## Tailwind CSS 4

The project uses Tailwind CSS v4 with the new `@tailwindcss/postcss` plugin. Utility-first styling is preferred. Avoid inline styles unless necessary.

**Key Files:**
- PostCSS plugin handles Tailwind (no separate `tailwind.config.js` needed for basic setup)
- Global styles import is in `src/app/layout.tsx` (see `./globals.css`)

## Code Quality Standards

- **Strict TypeScript:** All code must pass `tsc --noEmit`. Type inference is encouraged but explicit types for public APIs are required.
- **ESLint:** Extends `eslint-config-next` (core-web-vitals + typescript). Run `npm run lint` before commits.
- **Formatting:** No Prettier configured; rely on ESLint rules for consistency.

## Development Patterns

- **Server Components (Default):** Use React Server Components in `src/app/` by default.
- **Client Components:** Mark with `'use client'` only when needed (interactivity, hooks, etc.).
- **Image Optimization:** Use Next.js `Image` component for static/dynamic assets.
- **Fonts:** Google Fonts are pre-loaded in layout (Geist Sans/Mono); add via `next/font/google`.

## GitHub Actions

The repository includes GitHub Actions workflows for Gemini-based automation (dispatching, invoking, triaging, and scheduled tasks). These workflows are independent of the application build process.

## Future Expansion Areas

When building new features, consider:
- **Components:** Create a `src/components/` directory with reusable UI pieces
- **Utilities:** Add `src/lib/` for shared helpers and type definitions
- **API Routes:** If needed, create `src/app/api/` for server-side endpoints
- **Tests:** Set up Jest/Vitest and add `__tests__/` directories alongside code

## Important Notes

- **No Environment Variables Configured:** Add `.env.local` as needed (not committed to git).
- **Next.js 16 Features:** App Router is fully stable; Server Actions are production-ready.
- **Hot Module Replacement:** Enabled by default during development.
- **TypeScript Incremental Build:** Configured for faster rebuilds.

## Konwencje Komunikacji

**Zawsze używaj języka polskiego** we wszystkich:
- Komentarzach w kodzie
- Komunikatach użytkownika (komunikaty błędów, komunikaty walidacji)
- Dokumentacji
- Wiadomościach logów

## Common Issues & Troubleshooting

**Issue:** Path alias `@/*` not resolving
**Solution:** Ensure `tsconfig.json` includes the path alias and restart the dev server.

**Issue:** ESLint errors about React imports
**Solution:** React 19 no longer requires `import React` for JSX; remove if present.

**Issue:** Tailwind classes not applying
**Solution:** Verify `globals.css` imports are in layout, and check that content paths are correct in PostCSS plugin.
