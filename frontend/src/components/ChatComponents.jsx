import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// --- Chat Header ---
export function ChatHeader({ onClear, onSettings }) {
    const [isOnline, setIsOnline] = useState(true);

    return (
        <motion.header
            className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 z-10"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
        >
            <div className="flex items-center gap-3">
                {/* AI Avatar with pulse effect */}
                <div className="relative">
                    <motion.div
                        className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <span className="text-xl">🤖</span>
                    </motion.div>

                    {/* Online status indicator */}
                    {isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                    )}
                </div>

                <div>
                    <h1 className="font-bold text-lg text-gray-800 dark:text-white leading-tight">GTU Study AI</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isOnline ? '🟢 Online • Ready to help' : '🔴 Offline'}
                    </p>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
                <button onClick={onClear} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-300" title="Clear chat">
                    🗑️
                </button>
                <button onClick={onSettings} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-300" title="Settings">
                    ⚙️
                </button>
            </div>
        </motion.header>
    );
}

// --- Message Actions ---
function MessageActions({ message }) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRate = (type) => {
        // Mock rating
        console.log(`Rated message ${message.id} as ${type}`);
        alert(`Thanks for your feedback! (${type})`);
    };

    return (
        <div className="flex gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xs text-gray-500 dark:text-gray-400"
                onClick={copyToClipboard}
                title={copied ? 'Copied!' : 'Copy'}
            >
                {copied ? '✅' : '📋'}
            </button>

            <button
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xs text-gray-500 dark:text-gray-400"
                title="Read aloud"
                onClick={() => {
                    const utterance = new SpeechSynthesisUtterance(message.content);
                    window.speechSynthesis.speak(utterance);
                }}
            >
                🔊
            </button>

            <button
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xs text-gray-500 dark:text-gray-400"
                title="Good response"
                onClick={() => handleRate('up')}
            >
                👍
            </button>

            <button
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xs text-gray-500 dark:text-gray-400"
                title="Bad response"
                onClick={() => handleRate('down')}
            >
                👎
            </button>
        </div>
    );
}

// --- Message Bubble ---
export function MessageBubble({ message }) {
    const isUser = message.role === 'user';

    return (
        <motion.div
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 group`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
        >
            <div className={`flex gap-2 max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-white shadow-sm mt-1">
                        🤖
                    </div>
                )}

                {/* Message content */}
                <div className={`
          px-4 py-3 rounded-2xl shadow-sm
          ${isUser
                        ? 'bg-blue-600 text-white rounded-tr-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-sm'
                    }
        `}>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>

                    {/* Timestamp */}
                    <span className={`text-[10px] mt-1 block text-right opacity-70`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {/* Actions (for AI messages) */}
                    {!isUser && (
                        <MessageActions message={message} />
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// --- Typing Indicator ---
export function TypingIndicator() {
    return (
        <motion.div
            className="flex gap-2 items-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
                🤖
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                            animate={{
                                y: [0, -6, 0],
                                opacity: [0.4, 1, 0.4]
                            }}
                            transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.15
                            }}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

// --- Quick Suggestions ---
export function QuickSuggestions({ onSelect }) {
    const suggestions = [
        { icon: '📚', text: 'Explain Data Structures' },
        { icon: '❓', text: 'Important questions for DBMS' },
        { icon: '📝', text: 'Summarize Unit 3' },
        { icon: '💡', text: 'Exam tips' },
    ];

    return (
        <div className="flex gap-2 mb-3 overflow-x-auto pb-2 px-1 hide-scrollbar">
            {suggestions.map((suggestion, i) => (
                <motion.button
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-200 transition-colors shadow-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect(suggestion.text)}
                >
                    <span>{suggestion.icon}</span>
                    <span>{suggestion.text}</span>
                </motion.button>
            ))}
        </div>
    );
}

// --- Chat Input ---
export function ChatInput({ input, setInput, onSend, isVoiceMode, setIsVoiceMode }) {
    const textareaRef = useRef(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    }, [input]);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
            <QuickSuggestions onSelect={(text) => setInput(text)} />

            <div className="flex items-end gap-2">
                {/* Textarea */}
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything about your subjects..."
                        className="w-full px-4 py-3 pr-10 rounded-2xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none max-h-32 text-sm outline-none transition-all"
                        rows={1}
                    />
                </div>

                {/* Voice button */}
                <motion.button
                    className={`p-3 rounded-full shadow-md flex-shrink-0 transition-colors ${isVoiceMode
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsVoiceMode(!isVoiceMode)}
                    title="Voice Mode"
                >
                    {isVoiceMode ? '⏹️' : '🎤'}
                </motion.button>

                {/* Send button */}
                <motion.button
                    className={`p-3 rounded-full shadow-md flex-shrink-0 transition-colors ${input.trim()
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                        }`}
                    whileTap={{ scale: 0.9 }}
                    onClick={onSend}
                    disabled={!input.trim()}
                    title="Send"
                >
                    ➤
                </motion.button>
            </div>

            <div className="text-center mt-2">
                <span className="text-[10px] text-gray-400">AI can make mistakes. Verify important info.</span>
            </div>
        </div>
    );
}

// --- Empty State ---
export function EmptyState() {
    return (
        <motion.div
            className="flex flex-col items-center justify-center h-full text-center p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="text-6xl mb-6">🤖</div>
            <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">GTU Study AI Assistant</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md text-sm leading-relaxed">
                Ask me anything about your GTU subjects. I can help with concepts,
                important questions, exam preparation, and more!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                {[
                    { icon: "💡", title: "Concept Explanation", desc: "Get clear explanations" },
                    { icon: "❓", title: "Practice Questions", desc: "Generate questions" },
                    { icon: "🎤", title: "Voice Mode", desc: "Study hands-free" },
                    { icon: "📊", title: "Exam Tips", desc: "Preparation advice" }
                ].map((feature, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow text-left">
                        <div className="text-2xl mb-2">{feature.icon}</div>
                        <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{feature.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
