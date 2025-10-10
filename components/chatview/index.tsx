'use client'

import { useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, User, Bot, Loader2, Pause } from 'lucide-react'
import SuggestQuestions from './suggest-questions'
import Header from './header'
import Error from './error'

export default function ChatView() {
  const [message, setMessage] = useState('')
  const { messages, sendMessage, status, error, stop } = useChat()
  const showSuggestions =
    messages.length === 0 && status === 'ready' && message === ''

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    sendMessage({ text: message })
    setMessage('')
  }

  return (
    <div className='container mx-auto px-4 py-8 max-w-6xl'>
      <Header />

      <div className='w-full'>
        <Card className='bg-card border-border h-[calc(100vh-280px)] flex flex-col pt-6 pb-0'>
          {/* Chat Messages */}
          {showSuggestions ? (
            <SuggestQuestions setMessage={setMessage} />
          ) : (
            <CardContent className='flex-1 overflow-y-auto p-6 space-y-6'>
              {messages.map((msg, index) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`size-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user' ? 'bg-primary' : 'bg-muted-foreground'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User className='size-4 text-white' />
                    ) : (status === 'submitted' || status === 'streaming') &&
                      index === messages.length - 1 ? (
                      <Loader2 className='size-4 animate-spin text-white' />
                    ) : (
                      <Bot className='size-4 text-white' />
                    )}
                  </div>

                  {/* Message Content */}
                  <div
                    className={`flex-1 ${
                      msg.role === 'user' ? 'flex justify-end' : ''
                    }`}
                  >
                    <div
                      className={`inline-block max-w-[85%] ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm'
                          : 'bg-secondary/50 text-foreground rounded-2xl rounded-tl-sm'
                      } px-4 py-3`}
                    >
                      <div>
                        {msg.parts.map((part, index) => {
                          switch (part.type) {
                            case 'text':
                              return (
                                <div
                                  key={`${msg.id}-${index}`}
                                  className='text-sm leading-relaxed whitespace-pre-line'
                                >
                                  {part.text}
                                </div>
                              )
                            default:
                              return null
                          }
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          )}

          {error && <Error error={error} />}

          {/* Input Area */}
          <form
            className='border-t border-border p-4'
            onSubmit={handleSubmit}
          >
            <div className='flex gap-2 items-center'>
              <Input
                placeholder='Pregunta sobre tus notas, documentos o progreso...'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className='flex-1 bg-secondary/30 border-border rounded-full h-12'
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (status === 'ready') {
                      ;(
                        e.currentTarget as HTMLInputElement
                      ).form?.requestSubmit()
                    }
                  }
                }}
              />
              {status === 'submitted' || status === 'streaming' ? (
                <Button
                  size='icon'
                  className='size-12 bg-primary rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed'
                  type='submit'
                  onClick={stop}
                >
                  <Pause className='size-5' />
                </Button>
              ) : (
                <Button
                  size='icon'
                  className='size-12 bg-primary rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed'
                  type='submit'
                  disabled={status !== 'ready'}
                >
                  <Send className='size-5' />
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
