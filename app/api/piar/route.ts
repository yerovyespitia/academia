import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

interface StudentInfo {
  nombre: string
  institucion: string
  grado: string
  anio: string
  tipoDiscapacidad: string
  descripcionDiscapacidad: string
  docente: string
}

interface SectionData {
  available: boolean
  content?: string
}

interface Sections {
  diagnostico: SectionData
  valoracionPedagogica: SectionData
  observacionAula: SectionData
  historialAcademico: SectionData
  entrevistaFamilia: SectionData
  caracterizacion: SectionData
  mallaCurricular: SectionData
  peiLineamientos: SectionData
}

function buildSectionPrompt(sections: Sections): string {
  const sectionMeta = [
    { key: 'diagnostico', label: 'DIAGNÓSTICO MÉDICO O PSICOLÓGICO', source: 'diagnóstico médico o psicológico' },
    { key: 'valoracionPedagogica', label: 'VALORACIÓN PEDAGÓGICA', source: 'valoración pedagógica' },
    { key: 'observacionAula', label: 'OBSERVACIÓN EN EL AULA', source: 'observación en el aula' },
    { key: 'historialAcademico', label: 'HISTORIAL ACADÉMICO', source: 'historial académico' },
    { key: 'entrevistaFamilia', label: 'ENTREVISTA CON LA FAMILIA', source: 'entrevista con la familia' },
    { key: 'caracterizacion', label: 'CARACTERIZACIÓN', source: 'caracterización del estudiante' },
    { key: 'mallaCurricular', label: 'MALLA CURRICULAR', source: 'malla curricular' },
    { key: 'peiLineamientos', label: 'PEI/LINEAMIENTOS', source: 'PEI o lineamientos institucionales' },
  ]

  return sectionMeta
    .map(({ key, label, source }) => {
      const section = sections[key as keyof Sections]
      if (section.available && section.content) {
        return `[${label}]\nEstado: DISPONIBLE\nContenido: ${section.content}`
      }
      return `[${label}]\nEstado: NO DISPONIBLE\nFuente requerida: ${source}`
    })
    .join('\n\n')
}

const piarSchema = z.object({
  identificacion: z.string().describe('Sección 1: Identificación completa del estudiante con nombre, institución, grado y otros datos de identificación relevantes'),
  condicionBarreras: z.string().describe('Sección 2: Descripción detallada de la condición de discapacidad y las barreras para el aprendizaje y la participación'),
  fortalezas: z.string().describe('Sección 3: Fortalezas, habilidades, intereses y potencialidades identificadas en el estudiante'),
  ajustesRazonables: z.string().describe('Sección 4: Ajustes razonables requeridos por área o asignatura. Detalla cada área con sus respectivos ajustes'),
  metas: z.string().describe('Sección 5: Metas de aprendizaje y logros esperados para el período académico'),
  estrategias: z.string().describe('Sección 6: Estrategias pedagógicas diferenciadas y metodologías de enseñanza recomendadas'),
  recursos: z.string().describe('Sección 7: Recursos humanos, tecnológicos, físicos y de apoyo necesarios para la implementación'),
  evaluacion: z.string().describe('Sección 8: Sistema de evaluación diferenciada, criterios y formas de valoración del aprendizaje'),
  compromisoInstitucion: z.string().describe('Compromisos específicos y concretos de la institución educativa'),
  compromisoFamilia: z.string().describe('Compromisos específicos y concretos de la familia o cuidadores'),
  compromisoEstudiante: z.string().describe('Compromisos del propio estudiante según su capacidad y nivel de desarrollo'),
  cronograma: z.string().describe('Sección 10: Cronograma de seguimiento con actividades, responsables y fechas aproximadas'),
})

export type PIARData = z.infer<typeof piarSchema>

export async function POST(req: Request) {
  try {
    const { studentInfo, sections }: { studentInfo: StudentInfo; sections: Sections } = await req.json()

    const userPrompt = `DATOS DEL ESTUDIANTE:
Nombre: ${studentInfo.nombre}
Institución: ${studentInfo.institucion}
Grado: ${studentInfo.grado}
Año: ${studentInfo.anio}
Tipo de discapacidad: ${studentInfo.tipoDiscapacidad}
Descripción: ${studentInfo.descripcionDiscapacidad}
Docente responsable: ${studentInfo.docente}

FUENTES DE INFORMACIÓN:
${buildSectionPrompt(sections)}`

    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: piarSchema,
      system: `Eres un experto en educación inclusiva colombiana y elaboración de PIARs según el Decreto 1421 de 2017. Genera cada sección con redacción formal y profesional en español colombiano. Para secciones sin información disponible escribe: "[Pendiente: Se requiere {fuente} para completar esta sección]". No inventes datos clínicos ni diagnósticos. Usa texto plano con saltos de línea simples entre párrafos. No uses markdown ni asteriscos.`,
      prompt: userPrompt,
    })

    return Response.json(result.object)
  } catch (error) {
    console.error('Error generating PIAR:', error)
    return new Response('Error al generar el PIAR', { status: 500 })
  }
}
