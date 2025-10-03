import Link from 'next/link'
import { Badge } from '../ui/badge'

export default function Navbar() {
  return (
    <nav className='border-b border-border'>
      <header className='max-w-7xl mx-auto flex justify-between items-center p-4'>
        <Link href='/'>
          <h1 className='text-2xl font-bold'>AcademIA</h1>
        </Link>
        <div className='flex items-center gap-4'>
          <Badge
            variant='outline'
            className='bg-primary/10 text-primary border-primary/20'
          >
            2025-2
          </Badge>
          <div className='w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold cursor-pointer'>
            LE
          </div>
        </div>
      </header>
    </nav>
  )
}
