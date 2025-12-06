'use client'

import { useParams, useRouter } from 'next/navigation'

import { useEffect, useMemo, useRef, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  ArrowLeft,
  Search,
  BookOpen,
  Eye,
  EyeOff,
  Shuffle,
  Trash2,
  Volume2,
  RotateCcw,
  Loader2,
} from 'lucide-react'

type ApiGlossaryItem = {
  id: number
  term?: string
  name?: string
  definition: string
  topic?: string
  example?: string
}

type SubjectApiResponse = {
  id: number
  name: string
  code: string
  credits: number
  created_at: string
  glossary: ApiGlossaryItem[]
}

export default function GlosarioDetailPage() {
  const router = useRouter()
  const routeParams = useParams()
  const subjectId = Array.isArray(routeParams?.id)
    ? routeParams?.id[0]
    : (routeParams?.id as string)
  const [searchQuery, setSearchQuery] = useState('')
  const [studyMode, setStudyMode] = useState(false)
  const [revealedTerms, setRevealedTerms] = useState<Set<number>>(new Set())
  const [terms, setTerms] = useState<ApiGlossaryItem[]>([])

  // Speech synthesis state
  const [isSpeechLoading, setIsSpeechLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasAudio, setHasAudio] = useState(false)
  const [currentAudioTermId, setCurrentAudioTermId] = useState<number | null>(
    null,
  )
  const audioUrlRef = useRef<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const fetchSubjectGlossary = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/glossary/subject/${subjectId}`,
        )
        const data = await res.json()
        if (Array.isArray(data)) {
          setTerms(data as ApiGlossaryItem[])
        } else {
          const subject = data as SubjectApiResponse
          setTerms(subject.glossary ?? [])
        }
      } catch {
        setTerms([])
      }
    }
    if (subjectId) fetchSubjectGlossary()
  }, [subjectId])

  // Extract example and topic when they come embedded inside the definition text
  const extractFromDefinition = (rawDefinition: string) => {
    if (!rawDefinition) {
      return {
        cleanDefinition: '',
        example: undefined as string | undefined,
        topic: undefined as string | undefined,
      }
    }

    const text = String(rawDefinition)
    const ejemploLabel = /\*{0,2}\s*Ejemplo\s*:\s*\*{0,2}/i
    const temaLabel = /\*{0,2}\s*Tema\s*:\s*\*{0,2}/i

    const findFirst = (re: RegExp, s: string) => {
      const r = new RegExp(re.source, re.flags + 'g')
      const m = r.exec(s)
      return m ? { index: m.index, length: m[0].length } : null
    }

    const ej = findFirst(ejemploLabel, text)
    const te = findFirst(temaLabel, text)

    const firstLabelIdx = [ej?.index, te?.index].filter(
      (v) => typeof v === 'number',
    )
    const hasAnyLabel = firstLabelIdx.length > 0

    if (!hasAnyLabel) {
      return {
        cleanDefinition: text.trim(),
        example: undefined,
        topic: undefined,
      }
    }

    const cutoff = Math.min(...(firstLabelIdx as number[]))
    let cleanDefinition = text.slice(0, cutoff).trim()
    cleanDefinition = cleanDefinition.replace(/[\s\-–:|]+$/u, '').trim()

    let example: string | undefined
    let topic: string | undefined

    if (ej) {
      const start = ej.index + ej.length
      const end = te ? te.index : text.length
      example = text.slice(start, end).trim()
    }
    if (te) {
      const start = te.index + te.length
      topic = text.slice(start).trim()
    }

    const stripMarkdown = (s?: string) =>
      s
        ? s
            .replace(/^\*{1,2}/, '')
            .replace(/\*{1,2}$/u, '')
            .replace(/^[:\-\s]+/, '')
            .trim()
        : undefined

    example = stripMarkdown(example)
    topic = stripMarkdown(topic)

    return { cleanDefinition, example, topic }
  }

  const normalizedTerms = useMemo(
    () =>
      terms.map((t) => ({
        id: t.id,
        ...(() => {
          const extracted = extractFromDefinition(t.definition)
          const finalTopic = (t.topic ?? extracted.topic ?? 'General').trim()
          return {
            topic: finalTopic.length > 0 ? finalTopic : 'General',
            term: t.name ?? t.term ?? '',
            definition: (
              extracted.cleanDefinition ||
              t.definition ||
              ''
            ).trim(),
            example: t.example ?? extracted.example,
          }
        })(),
      })),
    [terms],
  )

  const filteredTerms = useMemo(() => {
    return normalizedTerms.filter((term) => {
      const matchesSearch =
        term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [normalizedTerms, searchQuery])

  const termsByTopic = useMemo(() => {
    return filteredTerms.reduce(
      (acc, term) => {
        if (!acc[term.topic]) acc[term.topic] = [] as typeof filteredTerms
        acc[term.topic].push(term)
        return acc
      },
      {} as Record<string, typeof filteredTerms>,
    )
  }, [filteredTerms])

  const toggleReveal = (termId: number) => {
    const newRevealed = new Set(revealedTerms)
    if (newRevealed.has(termId)) newRevealed.delete(termId)
    else newRevealed.add(termId)
    setRevealedTerms(newRevealed)
  }

  const revealAll = () =>
    setRevealedTerms(new Set(normalizedTerms.map((t) => t.id)))
  const hideAll = () => setRevealedTerms(new Set())

  const handleDeleteTerm = async (termId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/glossary/${termId}`,
        {
          method: 'DELETE',
        },
      )
      if (response.ok) {
        setTerms((prevTerms) => prevTerms.filter((term) => term.id !== termId))
      }
    } catch (error) {
      console.error('Error deleting term:', error)
    }
  }

  // --- Speech helpers ---
  function spellAcronyms(text: string): string {
    return text.replace(/\b([A-Z]{2,5})\b/g, (match) =>
      match.split('').join(' '),
    )
  }

  const getSpeakableTextForTerm = (t: {
    term: string
    definition: string
    example?: string
  }): string => {
    const parts: string[] = []
    if (t.term?.trim()) parts.push(`Término: ${t.term}.`)
    if (t.definition?.trim()) parts.push(`Definición: ${t.definition}.`)
    if (t.example?.trim()) parts.push(`Ejemplo: ${t.example}.`)
    return spellAcronyms(parts.join(' ')).trim()
  }

  const handleSpeech = async (text: string, termId: number) => {
    if (!text.trim()) return
    setIsSpeechLoading(true)

    // Cleanup previous audio
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
      setCurrentAudioTermId(termId)
      if (audioRef.current) {
        audioRef.current.onplay = () => setIsPlaying(true)
        audioRef.current.onpause = () => setIsPlaying(false)
        audioRef.current.onended = () => setIsPlaying(false)
        await audioRef.current.play()
      }
    } catch (e) {
      console.error('Error generating speech: ', e)
      setHasAudio(false)
    } finally {
      setIsSpeechLoading(false)
    }
  }

  const replayAudio = () => {
    if (audioUrlRef.current && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
    }
  }

  useEffect(() => {
    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current)
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  const disableInteractions = isSpeechLoading || isPlaying

  return (
    <main className='max-w-7xl mx-auto p-4'>
      <div className='mb-8'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => router.push('/glossaries')}
          className='mb-4'
        >
          <ArrowLeft className='w-4 h-4 mr-2' />
          Volver a glosarios
        </Button>

        <div className='flex items-start justify-between mb-2'>
          <div>
            <h1 className='text-3xl font-bold text-foreground'>Glosario</h1>
          </div>
          <Badge
            variant='outline'
            className='bg-primary/10 text-primary border-primary/30'
          >
            {normalizedTerms.length} términos
          </Badge>
        </div>
      </div>

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
            <Button variant='outline' size='sm' onClick={revealAll}>
              <Eye className='w-4 h-4 mr-2' />
              Revelar todo
            </Button>
            <Button variant='outline' size='sm' onClick={hideAll}>
              <EyeOff className='w-4 h-4 mr-2' />
              Ocultar todo
            </Button>
          </>
        )}
      </div>

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
      </div>

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
              </div>

              <div className='space-y-4'>
                {termsList.map((term) => (
                  <Card key={term.id} className='p-5 bg-card border-border'>
                    <div className='space-y-3'>
                      <div className='flex items-start justify-between'>
                        <h3 className='text-lg font-semibold text-foreground'>
                          {term.term}
                        </h3>
                        <div className='flex items-center gap-2'>
                          {hasAudio && currentAudioTermId === term.id ? (
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
                          ) : (
                            <Button
                              variant='outline'
                              size='icon'
                              disabled={
                                disableInteractions ||
                                !getSpeakableTextForTerm(term).trim()
                              }
                              onClick={() =>
                                handleSpeech(
                                  getSpeakableTextForTerm(term),
                                  term.id,
                                )
                              }
                              aria-label='Escuchar término'
                              className='bg-card'
                            >
                              {isSpeechLoading &&
                              currentAudioTermId === term.id ? (
                                <Loader2 className='w-4 h-4 animate-spin' />
                              ) : (
                                <Volume2 className='w-4 h-4' />
                              )}
                            </Button>
                          )}

                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleDeleteTerm(term.id)}
                          >
                            <Trash2 className='size-4 text-destructive' />
                          </Button>
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
