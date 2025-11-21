import React, { useState, useRef, useEffect } from 'react';

const SubjectChat = ({ subjectCode, subjectName, onClose }) => {
    const [messages, setMessages] = useState([
        { text: `Hi! I'm your AI tutor for ${subjectName}. Ask me anything about the syllabus, concepts, or exam preparation!`, sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const formatResponse = (text) => {
        // Basic markdown-like formatting
        let formatted = text;

        // Bold: **text**
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Code blocks: ```code```
        formatted = formatted.replace(/```(.*?)```/gs, '<pre class="bg-gray-100 p-2 rounded my-2 overflow-x-auto"><code>$1</code></pre>');

        // Inline code: `code`
        formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>');

        // Bullet points
        formatted = formatted.replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>');
        if (formatted.includes('<li')) {
            formatted = formatted.replace(/(<li.*<\/li>)/s, '<ul class="list-disc my-2">$1</ul>');
        }

        // Line breaks
        formatted = formatted.replace(/\n/g, '<br/>');

        return formatted;
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5004/api/ai-chat/subject', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subject_code: subjectCode,
                    question: currentInput,
                    chat_history: messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }))
                }),
            });

            const data = await response.json();

            if (data.success && data.response) {
                setMessages(prev => [...prev, { text: data.response, sender: 'ai' }]);
            } else {
                setMessages(prev => [...prev, {
                    text: "Sorry, I encountered an error. Please try again.",
                    sender: 'ai'
                }]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, {
                text: "Sorry, I'm having trouble connecting right now. Please ensure the backend is running.",
                sender: 'ai'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleExplainTopic = async (topic) => {
        const userMessage = { text: `Explain: ${topic}`, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5004/api/ai-chat/explain-topic', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subject_code: subjectCode,
                    topic: topic
                }),
            });

            const data = await response.json();

            if (data.success && data.explanation) {
                setMessages(prev => [...prev, { text: data.explanation, sender: 'ai' }]);
            } else {
                setMessages(prev => [...prev, {
                    text: "Sorry, I couldn't generate an explanation. Please try again.",
                    sender: 'ai'
                }]);
            }
        } catch (error) {
            console.error('Error explaining topic:', error);
            setMessages(prev => [...prev, {
                text: "Sorry, I'm having trouble connecting right now.",
                sender: 'ai'
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full h-[80vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">AI Subject Tutor</h2>
                        <p className="text-sm text-blue-100">{subjectName} ({subjectCode})</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 text-2xl font-bold transition-colors"
                    >
                        ×
                    </button>
                </div>

                {/* Messages Container */}
                <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] p-4 rounded-lg ${msg.sender === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                                    }`}
                            >
                                {msg.sender === 'ai' ? (
                                    <div
                                        className="prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: formatResponse(msg.text) }}
                                    />
                                ) : (
                                    <div className="whitespace-pre-wrap">{msg.text}</div>
                                )}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start mb-4">
                            <div className="bg-white text-gray-500 p-4 rounded-lg border border-gray-200 rounded-bl-none shadow-sm flex items-center">
                                <div className="flex space-x-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                                <span className="ml-2 text-sm">AI is thinking...</span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Suggested Questions */}
                {messages.length === 1 && (
                    <div className="px-4 py-2 bg-white border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setInput("Explain the key topics in this subject")}
                                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-full"
                            >
                                Key Topics
                            </button>
                            <button
                                onClick={() => setInput("What are the most important concepts to focus on?")}
                                className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1 rounded-full"
                            >
                                Important Concepts
                            </button>
                            <button
                                onClick={() => setInput("How should I prepare for the exam?")}
                                className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded-full"
                            >
                                Exam Preparation
                            </button>
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
                    <div className="flex items-end gap-2">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask a question about this subject... (Shift+Enter for new line)"
                            className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows="2"
                            disabled={loading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className={`p-3 rounded-lg text-white transition-all ${loading || !input.trim()
                                    ? 'bg-blue-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 transform hover:scale-105'
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        💡 Tip: Ask about specific topics, exam patterns, or request explanations of concepts
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SubjectChat;
