'use client'

import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer'
import { Download, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PiarDocument, type StudentInfo, type PIARData } from './piar-document'

interface Props {
  studentInfo: StudentInfo
  data: PIARData
  onRegenerate: () => void
  onBack: () => void
}

export default function PiarViewer({ studentInfo, data, onRegenerate, onBack }: Props) {
  const filename = `PIAR_${studentInfo.nombre.replace(/\s+/g, '_')}_${studentInfo.anio}.pdf`

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h2 className='text-xl font-bold text-[#1a4d2e]'>PIAR — {studentInfo.nombre}</h2>
          <p className='text-sm text-[#1a1a1a]/50 mt-0.5'>{studentInfo.institucion} · {studentInfo.anio}</p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={onBack} className='rounded-full px-4'>
            Volver a revisión
          </Button>
          <Button
            variant='outline'
            onClick={onRegenerate}
            className='rounded-full px-4'
          >
            <RefreshCw className='size-3.5 mr-1.5' />
            Regenerar
          </Button>
          <PDFDownloadLink
            document={<PiarDocument studentInfo={studentInfo} data={data} />}
            fileName={filename}
          >
            {({ loading }) => (
              <Button
                className='rounded-full bg-[#1a4d2e] hover:bg-[#153d24] text-white px-4'
                disabled={loading}
              >
                <Download className='size-3.5 mr-1.5' />
                {loading ? 'Preparando...' : 'Descargar PDF'}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      <PDFViewer
        style={{
          width: '100%',
          height: '75vh',
          minHeight: 500,
          border: 'none',
          borderRadius: 16,
        }}
        showToolbar={false}
      >
        <PiarDocument studentInfo={studentInfo} data={data} />
      </PDFViewer>
    </div>
  )
}
