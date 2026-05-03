import { z } from 'zod'

export const quizSchema = z.object({
  name: z.string().min(1, 'El nombre del quiz es obligatorio'),
  class: z.string().min(1, 'El nombre de la clase es obligatorio'),
  id: z.string().optional(),
  questions: z
    .array(
      z.object({
        id: z.union([z.string(), z.number()]).optional(),
        question: z.string().min(1, 'La pregunta no puede estar vacía'),
        // opción múltiple
        options: z
          .array(z.string().min(1, 'La opción no puede estar vacía'))
          .optional(),
        correctAnswer: z.number().int().nonnegative().optional(),
        // respuesta abierta
        modelAnswer: z.string().optional(),
      })
    )
    .min(1, 'El quiz debe tener al menos una pregunta'),
})

export type QuizSchema = z.infer<typeof quizSchema>
export type QuestionType = 'multiple' | 'open'
export type StoredQuiz = QuizSchema & { questionType?: QuestionType }
