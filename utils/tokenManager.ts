import axios from 'axios';
import config from '../config';
import toast from 'react-hot-toast';

class TokenManager {
    isRefreshing: boolean;
    failedQueue: any[];
    refreshTimer: any;

    constructor() {
        this.isRefreshing = false;
        this.failedQueue = [];
        this.refreshTimer = null;

        // Setup axios interceptors
        this.setupAxiosInterceptors();

        // Start token refresh timer
        if (typeof window !== 'undefined') {
            this.startRefreshTimer();
        }
    }

    setupAxiosInterceptors() {
        // Request interceptor - Add token to every request
        axios.interceptors.request.use((config) => {
            const token = this.getAccessToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        }, (error) => {
            return Promise.reject(error);
        });

        // Response interceptor - Handle token expiration
        axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status === 401 &&
                    (error.response?.data?.error === 'TOKEN_EXPIRED' ||
                        error.response?.data?.error === 'TOKEN_INVALID') &&
                    !originalRequest._retry) {

                    if (this.isRefreshing) {
                        // If refreshing, add to queue
                        return new Promise((resolve, reject) => {
                            this.failedQueue.push({ resolve, reject });
                        }).then(token => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            return axios(originalRequest);
                        }).catch(err => {
                            return Promise.reject(err);
                        });
                    }

                    originalRequest._retry = true;
                    this.isRefreshing = true;

                    try {
                        const newToken = await this.refreshAccessToken();
                        this.processQueue(null, newToken);

                        // Retry request with new token
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return axios(originalRequest);
                    } catch (refreshError) {
                        this.processQueue(refreshError, null);
                        this.logout();
                        return Promise.reject(refreshError);
                    } finally {
                        this.isRefreshing = false;
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    // Get Access Token from localStorage
    getAccessToken() {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(config.token_name);
    }

    // Get Refresh Token from localStorage
    getRefreshToken() {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('pos_refresh_token');
    }

    // Save tokens
    setTokens(accessToken: string, refreshToken: string) {
        localStorage.setItem(config.token_name, accessToken);
        localStorage.setItem('pos_refresh_token', refreshToken);

        // Save expiry time (15 minutes)
        const expiryTime = new Date().getTime() + (15 * 60 * 1000);
        localStorage.setItem('pos_token_expiry', expiryTime.toString());

        // Restart refresh timer
        this.startRefreshTimer();
    }

    // Clear tokens
    clearTokens() {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(config.token_name);
        localStorage.removeItem('pos_refresh_token');
        localStorage.removeItem('pos_token_expiry');
        localStorage.removeItem('userType');

        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    // Request new access token with refresh token
    async refreshAccessToken() {
        const refreshToken = this.getRefreshToken();

        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const response = await axios.post(`${config.api_path}/member/refresh`, {
                refreshToken: refreshToken
            }, {
                headers: {
                    // No interceptor for refresh request
                    'Authorization': undefined
                }
            });

            if (response.data.message === 'success') {
                this.setTokens(response.data.token, response.data.refreshToken);
                return response.data.token;
            } else {
                throw new Error('Failed to refresh token');
            }
        } catch (error: any) {
            console.error('Token refresh failed:', error);
            if (error.response?.status === 403) {
                console.error('Refresh token is invalid or expired');
            }
            throw error;
        }
    }

    // Process failed queue
    processQueue(error: any, token = null) {
        this.failedQueue.forEach(({ resolve, reject }) => {
            if (error) {
                reject(error);
            } else {
                resolve(token);
            }
        });

        this.failedQueue = [];
    }

    // Start auto refresh timer
    startRefreshTimer() {
        if (typeof window === 'undefined') return;
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }

        const expiryTime = localStorage.getItem('pos_token_expiry');
        if (!expiryTime) return;

        const timeUntilExpiry = parseInt(expiryTime) - new Date().getTime();
        // Refresh token 2 minutes before expiry
        const refreshTime = Math.max(0, timeUntilExpiry - (2 * 60 * 1000));

        this.refreshTimer = setTimeout(async () => {
            if (this.getAccessToken()) {
                try {
                    await this.refreshAccessToken();
                } catch (error) {
                    console.error('Auto refresh failed:', error);
                    this.logout();
                }
            }
        }, refreshTime);
    }

    // Check if token is expired
    isTokenExpired() {
        if (typeof window === 'undefined') return true;
        const expiryTime = localStorage.getItem('pos_token_expiry');
        if (!expiryTime) return true;

        return new Date().getTime() >= parseInt(expiryTime);
    }

    // Logout and redirect
    async logout() {
        const refreshToken = this.getRefreshToken();

        // Call logout API to remove refresh token from server
        if (refreshToken) {
            try {
                await axios.post(`${config.api_path}/member/logout`, {
                    refreshToken: refreshToken
                });
            } catch (error) {
                console.error('Logout API error:', error);
            }
        }

        this.clearTokens();

        // Use standard window location for full reset
        if (typeof window !== 'undefined') {
            toast.error('Session Expired. Please sign in again.');
            window.location.href = '/';
        }
    }
}

// Create singleton instance
const tokenManager = new TokenManager();

export default tokenManager;
