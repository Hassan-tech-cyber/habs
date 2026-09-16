const API_BASE = 'http://localhost:5000/api';

export const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
            throw new Error(data.error || 'API Request Failed');
        }

        return data;
    } catch (error) {
        console.error('API Fetch Error:', error);
        throw error;
    }
};
