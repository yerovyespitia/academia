import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    const result = streamText({
      model: openai('gpt-5-nano'),
      prompt,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Error streaming text: ', error)
    return new Response('Error streaming text', { status: 500 })
  }
}
