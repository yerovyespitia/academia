import { UIMessage, streamText, convertToModelMessages } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json()

    const result = streamText({
      model: openai('gpt-5-nano'),
      messages: [
        {
          role: 'system',
          content:
            'Eres una asistente de virtual educativa que responde preguntas sobre todo lo que tenga que ver con ayudar al estudiante con lo que neecsite sobre su carrera. Siempre que sea sobre el historial académico del usuario sé breve y concisa con las respuestas.',
        },
        ...convertToModelMessages(messages),
      ],
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Error streaming chat completion: ', error)
    return new Response('Failed to stream chat completion', { status: 500 })
  }
}
