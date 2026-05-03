'use client'

import { useUserClasses } from '@/lib/use-user-classes'

import { Badge } from '../ui/badge'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../ui/card'

export default function GradesPanel() {
  const { classes, isLoading } = useUserClasses()

  return (
    <div>
      <header className='flex justify-between items-center mb-4'>
        <div>
          <h2 className='text-xl font-bold'>Tus clases</h2>
          <p className='text-muted-foreground'>
            Estas son las 6 clases base disponibles para tu cuenta
          </p>
        </div>
      </header>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
        {classes.map((classItem) => {
          return (
            <Card
              key={classItem._id}
              className='gap-2 bg-card border-border hover:border-primary/50 transition-colors'
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div>
                    <CardTitle className='text-lg'>{classItem.name}</CardTitle>
                    <CardDescription>{classItem.code}</CardDescription>
                  </div>
                  <Badge className='bg-primary/10 text-primary border-primary/20'>
                    Clase base
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <p className='text-sm text-muted-foreground leading-relaxed'>
                    {classItem.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {!isLoading && classes.length === 0 && (
          <Card className='bg-card border-border'>
            <CardContent className='py-8'>
              <p className='text-sm text-muted-foreground'>
                No se encontraron clases para este usuario.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
