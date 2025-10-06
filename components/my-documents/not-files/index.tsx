import { FileText } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function NotFiles() {
  return (
    <Card className='p-12 text-center bg-card border-border'>
      <FileText className='size-12 text-muted-foreground mx-auto' />
      <p className='text-muted-foreground'>No se encontraron documentos</p>
    </Card>
  )
}
