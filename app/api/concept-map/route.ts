import { streamObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { conceptMapSchema } from '@/components/concept-map/schema'

export async function POST(req: Request) {
  try {
    const { topic, depth = 3, subtopics = [] } = await req.json()

    const subtopicsList = Array.isArray(subtopics) ? subtopics.join(', ') : ''

    const result = streamObject({
      model: openai('gpt-5-nano'),
      schema: conceptMapSchema,
      prompt: `Genera un mapa conceptual en formato JSON siguiendo el siguiente esquema:

{
  "topic": "${topic}",
  "nodes": [
    { "id": "string", "label": "string", "description": "string", "level": number }
  ],
  "edges": [
    { "from": "string", "to": "string", "relation": "string" }
  ]
}

Reglas de organización:
1. El campo "level" define la jerarquía y está acotado a 0..${Math.max(
        0,
        Number(depth) - 1
      )}:
   - 0 → tema central (solo uno)
   - 1 → categorías principales o conceptos clave
   - 2 → subtemas importantes o ejemplos
   - 3 → conceptos avanzados o casos específicos (si depth>=4)
2. Cada nodo debe conectarse SOLO con nodos de nivel inmediatamente superior o inferior (por ejemplo, nivel 0 → 1, 1 → 2), sin saltos de nivel.
3. Evita ciclos y conexiones cruzadas que rompan la jerarquía.
4. Usa relaciones breves y claras en "relation" (ej.: "se compone de", "depende de", "ejemplo de").
5. Debe poder representarse en capas verticales sin superposiciones.
6. Crea entre 8 y 15 nodos, balanceados entre niveles hasta un máximo de ${depth} niveles.
7. Limita cada "label" a un máximo de 5 palabras.
8. Si hay subtemas relevantes, inclúyelos: ${subtopicsList}.

Responde únicamente con el objeto JSON válido que cumpla con este formato y reglas. Asegurate de que la descripción sea simple, no demasiado corta, donde se explica el concepto, puedes usar ejemplos si lo ves necesario.`,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Error generating concept map:', error)
    return new Response('Error generating concept map', { status: 500 })
  }
}
