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

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    setLoading(true)
    try {
      const formData = new FormData()
      formData.set('email', email)
      formData.set('password', password)
      formData.set('flow', 'signIn')
      await signIn('password', formData)
      router.push('/onboarding')
    } catch {
      setError('Credenciales incorrectas. Intenta de nuevo.')
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
              {loading ? 'Cargando...' : 'Iniciar sesión'}
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
