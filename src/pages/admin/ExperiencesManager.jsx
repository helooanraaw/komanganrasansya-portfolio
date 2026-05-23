import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2, Edit2, X, Calendar } from 'lucide-react'

export default function ExperiencesManager() {
  const [experiences, setExperiences] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)

  // Form State
  const [title, setTitle] = useState('')
  const [organization, setOrganization] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isCurrent, setIsCurrent] = useState(false)
  const [sortOrder, setSortOrder] = useState(0)

  useEffect(() => {
    fetchExperiences()
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

  async function fetchExperiences() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .order('sort_order', { ascending: true })
      if (error) throw error
      setExperiences(data || [])
    } catch (err) {
      alert('Gagal memuat data pengalaman: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingId(null)
    setTitle('')
    setOrganization('')
    setDescription('')
    setStartDate('')
    setEndDate('')
    setIsCurrent(false)
    setSortOrder(0)
    setModalOpen(true)
  }

  const handleOpenEdit = (exp) => {
    setEditingId(exp.id)
    setTitle(exp.title)
    setOrganization(exp.organization || '')
    setDescription(exp.description || '')
    setStartDate(exp.start_date || '')
    setEndDate(exp.end_date || '')
    setIsCurrent(exp.is_current || false)
    setSortOrder(exp.sort_order || 0)
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      title,
      organization,
      description,
      start_date: startDate,
      end_date: isCurrent ? null : endDate || null,
      is_current: isCurrent,
      sort_order: parseInt(sortOrder) || 0,
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('experiences')
          .update(payload)
          .eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('experiences').insert([payload])
        if (error) throw error
      }
      setModalOpen(false)
      fetchExperiences()
    } catch (err) {
      alert('Gagal menyimpan data: ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data pengalaman ini?')) return
    try {
      const { error } = await supabase.from('experiences').delete().eq('id', id)
      if (error) throw error
      fetchExperiences()
    } catch (err) {
      alert('Gagal menghapus data: ' + err.message)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black text-text-primary tracking-tight uppercase">
            Riwayat Pengalaman
          </h1>
          <p className="text-text-secondary mt-1">
            Kelola garis waktu profesional dan latar belakang organisasi Anda.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-text-primary text-bg-primary hover:bg-accent hover:text-white font-bold uppercase tracking-wider px-6 py-3 text-sm cursor-pointer transition-colors duration-200"
        >
          <Plus size={18} /> Tambah Pengalaman
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="bg-bg-secondary border-2 border-border p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className="bg-bg-elevated border border-border px-3 py-1 text-xs text-text-secondary flex items-center gap-1.5 font-mono">
                    <Calendar size={12} />
                    {exp.start_date} &rarr; {exp.is_current ? 'Sekarang' : exp.end_date}
                  </span>
                  {exp.is_current && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-accent px-2 py-0.5 rounded">
                      Aktif
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-text-primary">{exp.title}</h3>
                <h4 className="text-md text-accent font-medium">{exp.organization}</h4>
                <p className="text-sm text-text-secondary max-w-3xl">{exp.description}</p>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={() => handleOpenEdit(exp)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-border hover:border-text-primary text-text-primary px-4 py-2 text-xs font-bold transition-all cursor-pointer"
                >
                  <Edit2 size={14} /> Ubah
                </button>
                <button
                  onClick={() => handleDelete(exp.id)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-border hover:border-accent hover:text-accent text-text-secondary px-4 py-2 text-xs font-bold transition-all cursor-pointer"
                >
                  <Trash2 size={14} /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CRUD Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-secondary border-4 border-border w-full max-w-2xl max-h-[90vh] flex flex-col relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 z-10 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>

            <div className="p-8 border-b border-border">
              <h2 className="text-2xl font-black uppercase tracking-tight text-text-primary">
                {editingId ? 'Ubah Data Pengalaman' : 'Tambah Data Pengalaman'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar" data-lenis-prevent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                      Judul Pekerjaan / Peran *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-bg-elevated border-2 border-border focus:border-text-primary px-4 py-2.5 text-sm text-text-primary outline-none"
                      placeholder="Contoh: Koordinator Proyek"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                      Organisasi / Perusahaan *
                    </label>
                    <input
                      type="text"
                      required
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full bg-bg-elevated border-2 border-border focus:border-text-primary px-4 py-2.5 text-sm text-text-primary outline-none"
                      placeholder="Contoh: OSIS SMK Negeri 1 Denpasar"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                    Deskripsi Tugas *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-bg-elevated border-2 border-border focus:border-text-primary px-4 py-2.5 text-sm text-text-primary outline-none resize-none"
                    placeholder="Tanggung jawab, pencapaian, dan keahlian yang dikembangkan..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                      Tanggal Mulai *
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-bg-elevated border-2 border-border focus:border-text-primary px-4 py-2.5 text-sm text-text-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                      Tanggal Berakhir
                    </label>
                    <input
                      type="date"
                      disabled={isCurrent}
                      value={isCurrent ? '' : endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-bg-elevated border-2 border-border focus:border-text-primary px-4 py-2.5 text-sm text-text-primary outline-none disabled:opacity-30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isCurrent"
                      checked={isCurrent}
                      onChange={(e) => setIsCurrent(e.target.checked)}
                      className="w-4 h-4 bg-bg-elevated border-2 border-border text-accent focus:ring-accent"
                    />
                    <label htmlFor="isCurrent" className="text-xs font-bold uppercase tracking-wider text-text-primary cursor-pointer select-none">
                      Saya masih aktif di sini
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                      Urutan Tampil
                    </label>
                    <input
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="w-full bg-bg-elevated border-2 border-border focus:border-text-primary px-4 py-2.5 text-sm text-text-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-border flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-text-primary text-bg-primary hover:bg-accent hover:text-white font-bold uppercase tracking-wider py-4 transition-colors duration-200 cursor-pointer"
                >
                  Simpan Data
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 border-2 border-border hover:border-text-primary text-text-primary font-bold uppercase tracking-wider py-4 transition-colors duration-200 cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
