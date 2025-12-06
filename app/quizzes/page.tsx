import QuizGeneratorPage from '@/components/quiz-generator/quiz-page'

async function getQuizzes() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/quizzes/user/1`,
  )
  const data = await response.json()
  return data
}

export default async function Page() {
  const quizzes = await getQuizzes()

  console.log('quizzes', quizzes)

  return (
    <main className='max-w-7xl mx-auto p-4'>
      <QuizGeneratorPage />
    </main>
  )
}
