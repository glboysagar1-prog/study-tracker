import React, { useState, useEffect } from 'react';

const FlashcardViewer = ({ subjectCode, unit, onClose }) => {
    const [flashcards, setFlashcards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [shuffled, setShuffled] = useState(false);

    useEffect(() => {
        const fetchFlashcards = async () => {
            try {
                const endpoint = unit
                    ? `http://localhost:5004/api/flashcards/${subjectCode}/${unit}`
                    : `http://localhost:5004/api/flashcards/${subjectCode}`;

                const response = await fetch(endpoint);
                const data = await response.json();

                if (data.flashcards && data.flashcards.length > 0) {
                    setFlashcards(data.flashcards);
                } else {
                    setFlashcards([]);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching flashcards:', error);
                setLoading(false);
            }
        };

        if (subjectCode) {
            fetchFlashcards();
        }
    }, [subjectCode, unit]);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

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
        setShuffled(true);
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy':
                return 'bg-green-100 text-green-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'hard':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-lg shadow-xl">
                    <div className="text-xl">Loading flashcards...</div>
                </div>
            </div>
        );
    }

    if (flashcards.length === 0) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-lg shadow-xl max-w-md">
                    <h2 className="text-2xl font-bold mb-4">No Flashcards Available</h2>
                    <p className="text-gray-600 mb-6">
                        There are no flashcards available for this {unit ? 'unit' : 'subject'} yet.
                    </p>
                    <button
                        onClick={onClose}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                    >
                        Close
                    </button>
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
                        <p className="text-sm text-blue-100">
                            {unit ? `Unit ${unit}` : 'All Units'} - {subjectCode}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="bg-gray-200 h-2">
                    <div
                        className="bg-blue-600 h-2 transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
                    ></div>
                </div>

                {/* Card Container */}
                <div className="p-8">
                    {/* Flashcard */}
                    <div
                        onClick={handleFlip}
                        className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg cursor-pointer transition-all duration-500 transform hover:scale-105 min-h-[300px] flex items-center justify-center p-8"
                        style={{
                            perspective: '1000px',
                            transformStyle: 'preserve-3d',
                        }}
                    >
                        <div
                            className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-opacity duration-500 ${isFlipped ? 'opacity-0' : 'opacity-100'
                                }`}
                        >
                            <div className="text-center">
                                <div className="text-sm text-gray-500 uppercase tracking-wide mb-4">Question</div>
                                <p className="text-xl font-semibold text-gray-800">{currentCard.question}</p>
                            </div>
                        </div>

                        <div
                            className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-opacity duration-500 ${isFlipped ? 'opacity-100' : 'opacity-0'
                                }`}
                        >
                            <div className="text-center">
                                <div className="text-sm text-gray-500 uppercase tracking-wide mb-4">Answer</div>
                                <p className="text-lg text-gray-700">{currentCard.answer}</p>
                            </div>
                        </div>

                        {/* Flip Indicator */}
                        <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                            Click to flip
                        </div>
                    </div>

                    {/* Difficulty Badge */}
                    <div className="flex justify-center mt-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentCard.difficulty)}`}>
                            {currentCard.difficulty || 'Medium'}
                        </span>
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex justify-between items-center mt-6">
                        <button
                            onClick={handlePrevious}
                            disabled={currentIndex === 0}
                            className={`px-4 py-2 rounded-md font-medium ${currentIndex === 0
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                }`}
                        >
                            ← Previous
                        </button>

                        <div className="text-center">
                            <div className="text-sm text-gray-600">
                                Card {currentIndex + 1} of {flashcards.length}
                            </div>
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={currentIndex === flashcards.length - 1}
                            className={`px-4 py-2 rounded-md font-medium ${currentIndex === flashcards.length - 1
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                }`}
                        >
                            Next →
                        </button>
                    </div>

                    {/* Additional Controls */}
                    <div className="flex justify-center gap-4 mt-6">
                        <button
                            onClick={handleShuffle}
                            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md font-medium flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Shuffle
                        </button>

                        <button
                            onClick={() => { setCurrentIndex(0); setIsFlipped(false); }}
                            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-medium"
                        >
                            Restart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlashcardViewer;
