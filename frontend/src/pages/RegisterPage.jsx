import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '',
    confirmPassword: '' 
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })
      navigate('/', { replace: true })
    } catch (err) {
      // Handle axios error response
      let errorMessage = 'Registration failed'
      const detail = err.response?.data?.detail
      if (typeof detail === 'string') {
        errorMessage = detail
      } else if (Array.isArray(detail) && detail.length > 0) {
        // FastAPI validation errors return array of objects with 'msg' field
        errorMessage = detail.map(e => e.msg || e.message).join(', ')
      } else if (err.message) {
        errorMessage = err.message
      }
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-paper-texture transition-colors duration-300">
      {/* Header */}
      <header className="flex items-center px-6 py-5 justify-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary text-background-dark shadow-crayon border-2 border-black dark:border-white">
            <span className="material-symbols-outlined text-2xl font-bold">nutrition</span>
          </div>
          <h2 className="text-forest dark:text-primary text-xl font-black tracking-tight">Ingredient Pal</h2>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 w-full max-w-md mx-auto pb-12">
        {/* Welcome Bubble */}
        <div className="bubble-tail relative bg-white dark:bg-[#1f331f] p-6 mb-8 rounded-[2rem] shadow-crayon border-2 border-black/5 dark:border-primary/20 w-full max-w-[320px] transform rotate-[1deg]">
          <h1 className="text-forest dark:text-white text-2xl font-black text-center leading-tight">
            Join the club! 🌿
          </h1>
          <p className="text-forest/60 dark:text-gray-300 text-sm font-medium text-center mt-2">
            Create your account to start understanding ingredients
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {error && (
            <div className="bg-brick/10 border-2 border-brick/30 rounded-2xl p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-brick">error</span>
              <p className="text-brick text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-bold text-forest/70 dark:text-gray-300 px-2">
              Your Name
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-forest/40">
                person
              </span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-white/5 border-2 border-forest/10 dark:border-primary/20 rounded-2xl focus:border-primary focus:ring-0 text-ink dark:text-white placeholder:text-forest/30 font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-forest/70 dark:text-gray-300 px-2">
              Email
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-forest/40">
                mail
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-white/5 border-2 border-forest/10 dark:border-primary/20 rounded-2xl focus:border-primary focus:ring-0 text-ink dark:text-white placeholder:text-forest/30 font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-forest/70 dark:text-gray-300 px-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-forest/40">
                lock
              </span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-white/5 border-2 border-forest/10 dark:border-primary/20 rounded-2xl focus:border-primary focus:ring-0 text-ink dark:text-white placeholder:text-forest/30 font-medium"
              />
            </div>
            <p className="text-xs text-forest/40 dark:text-gray-500 px-2">At least 6 characters</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-forest/70 dark:text-gray-300 px-2">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-forest/40">
                lock_reset
              </span>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-white/5 border-2 border-forest/10 dark:border-primary/20 rounded-2xl focus:border-primary focus:ring-0 text-ink dark:text-white placeholder:text-forest/30 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex items-center justify-center w-full p-1 transition-transform active:scale-[0.98] mt-6"
          >
            <div className="absolute inset-0 bg-black dark:bg-primary rounded-[2rem] translate-y-1 translate-x-0 group-hover:translate-y-1.5 transition-transform"></div>
            <div className="relative flex items-center justify-center gap-3 bg-primary border-2 border-black dark:border-transparent rounded-[2rem] px-6 py-4 h-16 w-full">
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-black text-lg font-black">Creating account...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-black text-2xl">person_add</span>
                  <span className="text-black text-lg font-black">Create Account</span>
                </>
              )}
            </div>
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-8 text-center">
          <p className="text-forest/60 dark:text-gray-400 font-medium">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-primary font-bold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Decorative Element */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <div className="h-px w-12 bg-forest/10 dark:bg-gray-700"></div>
          <span className="material-symbols-outlined text-forest/20 dark:text-gray-600 text-2xl">favorite</span>
          <div className="h-px w-12 bg-forest/10 dark:bg-gray-700"></div>
        </div>
      </main>
    </div>
  )
}
