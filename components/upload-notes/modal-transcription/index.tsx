import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Loader2 } from 'lucide-react'

export default function ModalTranscription({
  error,
  messages,
  status,
  setShowTranscriptionModal,
}: {
  error: boolean
  messages: any
  status: string
  setShowTranscriptionModal: (show: boolean) => void
}) {
  return (
    <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
      <div className='w-full max-w-2xl'>
        <Card className='bg-card border-border'>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>Transcripción</CardTitle>
            <button
              onClick={() => setShowTranscriptionModal(false)}
              aria-label='Cerrar'
              className='p-1 rounded hover:bg-secondary/40'
            >
              <X className='w-5 h-5' />
            </button>
          </CardHeader>
          <CardContent className='max-h-[70vh] overflow-y-auto'>
            {(status === 'submitted' || status === 'streaming') && (
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Loader2 className='w-4 h-4 animate-spin' />
                Procesando imagen...
              </div>
            )}
            {error && (
              <div className='text-sm text-red-500'>
                Error al generar la transcripción.
              </div>
            )}
            {status === 'ready' && !error && (
              <div className='space-y-3'>
                {(() => {
                  const latestAssistant = [...messages]
                    .reverse()
                    .find((m) => m.role === 'assistant')
                  if (!latestAssistant) {
                    return (
                      <div className='text-sm text-muted-foreground'>
                        Esperando respuesta...
                      </div>
                    )
                  }
                  return latestAssistant.parts.map(
                    (part: any, index: number) => {
                      if (part.type === 'text') {
                        return (
                          <div
                            key={`${latestAssistant.id}-${index}`}
                            className='text-sm leading-relaxed whitespace-pre-line'
                          >
                            {part.text}
                          </div>
                        )
                      }
                      return null
                    }
                  )
                })()}
              </div>
            )}
            <div className='mt-4 flex justify-end'>
              <Button
                onClick={() => setShowTranscriptionModal(false)}
                variant='secondary'
              >
                Cerrar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
