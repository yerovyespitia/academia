import { Button } from '@/components/ui/button'
import { Download, Trash2 } from 'lucide-react'

type ButtonActionsProps = {
  deleteDocument: () => void
}

export default function ButtonActions({ deleteDocument }: ButtonActionsProps) {
  return (
    <div className='flex items-center gap-2'>
      <Button
        variant='outline'
        className='flex-1'
      >
        <Download className='size-4' />
        Descargar
      </Button>
      <Button
        variant='outline'
        onClick={deleteDocument}
      >
        <Trash2 className='size-4' />
      </Button>
    </div>
  )
}
