import UploadNotes from '../upload-notes'

export default function StudyTools() {
  return (
    <div>
      <header className='flex justify-between items-center mb-4'>
        <div>
          <h2 className='text-xl font-bold'>Herramientas de estudio</h2>
        </div>
      </header>
      <UploadNotes />
    </div>
  )
}
