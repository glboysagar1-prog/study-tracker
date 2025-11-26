// API Base URL - can be overridden by environment variable
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5004/api';

// N8N Webhook URL for automation
export const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL ||
    'https://samalt0.app.n8n.cloud/webhook/df3ef169-ca71-46c0-a468-ec999d2e80f4/chat';

export const api = {
    get: async (endpoint) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        return response.json();
    },
    post: async (endpoint, data) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    }
};
