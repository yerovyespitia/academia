import { BookMarked } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'

export default function Glossary() {
  return (
    <Card className='bg-card border-border'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <BookMarked className='w-5 h-5 text-primary' />
          Glosarios de Estudio
        </CardTitle>
        <CardDescription>
          Términos clave organizados por materia
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          <div className='border border-border rounded-lg p-3 hover:bg-secondary/30 transition-colors cursor-pointer'>
            <div className='flex items-center justify-between mb-2'>
              <p className='font-medium text-foreground'>Glosario: Cálculo</p>
              <Badge
                variant='outline'
                className='text-xs'
              >
                24 términos
              </Badge>
            </div>
            <p className='text-xs text-muted-foreground'>
              Límite, Derivada, Integral, Continuidad...
            </p>
          </div>

          <div className='border border-border rounded-lg p-3 hover:bg-secondary/30 transition-colors cursor-pointer'>
            <div className='flex items-center justify-between mb-2'>
              <p className='font-medium text-foreground'>Glosario: Física</p>
              <Badge
                variant='outline'
                className='text-xs'
              >
                18 términos
              </Badge>
            </div>
            <p className='text-xs text-muted-foreground'>
              Velocidad, Aceleración, Fuerza, Energía...
            </p>
          </div>

          <div className='border border-border rounded-lg p-3 hover:bg-secondary/30 transition-colors cursor-pointer'>
            <div className='flex items-center justify-between mb-2'>
              <p className='font-medium text-foreground'>
                Glosario: Programación
              </p>
              <Badge
                variant='outline'
                className='text-xs'
              >
                31 términos
              </Badge>
            </div>
            <p className='text-xs text-muted-foreground'>
              Variable, Función, Bucle, Condicional...
            </p>
          </div>

          <Button
            variant='outline'
            className='w-full mt-2 bg-transparent'
          >
            <BookMarked className='w-4 h-4 mr-2' />
            Crear nuevo glosario
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
