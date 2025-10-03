import GradesPanel from '@/components/grades-panel'
import StudyTools from '@/components/study-tools'

export default function Home() {
  return (
    <main className='max-w-7xl mx-auto p-4'>
      <GradesPanel />
      <StudyTools />
    </main>
  )
}
