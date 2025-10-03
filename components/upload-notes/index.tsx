import { FileText, ImageIcon, Mic, Sparkles, Upload } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Button } from '../ui/button'

export default function UploadNotes() {
  return (
    <Card className='bg-card border-border'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Upload className='w-5 h-5 text-primary' />
          Subir Apuntes
          <span>
            <Sparkles
              size={15}
              fill='black'
              strokeWidth={1}
            />
          </span>
        </CardTitle>
        <CardDescription>
          Convierte imágenes y audio a texto organizado
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer'>
          <div className='flex flex-col items-center gap-3 text-center'>
            <div className='w-12 h-12 rounded-full bg-accent/80 flex items-center justify-center'>
              <ImageIcon className='w-6 h-6 text-primary' />
            </div>
            <div>
              <p className='font-medium text-foreground'>
                Subir imagen del tablero
              </p>
              <p className='text-sm text-muted-foreground'>
                Convierte escritura a mano a texto
              </p>
            </div>
            <Button variant='brand' size="brand">Seleccionar imagenes</Button>
          </div>
        </div>

        <div className='border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer'>
          <div className='flex flex-col items-center gap-3 text-center'>
            <div className='w-12 h-12 rounded-full bg-accent/80 flex items-center justify-center'>
              <Mic className='w-6 h-6 text-accent-foreground' />
            </div>
            <div>
              <p className='font-medium text-foreground'>Subir nota de voz</p>
              <p className='text-sm text-muted-foreground'>
              Convierte audio a texto
              </p>
            </div>
            <Button variant='brand' size="brand">Seleccionar audio</Button>
          </div>
        </div>

        <div className='bg-secondary/30 rounded-lg p-3 border border-border'>
          <div className='flex items-start gap-2'>
            <FileText className='w-4 h-4 text-primary mt-0.5' />
            <div className='text-xs'>
              <p className='text-foreground font-medium mb-1'>Soporte LaTeX</p>
              <p className='text-muted-foreground'>
                Matemáticas y física se formatean automáticamente
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
