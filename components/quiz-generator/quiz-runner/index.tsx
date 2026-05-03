'use client'

import { use, useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Trophy,
  Target,
  Volume2,
  RotateCcw,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import type { StoredQuiz } from '../quiz-modal/schema'

function spellAcronyms(text: string): string {
  return text.replace(/\b([A-Z]{2,5})\b/g, (match) => match.split('').join(' '))
}

type OpenGrade = {
  score: 'correct' | 'partial' | 'incorrect'
  grade: number
  feedback: string
}

const mockQuiz: StoredQuiz = {
  id: 'mat-1710512400000',
  name: 'Quiz: Fracciones y operaciones básicas',
  class: 'Matemáticas',
  questionType: 'multiple',
  questions: [
    {
      id: 1,
      question: '¿Qué representa el numerador en una fracción?',
      options: [
        'El total de partes en que se divide algo',
        'Las partes que se toman del total',
        'El resultado de una suma',
        'La medida de un ángulo',
      ],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: '¿Cuál fracción es equivalente a 1/2?',
      options: ['2/3', '3/4', '2/4', '5/8'],
      correctAnswer: 2,
    },
    {
      id: 3,
      question: 'Si sumas 1/4 + 1/4, obtienes:',
      options: ['1/2', '1/8', '2/8', '3/4'],
      correctAnswer: 0,
    },
    {
      id: 4,
      question: '¿Qué debes hacer primero en 8 + 2 × 3?',
      options: ['Sumar 8 + 2', 'Multiplicar 2 × 3', 'Restar 8 - 2', 'Dividir 8 entre 2'],
      correctAnswer: 1,
    },
    {
      id: 5,
      question: '¿Cuál de estos números es par?',
      options: ['7', '9', '12', '15'],
      correctAnswer: 2,
    },
  ],
}

export default function QuizRunner({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)

  const [quizData, setQuizData] = useState<StoredQuiz | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showResults, setShowResults] = useState(false)

  // Multiple choice state
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([])

  // Open answer state
  const [openAnswers, setOpenAnswers] = useState<string[]>([])
  const [openGrades, setOpenGrades] = useState<(OpenGrade | null)[]>([])
  const [isGrading, setIsGrading] = useState(false)

  // Audio state
  const [isAudioLoading, setIsAudioLoading] = useState(false)
  const [_audioError, setAudioError] = useState<string | null>(null)
  const [hasAudio, setHasAudio] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioUrlRef = useRef<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`quiz:${id}`)
      if (stored) {
        const parsed = JSON.parse(stored) as StoredQuiz
        if (parsed?.questions?.length) {
          setQuizData(parsed)
          setSelectedAnswers(Array.from({ length: parsed.questions.length }, () => null))
          setOpenAnswers(Array.from({ length: parsed.questions.length }, () => ''))
          setOpenGrades(Array.from({ length: parsed.questions.length }, () => null))
        }
      }
    } catch {}
  }, [id])

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
    return () => {
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  const quiz = quizData ?? mockQuiz
  const isOpen = quiz.questionType === 'open'
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  const handleSpeech = async (text: string) => {
    setIsAudioLoading(true)
    setAudioError(null)
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
      audioUrlRef.current = null
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
      if (!response.ok) throw new Error('Failed to generate speech')
      const blob = await response.blob()
      audioUrlRef.current = URL.createObjectURL(blob)
      audioRef.current = new Audio(audioUrlRef.current)
      setHasAudio(true)
      if (audioRef.current) {
        audioRef.current.onplay = () => setIsPlaying(true)
        audioRef.current.onpause = () => setIsPlaying(false)
        audioRef.current.onended = () => setIsPlaying(false)
        audioRef.current.play()
      }
    } catch {
      setAudioError('Error generating speech')
      setHasAudio(false)
    } finally {
      setIsAudioLoading(false)
    }
  }

  const replayAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
    }
  }

  // Multiple choice handlers
  const handleSelectAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const calculateMultipleScore = () => {
    let correct = 0
    selectedAnswers.forEach((answer, index) => {
      if (answer === quiz.questions[index].correctAnswer) correct++
    })
    return correct
  }

  // Open answer handlers
  const handleGradeAnswer = async () => {
    const question = quiz.questions[currentQuestion]
    const userAnswer = openAnswers[currentQuestion]
    if (!userAnswer.trim() || isGrading) return

    setIsGrading(true)
    try {
      const res = await fetch('/api/quiz-grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.question,
          modelAnswer: question.modelAnswer,
          userAnswer,
          className: quiz.class,
        }),
      })
      const grade = (await res.json()) as OpenGrade
      const newGrades = [...openGrades]
      newGrades[currentQuestion] = grade
      setOpenGrades(newGrades)
    } catch {
      const newGrades = [...openGrades]
      newGrades[currentQuestion] = {
        score: 'incorrect',
        grade: 0,
        feedback: 'No se pudo calificar la respuesta.',
      }
      setOpenGrades(newGrades)
    } finally {
      setIsGrading(false)
    }
  }

  const calculateOpenScore = () => {
    const total = openGrades.reduce((sum, g) => sum + (g?.grade ?? 0), 0)
    return total / quiz.questions.length
  }

  const disableInteractions = isAudioLoading || isPlaying || isGrading

  const gradeColors = {
    correct: 'text-green-500',
    partial: 'text-yellow-500',
    incorrect: 'text-red-500',
  }

  const gradeLabels = {
    correct: 'Correcto',
    partial: 'Parcialmente correcto',
    incorrect: 'Incorrecto',
  }

  const gradeIcons = {
    correct: <CheckCircle2 className='w-5 h-5 text-green-500' />,
    partial: <AlertCircle className='w-5 h-5 text-yellow-500' />,
    incorrect: <XCircle className='w-5 h-5 text-red-500' />,
  }

  if (showResults) {
    return (
      <main className='max-w-7xl mx-auto p-4'>
        <Button variant='ghost' onClick={() => router.push('/quizzes')} className='mb-6'>
          <ArrowLeft className='w-4 h-4 mr-2' />
          Volver a Quizzes
        </Button>

        <Card className='max-w-3xl mx-auto p-8 bg-card border-border'>
          <div className='text-center mb-8'>
            <div className='w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4'>
              <Trophy className='w-10 h-10 text-primary' />
            </div>
            <h1 className='text-3xl font-bold text-foreground mb-2'>¡Quiz Completado!</h1>
            <p className='text-muted-foreground'>{quiz.name}</p>
          </div>

          {isOpen ? (
            <>
              <div className='bg-secondary/30 rounded-lg p-6 mb-6 text-center'>
                <p className='text-sm text-muted-foreground mb-2'>Tu puntuación</p>
                <p className='text-5xl font-bold text-primary mb-2'>
                  {(calculateOpenScore() * 100).toFixed(0)}%
                </p>
                <p className='text-lg text-muted-foreground'>
                  {openGrades.filter((g) => g?.score === 'correct').length} correctas ·{' '}
                  {openGrades.filter((g) => g?.score === 'partial').length} parciales ·{' '}
                  {openGrades.filter((g) => g?.score === 'incorrect').length} incorrectas
                </p>
              </div>

              <div className='space-y-4 mb-6'>
                <h2 className='text-lg font-semibold text-foreground'>Resultados por pregunta</h2>
                {quiz.questions.map((question, index) => {
                  const grade = openGrades[index]
                  return (
                    <Card key={String(question.id ?? index)} className='p-4 bg-card border-border'>
                      <div className='flex items-start gap-3 mb-3'>
                        <div className='flex-shrink-0 mt-0.5'>
                          {grade ? gradeIcons[grade.score] : <AlertCircle className='w-5 h-5 text-muted-foreground' />}
                        </div>
                        <p className='font-medium text-foreground'>
                          {index + 1}. {question.question}
                        </p>
                      </div>
                      <div className='ml-8 space-y-2 text-sm'>
                        <p className='text-muted-foreground'>
                          <span className='font-medium'>Tu respuesta: </span>
                          {openAnswers[index] || '(sin respuesta)'}
                        </p>
                        {grade && (
                          <>
                            <p className={`font-medium ${gradeColors[grade.score]}`}>
                              {gradeLabels[grade.score]}
                            </p>
                            <p className='text-muted-foreground'>{grade.feedback}</p>
                          </>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </>
          ) : (
            <>
              <div className='bg-secondary/30 rounded-lg p-6 mb-6 text-center'>
                <p className='text-sm text-muted-foreground mb-2'>Tu puntuación</p>
                <p className='text-5xl font-bold text-primary mb-2'>
                  {calculateMultipleScore()}/{quiz.questions.length}
                </p>
                <p className='text-lg text-muted-foreground'>
                  {((calculateMultipleScore() / quiz.questions.length) * 100).toFixed(0)}% correcto
                </p>
              </div>

              <div className='space-y-4 mb-6'>
                <h2 className='text-lg font-semibold text-foreground'>Resultados por pregunta</h2>
                {quiz.questions.map((question, index) => {
                  const userAnswer = selectedAnswers[index]
                  const isCorrect = userAnswer === question.correctAnswer
                  return (
                    <Card key={String(question.id ?? index)} className='p-4 bg-card border-border'>
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
                              <p className={isCorrect ? 'text-green-500' : 'text-red-500'}>
                                Tu respuesta: {String.fromCharCode(97 + userAnswer)})
                                {question.options?.[userAnswer]}
                              </p>
                            )}
                            {!isCorrect && question.correctAnswer !== undefined && (
                              <p className='text-green-500'>
                                Respuesta correcta:{' '}
                                {String.fromCharCode(97 + question.correctAnswer)})
                                {question.options?.[question.correctAnswer]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </>
          )}

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
                setSelectedAnswers(Array.from({ length: quiz.questions.length }, () => null))
                setOpenAnswers(Array.from({ length: quiz.questions.length }, () => ''))
                setOpenGrades(Array.from({ length: quiz.questions.length }, () => null))
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
  const currentGrade = openGrades[currentQuestion]
  const currentOpenAnswer = openAnswers[currentQuestion]
  const isCurrentVerified = currentGrade !== null
  const selectedAnswer = selectedAnswers[currentQuestion]
  const isLastQuestion = currentQuestion === quiz.questions.length - 1

  return (
    <main className='max-w-7xl mx-auto p-4'>
      <Button variant='ghost' onClick={() => router.push('/quizzes')} className='mb-6'>
        <ArrowLeft className='w-4 h-4 mr-2' />
        Volver a Quizzes
      </Button>

      <Card className='max-w-3xl mx-auto p-6 bg-card border-border'>
        {/* Header */}
        <div className='mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h1 className='text-2xl font-bold text-foreground'>{quiz.name}</h1>
              <p className='text-sm text-muted-foreground'>{quiz.class}</p>
            </div>
            <div className='flex items-center gap-2'>
              <Badge variant='secondary' className='text-lg'>
                {currentQuestion + 1}/{quiz.questions.length}
              </Badge>
              {!hasAudio && (
                <Button
                  variant='outline'
                  size='icon'
                  disabled={disableInteractions}
                  onClick={() => {
                    const q = quiz.questions[currentQuestion]
                    const speechText = isOpen
                      ? `Pregunta ${currentQuestion + 1}: ${spellAcronyms(q.question)}.`
                      : `Pregunta ${currentQuestion + 1}: ${spellAcronyms(q.question)}. ${
                          (q.options ?? [])
                            .map((opt, i) => `Opción ${String.fromCharCode(65 + i)}: ${spellAcronyms(opt)}`)
                            .join('. ')
                        }.`
                    handleSpeech(speechText)
                  }}
                  aria-label='Leer pregunta'
                  className='bg-card'
                >
                  {isAudioLoading ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                  ) : (
                    <Volume2 className='w-4 h-4' />
                  )}
                </Button>
              )}
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
            <Progress value={progress} className='h-2' />
          </div>
        </div>

        {/* Question */}
        <div className='mb-8'>
          <div className='bg-secondary/30 rounded-lg p-6 mb-6'>
            <div className='flex items-start gap-3'>
              <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0'>
                <Target className='w-4 h-4 text-primary' />
              </div>
              <p className='text-lg text-foreground font-medium'>{question.question}</p>
            </div>
          </div>

          {isOpen ? (
            <div className='space-y-4'>
              <Textarea
                placeholder='Escribe tu respuesta aquí...'
                value={currentOpenAnswer}
                onChange={(e) => {
                  const newAnswers = [...openAnswers]
                  newAnswers[currentQuestion] = e.target.value
                  setOpenAnswers(newAnswers)
                }}
                disabled={isCurrentVerified || disableInteractions}
                className='min-h-[120px] bg-card border-border resize-none'
              />

              {!isCurrentVerified && (
                <Button
                  onClick={handleGradeAnswer}
                  disabled={!currentOpenAnswer.trim() || disableInteractions}
                  className='w-full'
                >
                  {isGrading ? (
                    <>
                      <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                      Calificando...
                    </>
                  ) : (
                    'Verificar respuesta'
                  )}
                </Button>
              )}

              {currentGrade && (
                <div
                  className={`rounded-lg border p-4 space-y-2 ${
                    currentGrade.score === 'correct'
                      ? 'border-green-500/30 bg-green-500/10'
                      : currentGrade.score === 'partial'
                        ? 'border-yellow-500/30 bg-yellow-500/10'
                        : 'border-red-500/30 bg-red-500/10'
                  }`}
                >
                  <div className='flex items-center gap-2'>
                    {gradeIcons[currentGrade.score]}
                    <p className={`font-semibold ${gradeColors[currentGrade.score]}`}>
                      {gradeLabels[currentGrade.score]}
                    </p>
                  </div>
                  <p className='text-sm text-foreground'>{currentGrade.feedback}</p>
                </div>
              )}
            </div>
          ) : (
            <div className='space-y-3'>
              {(question.options ?? []).map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  disabled={disableInteractions}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedAnswer === index
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 bg-card'
                  } ${disableInteractions ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedAnswer === index ? 'border-primary bg-primary' : 'border-border'
                      }`}
                    >
                      {selectedAnswer === index && (
                        <CheckCircle2 className='w-4 h-4 text-primary-foreground' />
                      )}
                    </div>
                    <span className='text-foreground'>
                      <span className='font-semibold mr-2'>{String.fromCharCode(97 + index)})</span>
                      {option}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className='flex gap-3'>
          <Button
            variant='outline'
            onClick={() => setCurrentQuestion(currentQuestion - 1)}
            disabled={currentQuestion === 0 || disableInteractions}
            className='bg-transparent'
          >
            Anterior
          </Button>

          <div className='flex-1' />

          {isLastQuestion ? (
            <Button
              onClick={() => setShowResults(true)}
              disabled={
                disableInteractions ||
                (isOpen ? !isCurrentVerified : selectedAnswer === null)
              }
              className='bg-primary hover:bg-primary/90'
            >
              Terminar Quiz
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={
                disableInteractions ||
                (isOpen ? !isCurrentVerified : selectedAnswer === null)
              }
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
