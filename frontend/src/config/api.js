const API_CONFIG = {
  BASE_URL: import.meta.env.PROD 
    ? 'https://iiitconnect.onrender.com'
    : 'http://localhost:5000',
  
  SOCKET_URL: import.meta.env.PROD 
    ? 'https://iiitconnect.onrender.com'
    : 'http://localhost:5000'
};

export default API_CONFIG;