'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  {
    label: 'Documentos',
    href: '/documents',
  },
  {
    label: 'Quizzes',
    href: '/',
  },
  {
    label: 'Glosarios',
    href: '/',
  },
  {
    label: 'Mapas conceptuales',
    href: '/',
  },
  {
    label: 'Etiquetas',
    href: '/',
  },
  {
    label: 'Historial académico',
    href: '/',
  },
]
export default function SubNavbar() {
  const pathname = usePathname()

  return (
    <nav className='border-b border-muted-foreground/30'>
      <header className='max-w-7xl mx-auto flex justify-center items-center p-4'>
        <div className='flex items-center justify-center gap-4 flex-wrap'>
          {links.map((link) => (
            <Link
              key={link.label}
              className={`font-medium hover:text-foreground ${
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
      </header>
    </nav>
  )
}
