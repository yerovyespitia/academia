'use client'

import { useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Send,
  Sparkles,
  User,
  Bot,
  Loader2,
  AlertCircle,
  Pause,
} from 'lucide-react'
import Sidebar from './sidebar'

export default function ChatView() {
  const [message, setMessage] = useState('')
  const { messages, sendMessage, status, error, stop } = useChat()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    sendMessage({ text: message })
    setMessage('')
  }

  return (
    <div className='container mx-auto px-4 py-8 max-w-6xl'>
      {/* Header */}
      <div className='mb-6'>
        <div className='flex items-center gap-3 mb-2'>
          <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center'>
            <Sparkles className='w-6 h-6 text-white' />
          </div>
          <div>
            <h1 className='text-3xl font-bold text-foreground'>
              Asistente Académico IA
            </h1>
            <p className='text-muted-foreground'>
              Pregunta sobre tus notas, documentos y progreso académico
            </p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
        {/* Chat Area */}
        <div className='lg:col-span-3'>
          <Card className='bg-card border-border h-[calc(100vh-280px)] flex flex-col'>
            {/* Chat Messages */}
            {error && (
              <div className='border-t border-border p-4'>
                <div className='flex items-center gap-2'>
                  <AlertCircle className='w-4 h-4 text-red-500' />
                  <p className='text-red-500'>
                    {error.message || 'Error al enviar el mensaje'}
                  </p>
                </div>
              </div>
            )}
            <CardContent className='flex-1 overflow-y-auto p-6 space-y-6'>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user' ? 'bg-primary' : 'bg-muted-foreground'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User className='w-4 h-4 text-white' />
                    ) : (
                      <Bot className='w-4 h-4 text-white' />
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

            {(status === 'submitted' || status === 'streaming') && (
              <div className='border-t border-border p-4'>
                <div className='flex items-center gap-2'>
                  <Loader2 className='w-4 h-4 animate-spin' />
                </div>
              </div>
            )}

            {/* Input Area */}
            <form
              className='border-t border-border p-4'
              onSubmit={handleSubmit}
            >
              <div className='flex gap-2'>
                <Input
                  placeholder='Pregunta sobre tus notas, documentos o progreso...'
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className='flex-1 bg-secondary/30 border-border'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                    }
                  }}
                />
                {status === 'submitted' || status === 'streaming' ? (
                  <Button
                    size='icon'
                    className='bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed'
                    type='submit'
                    onClick={stop}
                  >
                    <Pause className='size-4' />
                  </Button>
                ) : (
                  <Button
                    size='icon'
                    className='bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed'
                    type='submit'
                    disabled={status !== 'ready'}
                  >
                    <Send className='size-4' />
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>

        {/* Sidebar */}
        <Sidebar setMessage={setMessage} />
      </div>
    </div>
  )
}
