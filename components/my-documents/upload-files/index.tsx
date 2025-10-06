import { FileText, ImageIcon, Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function UploadFiles() {
  return (
    <Card className='p-6 mb-8 bg-card border-border'>
      <h2 className='text-lg font-semibold text-foreground'>
        Subir Documentos
      </h2>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Button
          variant='outline'
          className='h-24 flex flex-col gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5 bg-transparent'
        >
          <ImageIcon className='size-6 text-primary' />
          <span className='text-sm'>Subir Imagen</span>
          <span className='text-xs text-muted-foreground'>JPG, PNG, PDF</span>
        </Button>

        <Button
          variant='outline'
          className='h-24 flex flex-col gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5 bg-transparent'
        >
          <Mic className='size-6 text-primary' />
          <span className='text-sm'>Subir Audio</span>
          <span className='text-xs text-muted-foreground'>Máx. 10 minutos</span>
        </Button>

        <Button
          variant='outline'
          className='h-24 flex flex-col gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5 bg-transparent'
        >
          <FileText className='size-6 text-primary' />
          <span className='text-sm'>Subir Documento</span>
          <span className='text-xs text-muted-foreground'>TXT, DOCX, PDF</span>
        </Button>
      </div>
    </Card>
  )
}
