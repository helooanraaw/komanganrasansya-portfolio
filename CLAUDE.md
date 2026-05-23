# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- Start development server: `npm run dev`
- Build for production: `npm run build`
- Preview production build: `npm run preview`
- Lint code: `npm run lint`

## Project Architecture

### Tech Stack
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS 4 (via `@tailwindcss/vite`)
- **Routing**: React Router DOM v7
- **State/Auth**: Custom hooks (`useAuth`) and Supabase client
- **Smooth Scrolling**: Lenis library
- **Icons**: Lucide React

### Directory Structure
```
src/
├── components/        # Reusable UI components
│   └── layout/        # Layout components (ProtectedRoute, AdminLayout)
├── pages/             # Page components mapped to routes
│   ├── admin/         # Admin-protected pages (Dashboard, managers)
│   ├── Home.jsx       # Public homepage
│   └── Login.jsx      # Login page
├── hooks/             # Custom React hooks (useAuth, useScrollReveal)
├── lib/               # External service initialization (Supabase)
├── App.jsx            # Root router and Lenis smooth scroll setup
├── main.jsx           # React entry point
├── index.css          # Global CSS (Tailwind base)
└── assets/            # Static assets (images, documents)
```

### Key Features
- **Authentication**: Protected routes via `ProtectedRoute` component checking Supabase auth state.
- **Admin Sections**: CRUD-like managers for Projects, Experiences, and Skills (admin-only).
- **Smooth Scrolling**: Lenis initialized in `App.useEffect` with `autoRaf: true`.
- **Supabase**: Configured in `src/lib/supabase.js`; used via `useAuth` hook for session management.

### Common Tasks
- To add a new public page: create component in `src/pages/`, add `<Route>` in `App.jsx`.
- To add admin-protected feature: create component under `src/pages/admin/`, add route inside the `/admin` protected route in `App.jsx`.
- To modify styles: edit Tailwind classes in JSX or adjust `src/index.css` for global styles.
- To update Supabase schema: run `supabase db push` after making changes locally (requires Supabase CLI).

### Environment
- Environment variables (Supabase URL/anon key) expected in `.env` (not committed).
- Example `.env`:
  ```
  VITE_SUPABASE_URL=your_project_url
  VITE_SUPABASE_ANON_KEY=your_anon_key
  ```