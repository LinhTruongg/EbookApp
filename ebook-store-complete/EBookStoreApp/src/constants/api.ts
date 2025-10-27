import { Platform } from 'react-native';

// Function to get the correct localhost URL based on platform
const getBaseUrl = () => {
  if (__DEV__) {
    if (typeof window !== 'undefined') {
      return 'http://localhost:3000';
    }
    if (Platform.OS === 'android') {
      // Android emulator uses 10.0.2.2; physical device uses machine IP
      return 'http://10.0.2.2:3000';
    }
    // iOS simulator/physical device on same LAN - use localhost for simulator
    return 'http://localhost:3000';
  }
  return 'https://your-production-api.com';
};

// Alternative URLs to try if primary fails
export const FALLBACK_URLS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://10.0.2.2:3000',
  'http://192.168.2.25:3000'
];

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  API_VERSION: '/api',
  TIMEOUT: 15000, // Increased timeout
};

// Debug logging
console.log('🔧 API_CONFIG:', API_CONFIG);
console.log('🔧 Platform.OS:', Platform.OS);
console.log('🔧 __DEV__:', __DEV__);

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
