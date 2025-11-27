// API Base URL - can be overridden by environment variable
const getApiBaseUrl = () => {
    // Check if we have an explicit VITE_API_URL environment variable
    if (import.meta.env.VITE_API_URL) {
        // VITE_API_URL should already include /api, so return it as is
        return import.meta.env.VITE_API_URL;
    }

    // In production (deployed), use relative URL so Vercel rewrites work
    // In development, use localhost
    if (import.meta.env.MODE === 'production') {
        return '/api';
    }

    // For development, use the correct local backend port (5004 based on our setup)
    return 'http://localhost:5004/api';
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