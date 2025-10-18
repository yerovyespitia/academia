'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Loader2, Volume2, RotateCcw } from 'lucide-react'

type TranscriptResult = {
  text: string
  segments?: Array<{ start: number; end: number; text: string }>
  language?: string
  durationInSeconds?: number
}

function spellAcronyms(text: string): string {
  return text.replace(/\b([A-Z]{2,5})\b/g, (match) => match.split('').join(' '))
}

export default function ModalTranscription({
  mode = 'image',
  error,
  messages,
  status,
  audioTranscript,
  setShowTranscriptionModal,
}: {
  mode?: 'image' | 'audio' | 'pdf'
  error: boolean
  messages: any
  status: string
  audioTranscript?: TranscriptResult | null
  setShowTranscriptionModal: (show: boolean) => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [_speechError, setSpeechError] = useState<string | null>(null)
  const [hasAudio, setHasAudio] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const audioUrlRef = useRef<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const getSpeakableText = (): string => {
    if (status !== 'ready' || error) return ''
    if (mode === 'image') {
      try {
        const latestAssistant = [...messages]
          .reverse()
          .find((m) => m.role === 'assistant')
        if (!latestAssistant) return ''
        const textParts = latestAssistant.parts
          ?.filter(
            (p: any) => p?.type === 'text' && typeof p?.text === 'string'
          )
          ?.map((p: any) => p.text)
        const combined = Array.isArray(textParts) ? textParts.join('\n') : ''
        return spellAcronyms(combined)
      } catch {
        return ''
      }
    }
    return spellAcronyms(audioTranscript?.text ?? '')
  }

  const handleSpeech = async (text: string) => {
    if (!text.trim()) return
    setIsLoading(true)
    setSpeechError(null)

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
      audioRef.current = null
    }

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }

    try {
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate speech')
      }

      const blob = await response.blob()
      audioUrlRef.current = URL.createObjectURL(blob)
      audioRef.current = new Audio(audioUrlRef.current)

      setHasAudio(true)
      if (audioRef.current) {
        audioRef.current.onplay = () => setIsPlaying(true)
        audioRef.current.onpause = () => setIsPlaying(false)
        audioRef.current.onended = () => setIsPlaying(false)
        audioRef.current.play()
      }
    } catch (e) {
      console.error('Error generating speech: ', e)
      setSpeechError('Error generating speech')
      setHasAudio(false)
    } finally {
      setIsLoading(false)
    }
  }

  const replayAudio = () => {
    if (audioUrlRef.current && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
    }
  }

  useEffect(() => {
    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current)
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  const disableInteractions = isLoading || isPlaying
  const canSpeak =
    !disableInteractions &&
    status === 'ready' &&
    !error &&
    !!getSpeakableText().trim()

  return (
    <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
      <div className='w-full max-w-2xl'>
        <Card className='bg-card border-border'>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>Transcripción</CardTitle>
            <div className='flex items-center gap-2'>
              {/* Show play only if no audio has been generated yet */}
              {!hasAudio && (
                <Button
                  variant='outline'
                  size='icon'
                  disabled={!canSpeak}
                  onClick={() => handleSpeech(getSpeakableText())}
                  aria-label='Leer transcripción'
                  className='bg-card'
                >
                  {isLoading ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                  ) : (
                    <Volume2 className='w-4 h-4' />
                  )}
                </Button>
              )}
              {hasAudio && (
                <Button
                  variant='outline'
                  size='icon'
                  disabled={disableInteractions}
                  onClick={replayAudio}
                  aria-label='Reproducir de nuevo'
                  className='bg-card'
                >
                  <RotateCcw className='w-4 h-4' />
                </Button>
              )}
              <button
                onClick={() => setShowTranscriptionModal(false)}
                aria-label='Cerrar'
                className='p-1 rounded hover:bg-secondary/40'
              >
                <X className='w-5 h-5' />
              </button>
            </div>
          </CardHeader>
          <CardContent className='max-h-[70vh] overflow-y-auto'>
            {(status === 'submitted' || status === 'streaming') && (
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Loader2 className='w-4 h-4 animate-spin' />
                {mode === 'image'
                  ? 'Procesando imagen...'
                  : mode === 'audio'
                    ? 'Procesando audio...'
                    : 'Procesando documento...'}
              </div>
            )}
            {error && (
              <div className='text-sm text-red-500'>
                Error al generar la transcripción.
              </div>
            )}
            {status === 'ready' && !error && (
              <div className='space-y-3'>
                {mode === 'image' ? (
                  (() => {
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
                  })()
                ) : (
                  <div className='text-sm leading-relaxed whitespace-pre-line'>
                    {audioTranscript?.text || (
                      <span className='text-muted-foreground'>
                        Sin contenido transcrito.
                      </span>
                    )}
                  </div>
                )}
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
