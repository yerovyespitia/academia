'use client'

import { motion } from 'framer-motion'

export default function SuggestQuestions({
  setMessage,
}: {
  setMessage: (message: string) => void
}) {
  const suggestedQuestions = [
    '¿Cuál es mi promedio general del semestre?',
    'Genera un quiz sobre derivadas',
    'Resume mis apuntes de la última clase de Programación',
    '¿A qué clases no puedo faltar más?',
  ]
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.5 }}
      className='flex-1 overflow-y-auto'
    >
      <h2 className='px-6 text-lg font-bold uppercase text-foreground mb-3'>
        Preguntas sugeridas
      </h2>
      {suggestedQuestions.map((question, idx) => (
        <button
          key={idx}
          className='px-6 w-full border-b justify-start text-left h-auto py-3 bg-transparent hover:bg-secondary/50 cursor-pointer'
          onClick={() => setMessage(question)}
        >
          <span className='font-medium text-sm text-pretty'>{question}</span>
        </button>
      ))}
    </motion.div>
  )
}
