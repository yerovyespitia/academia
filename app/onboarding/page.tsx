'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Progress } from '@/components/ui/progress'

const questions = [
  {
    id: 'learning-style',
    question: '¿Cómo prefieres aprender?',
    options: ['Visual', 'Auditivo', 'Leyendo y escribiendo', 'Práctico (haciendo)'],
  },
  {
    id: 'explanation-type',
    question: '¿Qué tipo de explicaciones prefieres?',
    options: ['Breves y directas', 'Detalladas con ejemplos'],
  },
  {
    id: 'understanding-aid',
    question: '¿Qué te ayuda más a entender un tema?',
    options: ['Ejemplos prácticos', 'Diagramas y gráficos', 'Resúmenes escritos', 'Videos o audios'],
  },
  {
    id: 'question-format',
    question: '¿Prefieres preguntas de...?',
    options: ['Opción múltiple', 'Respuesta abierta', 'Combinación de ambas'],
  },
  {
    id: 'font-size',
    question: '¿Necesitas letra más grande para leer cómodamente?',
    options: ['Sí', 'No'],
  },
  {
    id: 'focus-time',
    question: '¿Cuánto tiempo puedes concentrarte seguido?',
    options: ['Menos de 15 min', '15–30 min', '30–60 min', 'Más de 60 min'],
  },
  {
    id: 'learning-pace',
    question: '¿Qué ritmo de aprendizaje prefieres?',
    options: ['Paso a paso, con calma', 'Ritmo moderado', 'Rápido e intenso'],
  },
  {
    id: 'motivation',
    question: '¿Qué te motiva más al estudiar?',
    options: [
      'Obtener buenas notas',
      'Entender realmente el tema',
      'Aplicarlo en la vida real',
      'Completar retos y logros',
    ],
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const current = questions[step]
  const progress = ((step + 1) / questions.length) * 100

  function handleSelect(option: string) {
    setAnswers((prev) => ({ ...prev, [current.id]: option }))

    setTimeout(() => {
      if (step < questions.length - 1) {
        setStep((prev) => prev + 1)
      } else {
        router.push('/dashboard')
      }
    }, 400)
  }

  return (
    <div className='min-h-screen bg-[#f5f0e8] flex flex-col items-center justify-center px-4'>
      <div className='w-full max-w-xl'>
        <h1 className='text-2xl font-bold tracking-tight text-[#1a4d2e] text-center mb-6'>
          AcademIA
        </h1>

        <Progress value={progress} className='mb-12 h-2' />

        <h2 className='text-2xl sm:text-3xl font-bold text-[#1a1a1a] text-center mb-8'>
          {current.question}
        </h2>

        <div className='grid gap-3'>
          {current.options.map((option) => {
            const isSelected = answers[current.id] === option

            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`w-full rounded-xl border-2 px-6 py-4 text-left text-lg font-medium transition cursor-pointer ${
                  isSelected
                    ? 'border-[#1a4d2e] bg-[#1a4d2e] text-white'
                    : 'border-[#1a1a1a]/10 bg-white text-[#1a1a1a] hover:border-[#1a4d2e]/40'
                }`}
              >
                {option}
              </button>
            )
          })}
        </div>

        <p className='text-sm text-[#1a1a1a]/40 text-center mt-8'>
          {step + 1} de {questions.length}
        </p>
      </div>
    </div>
  )
}
