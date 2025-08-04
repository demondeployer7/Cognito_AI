/**
 * Environment configuration for API endpoints
 */

// Get the base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5000';
console.log(API_BASE_URL)
export const apiConfig = {
    baseUrl: API_BASE_URL,
    endpoints: {
        chat: `${API_BASE_URL}/get_response`,
        health: `${API_BASE_URL}/health`,
    },
    // Request timeout in milliseconds
    timeout: 30000,
};

export default apiConfig;
