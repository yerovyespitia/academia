'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookMarked, Sparkles } from 'lucide-react'
import { useUserClasses } from '@/lib/use-user-classes'
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

export default function Glossary() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { classes } = useUserClasses()

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
          {classes.length === 0 && (
            <p className='text-sm text-muted-foreground'>No tienes glosarios aún.</p>
          )}

          {classes.slice(0, 3).map((classItem) => {
            const previewList = classItem.topics.slice(0, 4).join(', ')
            const hasMore = classItem.topics.length > 4

            return (
              <div
                key={classItem._id}
                className='border border-border rounded-lg p-3 hover:bg-secondary/30 transition-colors cursor-pointer'
                onClick={() => router.push(`/glossaries/${classItem._id}`)}
              >
                <div className='flex items-center justify-between mb-2'>
                  <p className='font-medium text-foreground'>Glosario: {classItem.name}</p>
                  <Badge
                    variant='outline'
                    className='text-xs'
                  >
                    {classItem.topics.length} temas base
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
