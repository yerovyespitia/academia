import { experimental_transcribe as transcribe, generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return new Response('No audio file provided', { status: 400 })
    }

    const arrayBuffer = await audioFile.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    const transcript = await transcribe({
      model: openai.transcription('whisper-1'),
      audio: uint8Array,
    })

    const { text: keyIdeas } = await generateText({
      model: openai('gpt-4o-mini'),
      messages: [
        {
          role: 'system',
          content: 'Extrae las ideas más importantes del siguiente texto con datos puntuales. Identifica conceptos clave, definiciones, fechas, datos específicos y conclusiones relevantes. Organiza la información de forma clara y estructurada en español colombiano. No transcribas todo textualmente, sintetiza y prioriza lo más valioso para estudiar. Responde únicamente con el contenido extraído, sin frases introductorias.',
        },
        {
          role: 'user',
          content: transcript.text,
        },
      ],
    })

    return Response.json({ ...transcript, text: keyIdeas })
  } catch (error) {
    console.error('Error transcribing audio: ', error)
    return new Response('Failed to transcribe audio', { status: 500 })
  }
}
