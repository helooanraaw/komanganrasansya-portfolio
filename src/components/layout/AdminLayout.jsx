import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LayoutDashboard, FolderKanban, Briefcase, LogOut, ArrowLeft, Code2, Image as ImageIcon } from 'lucide-react'

export default function AdminLayout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login')
  }

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dasbor', end: true },
    { to: '/admin/projects', icon: FolderKanban, label: 'Proyek' },
    { to: '/admin/experience', icon: Briefcase, label: 'Pengalaman' },
    { to: '/admin/skills', icon: Code2, label: 'Keahlian' },
    { to: '/admin/profile-images', icon: ImageIcon, label: 'Foto Profil' },
  ]


  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Sidebar */}
      <aside className="w-64 bg-bg-secondary border-r border-border flex flex-col fixed h-full">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-bold text-text-primary">Panel Admin</h2>
          <p className="text-[10px] uppercase font-mono text-text-muted mt-1">Manajer Portofolio</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-widest transition-all duration-200 ${
                  isActive
                    ? 'bg-accent text-white'
                    : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-widest text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-all duration-200"
          >
            <ArrowLeft size={18} />
            Lihat Situs
          </a>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-widest text-text-secondary hover:bg-accent/10 hover:text-accent transition-all duration-200 w-full cursor-pointer text-left"
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  )
}
