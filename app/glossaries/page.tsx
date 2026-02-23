import MyGlossaries from '@/components/glossary/my-glossaries'
import { userGlossaries } from '@/lib/dummy-data'

export default function Page() {
  return (
    <main className='max-w-7xl mx-auto p-4'>
      <MyGlossaries userGlossaries={userGlossaries} />
    </main>
  )
}
