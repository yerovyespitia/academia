'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import {
  BookMarked,
  BookOpen,
  Sparkles,
  FileText,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import { glossarySchema } from './schema'
import type { GlossarySchema } from './schema'

interface GlossaryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GlossaryModal({ open, onOpenChange }: GlossaryModalProps) {
  const [selectedClass, setSelectedClass] = useState('calculus')
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

  const classes = [
    {
      id: 'calculus',
      name: 'Cálculo Diferencial',
      code: 'MAT-101',
      syllabusAvailable: true,
      topics: ['Límites', 'Derivadas', 'Integrales', 'Continuidad'],
    },
    {
      id: 'physics',
      name: 'Física Mecánica',
      code: 'FIS-201',
      syllabusAvailable: true,
      topics: ['Cinemática', 'Dinámica', 'Energía', 'Momento'],
    },
    {
      id: 'programming',
      name: 'Programación I',
      code: 'CS-101',
      syllabusAvailable: true,
      topics: ['Variables', 'Funciones', 'Estructuras de Control', 'POO'],
    },
  ]

  const handleGenerate = () => {
    setGenerating(true)
    const classData = classes.find((c) => c.id === selectedClass)
    submit({
      className: classData?.name ?? selectedClass,
      topics: classData?.topics ?? [],
      termCount: termCount[0],
    })
  }

  const selectedClassData = classes.find((c) => c.id === selectedClass)

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
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
            {/* Selección de Clase */}
            <div className='space-y-3'>
              <Label className='text-base font-semibold text-foreground'>
                Selecciona la clase
              </Label>
              <RadioGroup
                value={selectedClass}
                onValueChange={setSelectedClass}
              >
                {classes.map((classItem) => (
                  <div
                    key={classItem.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedClass === classItem.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedClass(classItem.id)}
                  >
                    <div className='flex items-start gap-3'>
                      <RadioGroupItem
                        value={classItem.id}
                        id={classItem.id}
                        className='mt-1'
                      />
                      <div className='flex-1'>
                        <div className='flex items-center justify-between mb-2'>
                          <Label
                            htmlFor={classItem.id}
                            className='font-semibold text-foreground cursor-pointer'
                          >
                            {classItem.name}
                          </Label>
                          <Badge
                            variant='outline'
                            className='text-xs'
                          >
                            {classItem.code}
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
                          {classItem.topics.map((topic) => (
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
            {selectedClassData && (
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
                      <strong>{selectedClassData.name}</strong> para identificar
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
                Se han generado {terms.length} términos para {glossaryObject?.class ?? selectedClassData?.name}
              </p>
            </div>

            <div className='border border-border rounded-lg p-4 bg-secondary/20'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='font-semibold text-foreground flex items-center gap-2'>
                  <BookMarked className='w-5 h-5 text-primary' />
                  Glosario: {glossaryObject?.class ?? selectedClassData?.name}
                </h3>
                <Badge
                  variant='outline'
                  className='bg-primary/10 text-primary'
                >
                  {terms.length} términos
                </Badge>
              </div>

              <div className='space-y-3 max-h-[300px] overflow-y-auto pr-2'>
                {terms.map((term, index) => (
                  <div key={index} className='border border-border rounded-lg p-3 bg-card hover:border-primary/50 transition-colors'>
                    <div className='flex items-start justify-between mb-2'>
                      <h4 className='font-semibold text-foreground'>{term.name}</h4>
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
                onClick={() => onOpenChange(false)}
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
