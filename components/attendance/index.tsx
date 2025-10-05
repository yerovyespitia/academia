import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../ui/card'
import { Calendar, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Badge } from '../ui/badge'

export default function Attendance() {
  return (
    <Card className='bg-card border-border'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Calendar className='w-5 h-5 text-primary' />
          Asistencia
        </CardTitle>
        <CardDescription>Clases críticas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          <div className='bg-red-500/10 border border-red-500/30 rounded-lg p-3'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-sm font-medium text-foreground'>
                Física Mecánica
              </p>
              <AlertCircle className='w-4 h-4 text-red-500' />
            </div>
            <p className='text-xs text-muted-foreground mb-2'>Faltas: 3/4</p>
            <Badge
              variant='outline'
              className='bg-red-500/20 text-red-500 border-red-500/30 text-xs'
            >
              ¡No puedes faltar!
            </Badge>
          </div>

          <div className='bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-sm font-medium text-foreground'>
                Cálculo Diferencial
              </p>
              <AlertCircle className='w-4 h-4 text-yellow-500' />
            </div>
            <p className='text-xs text-muted-foreground mb-2'>Faltas: 2/4</p>
            <Badge
              variant='outline'
              className='bg-yellow-500/20 text-yellow-500 border-yellow-500/30 text-xs'
            >
              Cuidado
            </Badge>
          </div>

          <div className='bg-green-500/10 border border-green-500/30 rounded-lg p-3'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-sm font-medium text-foreground'>
                Programación I
              </p>
              <CheckCircle2 className='w-4 h-4 text-green-500' />
            </div>
            <p className='text-xs text-muted-foreground mb-2'>Faltas: 0/4</p>
            <Badge
              variant='outline'
              className='bg-green-500/20 text-green-500 border-green-500/30 text-xs'
            >
              Perfecto
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
