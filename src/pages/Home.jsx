import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useScrollReveal, useStaggerReveal } from '../hooks/useScrollReveal'
import { 
  ArrowUpRight, Github, Instagram, Linkedin, ArrowRight, 
  Code2, Cpu, Globe, Database, Layout, Smartphone, 
  Terminal, Layers, Monitor, Command, Zap, Shield, Search,
  Box, Coffee, Palette, Settings, Sun, Moon
} from 'lucide-react'
import anraHero from '../assets/images/Anra2.png'

const SwissStar = ({ className = "" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 0 L56 35 L90 20 L65 44 L100 50 L65 56 L90 80 L56 65 L50 100 L44 65 L10 80 L35 56 L0 50 L35 44 L10 20 L44 35 Z" />
  </svg>
)

const SwissCircle = ({ className = "" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="1">
    <circle cx="50" cy="50" r="40" />
  </svg>
)

const SwissLine = ({ className = "" }) => (
  <div className={`bg-border/40 ${className}`} />
)

const SwissDots = ({ className = "" }) => (
  <div className={`grid grid-cols-6 gap-2 ${className}`}>
    {[...Array(24)].map((_, i) => (
      <div key={i} className="w-1 h-1 bg-accent/20 rounded-full" />
    ))}
  </div>
)

const SwissHeadingText = ({ text, className = "" }) => (
  <div className={`absolute select-none pointer-events-none font-black uppercase tracking-tighter text-[20vw] leading-none opacity-[0.04] whitespace-nowrap ${className}`} style={{ WebkitTextStroke: '1px currentColor', color: 'transparent' }}>
    {text}
  </div>
)

const SwissDataLabel = ({ label, value, className = "" }) => (
  <div className={`font-mono text-[8px] uppercase tracking-[0.2em] flex flex-col gap-1 ${className}`}>
    <span className="text-text-muted">{label}</span>
    <span className="text-accent font-bold">{value}</span>
  </div>
)

const useTypewriter = (words, speed = 150, delay = 2000) => {
  const [index, setIndex] = useState(0)
  const [subIndex, setSubIndex] = useState(0)
  const [reverse, setReverse] = useState(false)

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !reverse) {
      const timeout = setTimeout(() => setReverse(true), delay)
      return () => clearTimeout(timeout)
    }
    if (subIndex === 0 && reverse) {
      const timeout = setTimeout(() => {
        setReverse(false)
        setIndex((prev) => (prev + 1) % words.length)
      }, 500)
      return () => clearTimeout(timeout)
    }
    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1))
    }, reverse ? speed / 2 : speed)
    return () => clearTimeout(timeout)
  }, [subIndex, index, reverse, words, speed, delay])

  return words[index].substring(0, subIndex)
}

export default function Home() {
  const [projects, setProjects] = useState([])
  const [experiences, setExperiences] = useState([])
  const [skills, setSkills] = useState([])
  const [profileImages, setProfileImages] = useState([])
  const [currentProfileIdx, setCurrentProfileIdx] = useState(0)
  const [prevProfileIdx, setPrevProfileIdx] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLightMode, setIsLightMode] = useState(false)
  const [spotifyEmbedUrl, setSpotifyEmbedUrl] = useState('https://open.spotify.com/embed/playlist/5KlJLq6QyiuBWvwmnC3kvi?utm_source=generator&theme=0')

  const heroReveal = useScrollReveal()
  const aboutReveal = useScrollReveal()
  const projectsReveal = useStaggerReveal()
  const expReveal = useStaggerReveal()
  const skillsReveal = useStaggerReveal()
  
  const skillsHeaderReveal = useScrollReveal()
  const projectsHeaderReveal = useScrollReveal()
  const expHeaderReveal = useScrollReveal()
  const spotifyReveal = useScrollReveal()
  const contactReveal = useScrollReveal()

  const aboutRef = useRef(null)
  const skillsRef = useRef(null)
  const projectsRef = useRef(null)
  const experienceRef = useRef(null)
  const spotifyRef = useRef(null)
  const contactRef = useRef(null)

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth' })

  const iconMap = {
    Code2, Database, Layout, Terminal, Layers, Command,
    Smartphone, Globe, Cpu, Monitor, Zap, Shield, Search,
    Box, Coffee, Github, Palette, Settings
  }

  const typewriterText = useTypewriter([
    "Fullstack",
    "UI/UX Enthusiast",
    "Halo Semuanya!",
    "Siswa SMK Negeri 1 Denpasar"
  ])

  // Logic ganti foto otomatis tiap 10 detik (durasi diam jauh lebih lama)
  useEffect(() => {
    if (profileImages.length <= 1) return
    const interval = setInterval(() => {
      setPrevProfileIdx(currentProfileIdx)
      setCurrentProfileIdx((prev) => (prev + 1) % profileImages.length)
    }, 10000) 
    return () => clearInterval(interval)
  }, [profileImages, currentProfileIdx])

  const toggleTheme = () => {
    setIsLightMode(!isLightMode)
    document.documentElement.classList.toggle('light')
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'light') {
      setIsLightMode(true)
      document.documentElement.classList.add('light')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark')
  }, [isLightMode])

  useEffect(() => {
    async function fetchData() {
      try {
        const [p, e, s, img] = await Promise.all([
          supabase.from('projects').select('*').order('sort_order'),
          supabase.from('experiences').select('*').order('sort_order'),
          supabase.from('skills').select('*').order('sort_order'),
          supabase.from('profile_images').select('*').order('sort_order')
        ])
        setProjects(p.data || [])
        setExperiences(e.data || [])
        setSkills(s.data || [])
        setProfileImages(img.data || [])
      } catch (err) {
        console.error('Fetch error:', err)
        setProfileImages([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const isVideo = (url) => {
    if (!url) return false
    return url.match(/\.(mp4|webm|ogg|mov)$/i)
  }

  const currentProfileUrl = profileImages.length > 0 
    ? profileImages[currentProfileIdx]?.image_url 
    : anraHero

  const prevProfileUrl = prevProfileIdx !== null && profileImages.length > 0
    ? profileImages[prevProfileIdx]?.image_url
    : null

  return (
    <div className="bg-bg-primary text-text-primary min-h-screen relative overflow-x-hidden transition-colors duration-500 ease-[var(--ease-out-expo)]">

      <nav className="fixed top-0 left-0 w-full z-50 p-8 md:p-12 flex justify-between items-center mix-blend-difference text-white">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <span className="text-2xl font-black tracking-tighter uppercase">ANRA.</span>
        </div>
        <div className="hidden md:flex gap-12 items-center">
          {[
            { name: 'Profil', ref: aboutRef },
            { name: 'Keahlian', ref: skillsRef },
            { name: 'Proyek', ref: projectsRef },
            { name: 'Pengalaman', ref: experienceRef },
            { name: 'Musik', ref: spotifyRef },
            { name: 'Kontak', ref: contactRef }
          ].map((item) => (
            <button 
              key={item.name} 
              onClick={() => scrollTo(item.ref)} 
              className="text-[10px] font-black uppercase tracking-[0.3em] hover:text-accent transition-colors cursor-pointer"
            >
              {item.name}
            </button>
          ))}
          <button onClick={toggleTheme} className="p-2 border border-white/20 hover:border-white transition-colors cursor-pointer flex items-center justify-center">
            {isLightMode ? <Moon size={14} /> : <Sun size={14} />}
          </button>
        </div>
        <div className="md:hidden">
           <button onClick={toggleTheme} className="p-2 border border-white/20 hover:border-white transition-colors cursor-pointer">
            {isLightMode ? <Moon size={14} /> : <Sun size={14} />}
          </button>
        </div>
      </nav>

      <section ref={heroReveal} className="min-h-screen flex flex-col justify-center relative border-b border-border">
        <SwissHeadingText text="PROFIL" className="-top-10 -left-10" />
        <SwissStar className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-[70vh] h-[70vh] text-text-primary opacity-[0.015] pointer-events-none" />
        <SwissCircle className="absolute top-1/4 left-0 -translate-x-1/2 w-[40vh] h-[40vh] text-text-primary opacity-[0.03] pointer-events-none" />
        <SwissLine className="absolute top-[20%] right-[10%] w-px h-64 rotate-45 opacity-50" />
        <SwissDots className="absolute bottom-24 right-12 opacity-20" />

        {/* HERO CONTENT: Pushed down for better vertical center balance */}
        <div className="grid-system pt-54 pb-40">
          <div className="col-span-4 md:col-span-12 lg:col-span-10 z-10 text-left">
            <div className="flex items-center gap-4 mb-10 overflow-hidden fade-up stagger-1">
              <div className="w-12 h-px bg-accent"></div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-accent">
                {typewriterText}<span className="animate-blink">|</span>
              </div>
            </div>

            <h1 className="text-display mb-12 fade-up stagger-2">
              KOMANG<br />
              ANRASANSYA.
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative">
              <div className="space-y-12">
                <p className="text-xl font-medium text-text-secondary uppercase leading-tight tracking-tight max-w-lg fade-up stagger-3">
                  Membangun aplikasi web dan mobile dengan arsitektur bersih dan basis data terstruktur. Siswa RPL di SMK Negeri 1 Denpasar yang mengombinasikan keahlian teknis dan kepemimpinan.
                </p>

                <div className="flex gap-4 pt-4 fade-up stagger-4">
                   <a href="/CVAnra.pdf" target="_blank" className="bg-text-primary text-bg-primary px-10 py-5 font-black uppercase tracking-widest text-[10px] hover:bg-accent hover:text-white transition-all duration-500 flex items-center gap-3">
                    Unduh CV <ArrowUpRight size={14} />
                   </a>
                   <button onClick={() => scrollTo(contactRef)} className="border border-border px-10 py-5 font-black uppercase tracking-widest text-[10px] hover:border-accent transition-all duration-500">
                    Hubungi Saya
                   </button>
                </div>
              </div>
              <div className="hidden md:flex items-center justify-center relative">
                <div className="relative">
                  <SwissCircle className="w-64 h-64 text-accent/10 animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <SwissStar className="w-16 h-16 text-accent/20" />
                  </div>
                  <div className="absolute -top-12 -right-12">
                    <SwissDots className="opacity-20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={aboutRef} className="py-48 relative overflow-hidden bg-bg-secondary border-b border-border transition-colors duration-500">
        <SwissHeadingText text="01" className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05]" />
        <SwissLine className="absolute left-0 top-1/2 w-full h-px opacity-20" />
        <SwissLine className="absolute right-1/4 top-0 w-px h-full opacity-10" />
        <SwissDots className="absolute top-12 left-12 opacity-30 rotate-90" />

        <div ref={aboutReveal} className="fade-up grid-system items-center relative z-10">
          <div className="col-span-4 md:col-span-5 lg:col-span-4 mb-16 lg:mb-0">
            <div className="relative group">
              <div className="absolute -inset-4 border border-border group-hover:border-accent/30 transition-colors duration-500"></div>
              
              {/* Box Foto dengan Cross-fade Smooth */}
              <div className="relative z-10 w-full aspect-[4/5] overflow-hidden border border-border bg-bg-primary">
                 {/* Background Layer: Previous Image */}
                 {prevProfileUrl && (
                   <img 
                     src={prevProfileUrl} 
                     alt="" 
                     className="absolute inset-0 w-full h-full object-cover grayscale opacity-40" 
                   />
                 )}
                 {/* Foreground Layer: Current Image with Animation */}
                 <img 
                   key={currentProfileUrl}
                   src={currentProfileUrl} 
                   alt="Anra" 
                   className="relative w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 animate-fade-simple" 
                 />
              </div>

              <SwissStar className="absolute -bottom-8 -right-8 w-16 h-16 text-accent z-20" />
              <SwissCircle className="absolute -top-8 -left-8 w-20 h-20 text-text-primary opacity-[0.05] z-0" />
              <SwissDataLabel label="ID_Profil" value="001-ANRA-2026" className="absolute -bottom-16 left-0" />
            </div>
          </div>
          <div className="col-span-4 md:col-span-7 lg:col-start-6 space-y-12 text-left relative">
            <div className="flex items-center gap-4">
               <div className="w-8 h-px bg-accent"></div>
               <span className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-accent">TENTANG</span>
            </div>
            <h2 className="text-headline tracking-tighter">LET KNOW <br/>ABOUT <span className="text-accent">ME.</span></h2>
            <div className="space-y-6 text-lg text-text-secondary leading-relaxed">
              <p>
                Halo! Saya I Nyoman Anrasansya Dharma Putra, siswa kelas 11 jurusan Rekayasa Perangkat Lunak (RPL) di SMK Negeri 1 Denpasar yang fokus mendalami pengembangan aplikasi web dan mobile serta aktif mengeksplorasi teknologi baru dalam pembuatan software. Di lingkungan sekolah, saya telah merancang berbagai proyek aplikasi berbasis website dan mengasah kemampuan dalam merancang basis data yang terstruktur dengan baik. Pengalaman teknis saya diperkuat melalui program beasiswa Coding Camp Indonesia selama dua tahun berturut-turut (2025–2026), di mana saya berkolaborasi menggunakan metode agile untuk membangun proyek CuanCerdas dan TaruPramana, sekaligus mematangkan pemahaman tech stack seperti React dan Node.js serta melatih keterampilan komunikasi bahasa Inggris. Selain fokus di dunia teknologi, saya juga melatih kapasitas kepemimpinan dan manajerial sebagai Ketua Paskibra Kansa SKENSA untuk periode 2026–2027 setelah sebelumnya sukses bertindak sebagai Wakil Ketua 2, sebuah kombinasi keahlian teknis dan kepemimpinan yang menjadi modal utama saya untuk siap berkontribusi nyata di industri profesional.
              </p>
            </div>
            <div className="flex items-center gap-6 mt-12">
              <SwissLine className="w-32 h-1 bg-accent" />
              <span className="font-mono text-[8px] text-text-muted tracking-[0.4em]">TEKNOLOGI / KEPEMIMPINAN</span>
            </div>
          </div>
        </div>
      </section>

      <section ref={skillsRef} className="py-48 border-b border-border relative overflow-hidden bg-bg-secondary/30 transition-colors duration-500">
        <SwissHeadingText text="TECH" className="-top-20 right-10" />
        <div ref={skillsHeaderReveal} className="fade-up grid-system mb-32">
          <div className="col-span-4 md:col-span-8 text-left relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-px bg-accent"></div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Keahlian Teknis</div>
            </div>
            <h2 className="text-headline tracking-tighter">TECH STACK.</h2>
          </div>
        </div>

        <div ref={skillsReveal} className="grid-system">
          <div className="col-span-4 md:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
            {skills.map((skill, idx) => {
              const Icon = iconMap[skill.icon_name]
              return (
                <div key={skill.id} className={`fade-up stagger-${(idx % 4) + 1} bg-bg-primary p-12 group hover:border-accent transition-all duration-300 relative`}>
                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-start">
                      <div className="font-mono text-[8px] text-text-muted group-hover:text-accent font-bold uppercase tracking-[0.3em] transition-colors">{skill.category}</div>
                      {Icon && <Icon size={20} className="text-text-muted group-hover:text-accent transition-colors" />}
                    </div>
                    <h3 className="text-4xl font-black uppercase tracking-tighter text-text-primary group-hover:text-accent transition-colors duration-300">{skill.name}</h3>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section ref={projectsRef} className="py-48 border-b border-border relative overflow-hidden transition-colors duration-500">
        <SwissHeadingText text="KARYA" className="-bottom-20 right-0" />
        <SwissCircle className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-[60vh] h-[60vh] text-text-primary opacity-[0.02] pointer-events-none" />
        
        <div ref={projectsHeaderReveal} className="fade-up grid-system mb-32 items-end">
          <div className="col-span-4 md:col-span-8 text-left relative">
             <div className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-accent mb-6">WORKS</div>
             <h2 className="text-headline tracking-tighter">PROJECT.</h2>
             <SwissLine className="absolute -left-12 top-0 w-8 h-px bg-accent/30" />
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center font-mono text-[10px] animate-pulse uppercase tracking-widest">Memuat data proyek...</div>
        ) : (
          <div ref={projectsReveal} className="grid-system gap-y-12">
            {projects.map((proj, idx) => (
              <Link key={proj.id} to={`/project/${proj.id}`} className={`fade-up stagger-${(idx % 3) + 1} col-span-4 md:col-span-6 lg:col-span-4 group cursor-pointer`} style={{ '--color-accent': proj.hover_color || '#0055D4' }}>
                <div className="bg-bg-secondary border border-border h-full flex flex-col transition-all duration-500 hover:border-accent relative text-left overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />
                  <div className="relative aspect-video overflow-hidden border-b border-border bg-bg-elevated">
                    {proj.image_url ? (
                      isVideo(proj.image_url) ? (
                        <video src={proj.image_url} muted loop autoPlay playsInline className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105" />
                      ) : (
                        <img src={proj.image_url} alt={proj.title} className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105" />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <SwissStar className="w-12 h-12 text-text-primary opacity-[0.05]" />
                      </div>
                    )}
                  </div>
                  <div className="p-10 flex-grow flex flex-col justify-between relative">
                    <SwissCircle className="absolute -bottom-4 -right-4 w-24 h-24 text-text-primary opacity-[0.04] group-hover:text-accent/5 transition-colors" />
                    <div className="space-y-6">
                      <h3 className="text-3xl font-black uppercase tracking-tighter leading-none group-hover:text-accent transition-colors">{proj.title}</h3>
                      <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">{proj.description}</p>
                    </div>
                    <div className="mt-12 pt-8 border-t border-border flex justify-between items-center">
                      <div className="flex flex-wrap gap-2">
                        {proj.tech_stack?.slice(0, 4).map(t => (
                          <span key={t} className="text-[8px] font-bold text-text-muted uppercase tracking-widest border border-border px-2 py-0.5">{t}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {proj.repo_link && (
                          <a href={proj.repo_link} target="_blank" rel="noopener noreferrer" className="p-3 border border-border hover:bg-accent hover:border-accent transition-all duration-300 group-hover:text-white" title="Repositori">
                            <Github size={18} />
                          </a>
                        )}
                        {proj.demo_link && (
                          <a href={proj.demo_link} target="_blank" rel="noopener noreferrer" className="p-3 border border-border hover:bg-accent hover:border-accent transition-all duration-300 group-hover:text-white" title="Demo Langsung">
                            <ArrowUpRight size={18} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section ref={experienceRef} className="py-48 bg-bg-secondary border-b border-border relative overflow-hidden transition-colors duration-500">
        <SwissHeadingText text="RIWAYAT" className="top-0 left-0 rotate-90 origin-top-left -translate-y-1/2" />
        <SwissLine className="absolute left-12 top-0 w-px h-full bg-border/20" />
        <SwissDots className="absolute top-24 right-12 opacity-10" />
        
        <div ref={expHeaderReveal} className="fade-up grid-system relative z-10">
          <div className="col-span-4 md:col-span-12 mb-24 text-left flex justify-between items-end">
             <div>
               <div className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-accent mb-6">PENGALAMAN</div>
               <h2 className="text-headline tracking-tighter">EXPERIENCE.</h2>
             </div>
             <SwissDataLabel label="Pembaruan" value="MEI_2026" className="hidden md:flex" />
          </div>

          <div ref={expReveal} className="col-span-4 md:col-span-12 space-y-px bg-border border-y border-border relative">
            {experiences.map((exp, idx) => (
              <div key={exp.id} className={`fade-up stagger-${(idx % 2) + 1} bg-bg-secondary py-16 px-6 group transition-colors hover:bg-bg-elevated relative overflow-hidden`}>
                <div className="flex flex-col md:flex-row justify-between items-start gap-12 max-w-7xl mx-auto w-full text-left">
                  <div className="flex gap-12 items-start">
                    <span className="font-mono text-[10px] text-accent font-bold mt-2">0{idx + 1}</span>
                    <div>
                      <h3 className="text-3xl font-black uppercase tracking-tighter group-hover:text-accent transition-colors">{exp.title}</h3>
                      <div className="text-sm font-bold text-text-secondary uppercase tracking-widest mt-2">{exp.organization}</div>
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end gap-6 min-w-[280px] md:text-right">
                    <div>
                      <span className="inline-block font-mono text-[10px] text-text-muted uppercase tracking-widest border border-border px-3 py-1">
                        {exp.start_date.split('-')[0]} &mdash; {exp.is_current ? 'SEKARANG' : exp.end_date?.split('-')[0]}
                      </span>
                    </div>
                    <p className="text-[12px] text-text-secondary leading-relaxed max-w-md">
                      {exp.description}
                    </p>
                  </div>
                </div>
                <SwissCircle className="absolute -right-12 top-1/2 -translate-y-1/2 w-48 h-48 text-text-primary opacity-[0.02] pointer-events-none group-hover:text-accent/5 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={spotifyReveal} className="py-48 border-b border-border relative overflow-hidden bg-bg-secondary/10 transition-colors duration-500">
        <div ref={spotifyRef} className="absolute top-0 left-0 w-full h-1" />
        <SwissHeadingText text="MUSIK" className="-bottom-20 left-10" />
        <SwissCircle className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[50vh] h-[50vh] text-text-primary opacity-[0.015] pointer-events-none" />
        <SwissLine className="absolute right-12 top-0 w-px h-full bg-border/20" />
        
        <div className="fade-up grid-system relative z-10 items-center">
          <div className="col-span-4 md:col-span-12 lg:col-span-5 text-left space-y-8 mb-16 lg:mb-0">
            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-accent mb-6">SOUNDTRACK</div>
              <h2 className="text-headline tracking-tighter">PLAYLIST SPOTIFY.</h2>
            </div>
            
            <p className="text-sm text-text-secondary leading-relaxed max-w-lg">
              Musik yang menemani saya di mana pun berada, baik saat sedang fokus maupun dalam menjalani aktivitas sehari-hari.
            </p>

            <div className="space-y-4 pt-4 border-t border-border">
              <div className="font-mono text-[9px] text-accent font-bold uppercase tracking-[0.3em]">LAGU FAVORIT :</div>
              <div className="space-y-3">
                {[
                  { rank: '01', title: 'Shape Of My Heart', artist: 'Backstreet Boys', genre: 'POP BALLAD', color: 'text-indigo-400 border-indigo-400/30 bg-indigo-400/5', trackId: '35o9a4iAfLl5jRmqMX9c1D' },
                  { rank: '02', title: 'My Love', artist: 'Westlife', genre: 'POP BALLAD', color: 'text-indigo-400 border-indigo-400/30 bg-indigo-400/5', trackId: '301y5sB3f99e4qG4z0516m' },
                  { rank: '03', title: 'I Lay My Love On You (Remix)', artist: 'Westlife', genre: 'POP BALLAD', color: 'text-indigo-400 border-indigo-400/30 bg-indigo-400/5', trackId: '24e3D5JU8ETOVouTcTD96r' },
                  { rank: '04', title: 'Natural', artist: 'D\'Masiv', genre: 'POP ROCK', color: 'text-amber-500 border-amber-500/30 bg-amber-500/5', trackId: '1P56xH8YxWwKqJkXyYg7wG' },
                  { rank: '05', title: 'Did You Like Her In The Morning?', artist: 'NIKI', genre: 'POP BALLAD', color: 'text-indigo-400 border-indigo-400/30 bg-indigo-400/5', trackId: '4jV7b41qR8yJ7k2qM2f8vO' }
                ].map((track) => (
                  <button 
                    key={track.rank} 
                    onClick={() => setSpotifyEmbedUrl(`https://open.spotify.com/embed/track/${track.trackId}?utm_source=generator&theme=0&autoplay=true`)}
                    className="w-full flex justify-between items-center py-2 border-b border-border/20 group/track cursor-pointer hover:bg-bg-secondary/30 transition-colors text-left"
                  >
                    <div className="flex gap-4 items-center">
                      <span className="font-mono text-[9px] text-accent">{track.rank}</span>
                      <div className="text-left">
                        <div className="text-[12px] font-black uppercase tracking-tight text-text-primary group-hover/track:text-accent transition-colors">{track.title}</div>
                        <div className="text-[9px] text-text-muted uppercase tracking-widest mt-0.5">{track.artist}</div>
                      </div>
                    </div>
                    <span className={`font-mono text-[7px] opacity-0 group-hover/track:opacity-100 group-hover/track:scale-105 transition-all duration-300 uppercase tracking-widest border px-2 py-0.5 ${track.color}`}>
                      {track.genre}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-8 pt-6 font-mono text-[9px] text-text-muted uppercase tracking-[0.2em] border-t border-border/20">
              <div>
                <span className="text-accent font-bold">TOTAL:</span> 451 LAGU
              </div>
            </div>


          </div>

          <div className="col-span-4 md:col-span-12 lg:col-start-7 lg:col-span-6 relative">
            <div className="border-4 border-text-primary p-2 bg-black shadow-2xl relative group">
              <div className="absolute -inset-2 border border-accent/20 pointer-events-none"></div>
              <iframe 
                key={spotifyEmbedUrl}
                src={spotifyEmbedUrl} 
                width="100%" 
                height="450" 
                frameBorder="0" 
                allowFullScreen="" 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy"
                style={{ borderRadius: '0px' }}
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      <section ref={contactReveal} className="py-64 grid-system relative overflow-hidden text-center fade-up transition-colors duration-500">
        <div ref={contactRef} className="absolute top-0 left-0 w-full h-1" />
        <SwissHeadingText text="KONTAK" className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.06]" />
        <SwissLine className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-border/0 via-border/50 to-border/0" />
        <SwissCircle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vh] h-[80vh] text-text-primary opacity-[0.02] pointer-events-none" />
        <SwissDots className="absolute bottom-24 left-1/2 -translate-x-1/2" />

        <div className="col-span-4 md:col-span-12 lg:col-start-3 lg:col-span-8 space-y-16 z-10">
          <div className="flex flex-col items-center gap-6">
             <SwissDataLabel label="Koneksi" value="PESAN_LANGSUNG" className="items-center" />
          </div>
          <h2 className="text-display leading-[0.8] mb-12 uppercase tracking-tighter">HUBUNGI<br /><span className="text-accent">SAYA.</span></h2>
          
          <div className="flex flex-col items-center gap-12">
            <div className="flex flex-col sm:flex-row gap-6 w-full max-w-xl justify-center">
              <a href="mailto:komanganrasansya21@gmail.com" className="magnetic-btn group border-2 border-text-primary bg-transparent text-text-primary px-10 py-5 font-black uppercase tracking-widest text-[11px] transition-all duration-500 hover:bg-accent hover:border-accent hover:text-white relative overflow-hidden flex-1 text-center">
                <span className="relative z-10 flex items-center justify-center">
                  Kirim Email <ArrowRight className="ml-4 group-hover:translate-x-2 transition-transform" size={16} />
                </span>
                <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              </a>
              
              <a href="https://wa.me/6285792288058" target="_blank" rel="noopener noreferrer" className="magnetic-btn group border-2 border-text-primary bg-transparent text-text-primary px-10 py-5 font-black uppercase tracking-widest text-[11px] transition-all duration-500 hover:bg-accent hover:border-accent hover:text-white relative overflow-hidden flex-1 text-center">
                <span className="relative z-10 flex items-center justify-center">
                  WhatsApp <ArrowRight className="ml-4 group-hover:translate-x-2 transition-transform" size={16} />
                </span>
                <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              </a>
            </div>
            
            <div className="flex flex-col md:flex-row gap-12 border-t border-border pt-24 w-full justify-center relative">
              <SwissLine className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
              {[
                { label: 'GITHUB', icon: Github, url: 'https://github.com/helooanraaw' },
                { label: 'INSTAGRAM', icon: Instagram, url: 'https://www.instagram.com/kmnganrasansy_' },
                { label: 'LINKEDIN', icon: Linkedin, url: 'https://www.linkedin.com/in/komanganrasansya' }
              ].map((social) => (
                <a key={social.label} href={social.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 font-mono text-[10px] font-bold text-text-muted hover:text-accent tracking-[0.4em] transition-colors group">
                  <social.icon size={12} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="p-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8 bg-bg-primary text-[10px] font-black uppercase tracking-[0.5em] text-text-muted relative transition-colors duration-500">
        <SwissLine className="absolute top-0 left-0 w-full h-px bg-border" />
        <div className="flex gap-12">
          <span className="hover:text-accent transition-colors cursor-default">© 2026 KOMANGANRASANSYA</span>
        </div>
        <div className="flex items-center gap-3">
          <span>ALL RIGHT RESERVED.</span>
        </div>
      </footer>

    </div>
  )
}
