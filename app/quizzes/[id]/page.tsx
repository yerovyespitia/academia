import QuizRunner from '@/components/quiz-generator/quiz-runner'

export default function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return <QuizRunner params={params} />
}
