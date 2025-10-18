import ConceptMapGenerator from '@/components/concept-map/concept-map-generator'

export default function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return <ConceptMapGenerator params={params} />
}
