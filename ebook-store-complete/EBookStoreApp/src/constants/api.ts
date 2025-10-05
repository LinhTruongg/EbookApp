import { Platform } from 'react-native';

// Function to get the correct localhost URL based on platform
const getBaseUrl = () => {
  if (__DEV__) {
    // For web development, always use localhost
    if (typeof window !== 'undefined') {
      return 'http://localhost:3000';
    }
    
    // For React Native/Expo development, use machine IP
    const MACHINE_IP = '192.168.2.25'; // Your machine's IP address
    return `http://${MACHINE_IP}:3000`;
  }
  return 'https://your-production-api.com';
};

// Alternative URLs to try if primary fails
export const FALLBACK_URLS = [
  'http://localhost:3000',    // Local development (for web/Expo web)
  'http://127.0.0.1:3000',    // IP localhost
  'http://10.0.2.2:3000',     // Android emulator (if running on Android)
  'http://192.168.2.25:3000', // Machine IP (duplicate for testing)
];

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  API_VERSION: '/api',
  TIMEOUT: 10000,
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    VERIFY_EMAIL: '/auth/verify-email',
    PROFILE: '/auth/profile',
  },
  BOOKS: {
    LIST: '/books',
    DETAILS: '/books',
    SEARCH: '/books/search',
    CATEGORIES: '/books/categories',
    FEATURED: '/books/featured',
    BESTSELLERS: '/books/bestsellers',
  },
  USER: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    LIBRARY: '/users/library',
    BOOKMARKS: '/users/bookmarks',
    WISHLIST: '/users/wishlist',
    READING_SESSIONS: '/users/reading-sessions',
  },
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}${endpoint}`;
};
