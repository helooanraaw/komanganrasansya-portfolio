# Project: Portfolio Anra

A modern portfolio website for Anra, featuring a sleek landing page and a robust admin dashboard for content management.

## Project Overview

- **Purpose**: Showcase professional projects, work experience, and technical skills.
- **Tech Stack**:
  - **Frontend**: React 19, Vite, Tailwind CSS 4, React Router 7.
  - **Backend**: Supabase (PostgreSQL database, Authentication, and Storage).
  - **Utilities**: Lenis (smooth scrolling), Lucide React (icons), Hooks (custom logic).

## Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- Supabase Account and Project

### Installation
```bash
npm install
```

### Environment Setup
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Commands
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Compiles the application for production.
- `npm run lint`: Checks for linting errors using ESLint.
- `npm run preview`: Previews the production build locally.

## Database & Backend

The database schema is defined in `supabase-setup.sql`. It includes:
- **Tables**: `projects`, `experiences`, `skills`.
- **Security**: Row Level Security (RLS) is enabled. Public can read; authenticated users (admin) have full CRUD access.
- **Storage**: A `project-images` bucket for hosting project media.

## Project Structure

- `src/pages/`: Contains the main routes:
  - `Home.jsx`: The main public landing page.
  - `Login.jsx`: Admin login portal.
  - `admin/`: Dashboard and management interfaces (`ProjectsManager`, `ExperiencesManager`, `SkillsManager`).
- `src/components/`:
  - `layout/`: Shared layouts like `AdminLayout` and `ProtectedRoute`.
- `src/hooks/`: Custom hooks like `useAuth` for authentication state and `useScrollReveal` for animations.
- `src/lib/`: Client initializations, specifically `supabase.js`.
- `public/`: Static assets including CV and favicon.

## Conventions & Guidelines

- **Styling**: Use Tailwind CSS 4 utility classes.
- **Components**: Prefer functional components and React Hooks.
- **Database**: When modifying the schema, update `supabase-setup.sql` to maintain consistency.
- **Smooth Scroll**: Lenis is initialized in `App.jsx` for the entire application.
- **Icons**: Use `lucide-react` for consistent iconography.
