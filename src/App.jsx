import { useEffect } from 'react'
import { Routes, Route, useLocation, useNavigationType } from 'react-router-dom'
import Lenis from 'lenis'
import Home from './pages/Home'
import ProjectDetail from './pages/ProjectDetail'
import Login from './pages/Login'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AdminLayout from './components/layout/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import ProjectsManager from './pages/admin/ProjectsManager'
import ExperiencesManager from './pages/admin/ExperiencesManager'
import SkillsManager from './pages/admin/SkillsManager'
import ProfileImagesManager from './pages/admin/ProfileImagesManager'

// Utility component to handle scroll behavior
function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // Jika navigasi adalah 'POP' (Kembali/Maju melalui tombol browser atau navigate(-1)),
    // maka JANGAN reset scroll agar browser bisa mengembalikan posisi terakhir.
    if (navType === 'POP') return;

    // Untuk navigasi baru (PUSH atau REPLACE), reset ke paling atas.
    window.scrollTo(0, 0);
    
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    }

    const forceReset = () => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    
    forceReset();
  }, [pathname, navType]);

  return null;
}

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    // Make lenis accessible globally
    window.lenis = lenis;

    return () => {
      lenis.destroy();
      window.lenis = null;
    };
  }, []);

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/project/:id" element={<ProjectDetail />} />

        {/* Auth */}
        <Route path="/admin/login" element={<Login />} />

        {/* Admin (Protected) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<ProjectsManager />} />
          <Route path="experience" element={<ExperiencesManager />} />
          <Route path="skills" element={<SkillsManager />} />
          <Route path="profile-images" element={<ProfileImagesManager />} />

        </Route>
      </Routes>
    </>
  )
}

export default App
