// API Base URL - can be overridden by environment variable
const getApiBaseUrl = () => {
    let url = import.meta.env.VITE_API_URL || 'http://localhost:5004/api';
    // Ensure it ends with /api if it's not the default localhost (which already has it)
    if (url !== 'http://localhost:5004/api' && !url.endsWith('/api')) {
        url = `${url}/api`;
    }
    return url;
};

export const API_BASE_URL = getApiBaseUrl();

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
