const config = {
    // Use Backend URL from environment variable
    api_path: process.env.NEXT_PUBLIC_API_URL || 'https://smartpos-backend-7ee9.onrender.com/api', // Default to Production Backend
    token_name: 'pos_token',
    refresh_token_name: 'pos_refresh_token',
    headers: () => {
        if (typeof window === 'undefined') return {}; // Server-side safety
        const token = localStorage.getItem('pos_token');
        if (!token) {
            console.error('No token found');
            return {};
        }

        return {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        }
    }
}

export default config;
