import { UIMessage, streamText, convertToModelMessages } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json()

    const result = streamText({
      model: openai('gpt-5.4-mini'),
      system:
        'Analiza el contenido de la imagen y extrae las ideas más importantes con datos puntuales. Identifica conceptos clave, definiciones, fechas, fórmulas, datos específicos y cualquier información relevante para estudiar. Organiza la información de forma clara y estructurada. No transcribas todo textualmente, sintetiza y prioriza lo más valioso. Responde únicamente con el contenido extraído, sin frases introductorias ni comentarios.',
      messages: convertToModelMessages(messages),
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Error streaming chat completion: ', error)
    return new Response('Failed to stream chat completion', { status: 500 })
  }
}
