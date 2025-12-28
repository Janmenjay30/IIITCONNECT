const DEFAULT_DEV_API_URL = 'http://localhost:5000';
const DEFAULT_PROD_ORIGIN = (typeof window !== 'undefined') ? window.location.origin : '';

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? DEFAULT_DEV_API_URL : DEFAULT_PROD_ORIGIN);

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  BASE_URL;

export default {
  BASE_URL,
  SOCKET_URL,
};