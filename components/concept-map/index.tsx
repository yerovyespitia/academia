'use client'

import { useState } from 'react'
import { Map, Network, Sparkles } from 'lucide-react'
import { Button } from '../ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { ConceptMapGeneratorModal } from '@/components/concept-map/concept-map-generator/modal'

export default function ConceptMap() {
  const [open, setOpen] = useState(false)

  return (
    <Card className='bg-card border-border'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Network className='size-5 text-primary' />
          Mapas Conceptuales
          <span>
            <Sparkles
              size={15}
              fill='black'
              strokeWidth={1}
            />
          </span>
        </CardTitle>
        <CardDescription>Visualiza conexiones entre conceptos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='bg-secondary/30 rounded-lg p-4 border border-border'>
            <div className='flex items-center justify-center h-32 mb-3'>
              <Map className='size-16 text-primary' />
            </div>
          </div>

          <Button
            className='w-full bg-primary hover:bg-primary/90'
            onClick={() => setOpen(true)}
          >
            <Network className='w-4 h-4 mr-2' />
            Generar mapa desde documentos
          </Button>

          <div className='bg-primary/5 rounded-lg p-3 border border-primary/20'>
            <p className='text-xs text-muted-foreground'>
              Crea mapas automáticamente desde tus apuntes, PDFs o syllabus
            </p>
          </div>
        </div>
        <ConceptMapGeneratorModal
          open={open}
          onOpenChange={setOpen}
        />
      </CardContent>
    </Card>
  )
}
