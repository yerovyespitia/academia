'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  BookOpen,
  Search,
  Trash2,
  Calendar,
  Tag,
  Eye,
  BookMarked,
} from 'lucide-react'

// Mock data for glossaries
const mockGlosarios = [
  {
    id: 'calc-glossary-1710512400000',
    name: 'Glosario: Cálculo Diferencial',
    class: 'Cálculo Diferencial',
    tag: 'Cálculo',
    date: '2024-03-15',
    terms: 45,
    topics: ['Límites', 'Derivadas', 'Continuidad'],
  },
  {
    id: 'physics-glossary-1710426000000',
    name: 'Glosario: Física Mecánica',
    class: 'Física Mecánica',
    tag: 'Física',
    date: '2024-03-14',
    terms: 38,
    topics: ['Cinemática', 'Dinámica', 'Energía'],
  },
  {
    id: 'programming-glossary-1710339600000',
    name: 'Glosario: Programación I',
    class: 'Programación I',
    tag: 'Programación',
    date: '2024-03-13',
    terms: 52,
    topics: ['Variables', 'Estructuras de Control', 'Funciones'],
  },
  {
    id: 'algebra-glossary-1710253200000',
    name: 'Glosario: Álgebra Lineal',
    class: 'Álgebra Lineal',
    tag: 'Matemáticas',
    date: '2024-03-12',
    terms: 41,
    topics: ['Matrices', 'Vectores', 'Determinantes'],
  },
  {
    id: 'chemistry-glossary-1710166800000',
    name: 'Glosario: Química General',
    class: 'Química General',
    tag: 'Química',
    date: '2024-03-11',
    terms: 36,
    topics: ['Átomos', 'Enlaces', 'Reacciones'],
  },
]

export default function Page() {
  const router = useRouter()
  const [glosarios, setGlosarios] = useState(mockGlosarios)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Get unique tags
  const tags = Array.from(new Set(glosarios.map((glosario) => glosario.tag)))

  // Calculate total terms
  const totalTerms = glosarios.reduce(
    (sum, glosario) => sum + glosario.terms,
    0
  )

  // Filter glosarios
  const filteredGlosarios = glosarios.filter((glosario) => {
    const matchesTag = !selectedTag || glosario.tag === selectedTag
    const matchesSearch = glosario.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    return matchesTag && matchesSearch
  })

  // Group glosarios by tag
  const glosariosByTag = filteredGlosarios.reduce((acc, glosario) => {
    if (!acc[glosario.tag]) {
      acc[glosario.tag] = []
    }
    acc[glosario.tag].push(glosario)
    return acc
  }, {} as Record<string, typeof mockGlosarios>)

  const handleDeleteGlosario = (id: string) => {
    setGlosarios(glosarios.filter((glosario) => glosario.id !== id))
  }

  const handleViewGlosario = (id: string) => {
    router.push(`/glosarios/${id}`)
  }

  return (
    <main className='max-w-7xl mx-auto p-4'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-foreground mb-2'>
          Mis Glosarios
        </h1>
        <p className='text-muted-foreground'>
          Organiza y estudia términos clave de tus materias
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
        <Card className='p-4 bg-card border-border'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center'>
              <BookOpen className='w-5 h-5 text-primary' />
            </div>
            <div>
              <p className='text-2xl font-bold text-foreground'>
                {glosarios.length}
              </p>
              <p className='text-sm text-muted-foreground'>
                Total de glosarios
              </p>
            </div>
          </div>
        </Card>

        <Card className='p-4 bg-card border-border'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center'>
              <BookMarked className='w-5 h-5 text-accent' />
            </div>
            <div>
              <p className='text-2xl font-bold text-foreground'>{totalTerms}</p>
              <p className='text-sm text-muted-foreground'>Términos totales</p>
            </div>
          </div>
        </Card>

        <Card className='p-4 bg-card border-border'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center'>
              <Tag className='w-5 h-5 text-cyan-500' />
            </div>
            <div>
              <p className='text-2xl font-bold text-foreground'>
                {tags.length}
              </p>
              <p className='text-sm text-muted-foreground'>
                Materias cubiertas
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className='flex flex-col md:flex-row gap-4 mb-6'>
        <div className='flex-1 relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <Input
            placeholder='Buscar glosarios...'
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

      {/* Glosarios Grid - Organized by Tags */}
      {Object.keys(glosariosByTag).length === 0 ? (
        <Card className='p-12 text-center bg-card border-border'>
          <BookOpen className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
          <p className='text-muted-foreground'>No se encontraron glosarios</p>
        </Card>
      ) : (
        <div className='space-y-8'>
          {Object.entries(glosariosByTag).map(([tag, glosariosList]) => (
            <div key={tag}>
              <div className='flex items-center gap-2 mb-4'>
                <Tag className='w-5 h-5 text-primary' />
                <h2 className='text-xl font-semibold text-foreground'>{tag}</h2>
                <Badge
                  variant='secondary'
                  className='ml-2'
                >
                  {glosariosList.length}
                </Badge>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {glosariosList.map((glosario) => (
                  <Card
                    key={glosario.id}
                    className='p-4 bg-card border-border hover:border-primary/50 transition-colors'
                  >
                    {/* Glosario Header */}
                    <div className='space-y-3'>
                      <div className='flex items-start justify-between'>
                        <h3 className='font-medium text-foreground text-sm line-clamp-2 flex-1'>
                          {glosario.name}
                        </h3>
                        <Badge
                          variant='outline'
                          className='bg-primary/10 text-primary border-primary/30'
                        >
                          {glosario.terms} términos
                        </Badge>
                      </div>

                      <p className='text-xs text-muted-foreground'>
                        {glosario.class}
                      </p>

                      {/* Topics */}
                      <div className='flex flex-wrap gap-1'>
                        {glosario.topics.map((topic) => (
                          <Badge
                            key={topic}
                            variant='secondary'
                            className='text-xs'
                          >
                            {topic}
                          </Badge>
                        ))}
                      </div>

                      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <Calendar className='w-3 h-3' />
                        <span>{glosario.date}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className='flex gap-2 mt-4'>
                      <Button
                        variant='default'
                        size='sm'
                        className='flex-1'
                        onClick={() => handleViewGlosario(glosario.id)}
                      >
                        <Eye className='w-4 h-4 mr-1' />
                        Ver glosario
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleDeleteGlosario(glosario.id)}
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
