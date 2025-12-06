import ConceptMap from '../concept-map'
import Glossary from '../glossary'
import QuizGenerator from '../quiz-generator'
import UploadNotes from '../upload-notes'

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
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <QuizGenerator />
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
