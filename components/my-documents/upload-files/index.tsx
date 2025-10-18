'use client'

import { useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { ImageIcon, Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ModalTranscription from '@/components/upload-notes/modal-transcription'

type TranscriptResult = {
  text: string
  segments?: Array<{ start: number; end: number; text: string }>
  language?: string
  durationInSeconds?: number
}

export default function UploadFiles() {
  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: '/api/transcribe-image' }),
  })

  const imageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  const [showTranscriptionModal, setShowTranscriptionModal] = useState(false)
  const [transcriptionMode, setTranscriptionMode] = useState<'image' | 'audio'>(
    'image'
  )

  const [genericTranscript, setGenericTranscript] =
    useState<TranscriptResult | null>(null)
  const [genericStatus, setGenericStatus] = useState<
    'idle' | 'submitted' | 'streaming' | 'ready'
  >('idle')
  const [genericError, setGenericError] = useState(false)

  const handleImageButtonClick = () => imageInputRef.current?.click()
  const handleAudioButtonClick = () => audioInputRef.current?.click()

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setTranscriptionMode('image')
      sendMessage({
        text: 'Es están enviando una imagen, transcribe todo el contenido de la imagen, en caso de no ver casi texto en imagen, escribe una explicación de lo que ves, pero siempre que puedas transcribir todo el texto de imagen',
        files,
      })
      setShowTranscriptionModal(true)
      if (imageInputRef.current) imageInputRef.current.value = ''
    }
  }

  const startAudioTranscription = async (file: File) => {
    if (genericStatus === 'submitted' || genericStatus === 'streaming') return
    setTranscriptionMode('audio')
    setGenericError(false)
    setGenericStatus('submitted')
    setShowTranscriptionModal(true)
    try {
      const formData = new FormData()
      formData.append('audio', file)
      const response = await fetch('/api/transcribe-audio', {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) throw new Error('Failed to transcribe audio')
      const data = (await response.json()) as TranscriptResult
      setGenericTranscript(data)
      setGenericStatus('ready')
      if (audioInputRef.current) audioInputRef.current.value = ''
    } catch (err) {
      console.error('Error transcribing audio: ', err)
      setGenericError(true)
      setGenericStatus('ready')
    }
  }

  const handleAudioSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('audio/')) startAudioTranscription(file)
    }
  }

  return (
    <Card className='p-6 mb-8 bg-card border-border'>
      <h2 className='text-lg font-semibold text-foreground'>
        Subir Documentos
      </h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Button
          type='button'
          onClick={handleImageButtonClick}
          variant='outline'
          className='h-24 flex flex-col gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5 bg-transparent'
        >
          <ImageIcon className='size-6 text-primary' />
          <span className='text-sm'>Subir Imagen</span>
          <span className='text-xs text-muted-foreground'>JPG, PNG</span>
        </Button>

        <Button
          type='button'
          onClick={handleAudioButtonClick}
          variant='outline'
          className='h-24 flex flex-col gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5 bg-transparent'
        >
          <Mic className='size-6 text-primary' />
          <span className='text-sm'>Subir Audio</span>
          <span className='text-xs text-muted-foreground'>Máx. 10 minutos</span>
        </Button>
      </div>

      {/* Hidden inputs */}
      <input
        ref={imageInputRef}
        type='file'
        accept='image/*'
        multiple
        onChange={handleImageSelect}
        className='hidden'
      />
      <input
        ref={audioInputRef}
        type='file'
        accept='audio/*'
        onChange={handleAudioSelect}
        className='hidden'
      />

      {showTranscriptionModal && (
        <ModalTranscription
          mode={transcriptionMode}
          error={
            transcriptionMode === 'image'
              ? error
                ? true
                : false
              : genericError
          }
          messages={messages}
          status={transcriptionMode === 'image' ? status : genericStatus}
          audioTranscript={genericTranscript}
          setShowTranscriptionModal={(show) => {
            if (!show) {
              if (transcriptionMode === 'image') {
                setMessages([])
              } else {
                setGenericTranscript(null)
                setGenericStatus('idle')
                setGenericError(false)
              }
            }
            setShowTranscriptionModal(show)
          }}
        />
      )}
    </Card>
  )
}
