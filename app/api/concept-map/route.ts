import { streamObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { conceptMapSchema } from '@/components/concept-map/schema'

export async function POST(req: Request) {
  try {
    const { topic, depth = 2, subtopics = [] } = await req.json()

    const subtopicsList = Array.isArray(subtopics) ? subtopics.join(', ') : ''

    const result = streamObject({
      model: openai('gpt-5-nano'),
      schema: conceptMapSchema,
      prompt: `Genera un mapa conceptual en formato JSON con el siguiente esquema:
- topic: "${topic}"
- nodes: lista de conceptos principales y secundarios (profundidad máxima ${depth})
- edges: define las relaciones entre nodos con un texto claro en el campo "relation".
Si hay subtemas relevantes, inclúyelos: ${subtopicsList}.
Responde **solo con un objeto JSON válido** que cumpla con el esquema.`,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Error generating concept map:', error)
    return new Response('Error generating concept map', { status: 500 })
  }
}
