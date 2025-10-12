'use client'

import { useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { FileText, ImageIcon, Mic, Sparkles, Upload, X } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Button } from '../ui/button'
import ModalTranscription from './modal-transcription'

type TranscriptResult = {
  text: string
  segments?: Array<{ start: number; end: number; text: string }>
  language?: string
  durationInSeconds?: number
}

export default function UploadNotes() {
  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/transcribe-image',
    }),
  })
  const [selectedImages, setSelectedImages] = useState<FileList | null>(null)
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null)
  const [isDraggingImage, setIsDraggingImage] = useState(false)
  const [isDraggingAudio, setIsDraggingAudio] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const [showTranscriptionModal, setShowTranscriptionModal] = useState(false)
  const [transcriptionMode, setTranscriptionMode] = useState<'image' | 'audio'>(
    'image'
  )
  const [transcriptAudio, setTranscriptAudio] =
    useState<TranscriptResult | null>(null)
  const [audioStatus, setAudioStatus] = useState<
    'idle' | 'submitted' | 'streaming' | 'ready'
  >('idle')
  const [audioError, setAudioError] = useState(false)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setSelectedImages(files)
      setTranscriptionMode('image')
      sendMessage({
        text: 'Es están enviando una imagen, transcribe todo el contenido de la imagen, en caso de no ver casi texto en imagen, escribe una explicación de lo que ves, pero siempre que puedas transcribir todo el texto de imagen',
        files,
      })
      setShowTranscriptionModal(true)
      setSelectedImages(null)
      if (imageInputRef.current) {
        imageInputRef.current.value = ''
      }
    }
  }

  // Funciones para imágenes
  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingImage(true)
  }

  const handleImageDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingImage(false)
  }

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingImage(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const dataTransfer = new DataTransfer()
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          dataTransfer.items.add(file)
        }
      })
      const imageFiles = dataTransfer.files
      if (imageFiles.length > 0) {
        setSelectedImages(imageFiles)
        setTranscriptionMode('image')
        sendMessage({
          text: 'Es están enviando una imagen, transcribe todo el contenido de la imagen, en caso de no ver casi texto en imagen, escribe una explicación de lo que ves, pero siempre que puedas transcribir todo el texto de imagen',
          files: imageFiles,
        })
        setShowTranscriptionModal(true)
        setSelectedImages(null)
      }
    }
  }

  const removeImage = (index: number) => {
    if (!selectedImages) return
    const dataTransfer = new DataTransfer()
    Array.from(selectedImages).forEach((file, i) => {
      if (i !== index) dataTransfer.items.add(file)
    })
    const newList = dataTransfer.files
    setSelectedImages(newList.length > 0 ? newList : null)
  }

  const handleImageButtonClick = () => {
    imageInputRef.current?.click()
  }

  // Funciones para audio
  const startAudioTranscription = async (file: File) => {
    // Evita múltiples transcripciones simultáneas
    if (audioStatus === 'submitted' || audioStatus === 'streaming') return

    setSelectedAudio(file)
    setTranscriptionMode('audio')
    setAudioError(false)
    setAudioStatus('submitted')
    setShowTranscriptionModal(true)

    try {
      const formData = new FormData()
      formData.append('audio', file)
      const response = await fetch('/api/transcribe-audio', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to transcribe audio')
      }

      const data = await response.json()
      setTranscriptAudio(data)
      setAudioStatus('ready')
      setSelectedAudio(null)
      if (audioInputRef.current) {
        audioInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error transcribing audio: ', error)
      setAudioError(true)
      setAudioStatus('ready')
    }
  }

  const handleAudioSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('audio/')) {
        startAudioTranscription(file)
      }
    }
  }

  const handleAudioDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingAudio(true)
  }

  const handleAudioDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingAudio(false)
  }

  const handleAudioDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingAudio(false)

    const files = e.dataTransfer.files
    if (!files || files.length === 0) return

    // Filtra solo audios y toma solo el primero para asegurar uno a la vez
    const audioFiles = Array.from(files).filter((file) =>
      file.type.startsWith('audio/')
    )
    if (audioFiles.length === 0) return

    const audioFile = audioFiles[0]
    startAudioTranscription(audioFile)
  }

  const removeAudio = () => {
    setSelectedAudio(null)
    if (audioInputRef.current) {
      audioInputRef.current.value = ''
    }
  }

  const handleAudioButtonClick = () => {
    audioInputRef.current?.click()
  }

  return (
    <Card className='bg-card border-border'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Upload className='size-5 text-primary' />
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
        <div
          className={`border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
            isDraggingImage
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50'
          }`}
          onDragOver={handleImageDragOver}
          onDragLeave={handleImageDragLeave}
          onDrop={handleImageDrop}
          onClick={handleImageButtonClick}
        >
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
            <Button
              variant='brand'
              size='brand'
              type='button'
            >
              Seleccionar imágenes
            </Button>
            <p className='text-xs text-muted-foreground'>
              o arrastra las imágenes aquí
            </p>
          </div>
          <input
            ref={imageInputRef}
            type='file'
            accept='image/*'
            multiple
            onChange={handleImageSelect}
            className='hidden'
          />
        </div>

        {selectedImages && selectedImages.length > 0 && (
          <div className='space-y-2'>
            <p className='text-sm font-medium text-foreground'>
              Imágenes seleccionadas ({selectedImages.length})
            </p>
            <div className='grid grid-cols-2 gap-2'>
              {Array.from(selectedImages).map((file, index) => (
                <div
                  key={index}
                  className='relative group border border-border rounded-lg p-2 bg-secondary/30'
                >
                  <div className='flex items-center gap-2'>
                    <ImageIcon className='w-4 h-4 text-primary flex-shrink-0' />
                    <span className='text-xs text-foreground truncate flex-1'>
                      {file.name}
                    </span>
                    <button
                      onClick={() => removeImage(index)}
                      className='opacity-0 group-hover:opacity-100 transition-opacity'
                    >
                      <X className='w-4 h-4 text-muted-foreground hover:text-foreground' />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className={`border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
            isDraggingAudio
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50'
          }`}
          onDragOver={handleAudioDragOver}
          onDragLeave={handleAudioDragLeave}
          onDrop={handleAudioDrop}
          onClick={handleAudioButtonClick}
        >
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
            <Button
              variant='brand'
              size='brand'
              type='button'
            >
              Seleccionar audio
            </Button>
            <p className='text-xs text-muted-foreground'>
              o arrastra el archivo de audio aquí
            </p>
          </div>
          <input
            ref={audioInputRef}
            type='file'
            accept='audio/*'
            onChange={handleAudioSelect}
            className='hidden'
          />
        </div>

        {selectedAudio && (
          <div className='space-y-2'>
            <p className='text-sm font-medium text-foreground'>
              Audio seleccionado
            </p>
            <div className='grid grid-cols-1 gap-2'>
              <div className='relative group border border-border rounded-lg p-2 bg-secondary/30'>
                <div className='flex items-center gap-2'>
                  <Mic className='w-4 h-4 text-accent-foreground flex-shrink-0' />
                  <span className='text-xs text-foreground truncate flex-1'>
                    {selectedAudio.name}
                  </span>
                  <button
                    onClick={removeAudio}
                    className='opacity-0 group-hover:opacity-100 transition-opacity'
                  >
                    <X className='w-4 h-4 text-muted-foreground hover:text-foreground' />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
      {showTranscriptionModal && (
        <ModalTranscription
          mode={transcriptionMode}
          error={
            transcriptionMode === 'image' ? (error ? true : false) : audioError
          }
          messages={messages}
          status={transcriptionMode === 'image' ? status : audioStatus}
          audioTranscript={transcriptAudio}
          setShowTranscriptionModal={(show) => {
            if (!show) {
              if (transcriptionMode === 'image') {
                setMessages([])
              } else {
                setTranscriptAudio(null)
                setAudioStatus('idle')
                setAudioError(false)
              }
            }
            setShowTranscriptionModal(show)
          }}
        />
      )}
    </Card>
  )
}
