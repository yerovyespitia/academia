import { z } from 'zod'

export const quizSchema = z.object({
  id: z.string().min(1, 'El id del quiz es obligatorio'),
  name: z.string().min(1, 'El nombre del quiz es obligatorio'),
  class: z.string().min(1, 'El nombre de la clase es obligatorio'),
  questions: z
    .array(
      z.object({
        id: z.number().int().nonnegative(),
        question: z.string().min(1, 'La pregunta no puede estar vacía'),
        options: z
          .array(z.string().min(1, 'La opción no puede estar vacía'))
          .min(2, 'Debe haber al menos dos opciones por pregunta'),
        correctAnswer: z.number().int().nonnegative(),
      })
    )
    .min(5, 'El quiz debe tener al menos 5 preguntas'),
})

export type QuizSchema = z.infer<typeof quizSchema>
