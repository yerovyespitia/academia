'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Brain, CheckCircle2, Loader2 } from 'lucide-react'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import { quizSchema } from './schema'
import type { QuizSchema } from './schema'

interface QuizModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuizModal({ open, onOpenChange }: QuizModalProps) {
  const router = useRouter()
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [questionCount, setQuestionCount] = useState([10])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const { submit, object } = useObject({
    api: '/api/quiz',
    schema: quizSchema,
  })

  const generatedQuiz = object as QuizSchema | undefined

  const classes = [
    {
      id: 'calc',
      name: 'Cálculo Diferencial',
      code: 'MAT-101',
      hasSyllabus: true,
      topics: ['Límites', 'Derivadas', 'Integrales', 'Continuidad'],
    },
    {
      id: 'physics',
      name: 'Física Mecánica',
      code: 'FIS-201',
      hasSyllabus: true,
      topics: ['Cinemática', 'Dinámica', 'Energía', 'Momento'],
    },
    {
      id: 'programming',
      name: 'Programación I',
      code: 'CS-101',
      hasSyllabus: true,
      topics: ['Variables', 'Funciones', 'Estructuras de Control', 'POO'],
    },
  ]

  const handleGenerate = () => {
    if (!selectedClass) return
    setIsGenerating(true)
    const classData = classes.find((c) => c.id === selectedClass)
    submit({
      className: classData?.name ?? selectedClass,
      quizName: `Quiz: ${classData?.name ?? selectedClass}`,
      questionCount: questionCount[0],
      topics: classData?.topics ?? [],
    })
  }

  useEffect(() => {
    const ready = Boolean(
      generatedQuiz?.questions &&
        generatedQuiz.questions.length > 0 &&
        generatedQuiz.questions.every(
          (q) => q && Array.isArray(q.options) && q.options.length > 0
        )
    )
    if (!showPreview && ready) {
      setIsGenerating(false)
      setShowPreview(true)
    }
  }, [generatedQuiz, showPreview])

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className='max-w-2xl bg-card border-border'>
        <DialogHeader>
          <DialogTitle className='text-2xl flex items-center gap-2'>
            <Brain className='w-6 h-6 text-primary' />
            Generar Quiz con IA
          </DialogTitle>
          <DialogDescription>
            Crea un quiz personalizado basado en el syllabus de tu clase
          </DialogDescription>
        </DialogHeader>

        {!showPreview ? (
          <div className='space-y-6 py-4'>
            {/* Class Selection */}
            <div className='space-y-3'>
              <Label className='text-base font-semibold'>
                Selecciona la clase
              </Label>
              <div className='grid gap-3'>
                {classes.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClass(cls.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedClass === cls.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 bg-card'
                    }`}
                  >
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='font-medium text-foreground'>
                          {cls.name}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          {cls.code}
                        </p>
                      </div>
                      <div className='flex items-center gap-2'>
                        {cls.hasSyllabus && (
                          <Badge
                            variant='outline'
                            className='bg-green-500/10 text-green-500 border-green-500/30'
                          >
                            <CheckCircle2 className='w-3 h-3 mr-1' />
                            Syllabus disponible
                          </Badge>
                        )}
                        {selectedClass === cls.id && (
                          <div className='w-5 h-5 rounded-full bg-primary flex items-center justify-center'>
                            <CheckCircle2 className='w-4 h-4 text-primary-foreground' />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className='mt-3 flex flex-wrap gap-1.5'>
                      {(cls.topics ?? []).map((topic) => (
                        <Badge
                          key={topic}
                          variant='outline'
                          className='text-xs bg-secondary/50'
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <Label className='text-base font-semibold'>
                  Número de preguntas
                </Label>
                <Badge
                  variant='secondary'
                  className='text-lg font-bold'
                >
                  {questionCount[0]}
                </Badge>
              </div>
              <Slider
                value={questionCount}
                onValueChange={setQuestionCount}
                min={5}
                max={15}
                step={5}
                className='w-full'
              />
              <div className='flex justify-between text-xs text-muted-foreground'>
                <span>5 preguntas</span>
                <span>15 preguntas</span>
              </div>
            </div>

            {/* Info Box */}
            <div className='bg-primary/5 border border-primary/20 rounded-lg p-4'>
              <div className='flex gap-3'>
                <BookOpen className='w-5 h-5 text-primary flex-shrink-0 mt-0.5' />
                <div className='space-y-2 text-sm'>
                  <p className='font-medium text-foreground'>¿Cómo funciona?</p>
                  <ul className='text-muted-foreground space-y-1'>
                    <li>• La IA analiza el syllabus completo de la clase</li>
                    <li>
                      • Genera preguntas de opción múltiple sobre temas clave
                    </li>
                    <li>
                      • Al finalizar, recibirás recomendaciones personalizadas
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className='flex gap-3'>
              <Button
                variant='outline'
                onClick={() => onOpenChange(false)}
                className='flex-1 bg-transparent'
              >
                Cancelar
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!selectedClass || isGenerating}
                className='flex-1 bg-primary hover:bg-primary/90'
              >
                {isGenerating ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Generando...
                  </>
                ) : (
                  <>
                    <Brain className='w-4 h-4 mr-2' />
                    Generar Quiz
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className='space-y-6 py-4'>
            <div className='bg-green-500/10 border border-green-500/30 rounded-lg p-4'>
              <div className='flex items-center gap-2 mb-1'>
                <CheckCircle2 className='w-5 h-5 text-green-500' />
                <p className='font-semibold text-foreground'>
                  Quiz generado exitosamente
                </p>
              </div>
              <p className='text-sm text-muted-foreground'>
                {generatedQuiz?.name} · {generatedQuiz?.class} ·{' '}
                {generatedQuiz?.questions.length} preguntas
              </p>
            </div>

            <div className='border border-border rounded-lg p-4 bg-secondary/20'>
              <div className='flex items-center justify-between mb-3'>
                <h3 className='font-semibold text-foreground'>Vista previa</h3>
                <Badge
                  variant='outline'
                  className='bg-primary/10 text-primary'
                >
                  {generatedQuiz?.questions.length ?? 0} preguntas
                </Badge>
              </div>
              <div className='space-y-3 max-h-[300px] overflow-y-auto pr-2'>
                {(generatedQuiz?.questions ?? []).map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className='border border-border rounded-lg p-3 bg-card'
                  >
                    <p className='font-medium text-foreground mb-2'>
                      {(q?.id ?? qIdx) as number}. {q?.question ?? 'Pregunta'}
                    </p>
                    <ul className='text-sm text-muted-foreground grid grid-cols-1 gap-1'>
                      {(q?.options ?? []).map((opt, idx) => (
                        <li key={`${qIdx}-${idx}`}>
                          {' '}
                          {String.fromCharCode(97 + idx)}) {opt}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className='flex gap-3'>
              <Button
                variant='outline'
                onClick={() => {
                  setIsGenerating(false)
                  setShowPreview(false)
                }}
                className='flex-1 bg-transparent'
              >
                Generar otro
              </Button>
              <Button
                onClick={() => {
                  if (!generatedQuiz) return
                  try {
                    localStorage.setItem(
                      `quiz:${generatedQuiz.id}`,
                      JSON.stringify(generatedQuiz)
                    )
                  } catch {}
                  onOpenChange(false)
                  router.push(`/quizzes/${generatedQuiz.id}`)
                }}
                className='flex-1 bg-primary hover:bg-primary/90'
              >
                Iniciar Quiz
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
