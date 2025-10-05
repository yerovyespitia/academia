import UploadNotes from '../upload-notes'
import TagOrganization from '../tag-organization'
import QuizzGenerator from '../quizz-generator'
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
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <UploadNotes />
          <TagOrganization />
        </div>
      </section>
      <section className='mb-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <QuizzGenerator />
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
