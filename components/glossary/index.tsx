'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookMarked, Sparkles } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { GlossaryModal } from './glossary-modal'
import type { SubjectGlossary, UserGlossaries } from '@/types'

export default function Glossary() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [subjects, setSubjects] = useState<SubjectGlossary[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const getGlossaries = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/glossary/user/1`,
        )
        if (!response.ok) throw new Error('No se pudo obtener glosarios')
        const data: UserGlossaries = await response.json()
        if (!isMounted) return
        setSubjects(data.subjects ?? [])
      } catch {
        if (!isMounted) return
        setError('Error cargando glosarios')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    getGlossaries()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <Card className='bg-card border-border'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <BookMarked className='size-5 text-primary' />
          Glosarios de Estudio
          <span>
            <Sparkles
              size={15}
              fill='black'
              strokeWidth={1}
            />
          </span>
        </CardTitle>
        <CardDescription>
          Términos clave organizados por materia
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {loading && (
            <p className='text-sm text-muted-foreground'>Cargando glosarios...</p>
          )}

          {error && (
            <p className='text-sm text-destructive'>{error}</p>
          )}

          {!loading && !error && subjects.length === 0 && (
            <p className='text-sm text-muted-foreground'>No tienes glosarios aún.</p>
          )}

          {!loading && !error &&
            subjects.slice(0, 3).map((s) => {
              const topics = Array.from(
                new Set((s.glossary ?? []).map((g) => g.topic).filter(Boolean)),
              ) as string[]
              const fallbackTerms = (s.glossary ?? []).map((g) => g.term)
              const previewList = (topics.length > 0 ? topics : fallbackTerms)
                .slice(0, 4)
                .join(', ')
              const hasMore = (topics.length > 0 ? topics : fallbackTerms).length > 4

              return (
                <div
                  key={s.id}
                  className='border border-border rounded-lg p-3 hover:bg-secondary/30 transition-colors cursor-pointer'
                  onClick={() => router.push(`/glossaries/${s.id}`)}
                >
                  <div className='flex items-center justify-between mb-2'>
                    <p className='font-medium text-foreground'>Glosario: {s.name}</p>
                    <Badge
                      variant='outline'
                      className='text-xs'
                    >
                      {(s.glossary?.length ?? 0)} términos
                    </Badge>
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {previewList}
                    {hasMore ? '...' : ''}
                  </p>
                </div>
              )
            })}

          <Button
            variant='outline'
            className='w-full mt-2 bg-transparent'
            onClick={() => setOpen(true)}
          >
            <BookMarked className='size-4 mr-2' />
            Crear nuevo glosario
          </Button>
        </div>
        <GlossaryModal
          open={open}
          onOpenChange={setOpen}
        />
      </CardContent>
    </Card>
  )
}
