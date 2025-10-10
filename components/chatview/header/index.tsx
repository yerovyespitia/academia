import { Sparkles } from 'lucide-react'

export default function Header() {
  return (
    <div className='mb-4'>
      <div className='flex items-center gap-2'>
        <div className='size-12 rounded-xl flex items-center justify-center'>
          <Sparkles className='size-6 text-black' />
        </div>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>
            Asistente Académico IA
          </h1>
          <p className='text-muted-foreground'>
            Pregunta sobre tus notas, documentos y progreso académico
          </p>
        </div>
      </div>
    </div>
  )
}
