import { Network } from 'lucide-react'
import { Button } from '../ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'

export default function ConceptMap() {
  return (
    <Card className='bg-card border-border'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Network className='w-5 h-5 text-primary' />
          Mapas Conceptuales
        </CardTitle>
        <CardDescription>Visualiza conexiones entre conceptos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='bg-secondary/30 rounded-lg p-4 border border-border'>
            <div className='flex items-center justify-center h-32 mb-3'>
              <div className='relative'>
                <div className='w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center'>
                  <span className='text-xs font-medium text-primary'>
                    Derivadas
                  </span>
                </div>
                <div className='absolute -top-8 -right-12 w-12 h-12 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center'>
                  <span className='text-[10px] font-medium text-accent'>
                    Límites
                  </span>
                </div>
                <div className='absolute -bottom-8 -right-12 w-12 h-12 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center'>
                  <span className='text-[10px] font-medium text-accent'>
                    Integrales
                  </span>
                </div>
                <div className='absolute -top-8 -left-12 w-12 h-12 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center'>
                  <span className='text-[10px] font-medium text-accent'>
                    Funciones
                  </span>
                </div>
              </div>
            </div>
            <p className='text-center text-sm text-muted-foreground'>
              Mapa: Cálculo Diferencial
            </p>
          </div>

          <Button className='w-full bg-primary hover:bg-primary/90'>
            <Network className='w-4 h-4 mr-2' />
            Generar mapa desde documentos
          </Button>

          <div className='bg-primary/5 rounded-lg p-3 border border-primary/20'>
            <p className='text-xs text-muted-foreground'>
              Crea mapas automáticamente desde tus apuntes, PDFs o syllabus
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
