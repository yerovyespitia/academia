import { Button } from '../ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../ui/card'
import { Tag } from 'lucide-react'
import { Badge } from '../ui/badge'

export default function TagOrganization() {
  return (
    <Card className='bg-card border-border'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Tag className='w-5 h-5 text-primary' />
          Organización por Etiquetas
        </CardTitle>
        <CardDescription>
          Etiquetas automáticas según tus materias
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='flex flex-wrap gap-2'>
            <Badge
              variant='outline'
              className='bg-primary/10 text-primary border-primary/30'
            >
              Cálculo
            </Badge>
            <Badge
              variant='outline'
              className='bg-accent text-accent-foreground border-accent-foreground/30'
            >
              Física
            </Badge>
            <Badge
              variant='outline'
              className='bg-green-500/10 text-green-500 border-green-500/30'
            >
              Programación
            </Badge>
            <Badge
              variant='outline'
              className='bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
            >
              Derivadas
            </Badge>
            <Badge
              variant='outline'
              className='bg-purple-500/10 text-purple-500 border-purple-500/30'
            >
              Cinemática
            </Badge>
            <Badge
              variant='outline'
              className='bg-pink-500/10 text-pink-500 border-pink-500/30'
            >
              Algoritmos
            </Badge>
          </div>

          <div className='border border-border rounded-lg divide-y divide-border'>
            <div className='p-3 hover:bg-secondary/30 transition-colors'>
              <div className='flex items-center justify-between mb-2'>
                <p className='text-sm font-medium text-foreground'>
                  Límites y Continuidad
                </p>
                <Badge
                  variant='outline'
                  className='text-xs'
                >
                  Cálculo
                </Badge>
              </div>
              <p className='text-xs text-muted-foreground'>
                Última edición: Hace 2 horas
              </p>
            </div>
            <div className='p-3 hover:bg-secondary/30 transition-colors'>
              <div className='flex items-center justify-between mb-2'>
                <p className='text-sm font-medium text-foreground'>
                  Movimiento Rectilíneo
                </p>
                <Badge
                  variant='outline'
                  className='text-xs'
                >
                  Física
                </Badge>
              </div>
              <p className='text-xs text-muted-foreground'>
                Última edición: Hace 5 horas
              </p>
            </div>
            <div className='p-3 hover:bg-secondary/30 transition-colors'>
              <div className='flex items-center justify-between mb-2'>
                <p className='text-sm font-medium text-foreground'>
                  Estructuras de Control
                </p>
                <Badge
                  variant='outline'
                  className='text-xs'
                >
                  Programación
                </Badge>
              </div>
              <p className='text-xs text-muted-foreground'>
                Última edición: Ayer
              </p>
            </div>
          </div>

          <Button
            variant='outline'
            className='w-full bg-transparent'
          >
            <Tag className='w-4 h-4 mr-2' />
            Crear etiqueta personalizada
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
