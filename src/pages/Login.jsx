import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Lock, Mail } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      navigate('/admin')
    } catch (err) {
      setError('Email atau kata sandi tidak valid')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
      <div className="w-full max-w-md border-4 border-border bg-bg-secondary p-8 md:p-12 relative overflow-hidden">
        {/* Decorative solid red line (Swiss design accent) */}
        <div className="absolute top-0 left-0 w-full h-2 bg-accent"></div>

        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-text-primary uppercase">
            Masuk
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Akses panel pengelolaan portfolio
          </p>
        </div>

        {error && (
          <div className="bg-accent/10 border-l-4 border-accent p-4 mb-6 text-sm text-accent font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg-elevated border-2 border-border focus:border-text-primary px-10 py-3 text-sm text-text-primary outline-none transition-colors duration-200"
                placeholder="admin@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg-elevated border-2 border-border focus:border-text-primary px-10 py-3 text-sm text-text-primary outline-none transition-colors duration-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-text-primary text-bg-primary hover:bg-accent hover:text-white font-bold uppercase tracking-wider py-4 transition-all duration-300 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Memproses...' : 'Masuk Ke Sistem'}
          </button>
        </form>
      </div>
    </div>
  )
}
