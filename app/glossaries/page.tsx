import MyGlossaries from '@/components/glossary/my-glossaries'

async function getGlossaries() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/glossary/user/1`,
  )
  const data = await response.json()
  return data
}

export default async function Page() {
  const glossaries = await getGlossaries()

  return (
    <main className='max-w-7xl mx-auto p-4'>
      <MyGlossaries userGlossaries={glossaries} />
    </main>
  )
}
