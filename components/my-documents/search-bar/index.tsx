import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type SearchBarProps = {
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedTag: string | null
  setSelectedTag: (tag: string | null) => void
  tags: string[]
}

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  selectedTag,
  setSelectedTag,
  tags,
}: SearchBarProps) {
  return (
    <div className='flex flex-col md:flex-row gap-4 mb-6'>
      <div className='flex-1 relative'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
        <Input
          placeholder='Buscar documentos...'
          className='pl-10 bg-card border-border rounded-full'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className='flex gap-2 flex-wrap'>
        <Button
          variant={selectedTag === null ? 'brand' : 'outline'}
          size='brand'
          onClick={() => setSelectedTag(null)}
        >
          Todos
        </Button>
        {tags.map((tag) => (
          <Button
            key={tag}
            variant={selectedTag === tag ? 'brand' : 'outline'}
            size='brand'
            onClick={() => setSelectedTag(tag)}
          >
            {tag}
          </Button>
        ))}
      </div>
    </div>
  )
}
