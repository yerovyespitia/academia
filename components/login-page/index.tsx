'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoginError('')
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        },
      )

      const data = await res.json()

      if (!res.ok) {
        setLoginError('Invalid email or password. Try again.')
        throw new Error(data.error || 'Login failed')
      }

      localStorage.setItem('token', data.token)

      // Set auth cookie for middleware-based protection
      const cookieParts = [
        `token=${data.token}`,
        'path=/',
        'max-age=2592000', // 30 days
        'samesite=lax',
      ]
      if (window.location.protocol === 'https:') cookieParts.push('secure')
      document.cookie = cookieParts.join('; ')

      const nextUrl = new URL(window.location.href).searchParams.get('next')
      window.location.href = nextUrl || '/'
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <div className='flex items-center justify-center gap-3 mb-4'>
            <h1 className='text-3xl font-bold text-foreground'>AcademIA</h1>
          </div>
          <p className='text-muted-foreground text-balance'>
            Plataforma inteligente de apoyo académico
          </p>
        </div>
        <Card className='border-border/50 shadow-xl'>
          <CardHeader className='space-y-1'>
            <CardTitle className='text-2xl font-bold'>Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder a tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              {/* Email Field */}
              <div className='space-y-2'>
                <Label htmlFor='email'>Correo Electrónico</Label>
                <div className='relative'>
                  <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    id='email'
                    type='email'
                    placeholder='estudiante@universidad.edu'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='pl-10'
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className='space-y-2'>
                <div className='relative'>
                  <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='••••••••'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='pl-10 pr-10'
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                  >
                    {showPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
                {loginError && (
                  <p className='text-sm text-red-600'>{loginError}</p>
                )}
              </div>

              <Button
                variant='brand'
                size='brand'
                type='submit'
                className='w-full'
              >
                Iniciar Sesión
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
