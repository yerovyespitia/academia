import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST() {
  const { text } = await generateText({
    model: openai('gpt-5.4-mini'),
    prompt: 'Explain what an LLM is',
  })

  return Response.json({ text })
}
