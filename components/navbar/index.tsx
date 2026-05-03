'use client'

import { useAuthActions } from '@convex-dev/auth/react'
import { LogOut, Menu, Settings, User, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

import { useUserClasses } from '@/lib/use-user-classes'

import { Avatar, AvatarFallback } from '../ui/avatar'
import { Badge } from '../ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetTrigger,
} from '../ui/sheet'

const links = [
  { label: 'PIAR', href: '/piar' },
  { label: 'Documentos', href: '/documents' },
  { label: 'Chat', href: '/chat' },
  { label: 'Quizzes', href: '/quizzes' },
  { label: 'Glosarios', href: '/glossaries' },
  { label: 'Mapas', href: '/concept-maps' },
]

export default function Navbar() {
  const { signOut } = useAuthActions()
  const router = useRouter()
  const pathname = usePathname()
  const { classes } = useUserClasses()
  const [open, setOpen] = useState(false)
  const currentUser = useQuery(api.users.getCurrent)

  const initials = currentUser?.name
    ? currentUser.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w: string) => w[0].toUpperCase())
        .join('')
    : '?'

  return (
    <nav className='border-b border-muted-foreground/30'>
      <header className='max-w-7xl mx-auto flex justify-between items-center p-4'>
        <Link href='/dashboard'>
          <h1 className='text-2xl font-bold'>AcademIA</h1>
        </Link>
        <div className='hidden lg:flex items-center gap-4'>
          {links.map((link) => (
            <Link
              key={link.label}
              className={`text-sm font-medium hover:text-foreground ${
                pathname === link.href
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className='flex items-center gap-3'>
          {classes.length > 0 && (
            <Badge
              variant='outline'
              className='bg-primary/10 text-primary border-primary/20'
            >
              {classes.length} clases
            </Badge>
          )}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button type='button' className='cursor-pointer rounded-full'>
                <Avatar className='size-8'>
                  <AvatarFallback className='bg-primary/10 text-primary text-xs font-semibold'>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-48'>
              <DropdownMenuItem>
                <User className='size-4' />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className='size-4' />
                Ajustes
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut().then(() => router.push('/'))}
              >
                <LogOut className='size-4' />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className='lg:hidden cursor-pointer' aria-label='Abrir menú'>
              <Menu className='size-5' />
            </SheetTrigger>
            <SheetContent side='right' className='w-full max-w-full sm:max-w-full gap-0' showCloseButton={false}>
              <header className='max-w-7xl mx-auto w-full flex justify-between items-center p-4'>
                <SheetTitle className='text-2xl font-bold'>AcademIA</SheetTitle>
                <SheetClose className='cursor-pointer'>
                  <X className='size-5' />
                  <span className='sr-only'>Cerrar</span>
                </SheetClose>
              </header>
              <div className='flex flex-col gap-2 mt-4'>
                {links.map((link) => (
                  <Link
                    key={link.label}
                    className={`text-sm font-medium px-3 py-2 rounded-md hover:bg-accent ${
                      pathname === link.href
                        ? 'text-foreground bg-accent'
                        : 'text-muted-foreground'
                    }`}
                    href={link.href}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </nav>
  )
}
