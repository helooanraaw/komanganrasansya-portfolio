import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2, Edit2, X, Upload, Link as LinkIcon, Palette, Layers, FileText, Film, Eye } from 'lucide-react'
import { compressImage } from '../../lib/imageUtils'

export default function ProjectsManager() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [longDescription, setLongDescription] = useState('')
  const [role, setRole] = useState('')
  const [techStackInput, setTechStackInput] = useState('')
  const [galleryImagesInput, setGalleryImagesInput] = useState('') 
  const [demoLink, setDemoLink] = useState('')
  const [repoLink, setRepoLink] = useState('')
  const [hoverColor, setHoverColor] = useState('#0055D4')
  const [imageFile, setImageFile] = useState(null)
  const [galleryFiles, setGalleryFiles] = useState([])
  const [imageUrl, setImageUrl] = useState('')
  const [galleryImages, setGalleryImages] = useState([]) 
  const [sortOrder, setSortOrder] = useState(0)

  useEffect(() => {
    fetchProjects()
  }, [])

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

  async function fetchProjects() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true })
      if (error) throw error
      setProjects(data || [])
    } catch (err) {
      alert('Error loading projects: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingId(null)
    setTitle('')
    setDescription('')
    setLongDescription('')
    setRole('')
    setTechStackInput('')
    setGalleryImagesInput('')
    setDemoLink('')
    setRepoLink('')
    setHoverColor('#0055D4')
    setImageFile(null)
    setGalleryFiles([])
    setImageUrl('')
    setGalleryImages([])
    setSortOrder(0)
    setModalOpen(true)
  }

  const handleOpenEdit = (proj) => {
    setEditingId(proj.id)
    setTitle(proj.title)
    setDescription(proj.description || '')
    setLongDescription(proj.long_description || '')
    setRole(proj.role || '')
    setTechStackInput(proj.tech_stack ? proj.tech_stack.join(', ') : '')
    setGalleryImagesInput('') 
    setDemoLink(proj.demo_link || '')
    setRepoLink(proj.repo_link || '')
    setHoverColor(proj.hover_color || '#0055D4')
    setImageFile(null)
    setGalleryFiles([])
    setImageUrl(proj.image_url || '')
    setGalleryImages(proj.gallery_images || [])
    setSortOrder(proj.sort_order || 0)
    setModalOpen(true)
  }

  const handleGalleryFilesChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 10) {
      alert('Maksimal 10 file diizinkan untuk galeri')
      return
    }
    setGalleryFiles(files)
  }

  const handleUploadImage = async (file) => {
    try {
      // Kompres gambar otomatis jika file adalah image
      let fileToUpload = file;
      if (file.type.startsWith('image/')) {
        fileToUpload = await compressImage(file, { maxWidth: 1600, quality: 0.8 });
      }

      const fileExt = fileToUpload.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `projects/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(filePath, fileToUpload)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('project-images')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      alert('Gagal mengunggah file: ' + error.message)
      return ''
    }
  }

  const removeGalleryImage = (idx) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== idx))
  }

  const clearPrimaryImage = () => {
    setImageUrl('')
    setImageFile(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    let finalImageUrl = imageUrl
    let finalGalleryImages = [...galleryImages]

    if (imageFile) {
      const uploadedUrl = await handleUploadImage(imageFile)
      if (uploadedUrl) {
        finalImageUrl = uploadedUrl
      }
    }

    if (galleryFiles.length > 0) {
      const uploadPromises = Array.from(galleryFiles).map(file => handleUploadImage(file))
      const uploadedUrls = await Promise.all(uploadPromises)
      finalGalleryImages = [...finalGalleryImages, ...uploadedUrls.filter(Boolean)]
    }

    if (galleryImagesInput) {
       const textUrls = galleryImagesInput.split(',').map(s => s.trim()).filter(Boolean)
       textUrls.forEach(url => {
         if (!finalGalleryImages.includes(url)) finalGalleryImages.push(url)
       })
    }

    const techStackArray = techStackInput
      ? techStackInput.split(',').map((tech) => tech.trim()).filter(Boolean)
      : []

    const payload = {
      title,
      description,
      long_description: longDescription,
      role,
      tech_stack: techStackArray,
      image_url: finalImageUrl,
      gallery_images: finalGalleryImages,
      demo_link: demoLink,
      repo_link: repoLink,
      hover_color: hoverColor,
      sort_order: parseInt(sortOrder) || 0,
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('projects')
          .update(payload)
          .eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('projects').insert([payload])
        if (error) throw error
      }
      setModalOpen(false)
      fetchProjects()
    } catch (err) {
      alert('Gagal menyimpan proyek: ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus proyek ini?')) return
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw error
      fetchProjects()
    } catch (err) {
      alert('Gagal menghapus proyek: ' + err.message)
    }
  }

  const isVideo = (url) => {
    if (!url) return false
    return url.match(/\.(mp4|webm|ogg|mov)$/i)
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-text-primary tracking-tight uppercase">
            Manajemen Proyek
          </h1>
          <p className="text-text-secondary font-mono text-[10px] uppercase tracking-widest mt-2">
            Mengelola data repositori proyek // Total: {projects.length}
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-text-primary text-bg-primary hover:bg-accent hover:text-white font-black uppercase tracking-widest px-8 py-4 text-xs cursor-pointer transition-all duration-300 shadow-lg"
        >
          <Plus size={16} /> Tambah Proyek
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-bg-secondary border border-border group hover:border-accent transition-all duration-500 flex flex-col"
            >
              <div className="aspect-video w-full overflow-hidden bg-bg-elevated relative border-b border-border">
                {proj.image_url ? (
                  isVideo(proj.image_url) ? (
                    <video
                      src={proj.image_url}
                      muted loop autoPlay playsInline
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                  ) : (
                    <img
                      src={proj.image_url}
                      alt={proj.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted opacity-20">
                    <Layers size={48} />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                   <span className="bg-bg-primary/90 backdrop-blur-sm border border-border px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-accent font-bold">
                     #{proj.sort_order}
                   </span>
                </div>
              </div>

              <div className="p-8 flex-grow space-y-6">
                <div className="space-y-2">
                  <span className="font-mono text-accent font-black uppercase text-[9px] tracking-[0.3em]">
                    {proj.role}
                  </span>
                  <h3 className="text-2xl font-black text-text-primary uppercase tracking-tighter group-hover:text-accent transition-colors">
                    {proj.title}
                  </h3>
                </div>
                
                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed uppercase font-medium">
                  {proj.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {proj.tech_stack?.slice(0, 3).map((tech) => (
                    <span key={tech} className="text-[8px] font-bold border border-border px-2 py-0.5 text-text-muted uppercase tracking-widest">
                      {tech}
                    </span>
                  ))}
                  {proj.tech_stack?.length > 3 && <span className="text-[8px] font-bold text-accent px-1">+{proj.tech_stack.length - 3}</span>}
                </div>
              </div>

              <div className="p-8 pt-0 grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleOpenEdit(proj)}
                  className="flex items-center justify-center gap-2 border border-border hover:border-text-primary py-3 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                >
                  <Edit2 size={12} /> Ubah
                </button>
                <button
                  onClick={() => handleDelete(proj.id)}
                  className="flex items-center justify-center gap-2 border border-border hover:border-accent hover:text-accent py-3 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer text-text-muted"
                >
                  <Trash2 size={12} /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-10">
          <div className="bg-bg-primary border border-border w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col relative">
            
            <div className="flex-none bg-bg-primary border-b border-border p-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-accent flex items-center justify-center text-white shrink-0">
                   {editingId ? <Edit2 size={20} /> : <Plus size={20} />}
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter text-text-primary leading-none">
                    {editingId ? 'Ubah Data Proyek' : 'Tambah Proyek Baru'}
                  </h2>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-text-muted">ID Data: {editingId || 'BARU'}</span>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center border border-border hover:border-accent hover:text-accent transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-12 custom-scrollbar" data-lenis-prevent>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-accent">
                      <FileText size={14} /> Identitas Dasar
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-text-muted mb-2">Nama Proyek *</label>
                        <input
                          type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                          className="w-full bg-bg-secondary border border-border focus:border-accent px-4 py-3 text-sm text-text-primary outline-none transition-colors"
                          placeholder="Contoh: CuanCerdas"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-text-muted mb-2">Peran Operasional *</label>
                        <input
                          type="text" required value={role} onChange={(e) => setRole(e.target.value)}
                          className="w-full bg-bg-secondary border border-border focus:border-accent px-4 py-3 text-sm text-text-primary outline-none transition-colors"
                          placeholder="Contoh: Fullstack Developer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-accent">
                      <Palette size={14} /> Visual & Prioritas
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-text-muted mb-2">Warna Aksen Utama</label>
                        <div className="flex gap-2">
                          <input
                            type="color" value={hoverColor} onChange={(e) => setHoverColor(e.target.value)}
                            className="h-[46px] w-16 bg-bg-secondary border border-border p-1 cursor-pointer"
                          />
                          <input
                            type="text" value={hoverColor} onChange={(e) => setHoverColor(e.target.value)}
                            className="flex-1 bg-bg-secondary border border-border focus:border-accent px-4 py-3 font-mono text-xs text-text-primary outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-text-muted mb-2">Urutan Tampil</label>
                        <input
                          type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}
                          className="w-full bg-bg-secondary border border-border focus:border-accent px-4 py-3 text-sm text-text-primary outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8 pt-8 border-t border-border">
                  <div className="flex items-center gap-3 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-accent">
                    <Layers size={14} /> Dokumentasi Modul
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-text-muted mb-2">Ringkasan Singkat (Overview) *</label>
                      <textarea
                        required rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-bg-secondary border border-border focus:border-accent px-4 py-3 text-sm text-text-primary outline-none resize-none"
                        placeholder="Deskripsi 1-2 kalimat untuk kartu proyek..."
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-text-muted mb-2">Dokumentasi Teknis Lengkap</label>
                      <textarea
                        rows={8} value={longDescription} onChange={(e) => setLongDescription(e.target.value)}
                        className="w-full bg-bg-secondary border border-border focus:border-accent px-4 py-4 text-sm text-text-primary outline-none"
                        placeholder="Detail teknis, tantangan, dan keputusan arsitektur..."
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-8 pt-8 border-t border-border pb-10">
                   <div className="flex items-center gap-3 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-accent">
                      <Upload size={14} /> Manajemen Aset Media
                   </div>
                   
                   <div className="space-y-8">
                      <div className="space-y-4">
                        <label className="block text-[9px] font-black uppercase tracking-widest text-text-muted">Aset Utama (Media Pertama)</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                          <div className="relative group aspect-video bg-bg-elevated border border-border overflow-hidden">
                             {imageFile || imageUrl ? (
                               <>
                                  {isVideo(imageFile?.name || imageUrl) ? (
                                    <video src={imageFile ? URL.createObjectURL(imageFile) : imageUrl} className="w-full h-full object-cover" muted autoPlay loop />
                                  ) : (
                                    <img src={imageFile ? URL.createObjectURL(imageFile) : imageUrl} className="w-full h-full object-cover" alt="Preview" />
                                  )}
                                  <button 
                                    type="button" 
                                    onClick={clearPrimaryImage}
                                    className="absolute top-2 right-2 p-2 bg-black/60 text-white hover:bg-accent transition-colors cursor-pointer"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                               </>
                             ) : (
                               <div className="w-full h-full flex items-center justify-center text-text-muted opacity-20"><Palette size={48}/></div>
                             )}
                          </div>
                          <div className="space-y-4">
                            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border hover:border-accent hover:text-accent px-6 py-10 cursor-pointer text-[10px] font-black uppercase tracking-widest transition-all">
                                <Upload size={16} /> {imageFile || imageUrl ? 'Ganti Aset' : 'Unggah Media Utama'}
                                <input type="file" accept="image/*,video/*" onChange={(e) => setImageFile(e.target.files[0])} className="hidden" />
                            </label>
                            <p className="text-[9px] text-text-muted leading-relaxed">Optimasi otomatis aktif untuk gambar agar tetap ringan dan jernih.</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="block text-[9px] font-black uppercase tracking-widest text-text-muted">Daftar Galeri // ({galleryImages.length} aset terpasang)</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                           {galleryImages.map((url, idx) => (
                             <div key={idx} className="relative aspect-video border border-border group overflow-hidden bg-bg-elevated">
                                {isVideo(url) ? (
                                  <video src={url} className="w-full h-full object-cover" muted />
                                ) : (
                                  <img src={url} className="w-full h-full object-cover" alt="" />
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                   <a href={url} target="_blank" rel="noreferrer" className="p-2 bg-white/10 hover:bg-accent text-white transition-all cursor-pointer"><Eye size={12}/></a>
                                   <button type="button" onClick={() => removeGalleryImage(idx)} className="p-2 bg-white/10 hover:bg-accent text-white transition-all cursor-pointer"><Trash2 size={12}/></button>
                                </div>
                             </div>
                           ))}
                           
                           <label className="aspect-video border-2 border-dashed border-border hover:border-accent hover:text-accent flex flex-col items-center justify-center gap-2 cursor-pointer transition-all">
                              <Plus size={20} />
                              <span className="text-[8px] font-black uppercase tracking-widest">Tambah Aset</span>
                              <input type="file" accept="image/*,video/*" multiple onChange={handleGalleryFilesChange} className="hidden" />
                           </label>
                        </div>
                        {galleryFiles.length > 0 && <p className="text-[9px] font-mono text-accent uppercase">{galleryFiles.length} file baru siap diunggah</p>}
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-border">
                   <div className="space-y-6">
                    <div className="flex items-center gap-3 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-accent">
                      <LinkIcon size={14} /> Tautan Akses
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-text-muted mb-2">URL Demo Langsung</label>
                        <input
                          type="url" value={demoLink} onChange={(e) => setDemoLink(e.target.value)}
                          className="w-full bg-bg-secondary border border-border focus:border-accent px-4 py-3 text-sm text-text-primary outline-none"
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-text-muted mb-2">Repositori Kode (Git)</label>
                        <input
                          type="url" value={repoLink} onChange={(e) => setRepoLink(e.target.value)}
                          className="w-full bg-bg-secondary border border-border focus:border-accent px-4 py-3 text-sm text-text-primary outline-none"
                          placeholder="https://github.com/..."
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-accent">
                      <Layers size={14} /> Teknologi Inti
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-text-muted mb-2">Daftar Keahlian (pisahkan dengan koma)</label>
                      <input
                        type="text" value={techStackInput} onChange={(e) => setTechStackInput(e.target.value)}
                        className="w-full bg-bg-secondary border border-border focus:border-accent px-4 py-3 text-sm text-text-primary outline-none"
                        placeholder="React, Node.js, Supabase..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-none bg-bg-primary border-t border-border p-6 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-text-primary text-bg-primary hover:bg-accent hover:text-white font-black uppercase tracking-widest py-5 text-[10px] transition-all duration-300 shadow-xl cursor-pointer"
                >
                  Simpan Perubahan // Konfirmasi
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-32 border border-border hover:border-text-primary text-text-primary font-black uppercase tracking-widest py-5 text-[10px] transition-all duration-300 cursor-pointer"
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
