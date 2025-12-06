'use client'

import Link from 'next/link'

import { useEffect, useRef, useState } from 'react'

import { Semester } from '@/types'

import { Badge } from '../ui/badge'

export default function Navbar({ semesters }: { semesters: Semester[] }) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem('token')
    document.cookie = 'token=; path=/; max-age=0'
    window.location.href = '/login'
  }

  const currentPeriod = semesters?.[0]?.period

  return (
    <nav className='border-b border-muted-foreground/30'>
      <header className='max-w-7xl mx-auto flex justify-between items-center p-4'>
        <Link href='/'>
          <h1 className='text-2xl font-bold'>AcademIA</h1>
        </Link>
        <div className='flex items-center gap-4 relative' ref={menuRef}>
          {currentPeriod && (
            <Badge
              variant='outline'
              className='bg-primary/10 text-primary border-primary/20'
            >
              {currentPeriod}
            </Badge>
          )}
          <div>
            <div
              className='w-10 h-10 rounded-full bg-muted-foreground/30 flex items-center justify-center text-sm font-semibold cursor-pointer hover:bg-muted-foreground/40'
              onClick={() => setShowMenu(!showMenu)}
            >
              LE
            </div>
            {showMenu && (
              <div className='absolute right-3 mt-2 w-48 py-2 bg-background border border-border rounded-md shadow-lg z-50'>
                <button
                  onClick={handleSignOut}
                  className='font-medium w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors cursor-pointer'
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </nav>
  )
}
