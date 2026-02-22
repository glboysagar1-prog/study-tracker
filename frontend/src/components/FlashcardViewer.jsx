import React, { useState } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';

const FlashcardViewer = ({ subjectCode, unit, onClose }) => {
    const [flashcards, setFlashcards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(false);
    const [generated, setGenerated] = useState(false);
    const chat = useAction(api.ai.chat);

    const generateFlashcards = async () => {
        setLoading(true);
        try {
            const response = await chat({
                prompt: `Generate 10 flashcards for GTU subject "${subjectCode}" ${unit ? `Unit ${unit}` : ''}. Return ONLY a JSON array of objects with "question" and "answer" keys. Each should be a key concept or definition. Example format: [{"question":"What is...","answer":"It is..."}]`
            });

            try {
                // Try to parse JSON from the response
                const jsonMatch = response.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    setFlashcards(parsed);
                } else {
                    setFlashcards([]);
                }
            } catch {
                setFlashcards([]);
            }
            setGenerated(true);
        } catch (error) {
            console.error('Error generating flashcards:', error);
            setGenerated(true);
        } finally {
            setLoading(false);
        }
    };

    const handleFlip = () => setIsFlipped(!isFlipped);

    const handleNext = () => {
        if (currentIndex < flashcards.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setIsFlipped(false);
        }
    };

    const handleShuffle = () => {
        const shuffledCards = [...flashcards].sort(() => Math.random() - 0.5);
        setFlashcards(shuffledCards);
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    if (!generated) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-lg shadow-xl max-w-md text-center">
                    <h2 className="text-2xl font-bold mb-4">Generate Flashcards</h2>
                    <p className="text-gray-600 mb-6">
                        AI will generate flashcards for {subjectCode} {unit ? `Unit ${unit}` : ''}.
                    </p>
                    {loading ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            <p className="text-gray-500">Generating flashcards...</p>
                        </div>
                    ) : (
                        <div className="flex gap-3 justify-center">
                            <button onClick={generateFlashcards} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium">Generate</button>
                            <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-md font-medium">Cancel</button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (flashcards.length === 0) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-lg shadow-xl max-w-md">
                    <h2 className="text-2xl font-bold mb-4">No Flashcards Available</h2>
                    <p className="text-gray-600 mb-6">Could not generate flashcards. Please try again.</p>
                    <div className="flex gap-3">
                        <button onClick={() => { setGenerated(false); }} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">Try Again</button>
                        <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md">Close</button>
                    </div>
                </div>
            </div>
        );
    }

    const currentCard = flashcards[currentIndex];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Flashcards</h2>
                        <p className="text-sm text-blue-100">{unit ? `Unit ${unit}` : 'All Units'} - {subjectCode}</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl font-bold">×</button>
                </div>

                {/* Progress Bar */}
                <div className="bg-gray-200 h-2">
                    <div className="bg-blue-600 h-2 transition-all duration-300" style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}></div>
                </div>

                {/* Card Container */}
                <div className="p-8">
                    <div onClick={handleFlip} className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg cursor-pointer transition-all duration-500 transform hover:scale-105 min-h-[300px] flex items-center justify-center p-8">
                        <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-opacity duration-500 ${isFlipped ? 'opacity-0' : 'opacity-100'}`}>
                            <div className="text-center">
                                <div className="text-sm text-gray-500 uppercase tracking-wide mb-4">Question</div>
                                <p className="text-xl font-semibold text-gray-800">{currentCard.question}</p>
                            </div>
                        </div>
                        <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-opacity duration-500 ${isFlipped ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="text-center">
                                <div className="text-sm text-gray-500 uppercase tracking-wide mb-4">Answer</div>
                                <p className="text-lg text-gray-700">{currentCard.answer}</p>
                            </div>
                        </div>
                        <div className="absolute bottom-4 right-4 text-xs text-gray-400">Click to flip</div>
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex justify-between items-center mt-6">
                        <button onClick={handlePrevious} disabled={currentIndex === 0} className={`px-4 py-2 rounded-md font-medium ${currentIndex === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>← Previous</button>
                        <div className="text-sm text-gray-600">Card {currentIndex + 1} of {flashcards.length}</div>
                        <button onClick={handleNext} disabled={currentIndex === flashcards.length - 1} className={`px-4 py-2 rounded-md font-medium ${currentIndex === flashcards.length - 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>Next →</button>
                    </div>

                    {/* Additional Controls */}
                    <div className="flex justify-center gap-4 mt-6">
                        <button onClick={handleShuffle} className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md font-medium">🔀 Shuffle</button>
                        <button onClick={() => { setCurrentIndex(0); setIsFlipped(false); }} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-medium">Restart</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlashcardViewer;
