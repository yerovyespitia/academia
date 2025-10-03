import Link from 'next/link'

export default function SubNavbar() {
  return (
    <nav className='border-b border-muted-foreground/30'>
      <header className='max-w-7xl mx-auto flex justify-center items-center p-4'>
        <div className='flex items-center justify-center gap-4 flex-wrap'>
          <Link
            className='font-medium text-muted-foreground hover:text-foreground'
            href='/'
          >
            Documentos
          </Link>
          <Link
            className='font-medium text-muted-foreground hover:text-foreground'
            href='/'
          >
            Quizzes
          </Link>
          <Link
            className='font-medium text-muted-foreground hover:text-foreground'
            href='/'
          >
            Glosarios
          </Link>
          <Link
            className='font-medium text-muted-foreground hover:text-foreground'
            href='/'
          >
            Mapas conceptuales
          </Link>
          <Link
            className='font-medium text-muted-foreground hover:text-foreground'
            href='/'
          >
            Etiquetas
          </Link>
          <Link
            className='font-medium text-muted-foreground hover:text-foreground'
            href='/'
          >
            Historial académico
          </Link>
        </div>
      </header>
    </nav>
  )
}
