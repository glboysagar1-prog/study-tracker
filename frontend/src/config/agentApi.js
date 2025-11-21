export const AGENT_BASE_URL = '/agent';

export const agentApi = {
    chat: async (userInput) => {
        const response = await fetch(`${AGENT_BASE_URL}/chat?user_input=${encodeURIComponent(userInput)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        return response.json();
    },
    summarizeVideo: async (videoUrl) => {
        const response = await fetch(`${AGENT_BASE_URL}/summarize-video?video_url=${encodeURIComponent(videoUrl)}`, {
            method: 'POST'
        });
        return response.json();
    },
    generateFlashcards: async (topic, count = 10) => {
        const response = await fetch(`${AGENT_BASE_URL}/flashcards?topic=${encodeURIComponent(topic)}&count=${count}`, {
            method: 'POST'
        });
        return response.json();
    },
    submitFeedback: async (userInput, agentResponse, rating, comment = "") => {
        const response = await fetch(`${AGENT_BASE_URL}/feedback?user_input=${encodeURIComponent(userInput)}&agent_response=${encodeURIComponent(agentResponse)}&rating=${rating}&comment=${encodeURIComponent(comment)}`, {
            method: 'POST'
        });
        return response.json();
    }
};
