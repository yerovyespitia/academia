'use client'

import { FileText, ImageIcon, Mic, Sparkles, Upload, X } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Button } from '../ui/button'
import { useRef, useState } from 'react'

export default function UploadNotes() {
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [selectedAudios, setSelectedAudios] = useState<File[]>([])
  const [isDraggingImage, setIsDraggingImage] = useState(false)
  const [isDraggingAudio, setIsDraggingAudio] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages = Array.from(files)
      setSelectedImages(prev => [...prev, ...newImages])
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
    if (files) {
      const imageFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/')
      )
      setSelectedImages(prev => [...prev, ...imageFiles])
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleImageButtonClick = () => {
    imageInputRef.current?.click()
  }

  // Funciones para audio
  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newAudios = Array.from(files)
      setSelectedAudios(prev => [...prev, ...newAudios])
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
    if (files) {
      const audioFiles = Array.from(files).filter(file => 
        file.type.startsWith('audio/')
      )
      setSelectedAudios(prev => [...prev, ...audioFiles])
    }
  }

  const removeAudio = (index: number) => {
    setSelectedAudios(prev => prev.filter((_, i) => i !== index))
  }

  const handleAudioButtonClick = () => {
    audioInputRef.current?.click()
  }

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
            <Button variant='brand' size="brand" type="button">
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

        {selectedImages.length > 0 && (
          <div className='space-y-2'>
            <p className='text-sm font-medium text-foreground'>
              Imágenes seleccionadas ({selectedImages.length})
            </p>
            <div className='grid grid-cols-2 gap-2'>
              {selectedImages.map((file, index) => (
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
            <Button variant='brand' size="brand" type="button">
              Seleccionar audio
            </Button>
            <p className='text-xs text-muted-foreground'>
              o arrastra los archivos de audio aquí
            </p>
          </div>
          <input
            ref={audioInputRef}
            type='file'
            accept='audio/*'
            multiple
            onChange={handleAudioSelect}
            className='hidden'
          />
        </div>

        {selectedAudios.length > 0 && (
          <div className='space-y-2'>
            <p className='text-sm font-medium text-foreground'>
              Audios seleccionados ({selectedAudios.length})
            </p>
            <div className='grid grid-cols-2 gap-2'>
              {selectedAudios.map((file, index) => (
                <div 
                  key={index} 
                  className='relative group border border-border rounded-lg p-2 bg-secondary/30'
                >
                  <div className='flex items-center gap-2'>
                    <Mic className='w-4 h-4 text-accent-foreground flex-shrink-0' />
                    <span className='text-xs text-foreground truncate flex-1'>
                      {file.name}
                    </span>
                    <button
                      onClick={() => removeAudio(index)}
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
