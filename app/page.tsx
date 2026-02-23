import Link from 'next/link'
import {
  MessageSquare,
  HelpCircle,
  BookOpen,
  GitBranch,
  ArrowRight,
} from 'lucide-react'

const features = [
  {
    icon: MessageSquare,
    title: 'Chat AI',
    description:
      'Conversa con una IA entrenada en tus documentos académicos para resolver dudas al instante.',
  },
  {
    icon: HelpCircle,
    title: 'Quizzes',
    description:
      'Genera quizzes automáticos a partir de tus materiales y pon a prueba tu conocimiento.',
  },
  {
    icon: BookOpen,
    title: 'Glosarios',
    description:
      'Crea glosarios inteligentes con definiciones claras extraídas de tus documentos.',
  },
  {
    icon: GitBranch,
    title: 'Mapas Conceptuales',
    description:
      'Visualiza las relaciones entre conceptos con mapas generados automáticamente.',
  },
]

export default function LandingPage() {
  return (
    <div className='min-h-screen bg-[#f5f0e8] text-[#1a1a1a]'>
      {/* Navbar */}
      <nav className='max-w-7xl mx-auto flex items-center justify-between px-6 py-5'>
        <span className='text-2xl font-bold tracking-tight text-[#1a4d2e]'>
          AcademIA
        </span>
        <div className='hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest text-[#1a1a1a]/70'>
          <a href='#features' className='hover:text-[#1a4d2e] transition'>
            Herramientas
          </a>
          <a href='#cta' className='hover:text-[#1a4d2e] transition'>
            Empezar
          </a>
        </div>
        <Link
          href='/dashboard'
          className='rounded-full bg-[#1a4d2e] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#153d24] transition'
        >
          Comenzar
        </Link>
      </nav>

      {/* Hero */}
      <section className='max-w-7xl mx-auto px-6 pt-20 pb-28 text-center'>
        <span className='inline-block rounded-full border border-[#1a4d2e]/20 bg-[#1a4d2e]/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#1a4d2e] mb-8'>
          Potenciado por IA
        </span>
        <h1 className='text-5xl sm:text-6xl md:text-7xl font-extrabold uppercase leading-[1.05] tracking-tight text-[#1a1a1a]'>
          Estudia
          <br />
          más inteligente
        </h1>
        <p className='mt-6 text-lg md:text-xl text-[#1a1a1a]/60 max-w-2xl mx-auto'>
          Tu compañero académico con inteligencia artificial. Sube tus
          documentos y deja que la IA transforme tu forma de estudiar.
        </p>
        <Link
          href='/dashboard'
          className='mt-10 inline-flex items-center gap-2 rounded-full bg-[#1a4d2e] px-8 py-3.5 text-base font-semibold text-white hover:bg-[#153d24] transition'
        >
          Ir al Dashboard
          <ArrowRight className='size-4' />
        </Link>
      </section>

      {/* Features */}
      <section id='features' className='max-w-7xl mx-auto px-6 pb-28'>
        <h2 className='text-center text-xs font-semibold uppercase tracking-widest text-[#1a4d2e] mb-12'>
          Herramientas
        </h2>
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          {features.map((f) => (
            <div
              key={f.title}
              className='rounded-2xl border border-[#1a1a1a]/10 bg-white p-6 hover:shadow-md transition'
            >
              <f.icon className='size-8 text-[#1a4d2e] mb-4' strokeWidth={1.5} />
              <h3 className='text-sm font-bold uppercase tracking-wide mb-2'>
                {f.title}
              </h3>
              <p className='text-sm text-[#1a1a1a]/60 leading-relaxed'>
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Green CTA Section */}
      <section
        id='cta'
        className='mx-4 md:mx-8 mb-8 rounded-[2rem] bg-[#1a4d2e] px-6 py-20 text-center text-white'
      >
        <h2 className='text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight leading-tight'>
          Empieza hoy
        </h2>
        <p className='mt-4 text-white/70 text-lg max-w-xl mx-auto'>
          Sube tus documentos, genera quizzes, explora glosarios y deja que la
          IA haga el trabajo pesado.
        </p>
        <Link
          href='/dashboard'
          className='mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-[#1a4d2e] hover:bg-white/90 transition'
        >
          Comenzar gratis
          <ArrowRight className='size-4' />
        </Link>
      </section>

      {/* Footer */}
      <footer className='max-w-7xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-[#1a1a1a]/40'>
        <span className='font-semibold text-[#1a4d2e]'>AcademIA</span>
        <span>&copy; {new Date().getFullYear()}</span>
      </footer>
    </div>
  )
}
