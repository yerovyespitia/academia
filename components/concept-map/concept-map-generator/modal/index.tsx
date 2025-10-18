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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import {
  Network,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import { conceptMapSchema } from '@/components/concept-map/schema'

interface ConceptMapGeneratorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConceptMapGeneratorModal({
  open,
  onOpenChange,
}: ConceptMapGeneratorModalProps) {
  const router = useRouter()
  const [selectedClass, setSelectedClass] = useState('')
  const [complexity, setComplexity] = useState([3])
  const [isGenerating, setIsGenerating] = useState(false)
  const { submit, object } = useObject({
    api: '/api/concept-map',
    schema: conceptMapSchema,
  })

  const classes = [
    {
      id: 'calc',
      name: 'Cálculo Diferencial',
      code: 'MAT-101',
      hasSyllabus: true,
    },
    {
      id: 'physics',
      name: 'Física Mecánica',
      code: 'FIS-201',
      hasSyllabus: true,
    },
    {
      id: 'programming',
      name: 'Programación I',
      code: 'CS-101',
      hasSyllabus: true,
    },
  ]

  const handleGenerate = () => {
    if (!selectedClass) return
    setIsGenerating(true)
    const cls = classes.find((c) => c.id === selectedClass)
    submit({
      topic: cls?.name ?? selectedClass,
      depth: complexity[0],
      subtopics: [],
    })
  }

  // When the AI object is ready, persist and navigate
  // Use an effect to avoid side-effects during render
  // and to ensure we only act once when data is ready
  useEffect(() => {
    if (!isGenerating) return
    const ready = Boolean(object?.nodes?.length && object?.edges)
    if (!ready) return
    try {
      const mapId = `${selectedClass}-${Date.now()}`
      localStorage.setItem(`concept-map:${mapId}`, JSON.stringify(object))
      setIsGenerating(false)
      onOpenChange(false)
      router.push(`/concept-maps/${mapId}`)
    } catch {
      setIsGenerating(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [object, isGenerating])

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className='max-w-2xl bg-card border-border'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-foreground'>
            <Network className='w-5 h-5 text-primary' />
            Generar Mapa Conceptual con IA
          </DialogTitle>
          <DialogDescription className='text-muted-foreground'>
            Crea un mapa conceptual automáticamente desde el syllabus de tu
            clase
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Class Selection */}
          <div className='space-y-3'>
            <Label className='text-foreground'>Selecciona la clase</Label>
            <RadioGroup
              value={selectedClass}
              onValueChange={setSelectedClass}
            >
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedClass === cls.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedClass(cls.id)}
                >
                  <RadioGroupItem
                    value={cls.id}
                    id={cls.id}
                  />
                  <div className='flex-1'>
                    <div className='flex items-center gap-2'>
                      <Label
                        htmlFor={cls.id}
                        className='cursor-pointer font-medium text-foreground'
                      >
                        {cls.name}
                      </Label>
                      {cls.hasSyllabus && (
                        <Badge
                          variant='outline'
                          className='bg-green-500/10 text-green-500 border-green-500/30'
                        >
                          <CheckCircle2 className='w-3 h-3 mr-1' />
                          Syllabus disponible
                        </Badge>
                      )}
                    </div>
                    <p className='text-sm text-muted-foreground'>{cls.code}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Complexity Level */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <Label className='text-foreground'>Nivel de complejidad</Label>
              <Badge variant='secondary'>{complexity[0]} niveles</Badge>
            </div>
            <Slider
              value={complexity}
              onValueChange={setComplexity}
              min={2}
              max={5}
              step={1}
              className='w-full'
            />
            <div className='flex justify-between text-xs text-muted-foreground'>
              <span>Simple</span>
              <span>Detallado</span>
            </div>
          </div>

          {/* Info Box */}
          <div className='bg-primary/5 rounded-lg p-4 border border-primary/20'>
            <div className='flex gap-3'>
              <BookOpen className='w-5 h-5 text-primary flex-shrink-0 mt-0.5' />
              <div className='space-y-2 text-sm'>
                <p className='text-foreground font-medium'>¿Cómo funciona?</p>
                <ul className='text-muted-foreground space-y-1'>
                  <li>• La IA analiza el syllabus de la clase seleccionada</li>
                  <li>• Identifica conceptos clave y sus relaciones</li>
                  <li>• Genera un mapa visual interactivo con jerarquías</li>
                  <li>• Puedes explorar cada concepto en detalle</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            className='w-full bg-primary hover:bg-primary/90'
            size='lg'
            disabled={!selectedClass || isGenerating}
            onClick={handleGenerate}
          >
            {isGenerating ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                Generando mapa conceptual...
              </>
            ) : (
              <>
                <Sparkles className='w-4 h-4 mr-2' />
                Generar Mapa Conceptual
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
