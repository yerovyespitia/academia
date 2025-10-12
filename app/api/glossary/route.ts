import { streamObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { glossarySchema } from '@/components/glossary/glossary-modal/schema'

export async function POST(req: Request) {
  try {
    const { className, topics, termCount } = await req.json()

    const topicsList = Array.isArray(topics) ? topics.join(', ') : ''

    const result = streamObject({
      model: openai('gpt-5-nano'),
      schema: glossarySchema,
      prompt: `Genera un glosario en español para la clase "${className}".
Incluye exactamente ${termCount} términos. Usa estos temas como guía: ${topicsList}.
Devuelve únicamente el objeto que cumpla con el esquema dado y establece el campo "class" igual a "${className}".`,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Error generating glossary: ', error)
    return new Response('Error generating glossary', { status: 500 })
  }
}
