import { streamObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { quizSchema } from '@/components/quiz-generator/quiz-modal/schema'

export async function POST(req: Request) {
  try {
    const { className, quizName, questionCount, topics } = await req.json()

    const topicsList = Array.isArray(topics) ? topics.join(', ') : ''

    const result = streamObject({
      model: openai('gpt-5-nano'),
      schema: quizSchema,
      prompt: `Genera un objeto de quiz en formato JSON con el siguiente esquema:
- id: un identificador único en formato "quiz-<timestamp>"
- name: "${quizName}"
- class: "${className}"
- questions: una lista de ${questionCount} preguntas.
Cada pregunta debe tener los siguientes campos:
  - id (número entero incremental)
  - question (enunciado claro y conciso en español)
  - options (arreglo con cuatro posibles respuestas)
  - correctAnswer (índice de la respuesta correcta, 0–3)
Usa los siguientes temas como guía: ${topicsList}.
Responde **solo con un objeto JSON válido** que cumpla con el esquema.`,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Error generating quiz:', error)
    return new Response('Error generating quiz', { status: 500 })
  }
}
