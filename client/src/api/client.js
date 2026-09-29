import axios from 'axios';

// Check if we are running locally on localhost/127.0.0.1
const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const api = axios.create({
  // When running locally in browser, automatically target local backend on port 5000
  baseURL: isLocal 
    ? 'http://localhost:5000/api' 
    : (import.meta.env.VITE_API_URL || 'https://fabh-backend.onrender.com/api'),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: automatically attach the JWT token to Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;