'use client'

import { use, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Info } from 'lucide-react'
import type { ConceptMapSchema } from '@/components/concept-map/schema'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'

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
  const [mapData, setMapData] = useState<ConceptMapSchema | null>(null)
  const [maxLevels, setMaxLevels] = useState<number>(3)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`concept-map:${id}`)
      if (stored) {
        const parsed = JSON.parse(stored) as
          | { map: ConceptMapSchema; depth?: number }
          | ConceptMapSchema
        if ('map' in (parsed as any)) {
          const wrapper = parsed as { map: ConceptMapSchema; depth?: number }
          if (wrapper.map?.nodes?.length) {
            setMapData(wrapper.map)
            if (wrapper.depth) setMaxLevels(wrapper.depth)
          }
        } else {
          const mapOnly = parsed as ConceptMapSchema
          if (mapOnly?.nodes?.length) setMapData(mapOnly)
        }
      }
    } catch {}
  }, [id])

  const conceptMap = useMemo(() => {
    if (!mapData) return null

    const nodes = mapData.nodes
    const edges = mapData.edges

    // Build directed adjacency and indegree maps
    const outgoing = new Map<string, Set<string>>()
    const incoming = new Map<string, Set<string>>()
    const indegree = new Map<string, number>()
    nodes.forEach((n) => {
      outgoing.set(n.id, new Set())
      incoming.set(n.id, new Set())
      indegree.set(n.id, 0)
    })
    edges.forEach((e) => {
      outgoing.get(e.from)?.add(e.to)
      incoming.get(e.to)?.add(e.from)
      indegree.set(e.to, (indegree.get(e.to) ?? 0) + 1)
    })

    // Choose a good root:
    // 1) label matches topic; 2) zero indegree node with max out-degree; 3) max out-degree
    const topicRoot = nodes.find(
      (n) => n.label.trim().toLowerCase() === mapData.topic.trim().toLowerCase()
    )?.id
    const zeroIn = nodes.filter((n) => (indegree.get(n.id) ?? 0) === 0)
    const byOutDegree = (a: string, b: string) =>
      (outgoing.get(b)?.size ?? 0) - (outgoing.get(a)?.size ?? 0)
    const zeroInBest = zeroIn.sort((a, b) => byOutDegree(a.id, b.id))[0]?.id
    const maxOut = nodes.slice().sort((a, b) => byOutDegree(a.id, b.id))[0]?.id
    const primaryRoot = topicRoot ?? zeroInBest ?? maxOut ?? nodes[0]?.id

    // If the model provided levels, prefer those (clamped)
    const providedLevels = new Map<string, number>()
    let hasProvided = false
    nodes.forEach((n) => {
      if (typeof (n as any).level === 'number') {
        hasProvided = true
        providedLevels.set(
          n.id,
          Math.max(0, Math.min((n as any).level, Math.max(0, maxLevels - 1)))
        )
      }
    })

    // Directed BFS layering strictly bounded to maxLevels
    const levels = new Map<string, number>()
    if (hasProvided) {
      providedLevels.forEach((lvl, id) => levels.set(id, lvl))
    } else {
      const queue: Array<{ id: string; level: number }> = []
      if (primaryRoot) {
        levels.set(primaryRoot, 0)
        queue.push({ id: primaryRoot, level: 0 })
      }
      while (queue.length) {
        const { id: cur, level } = queue.shift() as {
          id: string
          level: number
        }
        const nextLevel = level + 1
        if (nextLevel > maxLevels - 1) continue
        for (const nb of outgoing.get(cur) ?? []) {
          if (!levels.has(nb)) {
            levels.set(nb, nextLevel)
            if (nextLevel < maxLevels - 1) {
              queue.push({ id: nb, level: nextLevel })
            }
          }
        }
      }
    }

    // Any unvisited nodes (disconnected) go to level 0
    nodes.forEach((n) => {
      if (!levels.has(n.id)) levels.set(n.id, 0)
    })

    // Build grouped map with fixed keys 0..maxLevels-1
    const grouped = new Map<number, string[]>()
    for (let l = 0; l < maxLevels; l++) grouped.set(l, [])
    levels.forEach((lvl, nid) => {
      const clamped = Math.max(0, Math.min(lvl, maxLevels - 1))
      grouped.get(clamped)!.push(nid)
    })

    // Compute percentage positions with side-by-side layout
    // First compute X anchors based on parents in previous level
    const anchors = new Map<string, number>()
    // Level 0: distribute evenly
    const rootIds = grouped.get(0) ?? []
    rootIds.forEach((id, idx) => {
      anchors.set(
        id,
        rootIds.length === 1 ? 50 : (idx * 100) / (rootIds.length - 1)
      )
    })
    // For each subsequent level, compute parent-anchored order
    for (let l = 1; l < maxLevels; l++) {
      const ids = grouped.get(l) ?? []
      const withAnchor = ids.map((nid) => {
        const parents = Array.from(incoming.get(nid) ?? []).filter(
          (pid) => (levels.get(pid) ?? 0) === l - 1
        )
        const parentAnchors = parents
          .map((p) => anchors.get(p))
          .filter((v) => typeof v === 'number') as number[]
        const anchor = parentAnchors.length
          ? parentAnchors.reduce((a, b) => a + b, 0) / parentAnchors.length
          : 50
        return { nid, anchor }
      })
      withAnchor.sort((a, b) => a.anchor - b.anchor)
      withAnchor.forEach((item, idx) => {
        const x =
          withAnchor.length === 1 ? 50 : (idx * 100) / (withAnchor.length - 1)
        anchors.set(item.nid, x)
      })
    }

    // Compute percentage positions by level
    const levelCount = maxLevels
    const minY = 10
    const maxY = 90
    const yStep = levelCount > 1 ? (maxY - minY) / (levelCount - 1) : 0

    const positioned: PositionedConcept[] = []
    nodes.forEach((n) => {
      const lvl = levels.get(n.id) ?? 0
      // Arrange side-by-side across the width using computed anchors
      const x = anchors.get(n.id) ?? 50
      const y = minY + yStep * lvl
      positioned.push({
        id: n.id,
        name: truncateWords(n.label, 5),
        level: lvl,
        x,
        y,
        description: n.description,
        connections: Array.from(outgoing.get(n.id) ?? []),
      })
    })

    // Filter edges to adjacent levels only
    const filteredEdges = edges.filter((e) => {
      const lf = levels.get(e.from)
      const lt = levels.get(e.to)
      if (lf == null || lt == null) return false
      return Math.abs(lf - lt) === 1
    })

    return {
      id,
      name: `Mapa: ${mapData.topic}`,
      class: 'Mapa Conceptual',
      concepts: positioned,
      edges: filteredEdges,
    } as const
  }, [id, mapData])

  function truncateWords(text: string, maxWords: number): string {
    const parts = (text ?? '').split(/\s+/)
    if (parts.length <= maxWords) return text
    return parts.slice(0, maxWords).join(' ') + '…'
  }

  const selectedConcept = conceptMap?.concepts.find(
    (c) => c.id === selectedNode
  )

  if (!conceptMap) {
    return (
      <main className='max-w-7xl mx-auto p-4'>
        <Button
          variant='ghost'
          onClick={() => router.push('/concept-maps')}
          className='mb-6'
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
            variant='ghost'
            onClick={() => router.push('/concept-maps')}
            className='mb-6'
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
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Concept Map Visualization */}
        <Card className='lg:col-span-2 bg-card border-border p-6'>
          <div
            className='relative rounded-lg overflow-hidden bg-secondary/20'
            style={{ height: '600px' }}
          >
            <ConceptMapFlow
              conceptMap={conceptMap}
              onSelectNode={setSelectedNode}
            />
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

function ConceptMapFlow({
  conceptMap,
  onSelectNode,
}: {
  conceptMap: {
    id: string
    name: string
    class: string
    concepts: PositionedConcept[]
    edges: { from: string; to: string; relation: string }[]
  }
  onSelectNode: (id: string) => void
}) {
  const canvasWidth = 1200
  const canvasHeight = 700
  const initialNodes = useMemo(
    () =>
      conceptMap.concepts.map((c) => ({
        id: c.id,
        position: {
          x: (c.x / 100) * canvasWidth,
          y: (c.y / 100) * canvasHeight,
        },
        data: { label: c.name },
        style: {
          border: '2px solid hsl(var(--primary) / 0.3)',
          background: 'hsl(var(--card))',
          color: 'hsl(var(--foreground))',
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          cursor: 'pointer',
        },
      })),
    [conceptMap]
  )

  const initialEdges = useMemo(() => {
    // Build one best edge per child based on closest parent X to reduce clutter
    const idToConcept = new Map(conceptMap.concepts.map((c) => [c.id, c]))
    const edgesByChild = new Map<string, typeof conceptMap.edges>()
    conceptMap.edges.forEach((e) => {
      const list = edgesByChild.get(e.to) ?? []
      list.push(e)
      edgesByChild.set(e.to, list)
    })

    const bestEdges: {
      id: string
      source: string
      target: string
      label?: string
    }[] = []
    conceptMap.concepts.forEach((child) => {
      if (child.level <= 0) return
      const candidates = edgesByChild.get(child.id) ?? []
      if (candidates.length === 0) return
      let best = candidates[0]
      let bestDx = Number.POSITIVE_INFINITY
      candidates.forEach((edge) => {
        const parent = idToConcept.get(edge.from)
        if (!parent) return
        const dx = Math.abs((parent.x ?? 50) - (child.x ?? 50))
        if (dx < bestDx) {
          bestDx = dx
          best = edge
        }
      })
      bestEdges.push({
        id: `${best.from}-${best.to}`,
        source: best.from,
        target: best.to,
        label: best.relation,
      })
    })

    return bestEdges.map((be) => ({
      id: be.id,
      source: be.source,
      target: be.target,
      label: be.label,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: 'hsl(var(--primary))', opacity: 0.45 },
      labelStyle: { fill: 'hsl(var(--muted-foreground))', fontSize: 10 },
    }))
  }, [conceptMap])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    setNodes(initialNodes)
  }, [initialNodes, setNodes])

  useEffect(() => {
    setEdges(initialEdges)
  }, [initialEdges, setEdges])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      minZoom={0.2}
      maxZoom={1.5}
      onNodeClick={(_, node) => onSelectNode(node.id)}
    >
      <Background
        gap={16}
        size={1}
      />
      <MiniMap
        pannable
        zoomable
      />
      <Controls />
    </ReactFlow>
  )
}
