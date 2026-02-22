import React, { useState, useRef, useEffect } from 'react'
import { useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2, Send, Volume2, User, Bot, Sparkles } from 'lucide-react'

const AIAssistant = () => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef(null)

  const chat = useAction(api.ai.chat)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = { id: Date.now(), role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError('')

    try {
      const response = await chat({ prompt: input })
      const aiMessage = { id: Date.now() + 1, role: 'assistant', content: response }
      setMessages(prev => [...prev, aiMessage])
    } catch (err) {
      setError(err.message || 'Failed to get AI response. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTextToSpeech = async (text) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
    } catch (err) {
      console.error('TTS error:', err)
    }
  }

  const handleQuickAction = (text) => {
    setInput(text)
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <Card className="border-none shadow-xl bg-gradient-to-b from-white to-slate-50/50 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">GTU AI Tutor</CardTitle>
              <CardDescription className="text-blue-100">
                Powered by Convex & Groq AI
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div ref={scrollRef} className="h-[500px] overflow-y-auto p-6">
            <div className="space-y-6">
              {messages.length === 0 && (
                <div className="text-center py-12 space-y-4">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <Bot className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-800">Welcome to your GTU Study Buddy!</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">
                      Ask me anything about your subjects, syllabus, or exam patterns. I'm here to help!
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto pt-4">
                    <Button
                      variant="outline"
                      className="text-sm justify-start hover:border-blue-400 hover:bg-blue-50"
                      onClick={() => handleQuickAction('Explain polymorphism in C++')}
                    >
                      "Explain polymorphism in C++"
                    </Button>
                    <Button
                      variant="outline"
                      className="text-sm justify-start hover:border-blue-400 hover:bg-blue-50"
                      onClick={() => handleQuickAction('What is database normalization?')}
                    >
                      "What is database normalization?"
                    </Button>
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role !== 'user' && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${m.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white border text-slate-800 rounded-tl-none'
                      }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                        {m.role === 'user' ? 'You' : 'AI Tutor'}
                      </span>
                      {m.role !== 'user' && (
                        <button
                          onClick={() => handleTextToSpeech(m.content)}
                          className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      )}
                    </div>
                    <div className="prose prose-slate prose-sm max-w-none whitespace-pre-wrap">
                      {m.content}
                    </div>
                  </div>
                  {m.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-1 border border-indigo-200">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white border rounded-2xl p-4 rounded-tl-none shadow-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-sm text-slate-500 italic">Thinking...</span>
                  </div>
                </div>
              )}
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {error}
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-6 bg-white border-t">
          <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="h-12 w-12 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}

export default AIAssistant