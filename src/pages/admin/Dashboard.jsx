import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { FolderKanban, Briefcase, ExternalLink } from 'lucide-react'

export default function Dashboard() {
  const [projectCount, setProjectCount] = useState(0)
  const [experienceCount, setExperienceCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [projRes, expRes] = await Promise.all([
          supabase.from('projects').select('*', { count: 'exact', head: true }),
          supabase.from('experiences').select('*', { count: 'exact', head: true }),
        ])
        setProjectCount(projRes.count || 0)
        setExperienceCount(expRes.count || 0)
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCounts()
  }, [])

  const stats = [
    {
      title: 'Total Proyek',
      count: projectCount,
      link: '/admin/projects',
      icon: FolderKanban,
      color: 'border-accent text-accent',
    },
    {
      title: 'Total Pengalaman',
      count: experienceCount,
      link: '/admin/experiences',
      icon: Briefcase,
      color: 'border-blue-500 text-blue-500',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-text-primary tracking-tight uppercase">
          Ringkasan Sistem
        </h1>
        <p className="text-text-secondary mt-1">
          Pantau dan kelola konten portfolio Anda dari satu tempat.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`bg-bg-secondary border-4 border-border hover:border-text-primary transition-all duration-300 p-8 relative flex flex-col justify-between`}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  {stat.title}
                </span>
                <h2 className="text-5xl font-black mt-2 text-text-primary">
                  {stat.count}
                </h2>
              </div>
              <div className={`p-3 bg-bg-elevated border-2 border-border rounded`}>
                <stat.icon size={24} />
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <Link
                to={stat.link}
                className="flex items-center gap-2 text-sm font-bold text-text-primary hover:text-accent transition-colors"
              >
                Kelola Data <ExternalLink size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Tips */}
      <div className="bg-bg-secondary border-2 border-border p-6 rounded">
        <h3 className="text-lg font-bold text-text-primary mb-2">Sinkronisasi Database</h3>
        <p className="text-sm text-text-secondary">
          Semua modifikasi yang dilakukan di panel ini akan langsung tercermin pada situs publik secara otomatis. Pastikan data yang dimasukkan sudah benar sebelum disimpan.
        </p>
      </div>
    </div>
  )
}
