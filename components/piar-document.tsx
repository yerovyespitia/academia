import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

export interface StudentInfo {
  nombre: string
  institucion: string
  grado: string
  anio: string
  tipoDiscapacidad: string
  descripcionDiscapacidad: string
  docente: string
}

export interface PIARData {
  identificacion: string
  condicionBarreras: string
  fortalezas: string
  ajustesRazonables: string
  metas: string
  estrategias: string
  recursos: string
  evaluacion: string
  compromisoInstitucion: string
  compromisoFamilia: string
  compromisoEstudiante: string
  cronograma: string
}

const C = {
  green: '#1a4d2e',
  border: '#b0b0b0',
  headerBg: '#efefef',
  text: '#111111',
  gray: '#555555',
  lightGreen: '#e6efe9',
}

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: C.text,
    paddingTop: 32,
    paddingBottom: 48,
    paddingHorizontal: 42,
  },

  // ── Header ──────────────────────────────────────
  docHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  docTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: C.green,
  },
  docSubtitle: {
    fontSize: 7.5,
    color: C.gray,
    marginTop: 2,
  },
  docMetaText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
  },
  docMetaSub: {
    fontSize: 7,
    color: C.gray,
    textAlign: 'right',
  },

  // ── Info table ───────────────────────────────────
  tableCaption: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    paddingVertical: 5,
    backgroundColor: C.headerBg,
    borderWidth: 1,
    borderColor: C.border,
    borderBottomWidth: 0,
  },
  table: {
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 12,
  },
  tr: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  trLast: {
    flexDirection: 'row',
  },
  td: {
    flex: 1,
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: C.border,
  },
  tdLast: {
    flex: 1,
    padding: 5,
  },
  tdFull: {
    flex: 2,
    padding: 5,
  },
  tdLabel: {
    fontSize: 7,
    color: C.gray,
    marginBottom: 1.5,
  },
  tdValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },

  // ── Sections ─────────────────────────────────────
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: C.green,
    paddingBottom: 3,
    borderBottomWidth: 1.5,
    borderBottomColor: C.green,
    marginBottom: 5,
  },
  sectionText: {
    fontSize: 8.5,
    lineHeight: 1.55,
  },
  para: {
    marginBottom: 3,
  },

  // ── Compromisos 3-col ────────────────────────────
  commitRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: C.border,
    marginTop: 4,
  },
  commitCol: {
    flex: 1,
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: C.border,
  },
  commitColLast: {
    flex: 1,
    padding: 6,
  },
  commitTitle: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: C.green,
    textAlign: 'center',
    marginBottom: 4,
  },
  commitText: {
    fontSize: 8,
    lineHeight: 1.45,
  },

  // ── Footer ───────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 42,
    right: 42,
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: '#cccccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7,
    color: '#999999',
  },
})

function Paragraphs({ text }: { text: string }) {
  const paras = text.split(/\n\n+/).filter(Boolean)
  if (paras.length <= 1) {
    return <Text style={s.sectionText}>{text}</Text>
  }
  return (
    <View>
      {paras.map((p, i) => (
        <Text key={i} style={[s.sectionText, s.para]}>
          {p.trim()}
        </Text>
      ))}
    </View>
  )
}

function InfoRow({
  label1, value1, label2, value2, last,
}: {
  label1: string; value1: string
  label2?: string; value2?: string
  last?: boolean
}) {
  const rowStyle = last ? s.trLast : s.tr
  if (label2 !== undefined) {
    return (
      <View style={rowStyle}>
        <View style={s.td}>
          <Text style={s.tdLabel}>{label1}</Text>
          <Text style={s.tdValue}>{value1 || '—'}</Text>
        </View>
        <View style={s.tdLast}>
          <Text style={s.tdLabel}>{label2}</Text>
          <Text style={s.tdValue}>{value2 || '—'}</Text>
        </View>
      </View>
    )
  }
  return (
    <View style={rowStyle}>
      <View style={s.tdFull}>
        <Text style={s.tdLabel}>{label1}</Text>
        <Text style={s.tdValue}>{value1 || '—'}</Text>
      </View>
    </View>
  )
}

export function PiarDocument({ studentInfo, data }: { studentInfo: StudentInfo; data: PIARData }) {
  const today = new Date().toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.docHeader}>
          <View>
            <Text style={s.docTitle}>PLAN INDIVIDUAL DE APOYOS Y AJUSTES RAZONABLES</Text>
            <Text style={s.docSubtitle}>PIAR — Decreto 1421 de 2017 — Ministerio de Educación Nacional</Text>
          </View>
          <View>
            <Text style={s.docMetaText}>{studentInfo.anio}</Text>
            <Text style={s.docMetaSub}>{today}</Text>
          </View>
        </View>

        {/* Info table */}
        <Text style={s.tableCaption}>INFORMACIÓN GENERAL DEL ESTUDIANTE (Anexo 1 PIAR)</Text>
        <View style={s.table}>
          <InfoRow label1="Nombre completo del estudiante" value1={studentInfo.nombre}
            label2="Grado" value2={studentInfo.grado} />
          <InfoRow label1="Institución educativa" value1={studentInfo.institucion}
            label2="Año escolar" value2={studentInfo.anio} />
          <InfoRow label1="Tipo de discapacidad" value1={studentInfo.tipoDiscapacidad}
            label2="Docente responsable" value2={studentInfo.docente} />
          <InfoRow label1="Descripción de la condición" value1={studentInfo.descripcionDiscapacidad} last />
        </View>

        {/* 1 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>1. Identificación del estudiante</Text>
          <Paragraphs text={data.identificacion} />
        </View>

        {/* 2 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>2. Descripción de la condición y barreras para el aprendizaje</Text>
          <Paragraphs text={data.condicionBarreras} />
        </View>

        {/* 3 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>3. Fortalezas y habilidades del estudiante</Text>
          <Paragraphs text={data.fortalezas} />
        </View>

        {/* 4 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>4. Ajustes razonables por área de conocimiento</Text>
          <Paragraphs text={data.ajustesRazonables} />
        </View>

        {/* 5 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>5. Metas y logros esperados</Text>
          <Paragraphs text={data.metas} />
        </View>

        {/* 6 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>6. Estrategias pedagógicas diferenciadas</Text>
          <Paragraphs text={data.estrategias} />
        </View>

        {/* 7 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>7. Recursos y apoyos necesarios</Text>
          <Paragraphs text={data.recursos} />
        </View>

        {/* 8 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>8. Sistema de evaluación diferenciada</Text>
          <Paragraphs text={data.evaluacion} />
        </View>

        {/* 9 — Compromisos */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>9. Compromisos</Text>
          <View style={s.commitRow}>
            <View style={s.commitCol}>
              <Text style={s.commitTitle}>INSTITUCIÓN EDUCATIVA</Text>
              <Text style={s.commitText}>{data.compromisoInstitucion}</Text>
            </View>
            <View style={s.commitCol}>
              <Text style={s.commitTitle}>FAMILIA / CUIDADORES</Text>
              <Text style={s.commitText}>{data.compromisoFamilia}</Text>
            </View>
            <View style={s.commitColLast}>
              <Text style={s.commitTitle}>ESTUDIANTE</Text>
              <Text style={s.commitText}>{data.compromisoEstudiante}</Text>
            </View>
          </View>
        </View>

        {/* 10 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>10. Cronograma de seguimiento</Text>
          <Paragraphs text={data.cronograma} />
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            {studentInfo.nombre} — PIAR {studentInfo.anio} — Decreto 1421/2017
          </Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>

      </Page>
    </Document>
  )
}
