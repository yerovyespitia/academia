'use client'

import { useRouter } from 'next/navigation'

import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { SubjectGlossary, UserGlossaries } from '@/types'
import { BookOpen, Search, Calendar, Tag, Eye, BookMarked } from 'lucide-react'

type MyGlossariesProps = {
  userGlossaries: UserGlossaries
}

export default function MyGlossaries({ userGlossaries }: MyGlossariesProps) {
  const router = useRouter()
  const [subjects, setSubjects] = useState<SubjectGlossary[]>(
    userGlossaries.subjects ?? [],
  )
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const glosarios = useMemo(
    () =>
      subjects.map((s) => {
        const topics = Array.from(
          new Set((s.glossary ?? []).map((g) => g.topic).filter(Boolean)),
        ) as string[]
        return {
          id: String(s.id),
          name: `Glosario: ${s.name}`,
          class: s.name,
          tag: s.name,
          date: new Date(s.created_at).toISOString().slice(0, 10),
          terms: s.glossary?.length ?? 0,
          topics,
        }
      }),
    [subjects],
  )

  // Get unique tags (subjects names)
  const tags = useMemo(
    () => Array.from(new Set(glosarios.map((g) => g.tag))),
    [glosarios],
  )

  // Calculate total terms
  const totalTerms = useMemo(
    () => glosarios.reduce((sum, g) => sum + g.terms, 0),
    [glosarios],
  )

  // Filter glosarios
  const filteredGlosarios = useMemo(() => {
    return glosarios.filter((g) => {
      const matchesTag = !selectedTag || g.tag === selectedTag
      const matchesSearch = g.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      return matchesTag && matchesSearch
    })
  }, [glosarios, selectedTag, searchQuery])

  // Group glosarios by tag (subject name)
  const glosariosByTag = useMemo(() => {
    return filteredGlosarios.reduce(
      (acc, g) => {
        if (!acc[g.tag]) acc[g.tag] = [] as typeof filteredGlosarios
        acc[g.tag].push(g)
        return acc
      },
      {} as Record<string, typeof filteredGlosarios>,
    )
  }, [filteredGlosarios])

  const handleViewGlosario = (id: string) => {
    router.push(`/glossaries/${id}`)
  }

  return (
    <>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-foreground mb-2'>
          Mis Glosarios
        </h1>
        <p className='text-muted-foreground'>
          Organiza y estudia términos clave de tus materias
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'>
        <Card className='p-4 bg-card border-border'>
          <div className='flex items-center gap-3'>
            <div className='size-10 rounded-full bg-accent-foreground/10 flex items-center justify-center'>
              <BookOpen className='size-5 text-primary' />
            </div>
            <div>
              <p className='text-2xl font-bold text-foreground'>
                {subjects.length}
              </p>
              <p className='text-sm text-muted-foreground'>
                Total de glosarios
              </p>
            </div>
          </div>
        </Card>

        <Card className='p-4 bg-card border-border'>
          <div className='flex items-center gap-3'>
            <div className='size-10 rounded-full bg-accent-foreground/10 flex items-center justify-center'>
              <BookMarked className='size-5 text-accent-foreground' />
            </div>
            <div>
              <p className='text-2xl font-bold text-foreground'>{totalTerms}</p>
              <p className='text-sm text-muted-foreground'>Términos totales</p>
            </div>
          </div>
        </Card>
      </div>

      <div className='flex flex-col md:flex-row gap-4 mb-6'>
        <div className='flex-1 relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <Input
            placeholder='Buscar glosarios...'
            className='pl-10 bg-card border-border rounded-full'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className='flex gap-2 flex-wrap'>
          <Button
            variant={selectedTag === null ? 'default' : 'outline'}
            size='sm'
            onClick={() => setSelectedTag(null)}
            className='h-full rounded-full px-4'
          >
            Todos
          </Button>
          {tags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTag === tag ? 'default' : 'outline'}
              size='sm'
              onClick={() => setSelectedTag(tag)}
              className='h-full rounded-full px-4'
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

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
                <Tag className='size-5 text-primary' />
                <h2 className='text-xl font-semibold text-foreground'>{tag}</h2>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {glosariosList.map((glosario) => (
                  <Card
                    key={glosario.id}
                    className='p-4 bg-card border-border hover:border-primary/50 transition-colors'
                  >
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

                    <div className='flex gap-2 mt-4'>
                      <Button
                        variant='default'
                        size='sm'
                        className='flex-1'
                        onClick={() => handleViewGlosario(glosario.id)}
                      >
                        <Eye className='size-4 mr-1' />
                        Ver glosario
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
