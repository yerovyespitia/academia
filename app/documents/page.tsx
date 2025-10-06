'use client'

import { useState } from 'react'
import { Mic, Calendar, Tag, Book } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ButtonActions from '@/components/my-documents/button-actions'
import UploadFiles from '@/components/my-documents/upload-files'
import NotFiles from '@/components/my-documents/not-files'
import SearchBar from '@/components/my-documents/search-bar'

const mockDocuments = [
  {
    id: 1,
    name: 'Apuntes Cálculo Diferencial - Clase 1',
    type: 'image',
    tag: 'Cálculo',
    date: '2024-03-15',
    size: '2.4 MB',
  },
  {
    id: 2,
    name: 'Resumen Física Cuántica',
    type: 'image',
    tag: 'Física',
    date: '2024-03-14',
    size: '1.8 MB',
  },
  {
    id: 3,
    name: 'Nota de voz - Repaso Álgebra',
    type: 'audio',
    tag: 'Álgebra',
    date: '2024-03-13',
    size: '5.2 MB',
    duration: '8:30',
  },
  {
    id: 4,
    name: 'Ecuaciones Diferenciales - Ejercicios',
    type: 'image',
    tag: 'Cálculo',
    date: '2024-03-12',
    size: '3.1 MB',
  },
  {
    id: 5,
    name: 'Termodinámica - Leyes fundamentales',
    type: 'image',
    tag: 'Física',
    date: '2024-03-11',
    size: '2.7 MB',
  },
  {
    id: 6,
    name: 'Nota de voz - Conceptos Clave',
    type: 'audio',
    tag: 'Programación',
    date: '2024-03-10',
    size: '4.5 MB',
    duration: '6:45',
  },
]

export default function DocumentsPage() {
  const [documents, setDocuments] = useState(mockDocuments)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Get unique tags
  const tags = Array.from(new Set(documents.map((doc) => doc.tag)))

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesTag = !selectedTag || doc.tag === selectedTag
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    return matchesTag && matchesSearch
  })

  // Group documents by tag
  const documentsByTag = filteredDocuments.reduce((acc, doc) => {
    if (!acc[doc.tag]) {
      acc[doc.tag] = []
    }
    acc[doc.tag].push(doc)
    return acc
  }, {} as Record<string, typeof mockDocuments>)

  const handleDeleteDocument = (id: number) => {
    setDocuments(documents.filter((doc) => doc.id !== id))
  }

  return (
    <main className='max-w-7xl mx-auto p-4'>
      <div className='mb-4'>
        <h1 className='text-3xl font-bold text-foreground mb-2'>
          Mis Documentos
        </h1>
        <p className='text-muted-foreground'>
          Gestiona tus apuntes, imágenes y notas de voz
        </p>
      </div>

      <UploadFiles />

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        tags={tags}
      />

      {/* Documents Grid - Organized by Tags */}
      {Object.keys(documentsByTag).length === 0 ? (
        <NotFiles />
      ) : (
        <div className='space-y-8'>
          {Object.entries(documentsByTag).map(([tag, docs]) => (
            <div key={tag}>
              <div className='flex items-center gap-2 mb-4'>
                <Tag className='size-5 text-primary' />
                <h2 className='text-xl font-semibold text-foreground'>{tag}</h2>
                <Badge className='bg-accent-foreground/10 text-primary px-3'>
                  {docs.length}
                </Badge>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {docs.map((doc) => (
                  <Card
                    key={doc.id}
                    className='p-4 bg-card border-border hover:border-primary/50    '
                  >
                    {doc.type === 'image' && (
                      <div className='w-full h-32 bg-secondary rounded-lg mb-3 flex items-center justify-center'>
                        <Book className='size-12 text-primary' />
                      </div>
                    )}

                    {doc.type === 'audio' && (
                      <div className='w-full h-32 bg-secondary rounded-lg mb-3 flex items-center justify-center'>
                        <Mic className='size-12 text-primary' />
                      </div>
                    )}

                    <div className='space-y-2'>
                      <h3 className='font-medium text-foreground text-sm line-clamp-2'>
                        {doc.name}
                      </h3>

                      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <Calendar className='size-3' />
                        <span>{doc.date}</span>
                        <span>•</span>
                        <span>{doc.size}</span>
                        {doc.duration && (
                          <>
                            <span>•</span>
                            <span>{doc.duration}</span>
                          </>
                        )}
                      </div>

                      <Badge
                        variant='outline'
                        className='text-xs'
                      >
                        {doc.type === 'image' ? 'Imagen' : 'Audio'}
                      </Badge>
                    </div>

                    <ButtonActions
                      deleteDocument={() => handleDeleteDocument(doc.id)}
                    />
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
