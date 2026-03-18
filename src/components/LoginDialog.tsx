'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { X, LogIn } from 'lucide-react'
import { createClient } from '@/config/supabase/client'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function LoginDialog({ isOpen, onClose }: Props) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const resetForm = useCallback(() => {
    setEmail('')
    setPassword('')
    setError('')
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      resetForm()
    }
  }, [isOpen, resetForm])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
      if (loginError) {
        setError(`Login failed: ${loginError.message}`)
      } else {
        onClose()
        router.push('/dashboard')
      }
    } catch (err: unknown) {
      setError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      if (googleError) {
        setError(`Google login failed: ${googleError.message}`)
        setLoading(false)
      }
    } catch (err: unknown) {
      setError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`)
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-dialog-title"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#171d2b]/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogIn size={20} className="text-[#171d2b]" />
            <h2 id="login-dialog-title" className="font-sora font-bold text-lg text-[#171d2b]">
              Sign In
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close login dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="login-email" className="font-sora text-sm font-medium text-[#171d2b]">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
              className="w-full h-[42px] px-4 rounded-xl border border-[#171d2b]/20 font-sans text-sm text-[#171d2b] placeholder-[#171d2b]/40 focus:outline-none focus:ring-2 focus:ring-[#171d2b]/20 disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="login-password" className="font-sora text-sm font-medium text-[#171d2b]">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              onKeyDown={(e) => { if (e.key === 'Enter') handleEmailLogin() }}
              className="w-full h-[42px] px-4 rounded-xl border border-[#171d2b]/20 font-sans text-sm text-[#171d2b] placeholder-[#171d2b]/40 focus:outline-none focus:ring-2 focus:ring-[#171d2b]/20 disabled:opacity-50"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 font-sans">{error}</p>
          )}

          <button
            onClick={handleEmailLogin}
            disabled={loading}
            className="w-full h-[42px] rounded-[100px] bg-[#171d2b] text-white font-sora text-sm font-medium hover:bg-[#2a3347] transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In with Email'}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#171d2b]/10" />
            <span className="font-sans text-xs text-[#171d2b]/40">or</span>
            <div className="flex-1 h-px bg-[#171d2b]/10" />
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-[42px] rounded-[100px] border-2 border-[#171d2b]/20 text-[#171d2b] font-sora text-sm font-medium hover:bg-[#171d2b]/5 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {loading ? 'Signing in…' : 'Sign In with Google'}
          </button>
        </div>
      </div>
    </div>
  )
}
