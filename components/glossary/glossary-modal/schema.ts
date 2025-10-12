import { z } from 'zod'

export const glossarySchema = z.object({
  class: z.string(),
  terms: z.array(
    z.object({
      name: z.string(),
      definition: z.string(),
      example: z.string(),
      topic: z.string(),
    })
  ),
})

export type GlossarySchema = z.infer<typeof glossarySchema>
