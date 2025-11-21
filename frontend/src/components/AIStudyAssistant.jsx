import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChatHeader, ChatInput, MessageBubble, TypingIndicator, EmptyState } from './ChatComponents';

import { agentApi } from '../config/agentApi';

const AIStudyAssistant = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const data = await agentApi.chat(input);

            let content = "I'm sorry, I couldn't process that.";
            if (data.success && data.response) {
                if (typeof data.response === 'string') {
                    content = data.response;
                } else if (data.response.content) {
                    content = data.response.content;
                }
            }

            const aiMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: content,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Error getting AI response:", error);
            const errorMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: "Sorry, I'm having trouble connecting right now. Please try again later.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleClearChat = () => {
        if (window.confirm("Are you sure you want to clear the chat history?")) {
            setMessages([]);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] max-w-4xl mx-auto bg-gray-50 dark:bg-gray-900 shadow-xl rounded-lg overflow-hidden my-4 border border-gray-200 dark:border-gray-800">
            {/* Header */}
            <ChatHeader onClear={handleClearChat} onSettings={() => alert("Settings coming soon!")} />

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 scroll-smooth">
                {messages.length === 0 ? (
                    <EmptyState />
                ) : (
                    <AnimatePresence initial={false}>
                        {messages.map((message) => (
                            <MessageBubble key={message.id} message={message} />
                        ))}
                    </AnimatePresence>
                )}

                {/* Typing indicator */}
                {isTyping && <TypingIndicator />}

                {/* Auto-scroll anchor */}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <ChatInput
                input={input}
                setInput={setInput}
                onSend={handleSend}
                isVoiceMode={isVoiceMode}
                setIsVoiceMode={setIsVoiceMode}
            />
        </div>
    );
};

export default AIStudyAssistant;
