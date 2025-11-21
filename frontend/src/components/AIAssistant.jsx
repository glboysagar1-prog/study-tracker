import React, { useState } from 'react'
import axios from 'axios'

const AIAssistant = () => {
  const [prompt, setPrompt] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsLoading(true)
    setError('')
    setAiResponse('')

    try {
      const response = await axios.post('/api/ai-assistant', { prompt })
      
      if (response.data.success) {
        setAiResponse(response.data.response)
      } else {
        setError(response.data.error || 'Failed to get AI response')
      }
    } catch (err) {
      setError('Failed to communicate with AI assistant. Please try again.')
      console.error('AI assistant error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTextToSpeech = async () => {
    if (!aiResponse) return

    try {
      const response = await axios.post('/api/voice/tts', 
        { text: aiResponse },
        { responseType: 'blob' }
      )
      
      // Play the audio
      const audioUrl = URL.createObjectURL(response.data)
      const audio = new Audio(audioUrl)
      audio.play()
    } catch (err) {
      setError('Failed to convert text to speech.')
      console.error('TTS error:', err)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">AI Study Assistant</h2>
        
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4">
            <label htmlFor="prompt" className="block text-gray-700 mb-2">
              Ask a question about your GTU subjects:
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="e.g., Explain polymorphism in C++ or What is database normalization?"
            ></textarea>
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isLoading ? 'Getting AI Response...' : 'Ask AI Assistant'}
          </button>
        </form>
        
        {isLoading && (
          <div className="flex justify-center my-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {aiResponse && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">AI Assistant Response:</h3>
            <div className="bg-blue-50 p-4 rounded-lg mb-3">
              <p>{aiResponse}</p>
            </div>
            <button
              onClick={handleTextToSpeech}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Listen to Response
            </button>
          </div>
        )}
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Tip:</strong> Ask specific questions about your GTU subjects for detailed explanations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIAssistant