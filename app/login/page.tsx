'use client'

import { useState } from 'react'
import { useAuthActions } from '@convex-dev/auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const { signIn } = useAuthActions()
  const router = useRouter()

  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (mode === 'signUp' && password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.set('email', email)
      formData.set('password', password)
      formData.set('flow', mode)
      await signIn('password', formData)
      router.push('/onboarding')
    } catch {
      setError(
        mode === 'signIn'
          ? 'Credenciales incorrectas. Intenta de nuevo.'
          : 'No se pudo crear la cuenta. Intenta de nuevo.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-[#f5f0e8] flex items-center justify-center px-4'>
      <div className='w-full max-w-md'>
        <div className='rounded-2xl border border-[#1a1a1a]/10 bg-white p-8 shadow-sm'>
          <h1 className='text-2xl font-bold tracking-tight text-[#1a4d2e] text-center mb-8'>
            AcademIA
          </h1>

          {/* Tabs */}
          <div className='flex rounded-full bg-[#f5f0e8] p-1 mb-8'>
            <button
              type='button'
              onClick={() => {
                setMode('signIn')
                setError('')
              }}
              className={`flex-1 rounded-full py-2 text-sm font-semibold transition cursor-pointer ${
                mode === 'signIn'
                  ? 'bg-[#1a4d2e] text-white'
                  : 'text-[#1a1a1a]/60 hover:text-[#1a1a1a]'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type='button'
              onClick={() => {
                setMode('signUp')
                setError('')
              }}
              className={`flex-1 rounded-full py-2 text-sm font-semibold transition cursor-pointer ${
                mode === 'signUp'
                  ? 'bg-[#1a4d2e] text-white'
                  : 'text-[#1a1a1a]/60 hover:text-[#1a1a1a]'
              }`}
            >
              Crear cuenta
            </button>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='tu@correo.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='password'>Contraseña</Label>
              <Input
                id='password'
                type='password'
                placeholder='••••••••'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {mode === 'signUp' && (
              <div className='space-y-2'>
                <Label htmlFor='confirmPassword'>Confirmar contraseña</Label>
                <Input
                  id='confirmPassword'
                  type='password'
                  placeholder='••••••••'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}

            {error && (
              <p className='text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2'>
                {error}
              </p>
            )}

            <Button
              type='submit'
              disabled={loading}
              className='w-full rounded-full bg-[#1a4d2e] hover:bg-[#153d24] text-white h-11'
            >
              {loading
                ? 'Cargando...'
                : mode === 'signIn'
                  ? 'Iniciar sesión'
                  : 'Crear cuenta'}
            </Button>
          </form>

          <div className='mt-6 text-center'>
            <Link
              href='/'
              className='inline-flex items-center gap-1.5 text-sm text-[#1a1a1a]/50 hover:text-[#1a4d2e] transition'
            >
              <ArrowLeft className='size-3.5' />
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
