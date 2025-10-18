'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Search, BookOpen, Shuffle, Eye, EyeOff } from 'lucide-react'

// Mock glossary data
const mockGlosario = {
  id: 'calc-glossary-1710512400000',
  name: 'Glosario: Cálculo Diferencial',
  class: 'Cálculo Diferencial',
  tag: 'Cálculo',
  date: '2024-03-15',
  terms: [
    {
      id: 1,
      topic: 'Límites',
      term: 'Límite',
      definition:
        'Valor al que se aproxima una función cuando la variable independiente se acerca a un punto determinado.',
      example: 'lim(x→0) sin(x)/x = 1',
    },
    {
      id: 2,
      topic: 'Límites',
      term: 'Continuidad',
      definition:
        'Una función es continua en un punto si el límite de la función en ese punto existe y es igual al valor de la función.',
      example: 'f(x) = x² es continua en todos los reales',
    },
    {
      id: 3,
      topic: 'Límites',
      term: 'Asíntota',
      definition:
        'Línea recta a la cual se aproxima indefinidamente una curva sin llegar a tocarla.',
      example: 'f(x) = 1/x tiene asíntota vertical en x = 0',
    },
    {
      id: 4,
      topic: 'Derivadas',
      term: 'Derivada',
      definition:
        'Razón de cambio instantánea de una función. Representa la pendiente de la recta tangente en un punto.',
      example: "Si f(x) = x², entonces f'(x) = 2x",
    },
    {
      id: 5,
      topic: 'Derivadas',
      term: 'Regla de la cadena',
      definition:
        "Método para derivar funciones compuestas. Si y = f(g(x)), entonces dy/dx = f'(g(x)) · g'(x)",
      example: 'd/dx[sin(x²)] = cos(x²) · 2x',
    },
    {
      id: 6,
      topic: 'Derivadas',
      term: 'Derivada implícita',
      definition:
        'Técnica para derivar ecuaciones donde y no está despejada explícitamente en términos de x.',
      example:
        'Para x² + y² = 25, derivando implícitamente: 2x + 2y(dy/dx) = 0',
    },
    {
      id: 7,
      topic: 'Continuidad',
      term: 'Discontinuidad removible',
      definition:
        "Punto donde la función no está definida pero el límite existe. Se puede 'remover' redefiniendo.",
      example: 'f(x) = (x²-1)/(x-1) tiene discontinuidad removible en x = 1',
    },
    {
      id: 8,
      topic: 'Continuidad',
      term: 'Teorema del valor intermedio',
      definition:
        'Si f es continua en [a,b] y k está entre f(a) y f(b), existe c en (a,b) tal que f(c) = k.',
      example: 'Usado para demostrar existencia de raíces',
    },
  ],
}

export default function GlosarioDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [studyMode, setStudyMode] = useState(false)
  const [revealedTerms, setRevealedTerms] = useState<Set<number>>(new Set())

  // Get unique topics
  const topics = Array.from(
    new Set(mockGlosario.terms.map((term) => term.topic))
  )

  // Filter terms
  const filteredTerms = mockGlosario.terms.filter((term) => {
    const matchesTopic = !selectedTopic || term.topic === selectedTopic
    const matchesSearch =
      term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTopic && matchesSearch
  })

  // Group terms by topic
  const termsByTopic = filteredTerms.reduce((acc, term) => {
    if (!acc[term.topic]) {
      acc[term.topic] = []
    }
    acc[term.topic].push(term)
    return acc
  }, {} as Record<string, typeof mockGlosario.terms>)

  const toggleReveal = (termId: number) => {
    const newRevealed = new Set(revealedTerms)
    if (newRevealed.has(termId)) {
      newRevealed.delete(termId)
    } else {
      newRevealed.add(termId)
    }
    setRevealedTerms(newRevealed)
  }

  const revealAll = () => {
    setRevealedTerms(new Set(mockGlosario.terms.map((t) => t.id)))
  }

  const hideAll = () => {
    setRevealedTerms(new Set())
  }

  return (
    <main className='max-w-7xl mx-auto p-4'>
      <div className='mb-8'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => router.push('/glosarios')}
          className='mb-4'
        >
          <ArrowLeft className='w-4 h-4 mr-2' />
          Volver a glosarios
        </Button>

        <div className='flex items-start justify-between mb-4'>
          <div>
            <h1 className='text-3xl font-bold text-foreground mb-2'>
              {mockGlosario.name}
            </h1>
            <p className='text-muted-foreground'>{mockGlosario.class}</p>
          </div>
          <Badge
            variant='outline'
            className='bg-primary/10 text-primary border-primary/30'
          >
            {mockGlosario.terms.length} términos
          </Badge>
        </div>
      </div>

      {/* Controls */}
      <div className='flex flex-col md:flex-row gap-4 mb-6'>
        <div className='flex-1 relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <Input
            placeholder='Buscar términos...'
            className='pl-10 bg-card border-border'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className='flex gap-2 flex-wrap'>
          <Button
            variant={selectedTopic === null ? 'default' : 'outline'}
            size='sm'
            onClick={() => setSelectedTopic(null)}
          >
            Todos
          </Button>
          {topics.map((topic) => (
            <Button
              key={topic}
              variant={selectedTopic === topic ? 'default' : 'outline'}
              size='sm'
              onClick={() => setSelectedTopic(topic)}
            >
              {topic}
            </Button>
          ))}
        </div>
      </div>

      {/* Study Mode Toggle */}
      <div className='flex gap-2 mb-6'>
        <Button
          variant={studyMode ? 'default' : 'outline'}
          size='sm'
          onClick={() => {
            setStudyMode(!studyMode)
            if (!studyMode) hideAll()
          }}
        >
          <Shuffle className='w-4 h-4 mr-2' />
          Modo estudio
        </Button>

        {studyMode && (
          <>
            <Button
              variant='outline'
              size='sm'
              onClick={revealAll}
            >
              <Eye className='w-4 h-4 mr-2' />
              Revelar todo
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={hideAll}
            >
              <EyeOff className='w-4 h-4 mr-2' />
              Ocultar todo
            </Button>
          </>
        )}
      </div>

      {/* Terms - Organized by Topics */}
      {Object.keys(termsByTopic).length === 0 ? (
        <Card className='p-12 text-center bg-card border-border'>
          <BookOpen className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
          <p className='text-muted-foreground'>No se encontraron términos</p>
        </Card>
      ) : (
        <div className='space-y-8'>
          {Object.entries(termsByTopic).map(([topic, termsList]) => (
            <div key={topic}>
              <div className='flex items-center gap-2 mb-4'>
                <BookOpen className='w-5 h-5 text-primary' />
                <h2 className='text-xl font-semibold text-foreground'>
                  {topic}
                </h2>
                <Badge
                  variant='secondary'
                  className='ml-2'
                >
                  {termsList.length}
                </Badge>
              </div>

              <div className='space-y-4'>
                {termsList.map((term) => (
                  <Card
                    key={term.id}
                    className='p-5 bg-card border-border'
                  >
                    <div className='space-y-3'>
                      <div className='flex items-start justify-between'>
                        <h3 className='text-lg font-semibold text-foreground'>
                          {term.term}
                        </h3>
                        {studyMode && (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => toggleReveal(term.id)}
                          >
                            {revealedTerms.has(term.id) ? (
                              <EyeOff className='w-4 h-4' />
                            ) : (
                              <Eye className='w-4 h-4' />
                            )}
                          </Button>
                        )}
                      </div>

                      {(!studyMode || revealedTerms.has(term.id)) && (
                        <>
                          <p className='text-muted-foreground leading-relaxed'>
                            {term.definition}
                          </p>

                          {term.example && (
                            <div className='bg-muted/50 rounded-lg p-3 border border-border'>
                              <p className='text-sm text-muted-foreground mb-1 font-medium'>
                                Ejemplo:
                              </p>
                              <p className='text-sm text-foreground font-mono'>
                                {term.example}
                              </p>
                            </div>
                          )}
                        </>
                      )}

                      {studyMode && !revealedTerms.has(term.id) && (
                        <div className='bg-muted/30 rounded-lg p-8 border border-dashed border-border text-center'>
                          <p className='text-muted-foreground text-sm'>
                            Haz clic en el ícono para revelar
                          </p>
                        </div>
                      )}
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
