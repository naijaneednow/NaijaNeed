import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  withCredentials: true,  // sends HTTP-only cookie automatically on every request
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect if it's a 401 AND we're NOT already on the landing page
    // AND the request wasn't already to /api/auth/me (to avoid loop during auth check)
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const isAuthCall = error.config.url?.includes('/api/auth/');
        const isHomePage = window.location.pathname === '/';
        
        if (!isHomePage && !isAuthCall) {
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
