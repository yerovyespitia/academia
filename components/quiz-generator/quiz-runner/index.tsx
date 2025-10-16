'use client'

import { use, useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Trophy,
  Target,
  Volume2,
  RotateCcw,
  Loader2,
} from 'lucide-react'
import type { QuizSchema } from '../quiz-modal/schema'

// Ensure acronyms like POO/HTML are read letter-by-letter by TTS
function spellAcronyms(text: string): string {
  return text.replace(/\b([A-Z]{2,5})\b/g, (match) => match.split('').join(' '))
}

// Fallback mock data to ensure page works without storage
const mockQuiz: QuizSchema = {
  id: 'calc-1710512400000',
  name: 'Quiz: Límites y Continuidad',
  class: 'Cálculo Diferencial',
  questions: [
    {
      id: 1,
      question: '¿Cuál es la definición formal de límite de una función?',
      options: [
        'El valor que toma la función en un punto específico',
        'El valor al que se aproxima la función cuando x tiende a un valor',
        'La derivada de la función en un punto',
        'La integral de la función en un intervalo',
      ],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: 'Una función es continua en un punto si:',
      options: [
        'Existe el límite en ese punto',
        'La función está definida en ese punto',
        'El límite existe, la función está definida y ambos son iguales',
        'La función es derivable en ese punto',
      ],
      correctAnswer: 2,
    },
    {
      id: 3,
      question: '¿Qué representa el límite cuando x tiende a infinito?',
      options: [
        'El comportamiento de la función en valores muy grandes',
        'El valor máximo de la función',
        'La derivada en el infinito',
        'El área bajo la curva',
      ],
      correctAnswer: 0,
    },
    {
      id: 4,
      question:
        'Si lim(x→a) f(x) = L y lim(x→a) g(x) = M, entonces lim(x→a) [f(x) + g(x)] es:',
      options: ['L × M', 'L + M', 'L - M', 'L / M'],
      correctAnswer: 1,
    },
    {
      id: 5,
      question: 'Una discontinuidad removible ocurre cuando:',
      options: [
        'La función no está definida en ningún punto',
        'El límite existe pero no coincide con el valor de la función',
        'La función tiene un salto',
        'La función tiende a infinito',
      ],
      correctAnswer: 1,
    },
  ],
}

export default function QuizRunner({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id } = use(params)

  const [quizData, setQuizData] = useState<QuizSchema | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    Array.from({ length: mockQuiz.questions.length }, () => null)
  )
  const [showResults, setShowResults] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [_error, setError] = useState<string | null>(null)
  const [hasAudio, setHasAudio] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const audioUrlRef = useRef<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleSpeech = async (text: string) => {
    setIsLoading(true)
    setError(null)

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
      audioRef.current = null
    }

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }

    try {
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate speech')
      }

      const blob = await response.blob()
      audioUrlRef.current = URL.createObjectURL(blob)
      audioRef.current = new Audio(audioUrlRef.current)

      setHasAudio(true)
      // Track play/pause state
      if (audioRef.current) {
        audioRef.current.onplay = () => setIsPlaying(true)
        audioRef.current.onpause = () => setIsPlaying(false)
        audioRef.current.onended = () => setIsPlaying(false)
        audioRef.current.play()
      }
    } catch (error) {
      console.error('Error generating speech: ', error)
      setError('Error generating speech')
      setHasAudio(false)
    } finally {
      setIsLoading(false)
    }
  }

  const replayAudio = () => {
    if (audioUrlRef.current) {
      audioRef.current!.currentTime = 0
      audioRef.current?.play()
    }
  }

  useEffect(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current!)
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }
  }, [])

  // Stop and reset audio state when navigating between questions
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
      audioUrlRef.current = null
    }
    setHasAudio(false)
    setIsPlaying(false)
  }, [currentQuestion])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`quiz:${id}`)
      if (stored) {
        const parsed = JSON.parse(stored) as QuizSchema
        if (parsed?.questions?.length) {
          setQuizData(parsed)
          setSelectedAnswers(
            Array.from({ length: parsed.questions.length }, () => null)
          )
        }
      }
    } catch {}
  }, [id])

  const quiz = quizData ?? mockQuiz

  const handleSelectAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleFinish = () => {
    setShowResults(true)
  }

  const calculateScore = () => {
    let correct = 0
    selectedAnswers.forEach((answer, index) => {
      if (answer === quiz.questions[index].correctAnswer) {
        correct++
      }
    })
    return correct
  }

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100
  const disableInteractions = isLoading || isPlaying

  if (showResults) {
    const score = calculateScore()
    const percentage = (score / quiz.questions.length) * 100

    return (
      <main className='max-w-7xl mx-auto p-4'>
        <Button
          variant='ghost'
          onClick={() => router.push('/quizzes')}
          className='mb-6'
        >
          <ArrowLeft className='w-4 h-4 mr-2' />
          Volver a Quizzes
        </Button>

        <Card className='max-w-3xl mx-auto p-8 bg-card border-border'>
          <div className='text-center mb-8'>
            <div className='w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4'>
              <Trophy className='w-10 h-10 text-primary' />
            </div>
            <h1 className='text-3xl font-bold text-foreground mb-2'>
              ¡Quiz Completado!
            </h1>
            <p className='text-muted-foreground'>{quiz.name}</p>
          </div>

          <div className='bg-secondary/30 rounded-lg p-6 mb-6 text-center'>
            <p className='text-sm text-muted-foreground mb-2'>Tu puntuación</p>
            <p className='text-5xl font-bold text-primary mb-2'>
              {score}/{quiz.questions.length}
            </p>
            <p className='text-lg text-muted-foreground'>
              {percentage.toFixed(0)}% correcto
            </p>
          </div>

          <div className='space-y-4 mb-6'>
            <h2 className='text-lg font-semibold text-foreground mb-4'>
              Resultados por pregunta
            </h2>
            {quiz.questions.map((question, index) => {
              const userAnswer = selectedAnswers[index]
              const isCorrect = userAnswer === question.correctAnswer

              return (
                <Card
                  key={question.id}
                  className='p-4 bg-card border-border'
                >
                  <div className='flex items-start gap-3'>
                    <div className='flex-shrink-0'>
                      {isCorrect ? (
                        <div className='w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center'>
                          <CheckCircle2 className='w-5 h-5 text-green-500' />
                        </div>
                      ) : (
                        <div className='w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center'>
                          <XCircle className='w-5 h-5 text-red-500' />
                        </div>
                      )}
                    </div>
                    <div className='flex-1'>
                      <p className='font-medium text-foreground mb-2'>
                        {index + 1}. {question.question}
                      </p>
                      <div className='space-y-1 text-sm'>
                        {userAnswer !== null && (
                          <p
                            className={
                              isCorrect ? 'text-green-500' : 'text-red-500'
                            }
                          >
                            Tu respuesta: {String.fromCharCode(97 + userAnswer)}
                            ){question.options[userAnswer]}
                          </p>
                        )}
                        {!isCorrect && (
                          <p className='text-green-500'>
                            Respuesta correcta:{' '}
                            {String.fromCharCode(97 + question.correctAnswer)})
                            {question.options[question.correctAnswer]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          <div className='flex gap-3'>
            <Button
              variant='outline'
              onClick={() => router.push('/quizzes')}
              className='flex-1 bg-transparent'
            >
              Volver a Quizzes
            </Button>
            <Button
              onClick={() => {
                setShowResults(false)
                setCurrentQuestion(0)
                setSelectedAnswers(
                  Array.from({ length: quiz.questions.length }, () => null)
                )
              }}
              className='flex-1 bg-primary hover:bg-primary/90'
            >
              Reintentar Quiz
            </Button>
          </div>
        </Card>
      </main>
    )
  }

  const question = quiz.questions[currentQuestion]
  const selectedAnswer = selectedAnswers[currentQuestion]

  return (
    <main className='max-w-7xl mx-auto p-4'>
      <Button
        variant='ghost'
        onClick={() => router.push('/quizzes')}
        className='mb-6'
      >
        <ArrowLeft className='w-4 h-4 mr-2' />
        Volver a Quizzes
      </Button>

      <Card className='max-w-3xl mx-auto p-6 bg-card border-border'>
        <div className='mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h1 className='text-2xl font-bold text-foreground'>
                {quiz.name}
              </h1>
              <p className='text-sm text-muted-foreground'>{quiz.class}</p>
            </div>
            <div className='flex items-center gap-2'>
              <Badge
                variant='secondary'
                className='text-lg'
              >
                {currentQuestion + 1}/{quiz.questions.length}
              </Badge>
              {/* Show play only if no audio has been generated yet */}
              {!hasAudio && (
                <Button
                  variant='outline'
                  size='icon'
                  disabled={disableInteractions}
                  onClick={() => {
                    const q = quiz.questions[currentQuestion]
                    const optionsText = q.options
                      .map(
                        (opt, i) =>
                          `Opción ${String.fromCharCode(65 + i)}: ${spellAcronyms(
                            opt
                          )}`
                      )
                      .join('. ')
                    const speechText = `Pregunta ${
                      currentQuestion + 1
                    }: ${spellAcronyms(q.question)}. ${optionsText}.`
                    handleSpeech(speechText)
                  }}
                  aria-label='Leer pregunta'
                  className='bg-card'
                >
                  {isLoading ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                  ) : (
                    <Volume2 className='w-4 h-4' />
                  )}
                </Button>
              )}
              {/* Replay button appears only when audio was generated */}
              {hasAudio && (
                <Button
                  variant='outline'
                  size='icon'
                  disabled={disableInteractions}
                  onClick={replayAudio}
                  aria-label='Reproducir de nuevo'
                  className='bg-card'
                >
                  <RotateCcw className='w-4 h-4' />
                </Button>
              )}
            </div>
          </div>

          <div className='space-y-2'>
            <div className='flex justify-between text-sm text-muted-foreground'>
              <span>Progreso</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <Progress
              value={progress}
              className='h-2'
            />
          </div>
        </div>

        <div className='mb-8'>
          <div className='bg-secondary/30 rounded-lg p-6 mb-6'>
            <div className='flex items-start gap-3'>
              <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0'>
                <Target className='w-4 h-4 text-primary' />
              </div>
              <p className='text-lg text-foreground font-medium'>
                {question.question}
              </p>
            </div>
          </div>

          <div className='space-y-3'>
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={disableInteractions}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  selectedAnswer === index
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 bg-card'
                } ${
                  disableInteractions ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className='flex items-center gap-3'>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedAnswer === index
                        ? 'border-primary bg-primary'
                        : 'border-border'
                    }`}
                  >
                    {selectedAnswer === index && (
                      <CheckCircle2 className='w-4 h-4 text-primary-foreground' />
                    )}
                  </div>
                  <span className='text-foreground'>
                    <span className='font-semibold mr-2'>
                      {String.fromCharCode(97 + index)})
                    </span>
                    {option}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className='flex gap-3'>
          <Button
            variant='outline'
            onClick={handlePrevious}
            disabled={currentQuestion === 0 || disableInteractions}
            className='bg-transparent'
          >
            Anterior
          </Button>

          <div className='flex-1' />

          {currentQuestion === quiz.questions.length - 1 ? (
            <Button
              onClick={handleFinish}
              disabled={selectedAnswer === null || disableInteractions}
              className='bg-primary hover:bg-primary/90'
            >
              Terminar Quiz
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={selectedAnswer === null || disableInteractions}
              className='bg-primary hover:bg-primary/90'
            >
              Siguiente
            </Button>
          )}
        </div>
      </Card>
    </main>
  )
}
