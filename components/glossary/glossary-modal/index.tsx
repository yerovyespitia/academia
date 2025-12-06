'use client'

import { useRouter } from 'next/navigation'

import { useState, useEffect } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import {
  BookMarked,
  BookOpen,
  Sparkles,
  FileText,
  CheckCircle2,
  Loader2,
} from 'lucide-react'

import { glossarySchema } from './schema'
import type { GlossarySchema } from './schema'

interface GlossaryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GlossaryModal({ open, onOpenChange }: GlossaryModalProps) {
  const router = useRouter()
  const [subjects, setSubjects] = useState<
    Array<{
      id: number
      name: string
      code?: string
      glossary?: Array<{ topic?: string }>
    }>
  >([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    null,
  )
  const [termCount, setTermCount] = useState([6])
  const [generating, setGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const { submit, object } = useObject({
    api: '/api/glossary',
    schema: glossarySchema,
  })

  useEffect(() => {
    const generated = (object as GlossarySchema | undefined)?.terms
    if (generated && generated.length > 0) {
      setGenerating(false)
      setShowPreview(true)
    }
  }, [object])

  const glossaryObject = object as GlossarySchema | undefined
  const terms: GlossarySchema['terms'] = glossaryObject?.terms ?? []

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/glossary/user/1`,
        )
        const data = await res.json()
        const subjectsFromApi: Array<{
          id: number
          name: string
          code?: string
          glossary?: Array<{ topic?: string }>
        }> = Array.isArray(data?.subjects)
          ? data.subjects
          : (data?.subjects ?? [])
        setSubjects(subjectsFromApi)
        if (!selectedSubjectId && subjectsFromApi.length > 0) {
          setSelectedSubjectId(subjectsFromApi[0].id)
        }
      } catch {
        setSubjects([])
      }
    }
    fetchSubjects()
  }, [])

  const handleGenerate = () => {
    setGenerating(true)
    const subject = subjects.find((s) => s.id === selectedSubjectId)
    const derivedTopics = Array.from(
      new Set((subject?.glossary ?? []).map((g) => g.topic).filter(Boolean)),
    ) as string[]
    submit({
      className: subject?.name ?? 'Glosario',
      topics: derivedTopics,
      termCount: termCount[0],
    })
  }

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-xl'>
            <Sparkles className='w-5 h-5 text-primary' />
            Generar Glosario con IA
          </DialogTitle>
          <DialogDescription>
            Crea un glosario personalizado basado en el syllabus de tu clase
          </DialogDescription>
        </DialogHeader>

        {!showPreview ? (
          <div className='space-y-6 py-4'>
            {/* Selección de Clase (Subjects desde API) */}
            <div className='space-y-3'>
              <Label className='text-base font-semibold text-foreground'>
                Selecciona la clase
              </Label>
              <RadioGroup
                value={selectedSubjectId ? String(selectedSubjectId) : ''}
                onValueChange={(v) => setSelectedSubjectId(Number(v))}
              >
                {subjects.map((subjectItem) => (
                  <div
                    key={subjectItem.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedSubjectId === subjectItem.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedSubjectId(subjectItem.id)}
                  >
                    <div className='flex items-start gap-3'>
                      <RadioGroupItem
                        value={String(subjectItem.id)}
                        id={String(subjectItem.id)}
                        className='mt-1'
                      />
                      <div className='flex-1'>
                        <div className='flex items-center justify-between mb-2'>
                          <Label
                            htmlFor={String(subjectItem.id)}
                            className='font-semibold text-foreground cursor-pointer'
                          >
                            {subjectItem.name}
                          </Label>
                          <Badge variant='outline' className='text-xs'>
                            {subjectItem.code ?? ''}
                          </Badge>
                        </div>
                        <div className='flex items-center gap-2 mb-2'>
                          <BookOpen className='w-4 h-4 text-primary' />
                          <span className='text-sm text-muted-foreground'>
                            Syllabus disponible
                          </span>
                          <CheckCircle2 className='w-4 h-4 text-green-500' />
                        </div>
                        <div className='flex flex-wrap gap-1.5'>
                          {Array.from(
                            new Set(
                              (subjectItem.glossary ?? [])
                                .map((g) => g.topic)
                                .filter(Boolean),
                            ),
                          )
                            .slice(0, 6)
                            .map((topic) => (
                              <Badge
                                key={topic}
                                variant='outline'
                                className='text-xs bg-secondary/50'
                              >
                                {topic}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Configuración del Glosario */}
            <div className='space-y-4 border border-border rounded-lg p-4 bg-secondary/20'>
              <h3 className='font-semibold text-foreground flex items-center gap-2'>
                <FileText className='w-4 h-4 text-primary' />
                Configuración del Glosario
              </h3>

              <div className='space-y-3'>
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <Label className='text-sm text-foreground'>
                      Número de términos
                    </Label>
                    <Badge
                      variant='outline'
                      className='bg-primary/10 text-primary'
                    >
                      {termCount[0]} términos
                    </Badge>
                  </div>
                  <Slider
                    value={termCount}
                    onValueChange={setTermCount}
                    min={2}
                    max={10}
                    step={2}
                    className='w-full'
                  />
                  <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                    <span>2</span>
                    <span>10</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Información del Syllabus */}
            {selectedSubject && (
              <div className='bg-primary/5 border border-primary/20 rounded-lg p-4'>
                <div className='flex items-start gap-3'>
                  <div className='w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0'>
                    <Sparkles className='w-5 h-5 text-primary' />
                  </div>
                  <div className='space-y-2'>
                    <p className='text-sm font-medium text-foreground'>
                      Generación basada en syllabus
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      La IA analizará el syllabus de{' '}
                      <strong>{selectedSubject.name}</strong> para identificar
                      los términos más importantes y crear definiciones claras y
                      contextualizadas. Los términos se organizarán por temas
                      del curso.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Botón de Generar */}
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className='w-full bg-primary hover:bg-primary/90'
              size='lg'
            >
              {generating ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Generando glosario...
                </>
              ) : (
                <>
                  <Sparkles className='w-4 h-4 mr-2' />
                  Generar Glosario
                </>
              )}
            </Button>
          </div>
        ) : (
          // Vista Previa del Glosario Generado
          <div className='space-y-4 py-4'>
            <div className='bg-green-500/10 border border-green-500/30 rounded-lg p-4'>
              <div className='flex items-center gap-2 mb-2'>
                <CheckCircle2 className='w-5 h-5 text-green-500' />
                <p className='font-semibold text-foreground'>
                  Glosario generado exitosamente
                </p>
              </div>
              <p className='text-sm text-muted-foreground'>
                Se han generado {terms.length} términos para{' '}
                {glossaryObject?.class ?? selectedSubject?.name}
              </p>
            </div>

            <div className='border border-border rounded-lg p-4 bg-secondary/20'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='font-semibold text-foreground flex items-center gap-2'>
                  <BookMarked className='w-5 h-5 text-primary' />
                  Glosario: {glossaryObject?.class ?? selectedSubject?.name}
                </h3>
                <Badge variant='outline' className='bg-primary/10 text-primary'>
                  {terms.length} términos
                </Badge>
              </div>

              <div className='space-y-3 max-h-[300px] overflow-y-auto pr-2'>
                {terms.map((term, index) => (
                  <div
                    key={index}
                    className='border border-border rounded-lg p-3 bg-card hover:border-primary/50 transition-colors'
                  >
                    <div className='flex items-start justify-between mb-2'>
                      <h4 className='font-semibold text-foreground'>
                        {term.name}
                      </h4>
                      <Badge variant='outline' className='text-xs'>
                        {term.topic}
                      </Badge>
                    </div>
                    <p className='text-sm text-muted-foreground mb-2'>
                      {term.definition}
                    </p>
                    <div className='bg-secondary/50 rounded p-2 text-xs text-muted-foreground'>
                      <strong>Ejemplo:</strong> {term.example}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='flex gap-3'>
              <Button
                variant='outline'
                onClick={() => {
                  setGenerating(false)
                  setShowPreview(false)
                }}
                className='flex-1 bg-transparent'
              >
                Generar otro
              </Button>
              <Button
                onClick={async () => {
                  if (!selectedSubjectId) {
                    onOpenChange(false)
                    return
                  }
                  const body = {
                    class: glossaryObject?.class ?? 'Glosario',
                    subject_id: selectedSubjectId,
                    terms: terms.map((t) => ({
                      name: t.name,
                      definition: t.definition,
                      example: t.example,
                      topic: t.topic,
                    })),
                  }
                  try {
                    const resp = await fetch(
                      `${process.env.NEXT_PUBLIC_API_URL}/glossary`,
                      {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body),
                      },
                    )
                    if (resp.ok) {
                      onOpenChange(false)
                      router.push(`/glossaries/${selectedSubjectId}`)
                    } else {
                      onOpenChange(false)
                    }
                  } catch {
                    onOpenChange(false)
                  }
                }}
                className='flex-1 bg-primary hover:bg-primary/90'
              >
                <BookMarked className='w-4 h-4 mr-2' />
                Guardar Glosario
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
