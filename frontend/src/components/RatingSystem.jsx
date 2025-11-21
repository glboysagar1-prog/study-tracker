import React, { useState } from 'react';

const RatingSystem = ({ materialId, currentRating, onRate }) => {
    const [rating, setRating] = useState(currentRating || 0);
    const [hover, setHover] = useState(0);

    const submitRating = async (stars) => {
        setRating(stars);
        try {
            // Mock user ID
            const userId = "00000000-0000-0000-0000-000000000000";

            const response = await fetch('/api/ratings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    material_id: materialId,
                    rating: stars
                })
            });

            if (response.ok) {
                if (onRate) onRate(stars);
            }
        } catch (error) {
            console.error("Rating failed", error);
        }
    };

    return (
        <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    className={`text-xl focus:outline-none transition-colors ${star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                    onClick={() => submitRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(rating)}
                >
                    ★
                </button>
            ))}
        </div>
    );
};

export default RatingSystem;
