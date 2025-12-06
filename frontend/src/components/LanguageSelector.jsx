/**
 * Language Selector Component
 * Allows users to select their preferred language for content
 */

import React, { useState, useEffect } from 'react';
import '../index.css';

const LANGUAGE_FLAGS = {
    en: '🇺🇸',
    gu: '🇮🇳',
    hi: '🇮🇳',
    mr: '🇮🇳',
    ta: '🇮🇳',
    te: '🇮🇳',
    bn: '🇧🇩',
    pa: '🇮🇳',
    kn: '🇮🇳',
    ml: '🇮🇳',
    or: '🇮🇳',
    as: '🇮🇳'
};

const SUPPORTED_LANGUAGES = {
    en: 'English',
    gu: 'ગુજરાતી (Gujarati)',
    hi: 'हिंदी (Hindi)',
    mr: 'मराठी (Marathi)',
    ta: 'தமிழ் (Tamil)',
    te: 'తెలుగు (Telugu)',
    bn: 'বাংলা (Bengali)',
    pa: 'ਪੰਜਾਬੀ (Punjabi)',
    kn: 'ಕನ್ನಡ (Kannada)',
    ml: 'മലയാളം (Malayalam)',
    or: 'ଓଡ଼ିଆ (Odia)',
    as: 'অসমীয়া (Assamese)'
};

const LanguageSelector = ({ currentLanguage = 'en', onLanguageChange, className = '' }) => {
    const [selectedLang, setSelectedLang] = useState(currentLanguage);
    const [isOpen, setIsOpen] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);

    useEffect(() => {
        // Load language preference from localStorage
        const savedLang = localStorage.getItem('preferredLanguage');
        if (saved Lang && SUPPORTED_LANGUAGES[savedLang]) {
        setSelectedLang(savedLang);
        if (onLanguageChange) {
            onLanguageChange(savedLang);
        }
    }
}, []);

const handleLanguageSelect = async (langCode) => {
    setIsTranslating(true);
    setSelectedLang(langCode);
    setIsOpen(false);

    // Save to localStorage
    localStorage.setItem('preferredLanguage', langCode);

    // Notify parent component
    if (onLanguageChange) {
        await onLanguageChange(langCode);
    }

    setTimeout(() => setIsTranslating(false), 500);
};

return (
    <div className={`language-selector ${className}`}>
        <div className="selector-container">
            <button
                className="language-button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Select Language"
            >
                <span className="flag">{LANGUAGE_FLAGS[selectedLang] || '🌐'}</span>
                <span className="lang-name">{SUPPORTED_LANGUAGES[selectedLang]?.split('(')[0] || 'Language'}</span>
                <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isTranslating && (
                <div className="translating-indicator">
                    <div className="spinner"></div>
                    <span>Translating...</span>
                </div>
            )}

            {isOpen && (
                <div className="language-dropdown">
                    <div className="dropdown-header">
                        <span>Select Language</span>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
                    </div>
                    <div className="language-list">
                        {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                            <button
                                key={code}
                                className={`language-option ${code === selectedLang ? 'selected' : ''}`}
                                onClick={() => handleLanguageSelect(code)}
                            >
                                <span className="flag">{LANGUAGE_FLAGS[code] || '🌐'}</span>
                                <span className="name">{name}</span>
                                {code === selectedLang && <span className="checkmark">✓</span>}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>

        <style jsx>{`
        .language-selector {
          position: relative;
          z-index: 100;
        }

        .selector-container {
          position: relative;
        }

        .language-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .language-button:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .flag {
          font-size: 18px;
        }

        .lang-name {
          font-weight: 500;
        }

        .dropdown-arrow {
          font-size: 10px;
          margin-left: 4px;
          transition: transform 0.3s ease;
        }

        .translating-indicator {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 8px;
          padding: 8px 12px;
          background: rgba(59, 130, 246, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          color: white;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          white-space: nowrap;
          animation: slideIn 0.3s ease;
        }

        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .language-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 280px;
          max-height: 400px;
          background: rgba(30, 30, 40, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          animation: dropdownSlide 0.3s ease;
        }

        @keyframes dropdownSlide {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-header {
          padding: 16px;
          background: rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
          font-weight: 600;
          font-size: 15px;
        }

        .close-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .close-btn:hover {
          color: white;
        }

        .language-list {
          max-height: 350px;
          overflow-y: auto;
          padding: 8px;
        }

        .language-list::-webkit-scrollbar {
          width: 6px;
        }

        .language-list::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }

        .language-list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        .language-option {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: transparent;
          border: none;
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.9);
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          text-align: left;
        }

        .language-option:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateX(4px);
        }

        .language-option.selected {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-weight: 500;
        }

        .language-option .flag {
          font-size: 20px;
        }

        .language-option .name {
          flex: 1;
        }

        .checkmark {
          margin-left: auto;
          font-weight: bold;
          font-size: 16px;
        }

        @media (max-width: 640px) {
          .language-dropdown {
            width: 260px;
          }

          .lang-name {
            display: none;
          }

          .language-button {
            padding: 8px 12px;
          }
        }
      `}</style>
    </div>
);
};

export default LanguageSelector;
