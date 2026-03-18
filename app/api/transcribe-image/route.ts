import { UIMessage, streamText, convertToModelMessages } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json()

    const result = streamText({
      model: openai('gpt-5.4-mini'),
      system:
        'Transcribe el texto de la imagen exactamente como aparece, sin frases introductorias, comentarios ni explicaciones previas. Responde únicamente con el contenido transcrito.',
      messages: convertToModelMessages(messages),
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Error streaming chat completion: ', error)
    return new Response('Failed to stream chat completion', { status: 500 })
  }
}
