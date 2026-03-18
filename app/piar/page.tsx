'use client'

import { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Sparkles, Loader2, CheckCircle2, AlertTriangle, FileUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import type { PIARData } from '@/components/piar-document'

const PiarViewer = dynamic(() => import('@/components/piar-viewer'), {
  ssr: false,
  loading: () => (
    <div className='flex items-center justify-center h-64'>
      <Loader2 className='size-6 animate-spin text-[#1a4d2e]/40' />
    </div>
  ),
})
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
  content: string
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

const SECTION_META = [
  {
    key: 'diagnostico',
    title: 'Diagnóstico médico o psicológico',
    description: 'Informe de un profesional de salud que describe la condición del estudiante.',
    whyItMatters: 'Permite entender la base clínica de las necesidades de apoyo y ajuste.',
    howToObtain: 'Solicitar a la familia el informe del médico, neuropediatra, psicólogo o terapeuta que atiende al estudiante. Debe estar firmado por el profesional.',
    placeholder: 'Pega aquí el contenido del diagnóstico o un resumen del mismo...',
  },
  {
    key: 'valoracionPedagogica',
    title: 'Valoración pedagógica del docente',
    description: 'Evaluación realizada por el docente sobre el desempeño académico y social del estudiante.',
    whyItMatters: 'Es la base para identificar barreras y fortalezas en el contexto escolar.',
    howToObtain: 'El docente de apoyo o director de grupo debe elaborar este documento observando al estudiante en diferentes actividades académicas y describiendo su nivel de desempeño.',
    placeholder: 'Describe el desempeño académico y social del estudiante según tu observación...',
  },
  {
    key: 'observacionAula',
    title: 'Observación en el aula',
    description: 'Registro sistemático del comportamiento y participación del estudiante durante clases.',
    whyItMatters: 'Revela las barreras físicas, comunicativas y pedagógicas presentes en el entorno.',
    howToObtain: 'Realiza al menos dos observaciones directas del estudiante durante clases regulares y documenta: participación, interacciones, dificultades y estrategias que funcionan.',
    placeholder: 'Describe lo observado en el aula: participación, dificultades, estrategias que funcionan...',
  },
  {
    key: 'historialAcademico',
    title: 'Historial académico',
    description: 'Registro de calificaciones, logros, dificultades y apoyos recibidos en años anteriores.',
    whyItMatters: 'Permite identificar patrones de desempeño y evaluar la efectividad de apoyos anteriores.',
    howToObtain: 'Consulta el sistema de información académica de la institución. Solicita al área de coordinación el historial completo de notas y observaciones del estudiante.',
    placeholder: 'Resume el historial de notas, logros, dificultades y apoyos recibidos anteriormente...',
  },
  {
    key: 'entrevistaFamilia',
    title: 'Entrevista con la familia',
    description: 'Información aportada por los padres o cuidadores sobre el estudiante.',
    whyItMatters: 'La familia conoce aspectos del estudiante que no son visibles en el aula y son clave para personalizar los apoyos.',
    howToObtain: 'Cita a los padres o cuidadores a una reunión. Pregunta sobre: historia de vida, rutinas en casa, intereses, miedos, qué estrategias les funcionan, expectativas.',
    placeholder: 'Registra lo que la familia compartió sobre el estudiante, sus rutinas, intereses y contexto de vida...',
  },
  {
    key: 'caracterizacion',
    title: 'Caracterización del estudiante',
    description: 'Perfil socioeconómico, cultural y de contexto del estudiante.',
    whyItMatters: 'El contexto social y cultural influye directamente en las barreras y en las estrategias de apoyo más pertinentes.',
    howToObtain: 'Completa la ficha de caracterización institucional (SIMAT u otro sistema). Incluye: estrato, composición familiar, acceso a tecnología, lengua materna, etc.',
    placeholder: 'Describe el contexto socioeconómico, familiar y cultural del estudiante...',
  },
  {
    key: 'mallaCurricular',
    title: 'Malla curricular',
    description: 'Estructura curricular del grado con los estándares y competencias esperados.',
    whyItMatters: 'Permite identificar qué contenidos, competencias y logros requieren ajuste o flexibilización.',
    howToObtain: 'Solicita al área académica la malla curricular del grado actual. Identifica las asignaturas críticas y los estándares de competencias del MEN correspondientes.',
    placeholder: 'Describe los contenidos principales del grado, asignaturas y competencias esperadas...',
  },
  {
    key: 'peiLineamientos',
    title: 'PEI o lineamientos institucionales',
    description: 'Proyecto Educativo Institucional y políticas de inclusión de la institución.',
    whyItMatters: 'Los compromisos institucionales deben alinearse con la visión y los recursos definidos en el PEI.',
    howToObtain: 'Consulta con el rector o coordinador el PEI vigente. Revisa específicamente el componente de inclusión y el protocolo de atención a estudiantes con discapacidad.',
    placeholder: 'Resume los lineamientos del PEI relevantes para la inclusión y atención a la diversidad...',
  },
]

const DISCAPACIDAD_OPTIONS = [
  { value: 'cognitiva', label: 'Cognitiva (discapacidad intelectual)' },
  { value: 'fisica-motora', label: 'Física o motora' },
  { value: 'visual', label: 'Visual (baja visión o ceguera)' },
  { value: 'auditiva', label: 'Auditiva (hipoacusia o sordera)' },
  { value: 'psicosocial', label: 'Psicosocial (salud mental)' },
  { value: 'multiple', label: 'Múltiple' },
  { value: 'otra', label: 'Otra' },
]

const EMPTY_STUDENT_INFO: StudentInfo = {
  nombre: '',
  institucion: '',
  grado: '',
  anio: new Date().getFullYear().toString(),
  tipoDiscapacidad: '',
  descripcionDiscapacidad: '',
  docente: '',
}

const EMPTY_SECTIONS: Sections = {
  diagnostico: { available: false, content: '' },
  valoracionPedagogica: { available: false, content: '' },
  observacionAula: { available: false, content: '' },
  historialAcademico: { available: false, content: '' },
  entrevistaFamilia: { available: false, content: '' },
  caracterizacion: { available: false, content: '' },
  mallaCurricular: { available: false, content: '' },
  peiLineamientos: { available: false, content: '' },
}

export default function PiarPage() {
  const [step, setStep] = useState(0)
  const [studentInfo, setStudentInfo] = useState<StudentInfo>(EMPTY_STUDENT_INFO)
  const [sections, setSections] = useState<Sections>(EMPTY_SECTIONS)
  const [piarData, setPiarData] = useState<PIARData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')
  const [extracting, setExtracting] = useState<Partial<Record<keyof Sections, boolean>>>({})
  const [extractError, setExtractError] = useState<Partial<Record<keyof Sections, string>>>({})
  const [isGeneratingDemo, setIsGeneratingDemo] = useState(false)
  const [demoError, setDemoError] = useState('')
  const fileInputRefs = useRef<Partial<Record<keyof Sections, HTMLInputElement | null>>>({})

  const availableCount = Object.values(sections).filter((s) => s.available).length

  const step0Valid =
    studentInfo.nombre.trim() !== '' &&
    studentInfo.tipoDiscapacidad !== '' &&
    studentInfo.docente.trim() !== ''

  async function handleGenerateDemo() {
    setIsGeneratingDemo(true)
    setDemoError('')
    try {
      const response = await fetch('/api/demo-case', { method: 'POST' })
      if (!response.ok) throw new Error('Error al generar el caso')
      const data = await response.json()
      setStudentInfo(data.studentInfo)
      setSections(data.sections)
      setStep(9)
    } catch (err) {
      setDemoError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsGeneratingDemo(false)
    }
  }

  function updateSection(key: keyof Sections, field: 'available' | 'content', value: boolean | string) {
    setSections((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }))
  }

  async function handlePdfUpload(sectionKey: keyof Sections, sectionTitle: string, file: File) {
    setExtracting((prev) => ({ ...prev, [sectionKey]: true }))
    setExtractError((prev) => ({ ...prev, [sectionKey]: '' }))

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('sectionTitle', sectionTitle)

      const response = await fetch('/api/extract-pdf', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Error al procesar el PDF')

      const extracted = await response.text()
      setSections((prev) => ({
        ...prev,
        [sectionKey]: { available: true, content: extracted },
      }))
    } catch (err) {
      setExtractError((prev) => ({
        ...prev,
        [sectionKey]: err instanceof Error ? err.message : 'Error desconocido',
      }))
    } finally {
      setExtracting((prev) => ({ ...prev, [sectionKey]: false }))
      // reset so the same file can be re-uploaded if needed
      const ref = fileInputRefs.current[sectionKey]
      if (ref) ref.value = ''
    }
  }

  async function handleGeneratePiar() {
    setIsGenerating(true)
    setPiarData(null)
    setGenerateError('')
    setStep(10)

    try {
      const response = await fetch('/api/piar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentInfo, sections }),
      })

      if (!response.ok) throw new Error('Error del servidor al generar el PIAR')

      const data = await response.json()
      setPiarData(data)
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsGenerating(false)
    }
  }

  function handleNewPiar() {
    setStep(0)
    setStudentInfo(EMPTY_STUDENT_INFO)
    setSections(EMPTY_SECTIONS)
    setPiarData(null)
    setGenerateError('')
  }

  const progressValue = step <= 8 ? (step / 9) * 100 : 100

  return (
    <div className='min-h-screen bg-[#f5f0e8]'>
      <header className='border-b border-[#1a1a1a]/10 bg-white/70 backdrop-blur-sm sticky top-0 z-10'>
        <div className='max-w-3xl mx-auto flex justify-between items-center px-4 py-3'>
          <span className='text-lg font-bold text-[#1a4d2e]'>AcademIA — PIAR</span>
          <Link href='/dashboard' className='text-sm text-[#1a1a1a]/50 hover:text-[#1a4d2e] transition'>
            Ir al dashboard
          </Link>
        </div>
      </header>

      <div className='max-w-3xl mx-auto px-4 py-8'>
        {step >= 0 && step <= 8 && (
          <div className='mb-6'>
            <div className='flex justify-between text-xs text-[#1a1a1a]/50 mb-2'>
              <span>Paso {step + 1} de 9</span>
              <span>{step === 0 ? 'Datos del estudiante' : SECTION_META[step - 1].title}</span>
            </div>
            <Progress value={progressValue} className='h-1.5' />
          </div>
        )}

        {/* Step 0: Datos del estudiante */}
        {step === 0 && (
          <div className='rounded-2xl border border-[#1a1a1a]/10 bg-white p-6 shadow-sm space-y-5'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h2 className='text-xl font-bold text-[#1a4d2e]'>Datos del estudiante</h2>
                <p className='text-sm text-[#1a1a1a]/60 mt-1'>
                  Ingresa la información básica para identificar al estudiante en el PIAR.
                </p>
              </div>
              <button
                type='button'
                onClick={handleGenerateDemo}
                disabled={isGeneratingDemo}
                className='shrink-0 inline-flex items-center gap-1.5 rounded-full border border-[#1a4d2e]/30 bg-[#1a4d2e]/5 px-3 py-1.5 text-sm font-medium text-[#1a4d2e] hover:bg-[#1a4d2e]/10 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isGeneratingDemo ? (
                  <Loader2 className='size-3.5 animate-spin' />
                ) : (
                  <Sparkles className='size-3.5' />
                )}
                {isGeneratingDemo ? 'Generando...' : 'Llenar con IA'}
              </button>
            </div>

            {demoError && (
              <p className='text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2'>{demoError}</p>
            )}

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='sm:col-span-2 space-y-1.5'>
                <Label htmlFor='nombre'>Nombre completo del estudiante *</Label>
                <Input
                  id='nombre'
                  placeholder='Ej: María Fernanda García López'
                  value={studentInfo.nombre}
                  onChange={(e) => setStudentInfo((p) => ({ ...p, nombre: e.target.value }))}
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='institucion'>Institución educativa</Label>
                <Input
                  id='institucion'
                  placeholder='Nombre del colegio o escuela'
                  value={studentInfo.institucion}
                  onChange={(e) => setStudentInfo((p) => ({ ...p, institucion: e.target.value }))}
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='grado'>Grado</Label>
                <Input
                  id='grado'
                  placeholder='Ej: 3° Primaria'
                  value={studentInfo.grado}
                  onChange={(e) => setStudentInfo((p) => ({ ...p, grado: e.target.value }))}
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='anio'>Año escolar</Label>
                <Input
                  id='anio'
                  placeholder='Ej: 2026'
                  value={studentInfo.anio}
                  onChange={(e) => setStudentInfo((p) => ({ ...p, anio: e.target.value }))}
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='tipoDiscapacidad'>Tipo de discapacidad *</Label>
                <Select
                  value={studentInfo.tipoDiscapacidad}
                  onValueChange={(v) => setStudentInfo((p) => ({ ...p, tipoDiscapacidad: v }))}
                >
                  <SelectTrigger id='tipoDiscapacidad' className='w-full h-10'>
                    <SelectValue placeholder='Selecciona el tipo...' />
                  </SelectTrigger>
                  <SelectContent>
                    {DISCAPACIDAD_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='sm:col-span-2 space-y-1.5'>
                <Label htmlFor='descripcionDiscapacidad'>Descripción de la condición</Label>
                <textarea
                  id='descripcionDiscapacidad'
                  placeholder='Describe brevemente la condición del estudiante y cómo afecta su aprendizaje...'
                  value={studentInfo.descripcionDiscapacidad}
                  onChange={(e) => setStudentInfo((p) => ({ ...p, descripcionDiscapacidad: e.target.value }))}
                  className='rounded-xl border-2 border-[#1a1a1a]/10 bg-white px-4 py-3 text-base w-full focus:outline-none focus:border-[#1a4d2e]/50 resize-y min-h-[100px]'
                />
              </div>

              <div className='sm:col-span-2 space-y-1.5'>
                <Label htmlFor='docente'>Docente responsable *</Label>
                <Input
                  id='docente'
                  placeholder='Tu nombre completo'
                  value={studentInfo.docente}
                  onChange={(e) => setStudentInfo((p) => ({ ...p, docente: e.target.value }))}
                />
              </div>
            </div>

            <div className='flex justify-end pt-2'>
              <Button
                onClick={() => setStep(1)}
                disabled={!step0Valid}
                className='rounded-full bg-[#1a4d2e] hover:bg-[#153d24] text-white px-6'
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {/* Steps 1–8: Secciones de información */}
        {step >= 1 && step <= 8 && (() => {
          const meta = SECTION_META[step - 1]
          const sectionKey = meta.key as keyof Sections
          const section = sections[sectionKey]
          const isExtracting = extracting[sectionKey] ?? false
          const extractErr = extractError[sectionKey] ?? ''

          return (
            <div className='rounded-2xl border border-[#1a1a1a]/10 bg-white p-6 shadow-sm space-y-5'>
              <div>
                <p className='text-xs font-medium text-[#1a4d2e]/60 uppercase tracking-wide mb-1'>
                  Fuente {step} de 8
                </p>
                <h2 className='text-xl font-bold text-[#1a4d2e]'>{meta.title}</h2>
                <p className='text-sm text-[#1a1a1a]/60 mt-1'>{meta.description}</p>
              </div>

              <div className='rounded-xl border border-[#1a1a1a]/10 bg-[#f5f0e8]/50 px-4 py-3'>
                <p className='text-xs text-[#1a1a1a]/50 font-medium mb-0.5'>¿Por qué importa?</p>
                <p className='text-sm text-[#1a1a1a]/70'>{meta.whyItMatters}</p>
              </div>

              <label className='flex items-center gap-3 cursor-pointer group'>
                <input
                  type='checkbox'
                  checked={section.available}
                  onChange={(e) => updateSection(sectionKey, 'available', e.target.checked)}
                  className='size-4 rounded accent-[#1a4d2e] cursor-pointer'
                />
                <span className='text-sm font-medium text-[#1a1a1a] group-hover:text-[#1a4d2e] transition'>
                  Tengo esta información disponible
                </span>
              </label>

              {section.available ? (
                <div className='space-y-3'>
                  {/* PDF upload button */}
                  <div className='flex items-center gap-3'>
                    <input
                      ref={(el) => { fileInputRefs.current[sectionKey] = el }}
                      type='file'
                      accept='application/pdf'
                      className='hidden'
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handlePdfUpload(sectionKey, meta.title, file)
                      }}
                    />
                    <button
                      type='button'
                      onClick={() => fileInputRefs.current[sectionKey]?.click()}
                      disabled={isExtracting}
                      className='inline-flex items-center gap-2 rounded-lg border border-[#1a4d2e]/30 bg-[#1a4d2e]/5 px-3 py-1.5 text-sm font-medium text-[#1a4d2e] hover:bg-[#1a4d2e]/10 transition disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {isExtracting ? (
                        <>
                          <Loader2 className='size-3.5 animate-spin' />
                          Extrayendo PDF...
                        </>
                      ) : (
                        <>
                          <FileUp className='size-3.5' />
                          Subir PDF
                        </>
                      )}
                    </button>
                    <span className='text-xs text-[#1a1a1a]/40'>
                      La IA extrae automáticamente la información relevante
                    </span>
                  </div>

                  {extractErr && (
                    <p className='text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2'>{extractErr}</p>
                  )}

                  <div className='space-y-1.5'>
                    <Label>Contenido</Label>
                    <textarea
                      placeholder={meta.placeholder}
                      value={section.content}
                      onChange={(e) => updateSection(sectionKey, 'content', e.target.value)}
                      className='rounded-xl border-2 border-[#1a1a1a]/10 bg-white px-4 py-3 text-base w-full focus:outline-none focus:border-[#1a4d2e]/50 resize-y min-h-[160px]'
                    />
                  </div>
                </div>
              ) : (
                <div className='rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 space-y-1'>
                  <p className='text-xs font-semibold text-amber-700 uppercase tracking-wide'>
                    Cómo obtener esta información
                  </p>
                  <p className='text-sm text-amber-800'>{meta.howToObtain}</p>
                  <p className='text-xs text-amber-600 mt-1'>
                    Esta sección quedará marcada como pendiente en el PIAR.
                  </p>
                </div>
              )}

              <div className='flex justify-between pt-2'>
                <Button
                  variant='outline'
                  onClick={() => setStep(step - 1)}
                  className='rounded-full px-6'
                >
                  Anterior
                </Button>
                <Button
                  onClick={() => setStep(step + 1)}
                  className='rounded-full bg-[#1a4d2e] hover:bg-[#153d24] text-white px-6'
                >
                  {step === 8 ? 'Revisar' : 'Siguiente'}
                </Button>
              </div>
            </div>
          )
        })()}

        {/* Step 9: Revisión */}
        {step === 9 && (
          <div className='space-y-5'>
            <div className='rounded-2xl border border-[#1a1a1a]/10 bg-white p-6 shadow-sm'>
              <h2 className='text-xl font-bold text-[#1a4d2e]'>Revisión final</h2>
              <p className='text-sm text-[#1a1a1a]/60 mt-1'>
                Revisa la información recopilada antes de generar el PIAR.
              </p>
              <div className='mt-3 flex items-center gap-2'>
                <span className='text-sm font-medium text-[#1a1a1a]'>
                  {availableCount} de 8 fuentes disponibles
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    availableCount >= 5
                      ? 'bg-green-100 text-green-700'
                      : availableCount >= 3
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {availableCount >= 5
                    ? 'Buena cobertura'
                    : availableCount >= 3
                    ? 'Cobertura mínima'
                    : 'Información limitada'}
                </span>
              </div>

              {availableCount < 3 && (
                <div className='mt-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3'>
                  <p className='text-sm text-amber-800'>
                    Tienes menos de 3 fuentes disponibles. El PIAR generado tendrá muchas secciones marcadas como pendientes. Puedes continuar igual, pero se recomienda recopilar más información.
                  </p>
                </div>
              )}
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              {SECTION_META.map((meta, idx) => {
                const section = sections[meta.key as keyof Sections]
                return (
                  <button
                    key={meta.key}
                    onClick={() => setStep(idx + 1)}
                    className={`rounded-xl border-2 p-4 text-left transition hover:opacity-80 ${
                      section.available ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'
                    }`}
                  >
                    <div className='flex items-start gap-2'>
                      {section.available ? (
                        <CheckCircle2 className='size-4 text-green-600 mt-0.5 shrink-0' />
                      ) : (
                        <AlertTriangle className='size-4 text-amber-500 mt-0.5 shrink-0' />
                      )}
                      <div>
                        <p className='text-sm font-semibold text-[#1a1a1a]'>{meta.title}</p>
                        <p className={`text-xs mt-0.5 ${section.available ? 'text-green-700' : 'text-amber-700'}`}>
                          {section.available ? 'Disponible — clic para editar' : 'Pendiente — clic para agregar'}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className='flex justify-between items-center'>
              <Button variant='outline' onClick={() => setStep(8)} className='rounded-full px-6'>
                Anterior
              </Button>
              <Button
                onClick={handleGeneratePiar}
                className='rounded-full bg-[#1a4d2e] hover:bg-[#153d24] text-white px-8 h-11 text-base'
              >
                <Sparkles className='size-4 mr-2' />
                Generar PIAR
              </Button>
            </div>
          </div>
        )}

        {/* Step 10: Resultado */}
        {step === 10 && (
          <div>
            {isGenerating && (
              <div className='flex flex-col items-center justify-center gap-4 py-24'>
                <Loader2 className='size-10 animate-spin text-[#1a4d2e]' />
                <p className='text-sm text-[#1a1a1a]/60'>Generando el PIAR, esto puede tardar unos segundos…</p>
              </div>
            )}

            {!isGenerating && generateError && (
              <div className='space-y-4'>
                <div className='rounded-xl border border-red-200 bg-red-50 px-4 py-3'>
                  <p className='text-sm text-red-700'>{generateError}</p>
                </div>
                <div className='flex gap-3'>
                  <Button onClick={handleGeneratePiar} className='rounded-full bg-[#1a4d2e] hover:bg-[#153d24] text-white px-6'>
                    Reintentar
                  </Button>
                  <Button onClick={() => setStep(9)} variant='outline' className='rounded-full px-6'>
                    Volver a revisión
                  </Button>
                </div>
              </div>
            )}

            {!isGenerating && !generateError && piarData && (
              <PiarViewer
                studentInfo={studentInfo}
                data={piarData}
                onRegenerate={handleGeneratePiar}
                onBack={() => setStep(9)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
