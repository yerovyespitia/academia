'use client'

import React, { use, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Info, Download, FileImage } from 'lucide-react'
import type { ConceptMapSchema } from '@/components/concept-map/schema'

const LEVEL_COLORS = [
  { bg: '#4f46e5', text: '#ffffff', border: '#3730a3' },
  { bg: '#0891b2', text: '#ffffff', border: '#0e7490' },
  { bg: '#059669', text: '#ffffff', border: '#047857' },
  { bg: '#d97706', text: '#ffffff', border: '#b45309' },
  { bg: '#db2777', text: '#ffffff', border: '#be185d' },
]
function levelColor(level: number) {
  return LEVEL_COLORS[Math.min(level, LEVEL_COLORS.length - 1)]
}

const NODE_W = 150
const NODE_H = 42
const H_GAP = 60
const V_GAP = 120
const PAD = 80

type Concept = {
  id: string
  name: string
  level: number
  x: number
  y: number
  description?: string
  connections: string[]
}

type Edge = { from: string; to: string; relation: string }

function buildLayout(mapData: ConceptMapSchema, maxLevels: number) {
  const { nodes, edges } = mapData

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

  const topicRoot = nodes.find(
    (n) => n.label.trim().toLowerCase() === mapData.topic.trim().toLowerCase()
  )?.id
  const zeroIn = nodes.filter((n) => (indegree.get(n.id) ?? 0) === 0)
  const byOut = (a: string, b: string) =>
    (outgoing.get(b)?.size ?? 0) - (outgoing.get(a)?.size ?? 0)
  const root =
    topicRoot ??
    [...zeroIn].sort((a, b) => byOut(a.id, b.id))[0]?.id ??
    [...nodes].sort((a, b) => byOut(a.id, b.id))[0]?.id ??
    nodes[0]?.id

  const levels = new Map<string, number>()
  const hasProvided = nodes.some((n) => typeof (n as { level?: number }).level === 'number')
  if (hasProvided) {
    nodes.forEach((n) => {
      const l = (n as { level?: number }).level
      if (typeof l === 'number') levels.set(n.id, Math.max(0, Math.min(l, maxLevels - 1)))
    })
  } else {
    const queue: { id: string; level: number }[] = []
    if (root) { levels.set(root, 0); queue.push({ id: root, level: 0 }) }
    while (queue.length) {
      const { id: cur, level } = queue.shift()!
      if (level >= maxLevels - 1) continue
      for (const nb of outgoing.get(cur) ?? []) {
        if (!levels.has(nb)) {
          levels.set(nb, level + 1)
          queue.push({ id: nb, level: level + 1 })
        }
      }
    }
  }
  nodes.forEach((n) => { if (!levels.has(n.id)) levels.set(n.id, maxLevels - 1) })

  const grouped = new Map<number, string[]>()
  for (let l = 0; l < maxLevels; l++) grouped.set(l, [])
  levels.forEach((lvl, nid) => {
    grouped.get(Math.max(0, Math.min(lvl, maxLevels - 1)))!.push(nid)
  })

  const xPos = new Map<string, number>()
  for (let l = 0; l < maxLevels; l++) {
    const ids = grouped.get(l) ?? []
    const totalW = ids.length * NODE_W + (ids.length - 1) * H_GAP
    const startX = totalW / 2 - NODE_W / 2
    ids.forEach((nid, idx) => xPos.set(nid, idx * (NODE_W + H_GAP) - startX + totalW / 2))
  }

  // Compute canvas width based on widest level
  let canvasContentW = 0
  for (let l = 0; l < maxLevels; l++) {
    const ids = grouped.get(l) ?? []
    const w = ids.length * NODE_W + (ids.length - 1) * H_GAP
    if (w > canvasContentW) canvasContentW = w
  }

  // Center all levels relative to canvas
  const canvasW = canvasContentW + PAD * 2
  for (let l = 0; l < maxLevels; l++) {
    const ids = grouped.get(l) ?? []
    const rowW = ids.length * NODE_W + (ids.length - 1) * H_GAP
    const rowStart = (canvasW - rowW) / 2
    ids.forEach((nid, idx) => xPos.set(nid, rowStart + idx * (NODE_W + H_GAP) + NODE_W / 2))
  }

  const concepts: Concept[] = nodes.map((n) => {
    const lvl = levels.get(n.id) ?? 0
    return {
      id: n.id,
      name: n.label,
      level: lvl,
      x: xPos.get(n.id) ?? canvasW / 2,
      y: PAD + lvl * (NODE_H + V_GAP) + NODE_H / 2,
      description: n.description,
      connections: Array.from(outgoing.get(n.id) ?? []),
    }
  })

  // If no edges from API, generate fallback edges from hierarchy
  let finalEdges: Edge[] = edges
  if (edges.length === 0) {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]))
    finalEdges = []
    concepts.forEach((child) => {
      if (child.level === 0) return
      // find closest parent at level-1 by X distance
      const parents = concepts.filter((c) => c.level === child.level - 1)
      if (parents.length === 0) return
      const closest = parents.reduce((a, b) =>
        Math.abs(a.x - child.x) < Math.abs(b.x - child.x) ? a : b
      )
      finalEdges.push({ from: closest.id, to: child.id, relation: '' })
    })
  }

  const canvasH = PAD + maxLevels * (NODE_H + V_GAP) + PAD

  return { concepts, edges: finalEdges, canvasW, canvasH }
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
  const [maxLevels, setMaxLevels] = useState(3)
  const svgRef = useRef<SVGSVGElement>(null)

  const downloadAsPng = () => {
    const svg = svgRef.current
    if (!svg) return
    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svg)
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const scale = 2
      canvas.width = svg.clientWidth * scale
      canvas.height = svg.clientHeight * scale
      const ctx = canvas.getContext('2d')!
      ctx.scale(scale, scale)
      ctx.fillStyle = '#fafafa'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      const a = document.createElement('a')
      a.download = `mapa-${mapData?.topic ?? 'conceptual'}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    }
    img.src = url
  }

  const downloadAsPdf = () => {
    const svg = svgRef.current
    if (!svg) return
    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svg)
    const topic = mapData?.topic ?? 'Mapa Conceptual'
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head><title>${topic}</title><style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { background: #fafafa; display: flex; flex-direction: column; align-items: center; padding: 24px; font-family: sans-serif; }
      h2 { margin-bottom: 16px; font-size: 18px; color: #1f2937; }
      svg { max-width: 100%; height: auto; }
      @media print { body { padding: 8px; } h2 { font-size: 14px; } @page { margin: 1cm; } }
    </style></head><body>
      <h2>${topic}</h2>
      ${svgStr}
      <script>window.onload = () => { setTimeout(() => { window.print() }, 300) }<\/script>
    </body></html>`)
    win.document.close()
  }

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`concept-map:${id}`)
      if (stored) {
        const parsed = JSON.parse(stored) as { map: ConceptMapSchema; depth?: number } | ConceptMapSchema
        if ('map' in (parsed as object)) {
          const w = parsed as { map: ConceptMapSchema; depth?: number }
          if (w.map?.nodes?.length) {
            setMapData(w.map)
            if (w.depth) setMaxLevels(w.depth)
          }
        } else {
          const m = parsed as ConceptMapSchema
          if (m?.nodes?.length) setMapData(m)
        }
      }
    } catch {}
  }, [id])

  const layout = useMemo(
    () => (mapData ? buildLayout(mapData, maxLevels) : null),
    [mapData, maxLevels]
  )

  const selectedConcept = layout?.concepts.find((c) => c.id === selectedNode)

  if (!layout) {
    return (
      <main className='max-w-7xl mx-auto p-4'>
        <Button variant='ghost' onClick={() => router.push('/concept-maps')} className='mb-6'>
          <ArrowLeft className='w-4 h-4 mr-2' />
          Volver
        </Button>
        <Card className='p-8 bg-card border-border'>
          <p className='text-muted-foreground'>
            No se encontró el mapa. Vuelve a generar desde la sección de mapas conceptuales.
          </p>
        </Card>
      </main>
    )
  }

  return (
    <main className='max-w-7xl mx-auto p-4'>
      <div className='flex items-center gap-4 mb-6'>
        <Button variant='ghost' onClick={() => router.push('/concept-maps')}>
          <ArrowLeft className='w-4 h-4 mr-2' />
          Volver
        </Button>
        <div className='flex-1'>
          <h1 className='text-2xl font-bold text-foreground'>
            Mapa: {mapData?.topic}
          </h1>
          <p className='text-sm text-muted-foreground'>Mapa Conceptual</p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' onClick={downloadAsPng}>
            <FileImage className='w-4 h-4 mr-2' />
            Imagen
          </Button>
          <Button variant='outline' size='sm' onClick={downloadAsPdf}>
            <Download className='w-4 h-4 mr-2' />
            PDF
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <Card className='lg:col-span-2 bg-card border-border overflow-hidden'>
          <ConceptMapSVG
            layout={layout}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
            svgRef={svgRef}
          />
        </Card>

        <Card className='bg-card border-border p-6'>
          <div className='flex items-center gap-2 mb-4'>
            <Info className='w-5 h-5 text-primary' />
            <h2 className='text-lg font-semibold text-foreground'>Detalles del Concepto</h2>
          </div>

          {selectedConcept ? (
            <div className='space-y-4'>
              <div>
                <div
                  className='inline-block px-4 py-2 rounded-full text-white font-bold mb-3'
                  style={{ background: levelColor(selectedConcept.level).bg }}
                >
                  {selectedConcept.name}
                </div>
                <div><Badge variant='outline'>Nivel {selectedConcept.level + 1}</Badge></div>
              </div>
              <div className='bg-secondary/30 rounded-lg p-4 border border-border'>
                <p className='text-sm text-foreground leading-relaxed'>
                  {selectedConcept.description ?? 'Sin descripción'}
                </p>
              </div>
              <div>
                <p className='text-sm font-medium text-foreground mb-2'>Conexiones</p>
                <div className='space-y-2'>
                  {selectedConcept.connections.length > 0 ? (
                    selectedConcept.connections.map((connId) => {
                      const conn = layout.concepts.find((c) => c.id === connId)
                      return (
                        <div
                          key={connId}
                          className='rounded p-2 border border-border cursor-pointer hover:border-primary/50 transition-colors flex items-center gap-2'
                          onClick={() => setSelectedNode(connId)}
                        >
                          <div
                            className='w-2.5 h-2.5 rounded-full flex-shrink-0'
                            style={{ background: levelColor(conn?.level ?? 0).bg }}
                          />
                          <p className='text-sm text-foreground'>{conn?.name}</p>
                        </div>
                      )
                    })
                  ) : (
                    <p className='text-sm text-muted-foreground'>No hay conexiones directas</p>
                  )}
                </div>
              </div>
              <div className='pt-4 border-t border-border'>
                <p className='text-xs text-muted-foreground mb-2'>Estadísticas</p>
                <div className='grid grid-cols-2 gap-2'>
                  <div className='bg-secondary/30 rounded p-2 text-center'>
                    <p className='text-xs text-muted-foreground'>Nivel</p>
                    <p className='text-lg font-bold text-foreground'>{selectedConcept.level + 1}</p>
                  </div>
                  <div className='bg-secondary/30 rounded p-2 text-center'>
                    <p className='text-xs text-muted-foreground'>Conexiones</p>
                    <p className='text-lg font-bold text-foreground'>{selectedConcept.connections.length}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className='text-center py-12'>
              <div className='w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mx-auto mb-4'>
                <Info className='w-8 h-8 text-muted-foreground' />
              </div>
              <p className='text-muted-foreground'>Selecciona un concepto para ver sus detalles</p>
            </div>
          )}
        </Card>
      </div>
    </main>
  )
}

function ConceptMapSVG({
  layout,
  selectedNode,
  onSelectNode,
  svgRef,
}: {
  layout: ReturnType<typeof buildLayout>
  selectedNode: string | null
  onSelectNode: (id: string) => void
  svgRef?: React.RefObject<SVGSVGElement | null>
}) {
  const { concepts, edges, canvasW, canvasH } = layout
  const nodeMap = new Map(concepts.map((c) => [c.id, c]))

  return (
    <div
      style={{
        width: '100%',
        height: 580,
        overflow: 'auto',
        background: '#fafafa',
        position: 'relative',
      }}
    >
      <svg
        ref={svgRef}
        width={Math.max(canvasW, 600)}
        height={canvasH}
        style={{ display: 'block' }}
      >
        <defs>
          <marker
            id='arrow'
            markerWidth='8'
            markerHeight='8'
            refX='6'
            refY='3'
            orient='auto'
          >
            <path d='M0,0 L0,6 L8,3 z' fill='#6366f1' />
          </marker>
        </defs>

        {/* Edges — grouped by (from, relation) to avoid repeated labels */}
        {(() => {
          const groups: Array<{ from: string; relation: string; tos: string[] }> = []
          const groupIdx = new Map<string, number>()
          edges.forEach((edge) => {
            const key = `${edge.from}|||${edge.relation}`
            if (edge.relation && groupIdx.has(key)) {
              groups[groupIdx.get(key)!].tos.push(edge.to)
            } else {
              groupIdx.set(key, groups.length)
              groups.push({ from: edge.from, relation: edge.relation, tos: [edge.to] })
            }
          })

          return groups.map((group, gi) => {
            const from = nodeMap.get(group.from)
            if (!from) return null
            const targets = group.tos.map((id) => nodeMap.get(id)).filter((t): t is Concept => !!t)
            if (targets.length === 0) return null

            const isHub = targets.length > 1 && !!group.relation

            if (!isHub) {
              const to = targets[0]
              const spread = NODE_W * 0.42
              const totalRange = canvasW || 1
              const fraction = Math.max(-1, Math.min(1, (to.x - from.x) / (totalRange * 0.5)))
              const x1 = from.x + fraction * spread
              const y1 = from.y + NODE_H / 2
              const x2 = to.x - fraction * spread * 0.3
              const y2 = to.y - NODE_H / 2
              const mx = (x1 + x2) / 2
              const my = (y1 + y2) / 2
              const cp1y = y1 + (y2 - y1) * 0.45
              const cp2y = y2 - (y2 - y1) * 0.45
              const labelText = group.relation
                ? group.relation.length > 14 ? group.relation.slice(0, 14) + '…' : group.relation
                : null
              const labelW = labelText ? Math.min(labelText.length * 7 + 16, 110) : 0
              return (
                <g key={gi}>
                  <path
                    d={`M ${x1} ${y1} C ${x1} ${cp1y}, ${x2} ${cp2y}, ${x2} ${y2}`}
                    stroke='#6366f1' strokeWidth={1.8} fill='none' markerEnd='url(#arrow)'
                  />
                  {labelText && (
                    <>
                      <rect x={mx - labelW / 2} y={my - 9} width={labelW} height={18} rx={4} fill='#e0e7ff' />
                      <text x={mx} y={my + 4} textAnchor='middle' fontSize={9} fill='#3730a3' fontWeight={600} fontFamily='sans-serif'>
                        {labelText}
                      </text>
                    </>
                  )}
                </g>
              )
            }

            // Hub layout: single shared label fans out to all targets
            const hubX = targets.reduce((s, t) => s + t.x, 0) / targets.length
            const minTargetTopY = Math.min(...targets.map((t) => t.y - NODE_H / 2))
            const srcBottomY = from.y + NODE_H / 2
            const hubY = (srcBottomY + minTargetTopY) / 2
            const labelText = group.relation.length > 14 ? group.relation.slice(0, 14) + '…' : group.relation
            const labelW = Math.min(labelText.length * 7 + 16, 110)
            const lhh = 9 // label half-height

            return (
              <g key={gi}>
                <path
                  d={`M ${from.x} ${srcBottomY} L ${hubX} ${hubY - lhh}`}
                  stroke='#6366f1' strokeWidth={1.8} fill='none'
                />
                <rect x={hubX - labelW / 2} y={hubY - lhh} width={labelW} height={lhh * 2} rx={4} fill='#e0e7ff' />
                <text x={hubX} y={hubY + 4} textAnchor='middle' fontSize={9} fill='#3730a3' fontWeight={600} fontFamily='sans-serif'>
                  {labelText}
                </text>
                {targets.map((to) => (
                  <path
                    key={to.id}
                    d={`M ${hubX} ${hubY + lhh} L ${to.x} ${to.y - NODE_H / 2}`}
                    stroke='#6366f1' strokeWidth={1.8} fill='none' markerEnd='url(#arrow)'
                  />
                ))}
              </g>
            )
          })
        })()}

        {/* Nodes */}
        {concepts.map((concept) => {
          const colors = levelColor(concept.level)
          const isSelected = selectedNode === concept.id
          const isRoot = concept.level === 0
          const rx = NODE_H / 2

          return (
            <g
              key={concept.id}
              onClick={() => onSelectNode(concept.id)}
              style={{ cursor: 'pointer' }}
            >
              {/* Selection ring */}
              {isSelected && (
                <rect
                  x={concept.x - NODE_W / 2 - 4}
                  y={concept.y - NODE_H / 2 - 4}
                  width={NODE_W + 8}
                  height={NODE_H + 8}
                  rx={rx + 4}
                  fill='none'
                  stroke={colors.bg}
                  strokeWidth={3}
                  opacity={0.5}
                />
              )}
              <rect
                x={concept.x - NODE_W / 2}
                y={concept.y - NODE_H / 2}
                width={NODE_W}
                height={NODE_H}
                rx={rx}
                fill={colors.bg}
                stroke={isSelected ? '#ffffff' : colors.border}
                strokeWidth={isSelected ? 2.5 : 1.5}
                filter={isRoot ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'}
              />
              <text
                x={concept.x}
                y={concept.y + 4}
                textAnchor='middle'
                fontSize={isRoot ? 13 : 11}
                fontWeight={isRoot ? 700 : 500}
                fill={colors.text}
                fontFamily='sans-serif'
              >
                {concept.name.length > 18 ? concept.name.slice(0, 18) + '…' : concept.name}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
