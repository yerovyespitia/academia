import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

const sectionSchema = z.object({
  available: z.boolean(),
  content: z.string(),
})

const schema = z.object({
  studentInfo: z.object({
    nombre: z.string(),
    institucion: z.string(),
    grado: z.string(),
    anio: z.string(),
    tipoDiscapacidad: z.enum([
      'cognitiva',
      'fisica-motora',
      'visual',
      'auditiva',
      'psicosocial',
      'multiple',
      'otra',
    ]),
    descripcionDiscapacidad: z.string(),
    docente: z.string(),
  }),
  sections: z.object({
    diagnostico: sectionSchema,
    valoracionPedagogica: sectionSchema,
    observacionAula: sectionSchema,
    historialAcademico: sectionSchema,
    entrevistaFamilia: sectionSchema,
    caracterizacion: sectionSchema,
    mallaCurricular: sectionSchema,
    peiLineamientos: sectionSchema,
  }),
})

export async function POST() {
  try {
    const result = await generateObject({
      model: openai('gpt-4o'),
      schema,
      prompt: `Genera un caso de estudiante colombiano completamente ficticio y realista para un PIAR (Plan Individual de Apoyos y Ajustes Razonables) según el Decreto 1421 de 2017.

El caso debe ser coherente e internamente consistente: toda la información de las diferentes fuentes debe referirse al mismo estudiante y complementarse entre sí.

Requisitos:
- Usa nombres colombianos reales (nombre y apellidos del estudiante y del docente)
- Usa nombres de instituciones educativas colombianas reales o verosímiles (con municipio y departamento)
- El año debe ser ${new Date().getFullYear()}
- Elige un tipo de discapacidad específico y detállalo de forma clínica y pedagógica realista
- Para cada sección con available: true, escribe contenido detallado (mínimo 150 palabras) que sea coherente con el resto del caso
- Todas las secciones deben tener available: true con contenido detallado
- El contenido de cada sección debe estar escrito como si fuera un docente o profesional real quien lo redactó, en español colombiano formal`,
    })

    return Response.json(result.object)
  } catch (error) {
    console.error('Error generating demo case:', error)
    return new Response('Error al generar el caso de ejemplo', { status: 500 })
  }
}
