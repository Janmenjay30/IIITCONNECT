const DEFAULT_DEV_API_URL = 'http://localhost:5000';

// Vite only exposes env vars prefixed with VITE_.
// In production, default to same-origin so Nginx can reverse-proxy `/api` + `/socket.io`.
const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? DEFAULT_DEV_API_URL
    : (typeof window !== 'undefined' ? window.location.origin : ''));

export default API_URL;