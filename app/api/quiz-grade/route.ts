import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

const gradeSchema = z.object({
  score: z.enum(['correct', 'partial', 'incorrect']),
  grade: z.number().min(0).max(1),
  feedback: z.string(),
})

export async function POST(req: Request) {
  try {
    const { question, modelAnswer, userAnswer, className } = await req.json()

    if (!question || !modelAnswer || !userAnswer?.trim()) {
      return Response.json(
        { score: 'incorrect', grade: 0, feedback: 'No se proporcionó respuesta.' },
        { status: 200 }
      )
    }

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: gradeSchema,
      prompt: `Eres un profesor evaluando una respuesta de un estudiante${className ? ` de la clase "${className}"` : ''}.

Pregunta: ${question}
Respuesta modelo: ${modelAnswer}
Respuesta del estudiante: ${userAnswer}

Evalúa la respuesta del estudiante comparándola con la respuesta modelo. Ten en cuenta:
- "correct": la respuesta es correcta o esencialmente equivalente a la modelo (grade: 0.9–1.0)
- "partial": la respuesta tiene parte de la idea correcta pero le faltan elementos clave (grade: 0.4–0.8)
- "incorrect": la respuesta es incorrecta, irrelevante o no demuestra comprensión (grade: 0.0–0.3)

El feedback debe ser breve, en español, constructivo y explicar qué estuvo bien y qué faltó.`,
    })

    return Response.json(object)
  } catch (error) {
    console.error('Error grading answer:', error)
    return new Response('Error al calificar la respuesta', { status: 500 })
  }
}
