-- ============================================
-- SUPABASE SETUP: Portfolio Anra
-- Jalankan di Supabase Dashboard > SQL Editor
-- ============================================

-- 1. TABEL: projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  long_description TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  tech_stack TEXT[] DEFAULT '{}',
  image_url TEXT DEFAULT '',
  gallery_images TEXT[] DEFAULT '{}',
  demo_link TEXT DEFAULT '',
  repo_link TEXT DEFAULT '',
  hover_color TEXT DEFAULT '#0055D4',
  sort_order INT4 DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABEL: experiences
CREATE TABLE IF NOT EXISTS public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  organization TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  start_date DATE NOT NULL,
  end_date DATE DEFAULT NULL,
  is_current BOOLEAN DEFAULT false,
  sort_order INT4 DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABEL: skills
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  sort_order INT4 DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TABEL: profile_images (untuk foto profil yang berganti-ganti)
CREATE TABLE IF NOT EXISTS public.profile_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  sort_order INT4 DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_images ENABLE ROW LEVEL SECURITY;

-- Public: siapa saja bisa SELECT (baca)
CREATE POLICY "Public can read projects"
  ON public.projects FOR SELECT
  USING (true);

CREATE POLICY "Public can read experiences"
  ON public.experiences FOR SELECT
  USING (true);

CREATE POLICY "Public can read skills"
  ON public.skills FOR SELECT
  USING (true);

CREATE POLICY "Public can read profile images"
  ON public.profile_images FOR SELECT
  USING (true);

-- Admin: hanya yang login bisa CRUD
CREATE POLICY "Admin can CRUD projects"
  ON public.projects FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can CRUD experiences"
  ON public.experiences FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can CRUD skills"
  ON public.skills FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can CRUD profile images"
  ON public.profile_images FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================
-- 6. STORAGE BUCKETS
-- ============================================
-- Bucket 'project-images'
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket 'profile-images'
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy untuk project-images
CREATE POLICY "Public read project images" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
CREATE POLICY "Admin CRUD project images" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'project-images');

-- Policy untuk profile-images
CREATE POLICY "Public read profile images" ON storage.objects FOR SELECT USING (bucket_id = 'profile-images');
CREATE POLICY "Admin CRUD profile images" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'profile-images');

-- ============================================
-- 5. SEED DATA: Projects
-- ============================================
INSERT INTO public.projects (title, description, role, tech_stack, image_url, demo_link, repo_link, sort_order)
VALUES
  (
    'CuanCerdas',
    'Platform edukasi finansial berbasis AI yang memberikan literasi keuangan personal. Dikembangkan sebagai Capstone Project Coding Camp Indonesia 2025 oleh DBS Foundation & Dicoding Academy.',
    'Fullstack Developer',
    ARRAY['React.js', 'Hapi (Node.js)', 'Scikit-learn', 'Figma'],
    '',
    '',
    '',
    1
  ),
  (
    'TaruPramana',
    'Aplikasi web kesehatan sebagai Capstone Project Coding Camp Indonesia 2026. Platform digital yang membantu pengguna mengelola kesehatan secara lebih baik. Dikerjakan secara kolaboratif bersama tim.',
    'Fullstack Developer',
    ARRAY['React.js', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    '',
    '',
    '',
    2
  ),
  (
    'SkensaMotoHub',
    'Sistem manajemen servis sepeda motor (ERP) untuk bengkel SMKN 1 Denpasar. Fokus pada perancangan alur sistem, migrasi database, dan dashboard interaktif untuk tracking status servis.',
    'System Designer & Developer',
    ARRAY['Laravel', 'MySQL', 'Blade', 'Tailwind CSS', 'Alpine.js'],
    '',
    '',
    '',
    3
  ),
  (
    'Kas-App',
    'Aplikasi manajemen kas digital untuk pencatatan pemasukan dan pengeluaran. Di-deploy menggunakan Railway untuk kemudahan akses.',
    'Fullstack Developer',
    ARRAY['Node.js', 'Express', 'PostgreSQL', 'Railway'],
    '',
    '',
    '',
    4
  ),
  (
    'Api Banaspati',
    'Game survival 2D interaktif dengan aset pixel art yang dibuat secara mandiri. Pemain harus menghindari bola api mistis dan menguji refleks. Proyek pertama dalam pengembangan game.',
    'Game Developer & Pixel Artist',
    ARRAY['Scratch', 'Pixel Art', 'Game Design'],
    '',
    'https://scratch.mit.edu/projects/1107983820/',
    '',
    5
  );

-- ============================================
-- 6. SEED DATA: Experiences
-- ============================================
INSERT INTO public.experiences (title, organization, description, start_date, end_date, is_current, sort_order)
VALUES
  (
    'Koordinator LKBB',
    'Paskibra Kansa - SMKN 1 Denpasar (SKENSA)',
    'Berperan sebagai koordinator Lomba Ketangkasan Baris-Berbaris (LKBB), mengelola anggota, menyusun strategi latihan, dan mempromosikan kegiatan. Mengembangkan kemampuan manajerial, kepemimpinan, dan komunikasi tim.',
    '2024-07-01',
    NULL,
    true,
    1
  ),
  (
    'Peserta Coding Camp Indonesia 2025 & 2026',
    'DBS Foundation & Dicoding Academy',
    'Program intensif pengembangan keterampilan teknologi meliputi React.js, Node.js, Web Development, dan Machine Learning. Menyelesaikan capstone project CuanCerdas (2025) dan TaruPramana (2026).',
    '2025-02-01',
    NULL,
    true,
    2
  ),
  (
    'Mentee - Mentoring Profesional',
    'Program Mentoring Berkelanjutan',
    'Mengikuti sesi mentoring rutin untuk pengembangan karir dan keterampilan teknis. Fokus pada best practices dalam software development, project management, dan career growth.',
    '2025-01-01',
    NULL,
    true,
    3
  );
