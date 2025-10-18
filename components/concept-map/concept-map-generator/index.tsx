'use client'

import { use, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ZoomIn, ZoomOut, Maximize2, Info } from 'lucide-react'
import type { ConceptMapSchema } from '@/components/concept-map/schema'

type PositionedConcept = {
  id: string
  name: string
  level: number
  x: number
  y: number
  description?: string
  connections: string[]
}

export default function ConceptMapGenerator({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id } = use(params)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [mapData, setMapData] = useState<ConceptMapSchema | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`concept-map:${id}`)
      if (stored) {
        const parsed = JSON.parse(stored) as ConceptMapSchema
        if (parsed?.nodes?.length) setMapData(parsed)
      }
    } catch {}
  }, [id])

  const conceptMap = useMemo(() => {
    if (!mapData) return null

    const nodes = mapData.nodes
    const edges = mapData.edges

    // Build adjacency (undirected for visualization)
    const adjacency = new Map<string, Set<string>>()
    nodes.forEach((n) => adjacency.set(n.id, new Set()))
    edges.forEach((e) => {
      adjacency.get(e.from)?.add(e.to)
      adjacency.get(e.to)?.add(e.from)
    })

    // BFS to compute levels from first node as root
    const levels = new Map<string, number>()
    const rootId = nodes[0]?.id
    const queue: string[] = []
    if (rootId) {
      levels.set(rootId, 0)
      queue.push(rootId)
      while (queue.length) {
        const current = queue.shift() as string
        const currentLevel = levels.get(current) as number
        for (const neighbor of adjacency.get(current) ?? []) {
          if (!levels.has(neighbor)) {
            levels.set(neighbor, currentLevel + 1)
            queue.push(neighbor)
          }
        }
      }
    }

    // Group nodes by level (unreached nodes go to last level)
    const maxLevel = Math.max(0, ...Array.from(levels.values()))
    const unvisited = nodes.filter((n) => !levels.has(n.id))
    unvisited.forEach((n) => levels.set(n.id, maxLevel + 1))

    const grouped = new Map<number, string[]>()
    levels.forEach((lvl, nid) => {
      const list = grouped.get(lvl) ?? []
      list.push(nid)
      grouped.set(lvl, list)
    })

    // Compute positions
    const levelCount = Math.max(...Array.from(grouped.keys())) + 1
    const minY = 15
    const maxY = 85
    const yStep = levelCount > 1 ? (maxY - minY) / (levelCount - 1) : 0

    const positioned: PositionedConcept[] = []
    nodes.forEach((n) => {
      const lvl = levels.get(n.id) ?? 0
      const siblings = grouped.get(lvl) ?? [n.id]
      const index = siblings.indexOf(n.id)
      const x = siblings.length === 1 ? 50 : (index * 100) / (siblings.length - 1)
      const y = minY + yStep * lvl
      positioned.push({
        id: n.id,
        name: n.label,
        level: lvl,
        x,
        y,
        description: n.description,
        connections: Array.from(adjacency.get(n.id) ?? []),
      })
    })

    return {
      id,
      name: `Mapa: ${mapData.topic}`,
      class: 'Mapa Conceptual',
      concepts: positioned,
    }
  }, [id, mapData])

  const selectedConcept = conceptMap?.concepts.find((c) => c.id === selectedNode)

  const handleZoomIn = () => setZoom(Math.min(zoom + 10, 150))
  const handleZoomOut = () => setZoom(Math.max(zoom - 10, 50))

  if (!conceptMap) {
    return (
      <main className='max-w-7xl mx-auto p-4'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => router.back()}
          className='mb-4'
        >
          <ArrowLeft className='w-4 h-4 mr-2' />
          Volver
        </Button>
        <Card className='p-8 bg-card border-border'>
          <p className='text-muted-foreground'>
            No se encontró el mapa. Vuelve a generar desde la sección de mapas
            conceptuales.
          </p>
        </Card>
      </main>
    )
  }

  return (
    <main className='max-w-7xl mx-auto p-4'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-4'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => router.back()}
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            Volver
          </Button>
          <div>
            <h1 className='text-2xl font-bold text-foreground'>
              {conceptMap.name}
            </h1>
            <p className='text-sm text-muted-foreground'>{conceptMap.class}</p>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleZoomOut}
          >
            <ZoomOut className='w-4 h-4' />
          </Button>
          <span className='text-sm text-muted-foreground w-12 text-center'>
            {zoom}%
          </span>
          <Button
            variant='outline'
            size='sm'
            onClick={handleZoomIn}
          >
            <ZoomIn className='w-4 h-4' />
          </Button>
          <Button
            variant='outline'
            size='sm'
          >
            <Maximize2 className='w-4 h-4' />
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Concept Map Visualization */}
        <Card className='lg:col-span-2 bg-card border-border p-6'>
          <div
            className='relative bg-secondary/20 rounded-lg overflow-hidden'
            style={{
              height: '600px',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
            }}
          >
            {/* SVG for connections */}
            <svg className='absolute inset-0 w-full h-full pointer-events-none'>
              {conceptMap.concepts.map((concept) =>
                concept.connections.map((targetId) => {
                  const target = conceptMap.concepts.find(
                    (c) => c.id === targetId
                  )
                  if (!target) return null
                  return (
                    <line
                      key={`${concept.id}-${targetId}`}
                      x1={`${concept.x}%`}
                      y1={`${concept.y}%`}
                      x2={`${target.x}%`}
                      y2={`${target.y}%`}
                      stroke='hsl(var(--primary))'
                      strokeWidth='2'
                      strokeOpacity='0.3'
                    />
                  )
                })
              )}
            </svg>

            {/* Concept Nodes */}
            {conceptMap.concepts.map((concept) => (
              <div
                key={concept.id}
                className={`absolute cursor-pointer transition-all ${
                  selectedNode === concept.id
                    ? 'scale-110 z-10'
                    : 'hover:scale-105'
                }`}
                style={{
                  left: `${concept.x}%`,
                  top: `${concept.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onClick={() => setSelectedNode(concept.id)}
              >
                <div
                  className={`px-4 py-3 rounded-lg border-2 shadow-lg transition-colors ${
                    selectedNode === concept.id
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-card border-primary/30 text-foreground hover:border-primary'
                  }`}
                >
                  <p className='text-sm font-medium whitespace-nowrap'>
                    {concept.name}
                  </p>
                  <Badge
                    variant='secondary'
                    className={`mt-1 text-xs ${
                      selectedNode === concept.id
                        ? 'bg-primary-foreground/20'
                        : ''
                    }`}
                  >
                    Nivel {concept.level + 1}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Concept Details Sidebar */}
        <Card className='bg-card border-border p-6'>
          <div className='flex items-center gap-2 mb-4'>
            <Info className='w-5 h-5 text-primary' />
            <h2 className='text-lg font-semibold text-foreground'>
              Detalles del Concepto
            </h2>
          </div>

          {selectedConcept ? (
            <div className='space-y-4'>
              <div>
                <h3 className='text-xl font-bold text-foreground mb-2'>
                  {selectedConcept.name}
                </h3>
                <Badge
                  variant='outline'
                  className='mb-4'
                >
                  Nivel {selectedConcept.level + 1}
                </Badge>
              </div>

              <div className='bg-secondary/30 rounded-lg p-4 border border-border'>
                <p className='text-sm text-foreground leading-relaxed'>
                  {selectedConcept.description ?? 'Sin descripción'}
                </p>
              </div>

              <div>
                <p className='text-sm font-medium text-foreground mb-2'>
                  Conexiones
                </p>
                <div className='space-y-2'>
                  {selectedConcept.connections.length > 0 ? (
                    selectedConcept.connections.map((connId) => {
                      const connectedConcept = conceptMap.concepts.find(
                        (c) => c.id === connId
                      )
                      return (
                        <div
                          key={connId}
                          className='bg-secondary/30 rounded p-2 border border-border cursor-pointer hover:border-primary/50 transition-colors'
                          onClick={() => setSelectedNode(connId)}
                        >
                          <p className='text-sm text-foreground'>
                            {connectedConcept?.name}
                          </p>
                        </div>
                      )
                    })
                  ) : (
                    <p className='text-sm text-muted-foreground'>
                      No hay conexiones directas
                    </p>
                  )}
                </div>
              </div>

              <div className='pt-4 border-t border-border'>
                <p className='text-xs text-muted-foreground mb-2'>
                  Estadísticas
                </p>
                <div className='grid grid-cols-2 gap-2'>
                  <div className='bg-secondary/30 rounded p-2 text-center'>
                    <p className='text-xs text-muted-foreground'>Nivel</p>
                    <p className='text-lg font-bold text-foreground'>
                      {selectedConcept.level + 1}
                    </p>
                  </div>
                  <div className='bg-secondary/30 rounded p-2 text-center'>
                    <p className='text-xs text-muted-foreground'>Conexiones</p>
                    <p className='text-lg font-bold text-foreground'>
                      {selectedConcept.connections.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className='text-center py-12'>
              <div className='w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mx-auto mb-4'>
                <Info className='w-8 h-8 text-muted-foreground' />
              </div>
              <p className='text-muted-foreground'>
                Selecciona un concepto para ver sus detalles
              </p>
            </div>
          )}
        </Card>
      </div>
    </main>
  )
}
