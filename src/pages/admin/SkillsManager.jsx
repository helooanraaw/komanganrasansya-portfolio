import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  Plus, Trash2, Edit2, X, 
  Code2, Database, Layout, Terminal, Layers, Command,
  Smartphone, Globe, Cpu, Monitor, Zap, Shield, Search,
  Box, Coffee, Github, Palette, Settings
} from 'lucide-react'

const ICON_OPTIONS = [
  { name: 'Code2', icon: Code2 },
  { name: 'Database', icon: Database },
  { name: 'Layout', icon: Layout },
  { name: 'Terminal', icon: Terminal },
  { name: 'Layers', icon: Layers },
  { name: 'Command', icon: Command },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Globe', icon: Globe },
  { name: 'Cpu', icon: Cpu },
  { name: 'Monitor', icon: Monitor },
  { name: 'Zap', icon: Zap },
  { name: 'Shield', icon: Shield },
  { name: 'Search', icon: Search },
  { name: 'Box', icon: Box },
  { name: 'Coffee', icon: Coffee },
  { name: 'Github', icon: Github },
  { name: 'Palette', icon: Palette },
  { name: 'Settings', icon: Settings }
]

export default function SkillsManager() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const [name, setName] = useState('')
  const [iconName, setIconName] = useState('Code2')
  const [category, setCategory] = useState('Umum')
  const [sortOrder, setSortOrder] = useState(0)

  useEffect(() => {
    fetchSkills()
  }, [])

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (modalOpen) {
      document.documentElement.classList.add('lenis-stopped');
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.classList.remove('lenis-stopped');
      document.body.style.overflow = '';
    }
    return () => { 
      document.documentElement.classList.remove('lenis-stopped');
      document.body.style.overflow = '';
    }
  }, [modalOpen])

  async function fetchSkills() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('sort_order', { ascending: true })
      if (error) throw error
      setSkills(data || [])
    } catch (err) {
      alert('Gagal memuat data keahlian: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingId(null)
    setName('')
    setIconName('Code2')
    setCategory('Umum')
    setSortOrder(0)
    setModalOpen(true)
  }

  const handleOpenEdit = (skill) => {
    setEditingId(skill.id)
    setName(skill.name)
    setIconName(skill.icon_name || 'Code2')
    setCategory(skill.category || 'Umum')
    setSortOrder(skill.sort_order || 0)
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      name,
      icon_name: iconName,
      category,
      sort_order: parseInt(sortOrder) || 0
    }

    try {
      if (editingId) {
        const { error } = await supabase.from('skills').update(payload).eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('skills').insert([payload])
        if (error) throw error
      }
      setModalOpen(false)
      fetchSkills()
    } catch (err) {
      alert('Gagal menyimpan data keahlian: ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin?')) return
    try {
      const { error } = await supabase.from('skills').delete().eq('id', id)
      if (error) throw error
      fetchSkills()
    } catch (err) {
      alert('Gagal menghapus data: ' + err.message)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black text-text-primary tracking-tight uppercase">Daftar Keahlian</h1>
          <p className="text-text-secondary mt-1">Kelola daftar teknologi dan keahlian yang Anda gunakan.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-text-primary text-bg-primary hover:bg-accent hover:text-white font-bold uppercase tracking-wider px-6 py-3 text-sm cursor-pointer transition-colors"
        >
          <Plus size={18} /> Tambah Keahlian
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {skills.map((skill) => (
            <div key={skill.id} className="bg-bg-secondary border-2 border-border p-8 flex justify-between items-center group relative">
              <div className="space-y-2">
                <span className="font-mono text-[8px] text-accent font-bold uppercase tracking-[0.3em]">{skill.category}</span>
                <h3 className="text-xl font-black uppercase tracking-tighter text-text-primary">{skill.name}</h3>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenEdit(skill)} className="p-2 text-text-secondary hover:text-accent border border-transparent hover:border-accent transition-all cursor-pointer"><Edit2 size={16}/></button>
                <button onClick={() => handleDelete(skill.id)} className="p-2 text-text-secondary hover:text-accent border border-transparent hover:border-accent transition-all cursor-pointer"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-secondary border-4 border-border w-full max-w-lg max-h-[90vh] flex flex-col relative" data-lenis-prevent>
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 z-10 text-text-secondary hover:text-text-primary cursor-pointer"><X size={24}/></button>
            <div className="p-8 border-b border-border">
              <h2 className="text-2xl font-black uppercase tracking-tight text-text-primary">{editingId ? 'Ubah Keahlian' : 'Tambah Keahlian'}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Nama Teknologi</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-bg-elevated border-2 border-border focus:border-text-primary px-4 py-2.5 text-sm text-text-primary outline-none" placeholder="Contoh: React" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Pilih Ikon</label>
                <div className="grid grid-cols-6 gap-2 bg-bg-elevated p-4 border-2 border-border overflow-y-auto max-h-40 custom-scrollbar">
                  {ICON_OPTIONS.map((opt) => {
                    const Icon = opt.icon
                    return (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => setIconName(opt.name)}
                        className={`p-2 flex items-center justify-center border-2 transition-all ${iconName === opt.name ? 'border-accent bg-accent/10 text-accent' : 'border-transparent text-text-muted hover:border-border'}`}
                        title={opt.name}
                      >
                        <Icon size={20} />
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Kategori</label>
                  <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-bg-elevated border-2 border-border focus:border-text-primary px-4 py-2.5 text-sm text-text-primary outline-none" placeholder="Contoh: Frontend" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Urutan Tampil</label>
                  <input type="number" value={sortOrder} onChange={(setSortOrder) => setSortOrder(e.target.value)} className="w-full bg-bg-elevated border-2 border-border focus:border-text-primary px-4 py-2.5 text-sm text-text-primary outline-none" />
                </div>
              </div>

              <button type="submit" className="w-full bg-text-primary text-bg-primary hover:bg-accent hover:text-white font-bold uppercase tracking-wider py-4 transition-colors cursor-pointer">Simpan Data</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
