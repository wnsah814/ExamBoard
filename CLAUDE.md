# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ExamBoard is a university exam timer and announcement display system (Korean UI). It shows a real-time clock, exam timer, and announcements on a large display, with an admin page for managing exam settings. Data syncs in real-time via Firebase Firestore.

## Commands

- `npm run dev` — start dev server (Next.js 16, port 3000)
- `npm run build` — production build
- `npm run lint` — run ESLint (flat config, next/core-web-vitals + typescript)
- No test framework is configured

## Architecture

**Two pages:**
- `/` (src/app/page.tsx) — public display page, subscribes to Firestore real-time updates for exam info, announcements, and app settings (clock size, font scale). Supports per-display local overrides via localStorage.
- `/admin` (src/app/admin/page.tsx) — admin panel for managing exams, announcements, and presets. Two auth modes: Google login (full access) or password (limited).

**Data layer (src/lib/):**
- `firebase.ts` — Firebase app singleton, exports `db`, `auth`, `googleProvider`
- `firestore.ts` — all Firestore CRUD: exams (`exams/current`), announcements, presets, app settings (`app/settings`). Provides both one-shot loaders and `subscribeTo*` real-time listeners.
- `auth.ts` — authentication (Google, anonymous), admin management (CRUD on `admins/{email}`), admin password stored in `app/settings`
- `storage.ts` — localStorage helpers for local display overrides (clock size, font scale) and fallback data

**Settings have two layers:** global defaults in Firestore (`app/settings`, admin-controlled) and local overrides in localStorage (per-display). The display page merges them as `localValue ?? defaultValue`.

**Types:** `src/types/exam.ts` defines `ExamInfo` and `Announcement` interfaces used across the app.

**UI:** shadcn/ui (new-york style) with Tailwind CSS v4. Add components via `npx shadcn@latest add <component>`. Existing UI primitives are in `src/components/ui/`.

## Environment

Requires `.env.local` with `NEXT_PUBLIC_FIREBASE_*` variables (see `.env.example`). All Firebase config is client-side via `NEXT_PUBLIC_` prefix.

## Key Conventions

- All pages are client components (`"use client"`) since they rely on real-time Firestore subscriptions and browser APIs
- Path alias: `@/*` maps to `./src/*`
- Firestore timestamps are converted to JS `Date` objects at the data layer boundary
- UI text is in Korean
