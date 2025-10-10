import { AlertCircle } from "lucide-react";

export default function Error({ error }: { error: Error }) {
  return (
    <div className='px-4'>
      <div className='flex gap-2'>
        <AlertCircle className='size-7 text-red-500' />
        <p className='text-red-500'>
          {error.message || 'Error al enviar el mensaje'}
        </p>
      </div>
    </div>
  )
}
