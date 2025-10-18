import { z } from 'zod'

export const conceptMapSchema = z.object({
  topic: z.string(),
  nodes: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      description: z.string().optional(),
    })
  ),
  edges: z.array(
    z.object({
      from: z.string(),
      to: z.string(),
      relation: z.string(),
    })
  ),
})

export type ConceptMapSchema = z.infer<typeof conceptMapSchema>
