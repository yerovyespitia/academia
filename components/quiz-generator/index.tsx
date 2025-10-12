'use client'

import { useState } from 'react'
import {
  Brain,
  Target,
  FileText,
  Upload,
  BookOpen,
  Sparkles,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../ui/card'
import { Button } from '../ui/button'
import { QuizModal } from './quiz-modal'

export default function QuizGenerator() {
  const [open, setOpen] = useState(false)

  return (
    <Card className='lg:col-span-2 bg-card border-border'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Brain className='w-5 h-5 text-primary' />
          Generador de Quizzes
          <span>
            <Sparkles
              size={15}
              fill='black'
              strokeWidth={1}
            />
          </span>
        </CardTitle>
        <CardDescription>
          Crea evaluaciones automáticas basadas en tus apuntes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-3'>
            <div className='border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer'>
              <div className='flex items-center gap-3'>
                <div className='size-8 rounded bg-accent flex items-center justify-center'>
                  <Target className='size-4 text-primary' />
                </div>
                <div>
                  <p className='font-medium text-sm text-foreground'>
                    Opción Múltiple
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Evaluación rápida de conceptos
                  </p>
                </div>
              </div>
            </div>

            <div className='border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer'>
              <div className='flex items-center gap-3'>
                <div className='size-8 rounded bg-accent flex items-center justify-center'>
                  <FileText className='size-4 text-primary' />
                </div>
                <div>
                  <p className='font-medium text-sm text-foreground'>
                    Respuesta Abierta
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Calificación con IA
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-secondary/30 rounded-lg p-4 border border-border'>
            <p className='text-sm font-medium text-foreground mb-3'>
              Generar quiz desde:
            </p>
            <div className='space-y-2'>
              <Button
                onClick={() => setOpen(true)}
                variant='outline'
                size='sm'
                className='w-full justify-start'
              >
                <FileText className='size-4 mr-2' />
                Mis apuntes
              </Button>
              <Button
                onClick={() => setOpen(true)}
                variant='outline'
                size='sm'
                className='w-full justify-start'
              >
                <Upload className='size-4 mr-2' />
                Archivos subidos
              </Button>
              <Button
                onClick={() => setOpen(true)}
                variant='outline'
                size='sm'
                className='w-full justify-start'
              >
                <BookOpen className='size-4 mr-2' />
                Syllabus del curso
              </Button>
            </div>
          </div>

          <div className='bg-primary/5 rounded-lg p-3 border border-primary/20'>
            <div className='flex items-start gap-2'>
              <Brain className='size-4 text-primary mt-0.5' />
              <div className='text-xs'>
                <p className='text-foreground font-medium mb-1'>
                  Recomendaciones inteligentes
                </p>
                <p className='text-muted-foreground'>
                  Al finalizar, la IA te sugerirá temas para reforzar
                </p>
              </div>
            </div>
          </div>
        </div>
        <QuizModal
          open={open}
          onOpenChange={setOpen}
        />
      </CardContent>
    </Card>
  )
}
