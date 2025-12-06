/**
 * Feedback Widget Component
 * Collects detailed user feedback for self-improvement loops
 */

import React, { useState, useEffect } from 'react';
import '../index.css';

const FeedbackWidget = ({
    contentId,
    contentVariantId,
    contentType = 'note',
    languageCode = 'en',
    onFeedbackSubmitted
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [step, setStep] = useState(1); // 1: ratings, 2: comment (optional)
    const [submitted, setSubmitted] = useState(false);
    const [startTime] = useState(Date.now());

    const [feedback, setFeedback] = useState({
        clarity_rating: 0,
        accuracy_rating: 0,
        usefulness_rating: 0,
        overall_rating: 0,
        completed: false,
        comment: '',
        reported_issue: false,
        issue_type: null
    });

    // Track time spent
    useEffect(() => {
        const markCompleted = () => {
            setFeedback(prev => ({ ...prev, completed: true }));
        };

        // Mark as completed if user stays for > 30 seconds
        const timer = setTimeout(markCompleted, 30000);

        return () => clearTimeout(timer);
    }, []);

    const handleRatingClick = (category, value) => {
        setFeedback(prev => ({ ...prev, [category]: value }));

        // Auto-calculate overall if all rated
        const newFeedback = { ...feedback, [category]: value };
        if (newFeedback.clarity_rating && newFeedback.accuracy_rating && newFeedback.usefulness_rating) {
            const avg = Math.round(
                (newFeedback.clarity_rating + newFeedback.accuracy_rating + newFeedback.usefulness_rating) / 3
            );
            setFeedback(prev => ({ ...prev, overall_rating: avg }));
        }
    };

    const handleQuickReaction = (emoji) => {
        const ratingMap = {
            '😍': 5, // Loved it
            '😊': 4, // Good
            '😐': 3, // Okay
            '😕': 2, // Not great
            '😢': 1  // Poor
        };

        const rating = ratingMap[emoji];
        setFeedback(prev => ({
            ...prev,
            overall_rating: rating,
            clarity_rating: rating,
            accuracy_rating: rating,
            usefulness_rating: rating
        }));

        // Quick submit
        setTimeout(() => submitFeedback(), 500);
    };

    const submitFeedback = async () => {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);

        const payload = {
            content_id: contentId,
            content_variant_id: contentVariantId,
            content_type: contentType,
            language_code: languageCode,
            time_spent_seconds: timeSpent,
            ...feedback
        };

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/multilingual/feedback/detailed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setSubmitted(true);
                if (onFeedbackSubmitted) {
                    onFeedbackSubmitted(payload);
                }

                // Auto-collapse after 3 seconds
                setTimeout(() => setIsExpanded(false), 3000);
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
        }
    };

    const handleReportIssue = (issueType) => {
        setFeedback(prev => ({
            ...prev,
            reported_issue: true,
            issue_type: issueType
        }));
    };

    const renderRatingStars = (category, label) => {
        const currentRating = feedback[category];

        return (
            <div className="rating-row">
                <span className="rating-label">{label}</span>
                <div className="stars">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            key={star}
                            className={`star ${star <= currentRating ? 'filled' : ''}`}
                            onClick={() => handleRatingClick(category, star)}
                        >
                            ★
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    if (submitted) {
        return (
            <div className="feedback-widget submitted">
                <div className="success-message">
                    <div className="success-icon">✓</div>
                    <h4>Thank you for your feedback!</h4>
                    <p>Your input helps improve study materials for everyone.</p>
                    <div className="impact-badge">
                        🎯 Your feedback has helped improve <strong>12</strong> study notes!
                    </div>
                </div>

                <style jsx>{`
          .feedback-widget.submitted {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 24px;
            border-radius: 16px;
            color: white;
            text-align: center;
            animation: successSlide 0.5s ease;
          }

          @keyframes successSlide {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .success-icon {
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            margin: 0 auto 16px;
          }

          .success-message h4 {
            margin: 0 0 8px;
            font-size: 20px;
          }

          .success-message p {
            margin: 0;
            opacity: 0.9;
            font-size: 14px;
          }

          .impact-badge {
            margin-top: 16px;
            padding: 12px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 10px;
            font-size: 13px;
          }

          .impact-badge strong {
            font-size: 16px;
            color: #ffd700;
          }
        `}</style>
            </div>
        );
    }

    return (
        <div className={`feedback-widget ${isExpanded ? 'expanded' : 'collapsed'}`}>
            {!isExpanded ? (
                <button className="feedback-trigger" onClick={() => setIsExpanded(true)}>
                    <span className="icon">💬</span>
                    <span className="text">Rate this content</span>
                    <span className="emoji-hint">😊 Quick feedback</span>
                </button>
            ) : (
                <div className="feedback-form">
                    <div className="form-header">
                        <h4>How was this content?</h4>
                        <button className="close-btn" onClick={() => setIsExpanded(false)}>×</button>
                    </div>

                    {step === 1 && (
                        <div className="step-1">
                            <div className="quick-reactions">
                                {['😍', '😊', '😐', '😕', '😢'].map(emoji => (
                                    <button
                                        key={emoji}
                                        className="emoji-btn"
                                        onClick={() => handleQuickReaction(emoji)}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>

                            <div className="divider">or rate specifically</div>

                            <div className="detailed-ratings">
                                {renderRatingStars('clarity_rating', 'Clarity')}
                                {renderRatingStars('accuracy_rating', 'Accuracy')}
                                {renderRatingStars('usefulness_rating', 'Usefulness')}
                            </div>

                            <div className="action-buttons">
                                <button
                                    className="report-btn"
                                    onClick={() => setStep(2)}
                                >
                                    Report Issue
                                </button>
                                <button
                                    className="submit-btn"
                                    onClick={submitFeedback}
                                    disabled={!feedback.overall_rating}
                                >
                                    Submit Feedback
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="step-2">
                            <h5>Report an Issue</h5>
                            <div className="issue-types">
                                {['translation_error', 'factual_error', 'unclear', 'other'].map(type => (
                                    <button
                                        key={type}
                                        className={`issue-btn ${feedback.issue_type === type ? 'selected' : ''}`}
                                        onClick={() => handleReportIssue(type)}
                                    >
                                        {type.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>

                            <textarea
                                className="comment-box"
                                placeholder="Tell us more (optional)..."
                                value={feedback.comment}
                                onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                                rows="3"
                            />

                            <div className="action-buttons">
                                <button className="back-btn" onClick={() => setStep(1)}>
                                    Back
                                </button>
                                <button className="submit-btn" onClick={submitFeedback}>
                                    Submit Report
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
        .feedback-widget {
          margin-top: 32px;
          transition: all 0.3s ease;
        }

        .feedback-trigger {
          width: 100%;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px dashed rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s ease;
        }

        .feedback-trigger:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-2px);
        }

        .feedback-trigger .icon {
          font-size: 24px;
        }

        .feedback-trigger .text {
          flex: 1;
          font-weight: 500;
        }

        .emoji-hint {
          font-size: 20px;
        }

        .feedback-form {
          background: rgba(30, 30, 40, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 24px;
          animation: formSlide 0.3s ease;
        }

        @keyframes formSlide {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .form-header h4 {
          margin: 0;
          color: white;
          font-size: 18px;
        }

        .close-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          font-size: 28px;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s;
        }

        .close-btn:hover {
          color: white;
        }

        .quick-reactions {
          display: flex;
          justify-content: space-around;
          gap: 12px;
          margin-bottom: 20px;
        }

        .emoji-btn {
          flex: 1;
          padding: 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          font-size: 28px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .emoji-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .divider {
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
          margin: 20px 0;
          font-size: 13px;
        }

        .detailed-ratings {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 20px;
        }

        .rating-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .rating-label {
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          font-weight: 500;
        }

        .stars {
          display: flex;
          gap: 8px;
        }

        .star {
          background: none;
          border: none;
          font-size: 24px;
          color: rgba(255, 255, 255, 0.2);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .star:hover {
          color: #ffd700;
          transform: scale(1.15);
        }

        .star.filled {
          color: #ffd700;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .report-btn,
        .back-btn {
          flex: 1;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          color: white;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .report-btn:hover,
        .back-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .submit-btn {
          flex: 1;
          padding: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 10px;
          color: white;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .issue-types {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 16px;
        }

        .issue-btn {
          padding: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          cursor: pointer;
          font-size: 13px;
          text-transform: capitalize;
          transition: all 0.2s ease;
        }

        .issue-btn.selected {
          background: rgba(239, 68, 68, 0.2);
          border-color: #ef4444;
        }

        .comment-box {
          width: 100%;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: white;
          font-family: inherit;
          font-size: 14px;
          resize: vertical;
          margin-bottom: 16px;
        }

        .comment-box::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        @media (max-width: 640px) {
          .quick-reactions {
            gap: 8px;
          }

          .emoji-btn {
            padding: 12px;
            font-size: 24px;
          }
        }
      `}</style>
        </div>
    );
};

export default FeedbackWidget;
