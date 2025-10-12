import UploadNotes from '../upload-notes'
import QuizGenerator from '../quiz-generator'
import Attendance from '../attendance'
import Glossary from '../glossary'
import ConceptMap from '../concept-map'

export default function StudyTools() {
  return (
    <div>
      <header className='flex justify-between items-center mb-4'>
        <div>
          <h2 className='text-xl font-bold'>Herramientas de estudio</h2>
        </div>
      </header>
      <section className='mb-8'>
        <div className='w-full'>
          <UploadNotes />
        </div>
      </section>
      <section className='mb-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <QuizGenerator />
          <Attendance />
        </div>
      </section>
      <section className='mb-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <Glossary />
          <ConceptMap />
        </div>
      </section>
    </div>
  )
}
