// API Configuration
// IMPORTANT: Replace the IP address below with your actual local network IP
// To find your IP:
// - macOS/Linux: Run `ifconfig | grep "inet " | grep -v 127.0.0.1` in terminal
// - Windows: Run `ipconfig` in command prompt
// Look for an IP that starts with 192.168.x.x or 10.x.x.x

export const API_URL = __DEV__ 
   //http://192.168.110.119:3000/api'  // Your actual local IP address with /api prefix
   ? 'http://localhost:3000/api'
   //? 'http://10.238.24.39:3000/api'
  : 'https://your-production-api.com/api'; // For production

export const GOOGLE_MAPS_API_KEY = 'AIzaSyDid1i5l-aOJq3R5ZEw_jLc744h289-84M';

export const RECOMMENDATION_API_URL = 'https://web-production-d57d3.up.railway.app/recommend';