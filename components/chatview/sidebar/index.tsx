'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  BookOpen,
  Calculator,
  FileText,
  TrendingUp,
  Brain,
} from 'lucide-react'

export default function Sidebar({
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
    <div className='space-y-4'>
      {/* Quick Actions */}
      <Card className='bg-card border-border'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm flex items-center gap-2'>
            <Sparkles className='w-4 h-4 text-primary' />
            Preguntas sugeridas
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          {suggestedQuestions.map((question, idx) => (
            <Button
              key={idx}
              variant='outline'
              size='sm'
              className='w-full justify-start text-left h-auto py-2 px-3 bg-transparent hover:bg-secondary/50'
              onClick={() => setMessage(question)}
            >
              <span className='text-xs text-pretty'>{question}</span>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Capabilities */}
      <Card className='bg-card border-border'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm flex items-center gap-2'>
            <Brain className='w-4 h-4 text-primary' />
            Capacidades
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='flex items-start gap-2'>
            <Calculator className='w-4 h-4 text-accent mt-0.5 flex-shrink-0' />
            <div>
              <p className='text-xs font-medium text-foreground'>
                Cálculo de notas
              </p>
              <p className='text-xs text-muted-foreground'>
                Calcula qué necesitas para aprobar
              </p>
            </div>
          </div>

          <div className='flex items-start gap-2'>
            <FileText className='w-4 h-4 text-accent mt-0.5 flex-shrink-0' />
            <div>
              <p className='text-xs font-medium text-foreground'>
                Análisis de documentos
              </p>
              <p className='text-xs text-muted-foreground'>
                Resume y explica tus apuntes
              </p>
            </div>
          </div>

          <div className='flex items-start gap-2'>
            <TrendingUp className='w-4 h-4 text-accent mt-0.5 flex-shrink-0' />
            <div>
              <p className='text-xs font-medium text-foreground'>
                Seguimiento de progreso
              </p>
              <p className='text-xs text-muted-foreground'>
                Analiza tu rendimiento académico
              </p>
            </div>
          </div>

          <div className='flex items-start gap-2'>
            <BookOpen className='w-4 h-4 text-accent mt-0.5 flex-shrink-0' />
            <div>
              <p className='text-xs font-medium text-foreground'>
                Generación de contenido
              </p>
              <p className='text-xs text-muted-foreground'>
                Crea quizzes, glosarios y mapas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Context Info */}
      <Card className='bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20'>
        <CardContent className='pt-6'>
          <div className='flex items-start gap-2'>
            <Sparkles className='w-4 h-4 text-primary mt-0.5' />
            <div>
              <p className='text-xs font-medium text-foreground mb-1'>
                Contexto activo
              </p>
              <p className='text-xs text-muted-foreground'>
                El asistente conoce tus 3 materias, 47 documentos, 12 quizzes
                completados y tu historial de asistencia.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
