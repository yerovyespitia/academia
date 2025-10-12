'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Brain,
  Search,
  Trash2,
  Calendar,
  Tag,
  Play,
  CheckCircle2,
  Clock,
} from 'lucide-react'

// Mock data for quizzes
const mockQuizzes = [
  {
    id: 'calc-1710512400000',
    name: 'Quiz: Límites y Continuidad',
    class: 'Cálculo Diferencial',
    tag: 'Cálculo',
    date: '2024-03-15',
    questions: 15,
    completed: true,
    score: 13,
    duration: '12 min',
  },
  {
    id: 'physics-1710426000000',
    name: 'Quiz: Cinemática y Movimiento',
    class: 'Física Mecánica',
    tag: 'Física',
    date: '2024-03-14',
    questions: 20,
    completed: true,
    score: 16,
    duration: '18 min',
  },
  {
    id: 'calc-1710339600000',
    name: 'Quiz: Derivadas Básicas',
    class: 'Cálculo Diferencial',
    tag: 'Cálculo',
    date: '2024-03-13',
    questions: 10,
    completed: false,
    score: null,
    duration: null,
  },
  {
    id: 'programming-1710253200000',
    name: 'Quiz: Estructuras de Control',
    class: 'Programación I',
    tag: 'Programación',
    date: '2024-03-12',
    questions: 12,
    completed: true,
    score: 11,
    duration: '10 min',
  },
  {
    id: 'physics-1710166800000',
    name: 'Quiz: Leyes de Newton',
    class: 'Física Mecánica',
    tag: 'Física',
    date: '2024-03-11',
    questions: 15,
    completed: false,
    score: null,
    duration: null,
  },
]

export default function QuizzesPage() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState(mockQuizzes)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Get unique tags
  const tags = Array.from(new Set(quizzes.map((quiz) => quiz.tag)))

  // Filter quizzes
  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesTag = !selectedTag || quiz.tag === selectedTag
    const matchesSearch = quiz.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    return matchesTag && matchesSearch
  })

  // Group quizzes by tag
  const quizzesByTag = filteredQuizzes.reduce((acc, quiz) => {
    if (!acc[quiz.tag]) {
      acc[quiz.tag] = []
    }
    acc[quiz.tag].push(quiz)
    return acc
  }, {} as Record<string, typeof mockQuizzes>)

  const handleDeleteQuiz = (id: string) => {
    setQuizzes(quizzes.filter((quiz) => quiz.id !== id))
  }

  const handleStartQuiz = (id: string) => {
    router.push(`/quizzes/${id}`)
  }

  return (
    <main className='max-w-7xl mx-auto p-4'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-foreground mb-2'>Mis Quizzes</h1>
        <p className='text-muted-foreground'>
          Practica y evalúa tu conocimiento
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
        <Card className='p-4 bg-card border-border'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center'>
              <Brain className='w-5 h-5 text-primary' />
            </div>
            <div>
              <p className='text-2xl font-bold text-foreground'>
                {quizzes.length}
              </p>
              <p className='text-sm text-muted-foreground'>Total de quizzes</p>
            </div>
          </div>
        </Card>

        <Card className='p-4 bg-card border-border'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center'>
              <CheckCircle2 className='w-5 h-5 text-green-500' />
            </div>
            <div>
              <p className='text-2xl font-bold text-foreground'>
                {quizzes.filter((q) => q.completed).length}
              </p>
              <p className='text-sm text-muted-foreground'>Completados</p>
            </div>
          </div>
        </Card>

        <Card className='p-4 bg-card border-border'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center'>
              <Clock className='w-5 h-5 text-accent' />
            </div>
            <div>
              <p className='text-2xl font-bold text-foreground'>
                {quizzes.filter((q) => !q.completed).length}
              </p>
              <p className='text-sm text-muted-foreground'>Pendientes</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className='flex flex-col md:flex-row gap-4 mb-6'>
        <div className='flex-1 relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <Input
            placeholder='Buscar quizzes...'
            className='pl-10 bg-card border-border'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className='flex gap-2 flex-wrap'>
          <Button
            variant={selectedTag === null ? 'default' : 'outline'}
            size='sm'
            onClick={() => setSelectedTag(null)}
          >
            Todos
          </Button>
          {tags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTag === tag ? 'default' : 'outline'}
              size='sm'
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      {/* Quizzes Grid - Organized by Tags */}
      {Object.keys(quizzesByTag).length === 0 ? (
        <Card className='p-12 text-center bg-card border-border'>
          <Brain className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
          <p className='text-muted-foreground'>No se encontraron quizzes</p>
        </Card>
      ) : (
        <div className='space-y-8'>
          {Object.entries(quizzesByTag).map(([tag, quizList]) => (
            <div key={tag}>
              <div className='flex items-center gap-2 mb-4'>
                <Tag className='w-5 h-5 text-primary' />
                <h2 className='text-xl font-semibold text-foreground'>{tag}</h2>
                <Badge
                  variant='secondary'
                  className='ml-2'
                >
                  {quizList.length}
                </Badge>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {quizList.map((quiz) => (
                  <Card
                    key={quiz.id}
                    className='p-4 bg-card border-border hover:border-primary/50 transition-colors'
                  >
                    {/* Quiz Header */}
                    <div className='space-y-3'>
                      <div className='flex items-start justify-between'>
                        <h3 className='font-medium text-foreground text-sm line-clamp-2 flex-1'>
                          {quiz.name}
                        </h3>
                        {quiz.completed ? (
                          <Badge
                            variant='outline'
                            className='bg-green-500/10 text-green-500 border-green-500/30'
                          >
                            <CheckCircle2 className='w-3 h-3 mr-1' />
                            Completado
                          </Badge>
                        ) : (
                          <Badge
                            variant='outline'
                            className='bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
                          >
                            Pendiente
                          </Badge>
                        )}
                      </div>

                      <p className='text-xs text-muted-foreground'>
                        {quiz.class}
                      </p>

                      {/* Quiz Stats */}
                      <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                        <div className='flex items-center gap-1'>
                          <Brain className='w-3 h-3' />
                          <span>{quiz.questions} preguntas</span>
                        </div>
                        {quiz.completed && quiz.score !== null && (
                          <div className='flex items-center gap-1'>
                            <CheckCircle2 className='w-3 h-3 text-green-500' />
                            <span className='text-green-500'>
                              {quiz.score}/{quiz.questions}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <Calendar className='w-3 h-3' />
                        <span>{quiz.date}</span>
                        {quiz.duration && (
                          <>
                            <span>•</span>
                            <Clock className='w-3 h-3' />
                            <span>{quiz.duration}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className='flex gap-2 mt-4'>
                      <Button
                        variant='default'
                        size='sm'
                        className='flex-1'
                        onClick={() => handleStartQuiz(quiz.id)}
                      >
                        <Play className='w-4 h-4 mr-1' />
                        {quiz.completed ? 'Reintentar' : 'Comenzar'}
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        className='text-destructive hover:bg-destructive/10'
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
