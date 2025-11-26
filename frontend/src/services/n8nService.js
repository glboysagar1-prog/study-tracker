/**
 * N8N Webhook Service
 * Handles all communication with the N8N automation workflow
 */

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL ||
    'https://samalt0.app.n8n.cloud/webhook/df3ef169-ca71-46c0-a468-ec999d2e80f4/chat';

// Event types for N8N workflow
export const N8N_EVENTS = {
    USER_MESSAGE: 'user_message',
    SUBJECT_CHAT: 'subject_chat',
    GENERATE_NOTES: 'generate_notes',
    START_QUIZ: 'start_quiz',
    IMPORTANT_QUESTIONS: 'important_questions',
    PREVIOUS_PAPERS: 'previous_papers',
    EXPLAIN_TOPIC: 'explain_topic',
    SCRAPE_MATERIALS: 'scrape_materials',
};

/**
 * Generate or retrieve session ID for user
 */
const getSessionId = () => {
    let sessionId = localStorage.getItem('n8n_session_id');
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('n8n_session_id', sessionId);
    }
    return sessionId;
};

/**
 * Get user ID (optional, for authenticated users)
 */
const getUserId = () => {
    // TODO: Implement when user authentication is added
    return localStorage.getItem('user_id') || null;
};

/**
 * Send request to N8N webhook
 * @param {string} eventType - Type of event (from N8N_EVENTS)
 * @param {object} payload - Event-specific data
 * @param {array} previousMessages - Optional chat history for context
 * @returns {Promise<object>} N8N response
 */
export const sendToN8N = async (eventType, payload, previousMessages = []) => {
    const sessionId = getSessionId();
    const userId = getUserId();

    const requestBody = {
        sessionId,
        userId,
        eventType,
        payload,
        previousMessages: previousMessages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
        }))
    };

    try {
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`N8N webhook returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            success: true,
            data
        };
    } catch (error) {
        console.error('N8N webhook error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Send a general chat message
 */
export const sendChatMessage = async (message, previousMessages = []) => {
    return sendToN8N(N8N_EVENTS.USER_MESSAGE, { query: message }, previousMessages);
};

/**
 * Send a subject-specific chat message
 */
export const sendSubjectChat = async (subjectCode, subjectName, question, previousMessages = []) => {
    return sendToN8N(
        N8N_EVENTS.SUBJECT_CHAT,
        {
            subjectCode,
            subjectName,
            query: question
        },
        previousMessages
    );
};

/**
 * Request notes generation
 */
export const generateNotes = async (subjectCode, unit, topic = null) => {
    return sendToN8N(N8N_EVENTS.GENERATE_NOTES, {
        subjectCode,
        unit,
        topic,
        query: `Generate notes for ${topic || `Unit ${unit}`}`
    });
};

/**
 * Request quiz/mock test generation
 */
export const generateQuiz = async (subjectCode, difficulty = 'medium', topics = []) => {
    return sendToN8N(N8N_EVENTS.START_QUIZ, {
        subjectCode,
        difficulty,
        topics,
        query: 'Generate a practice quiz'
    });
};

/**
 * Request important questions
 */
export const getImportantQuestions = async (subjectCode, subjectName, unit = null) => {
    return sendToN8N(N8N_EVENTS.IMPORTANT_QUESTIONS, {
        subjectCode,
        subjectName,
        unit,
        query: `Get important questions for ${subjectName}${unit ? ` Unit ${unit}` : ''}`
    });
};

/**
 * Request previous papers
 */
export const getPreviousPapers = async (subjectCode, subjectName, year = null) => {
    return sendToN8N(N8N_EVENTS.PREVIOUS_PAPERS, {
        subjectCode,
        subjectName,
        year,
        query: `Get previous year papers for ${subjectName}${year ? ` (${year})` : ''}`
    });
};

/**
 * Request topic explanation
 */
export const explainTopic = async (subjectCode, topic, unit = null) => {
    return sendToN8N(N8N_EVENTS.EXPLAIN_TOPIC, {
        subjectCode,
        topic,
        unit,
        query: `Explain: ${topic}`
    });
};

/**
 * Trigger material scraping
 */
export const scrapeMaterials = async (subjectCode, sources = []) => {
    return sendToN8N(N8N_EVENTS.SCRAPE_MATERIALS, {
        subjectCode,
        sources,
        query: 'Scrape and update study materials'
    });
};

/**
 * Reset session (useful for testing or logout)
 */
export const resetSession = () => {
    localStorage.removeItem('n8n_session_id');
};

export default {
    sendToN8N,
    sendChatMessage,
    sendSubjectChat,
    generateNotes,
    generateQuiz,
    getImportantQuestions,
    getPreviousPapers,
    explainTopic,
    scrapeMaterials,
    resetSession,
    N8N_EVENTS
};
