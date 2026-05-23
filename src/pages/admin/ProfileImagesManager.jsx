import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react'
import { compressImage } from '../../lib/imageUtils'

export default function ProfileImagesManager() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchImages()
  }, [])

  async function fetchImages() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profile_images')
        .select('*')
        .order('sort_order', { ascending: true })
      if (error) throw error
      setImages(data || [])
    } catch (err) {
      alert('Gagal memuat foto profil: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)

      // Kompres gambar otomatis sebelum upload
      // maxWidth 1200 cukup jernih untuk foto profil, quality 0.8 sangat ringan
      const compressedFile = await compressImage(file, { maxWidth: 1200, quality: 0.8 })

      const fileExt = compressedFile.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `profiles/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, compressedFile)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath)

      const { error: dbError } = await supabase
        .from('profile_images')
        .insert([{ image_url: data.publicUrl, sort_order: images.length }])

      if (dbError) throw dbError

      fetchImages()
    } catch (err) {
      alert('Gagal mengunggah foto: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id, url) => {
    if (!confirm('Hapus foto ini?')) return
    try {
      // 1. Delete from DB
      const { error: dbError } = await supabase
        .from('profile_images')
        .delete()
        .eq('id', id)
      
      if (dbError) throw dbError

      // 2. Delete from Storage (Optional but clean)
      const path = url.split('/').pop()
      await supabase.storage.from('profile-images').remove([`profiles/${path}`])

      fetchImages()
    } catch (err) {
      alert('Gagal menghapus foto: ' + err.message)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-text-primary tracking-tight uppercase">
          Foto Profil
        </h1>
        <p className="text-text-secondary mt-1">
          Kelola kumpulan foto yang akan berganti secara otomatis di halaman utama.
        </p>
      </div>

      <div className="bg-bg-secondary border-2 border-border p-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {images.map((img) => (
            <div key={img.id} className="relative aspect-[4/5] border-2 border-border group overflow-hidden bg-bg-elevated">
              <img src={img.image_url} className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={() => handleDelete(img.id, img.image_url)}
                  className="p-3 bg-accent text-white hover:scale-110 transition-transform cursor-pointer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          <label className={`aspect-[4/5] border-2 border-dashed border-border hover:border-accent hover:text-accent flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            {uploading ? (
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Plus size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest text-center px-2">Tambah Foto</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
        </div>
      </div>

      <div className="bg-bg-secondary border-2 border-border p-6">
        <div className="flex gap-4 items-start text-text-muted">
           <ImageIcon size={20} className="shrink-0 mt-1" />
           <p className="text-xs leading-relaxed">
             <strong className="text-text-primary">Optimasi Otomatis Aktif:</strong> Setiap gambar yang Anda unggah akan dikompres secara otomatis untuk memastikan website tetap ringan tanpa mengurangi kejernihan gambar. Disarankan menggunakan rasio Portrait (4:5).
           </p>
        </div>
      </div>
    </div>
  )
}
