'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Network,
  Search,
  Trash2,
  Calendar,
  Tag,
  Eye,
  Layers,
} from 'lucide-react'

// Mock data for concept maps
const mockConceptMaps = [
  {
    id: 'calc-1710512400000',
    name: 'Mapa: Cálculo Diferencial Completo',
    class: 'Cálculo Diferencial',
    tag: 'Cálculo',
    date: '2024-03-15',
    concepts: 24,
    levels: 4,
    connections: 38,
  },
  {
    id: 'physics-1710426000000',
    name: 'Mapa: Mecánica Clásica',
    class: 'Física Mecánica',
    tag: 'Física',
    date: '2024-03-14',
    concepts: 18,
    levels: 3,
    connections: 27,
  },
  {
    id: 'calc-1710339600000',
    name: 'Mapa: Límites y Continuidad',
    class: 'Cálculo Diferencial',
    tag: 'Cálculo',
    date: '2024-03-13',
    concepts: 12,
    levels: 3,
    connections: 16,
  },
  {
    id: 'programming-1710253200000',
    name: 'Mapa: Estructuras de Datos',
    class: 'Programación I',
    tag: 'Programación',
    date: '2024-03-12',
    concepts: 20,
    levels: 4,
    connections: 32,
  },
  {
    id: 'physics-1710166800000',
    name: 'Mapa: Cinemática',
    class: 'Física Mecánica',
    tag: 'Física',
    date: '2024-03-11',
    concepts: 15,
    levels: 3,
    connections: 22,
  },
]

export default function ConceptMapsPage() {
  const router = useRouter()
  const [conceptMaps, setConceptMaps] = useState(mockConceptMaps)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Get unique tags
  const tags = Array.from(new Set(conceptMaps.map((map) => map.tag)))

  // Filter concept maps
  const filteredMaps = conceptMaps.filter((map) => {
    const matchesTag = !selectedTag || map.tag === selectedTag
    const matchesSearch = map.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    return matchesTag && matchesSearch
  })

  // Group maps by tag
  const mapsByTag = filteredMaps.reduce((acc, map) => {
    if (!acc[map.tag]) {
      acc[map.tag] = []
    }
    acc[map.tag].push(map)
    return acc
  }, {} as Record<string, typeof mockConceptMaps>)

  const handleDeleteMap = (id: string) => {
    setConceptMaps(conceptMaps.filter((map) => map.id !== id))
  }

  const handleViewMap = (id: string) => {
    router.push(`/concept-maps/${id}`)
  }

  return (
    <main className='max-w-7xl mx-auto p-4'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-foreground mb-2'>
          Mis Mapas Conceptuales
        </h1>
        <p className='text-muted-foreground'>
          Visualiza conexiones entre conceptos
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
        <Card className='p-4 bg-card border-border'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center'>
              <Network className='w-5 h-5 text-primary' />
            </div>
            <div>
              <p className='text-2xl font-bold text-foreground'>
                {conceptMaps.length}
              </p>
              <p className='text-sm text-muted-foreground'>Mapas creados</p>
            </div>
          </div>
        </Card>

        <Card className='p-4 bg-card border-border'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center'>
              <Layers className='w-5 h-5 text-accent' />
            </div>
            <div>
              <p className='text-2xl font-bold text-foreground'>
                {conceptMaps.reduce((sum, map) => sum + map.concepts, 0)}
              </p>
              <p className='text-sm text-muted-foreground'>Conceptos totales</p>
            </div>
          </div>
        </Card>

        <Card className='p-4 bg-card border-border'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center'>
              <Tag className='w-5 h-5 text-green-500' />
            </div>
            <div>
              <p className='text-2xl font-bold text-foreground'>
                {tags.length}
              </p>
              <p className='text-sm text-muted-foreground'>Clases cubiertas</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className='flex flex-col md:flex-row gap-4 mb-6'>
        <div className='flex-1 relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <Input
            placeholder='Buscar mapas conceptuales...'
            className='pl-10 bg-card border-border'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className='flex gap-2 flex-wrap'>
          <Button
            variant={selectedTag === null ? 'default' : 'outline'}
            size='sm'
            onClick={() => setSelectedTag(null)}
          >
            Todos
          </Button>
          {tags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTag === tag ? 'default' : 'outline'}
              size='sm'
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      {/* Concept Maps Grid - Organized by Tags */}
      {Object.keys(mapsByTag).length === 0 ? (
        <Card className='p-12 text-center bg-card border-border'>
          <Network className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
          <p className='text-muted-foreground'>
            No se encontraron mapas conceptuales
          </p>
        </Card>
      ) : (
        <div className='space-y-8'>
          {Object.entries(mapsByTag).map(([tag, mapList]) => (
            <div key={tag}>
              <div className='flex items-center gap-2 mb-4'>
                <Tag className='w-5 h-5 text-primary' />
                <h2 className='text-xl font-semibold text-foreground'>{tag}</h2>
                <Badge
                  variant='secondary'
                  className='ml-2'
                >
                  {mapList.length}
                </Badge>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {mapList.map((map) => (
                  <Card
                    key={map.id}
                    className='p-4 bg-card border-border hover:border-primary/50 transition-colors'
                  >
                    {/* Map Header */}
                    <div className='space-y-3'>
                      <div className='flex items-start justify-between'>
                        <h3 className='font-medium text-foreground text-sm line-clamp-2 flex-1'>
                          {map.name}
                        </h3>
                      </div>

                      <p className='text-xs text-muted-foreground'>
                        {map.class}
                      </p>

                      {/* Map Stats */}
                      <div className='grid grid-cols-3 gap-2 text-xs'>
                        <div className='bg-secondary/30 rounded p-2 text-center'>
                          <p className='text-muted-foreground mb-1'>
                            Conceptos
                          </p>
                          <p className='text-foreground font-bold'>
                            {map.concepts}
                          </p>
                        </div>
                        <div className='bg-secondary/30 rounded p-2 text-center'>
                          <p className='text-muted-foreground mb-1'>Niveles</p>
                          <p className='text-foreground font-bold'>
                            {map.levels}
                          </p>
                        </div>
                        <div className='bg-secondary/30 rounded p-2 text-center'>
                          <p className='text-muted-foreground mb-1'>
                            Conexiones
                          </p>
                          <p className='text-foreground font-bold'>
                            {map.connections}
                          </p>
                        </div>
                      </div>

                      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <Calendar className='w-3 h-3' />
                        <span>{map.date}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className='flex gap-2 mt-4'>
                      <Button
                        variant='default'
                        size='sm'
                        className='flex-1'
                        onClick={() => handleViewMap(map.id)}
                      >
                        <Eye className='w-4 h-4 mr-1' />
                        Ver mapa
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleDeleteMap(map.id)}
                        className='text-destructive hover:bg-destructive/10'
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>
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
