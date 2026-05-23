import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { 
  ArrowLeft, ArrowUpRight, Github, 
  ChevronRight, ChevronLeft, Gamepad2
} from 'lucide-react'

const getProjectType = (title) => {
  const t = title?.toLowerCase() || '';
  if (t.includes('cuancerdas')) return 'Capstone Project';
  if (t.includes('tarupramana')) return 'Capstone Project';
  if (t.includes('skensamotohub')) return 'School Project';
  if (t.includes('kas-app')) return 'Personal Project';
  if (t.includes('banaspati')) return 'Experimental Game';
  return 'Personal Project';
}

const getProjectPlatform = (title) => {
  const t = title?.toLowerCase() || '';
  if (t.includes('cuancerdas')) return 'Web Application';
  if (t.includes('tarupramana')) return 'Web Application';
  if (t.includes('skensamotohub')) return 'Web App (Local Server)';
  if (t.includes('kas-app')) return 'Web Application';
  if (t.includes('banaspati')) return 'Web / Scratch Playable';
  return 'Web Application';
}

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [prevImage, setPrevImage] = useState(null)
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    async function fetchProject() {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single()
        
        if (error) throw error
        setProject(data)
      } catch (err) {
        console.error('Error fetching project:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center font-mono text-[10px] uppercase tracking-[0.5em]">
        Memuat Data Proyek...
      </div>
    )
  }

  if (!project) return null

  const isVideo = (url) => {
    if (!url) return false
    return url.match(/\.(mp4|webm|ogg|mov)$/i)
  }

  const rawMedia = [project.image_url, ...(project.gallery_images || [])].filter(Boolean)
  const allImages = [...rawMedia].sort((a, b) => {
    const aIsVideo = isVideo(a)
    const bIsVideo = isVideo(b)
    if (aIsVideo && !bIsVideo) return -1
    if (!aIsVideo && bIsVideo) return 1
    return 0
  })

  const handleNext = () => {
    setPrevImage(allImages[activeImage])
    setIsNavigating(true)
    setActiveImage((prev) => (prev + 1) % allImages.length)
  }

  const handlePrev = () => {
    setPrevImage(allImages[activeImage])
    setIsNavigating(true)
    setActiveImage((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  const handleSelectThumb = (idx) => {
    if (idx === activeImage) return
    setPrevImage(allImages[activeImage])
    setIsNavigating(true)
    setActiveImage(idx)
  }

  const MediaRenderer = ({ url, className }) => {
    if (isVideo(url)) {
      return (
        <video
          src={url}
          muted
          loop
          autoPlay
          playsInline
          disablePictureInPicture
          className={`${className} object-cover`}
        />
      )
    }
    return <img src={url} className={`${className} object-cover`} alt="" />
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  const isBanaspati = project.title?.toLowerCase().includes('banaspati')

  return (
    <div className="bg-bg-primary text-text-primary min-h-screen selection:bg-accent selection:text-white transition-colors duration-500">
      
      <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-10 flex justify-between items-center mix-blend-difference text-white">
        <button onClick={handleBack} className="flex items-center gap-2 group cursor-pointer bg-transparent border-none outline-none text-white">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Kembali</span>
        </button>
        <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest hidden md:block">
          {project.title}
        </span>
      </nav>

      <section className="pt-40 pb-20 px-6 md:px-12 border-b border-border">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
            <div className="flex-1 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-px bg-accent"></div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Project</span>
              </div>
              <h1 className="text-5xl md:text-9xl font-black leading-[0.85] uppercase tracking-tighter break-words">
                {project.title}
              </h1>
              
              <div className="flex flex-wrap gap-2 pt-4">
                {project.tech_stack?.map(tech => (
                  <span key={tech} className="px-4 py-2 bg-bg-secondary border border-border text-[9px] font-black uppercase tracking-widest text-text-primary">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-6 md:min-w-[400px] border-l border-border pl-12">
              <div className="space-y-1">
                <span className="block font-mono text-[9px] uppercase tracking-widest text-text-muted">Kontribusi</span>
                <span className="block text-sm font-black uppercase tracking-tight">{project.role || 'Pengembang'}</span>
              </div>
              <div className="space-y-1">
                <span className="block font-mono text-[9px] uppercase tracking-widest text-text-muted">Diluncurkan</span>
                <span className="block text-sm font-black uppercase tracking-tight">{new Date(project.created_at).getFullYear()}</span>
              </div>
              <div className="space-y-1">
                <span className="block font-mono text-[9px] uppercase tracking-widest text-text-muted">Tipe Proyek</span>
                <span className="block text-sm font-black uppercase tracking-tight">{getProjectType(project.title)}</span>
              </div>
              <div className="space-y-1">
                <span className="block font-mono text-[9px] uppercase tracking-widest text-text-muted">Platform</span>
                <span className="block text-sm font-black uppercase tracking-tight">{getProjectPlatform(project.title)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 md:px-12 bg-bg-secondary/20">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="relative aspect-video w-full overflow-hidden border border-border bg-bg-elevated group shadow-2xl">
            {prevImage && (
              <div className="absolute inset-0 w-full h-full">
                <MediaRenderer 
                  url={prevImage} 
                  className="w-full h-full" 
                />
              </div>
            )}

            <div key={activeImage} className={`relative z-10 w-full h-full ${isNavigating ? 'animate-fade-simple' : 'animate-fade-blur'}`}>
               <MediaRenderer 
                url={allImages[activeImage]} 
                className="w-full h-full" 
              />
            </div>
            
            {allImages.length > 1 && (
              <div className="z-20">
                <div className="absolute inset-y-0 left-0 flex items-center p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={handlePrev}
                    className="w-16 h-16 bg-bg-primary/90 backdrop-blur-md border border-border flex items-center justify-center hover:bg-accent hover:text-white transition-all cursor-pointer shadow-2xl"
                  >
                    <ChevronLeft size={24} />
                  </button>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={handleNext}
                    className="w-16 h-16 bg-bg-primary/90 backdrop-blur-md border border-border flex items-center justify-center hover:bg-accent hover:text-white transition-all cursor-pointer shadow-2xl"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>
            )}
            
            <div className="absolute top-8 left-8 font-mono text-[10px] bg-bg-primary/90 px-4 py-2 border border-border uppercase tracking-widest backdrop-blur-sm z-20">
              Visualisasi {activeImage + 1} / {allImages.length}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
             <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4 w-full flex-grow">
                {allImages.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleSelectThumb(idx)}
                    className={`aspect-video border-2 transition-all overflow-hidden ${activeImage === idx ? 'border-accent scale-105' : 'border-border opacity-40 hover:opacity-100'}`}
                  >
                    {isVideo(img) ? (
                      <video src={img} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-4 w-full lg:w-auto shrink-0">
                {project.demo_link && (
                  <a 
                    href={project.demo_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-text-primary text-bg-primary px-8 py-4 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-accent hover:text-white transition-all duration-500 shadow-lg"
                  >
                    Buka Proyek <ArrowUpRight size={14} />
                  </a>
                )}
                {project.repo_link && (
                  <a 
                    href={project.repo_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 lg:flex-none flex items-center justify-center gap-3 border-2 border-border px-8 py-4 font-black uppercase tracking-[0.2em] text-[10px] hover:border-accent hover:text-accent transition-all duration-500"
                  >
                    <Github size={16} /> Repositori
                  </a>
                )}
              </div>
          </div>
        </div>
      </section>

      {isBanaspati && (
        <section className="py-32 px-6 md:px-12 border-y border-border bg-black/40 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--color-accent) 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
          
          <div className="max-w-7xl mx-auto space-y-16 relative z-10 flex flex-col items-center text-center">
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-px bg-accent"></div>
                <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-accent">SCRATCH GAME</span>
                <div className="w-12 h-px bg-accent"></div>
              </div>
              <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                COBA MAINKAN!
              </h2>
              <p className="font-mono text-[10px] text-text-muted uppercase tracking-[0.2em]">DI HARAPKAN MEMAINKANYA MENGGUNAKAN LAPTOP</p>
            </div>

            <div className="w-full max-w-[800px] relative">
               <div className="absolute -inset-4 border border-accent/20 animate-pulse pointer-events-none"></div>
               <div className="relative aspect-[485/402] w-full border-4 border-border bg-black shadow-[0_0_50px_rgba(0,85,212,0.1)] overflow-hidden">
                  <iframe 
                    src="https://scratch.mit.edu/projects/1107983820/embed" 
                    allowtransparency="true" 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
               </div>
            </div>

            {/* <div className="flex items-center gap-6 font-mono text-[9px] text-text-muted uppercase tracking-[0.3em]">
               <div className="flex items-center gap-2"><Gamepad2 size={12} className="text-accent" /> Gunakan Kontrol untuk Bermain</div>
               <div className="w-1 h-1 bg-border rounded-full"></div>
               <div>Ditanam melalui API Scratch MIT</div>
            </div> */}
          </div>
        </section>
      )}

      {project.long_description && (
        <section className="py-32 px-6 md:px-12">
          <div className="max-w-4xl mx-auto space-y-16">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-accent">Studi Kasus Teknis</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                Analisis Mendalam & <br/> Desain Arsitektur
              </h2>
            </div>
            
            <div className="prose prose-invert max-w-none space-y-8">
              {project.long_description.split('\n').filter(Boolean).map((para, i) => (
                <p key={i} className="text-base md:text-lg text-text-secondary leading-relaxed font-medium">
                  {para}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="p-10 border-t border-border flex justify-between items-center bg-bg-primary text-[9px] font-black uppercase tracking-[0.5em] text-text-muted opacity-50">
        <span>ANRA // PORTFOLIO</span>
        <span className="tracking-[0.5em]">ALL RIGHT RESERVED.</span>
      </footer>

    </div>
  )
}
