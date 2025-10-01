import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className='border-b border-border'>
      <header className='max-w-7xl mx-auto flex justify-between items-center p-4'>
        <Link href='/'>
          <h1 className='text-2xl font-bold'>AcademIA</h1>
        </Link>
        <div className='flex items-center gap-4'>
          <Link
            className='font-medium'
            href='/login'
          >
            Iniciar sesión
          </Link>
        </div>
      </header>
    </nav>
  )
}
