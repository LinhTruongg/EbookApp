import { Platform } from 'react-native';

// Function to get the correct localhost URL based on platform
const getBaseUrl = () => {

  process.env.EXPO_PUBLIC_API_URL
  if (__DEV__) {
    return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
  }
  return process.env.EXPO_PUBLIC_API_URL;
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  API_VERSION: '/api',
  TIMEOUT: 15000, // Increased timeout
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
  console.log('API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}${endpoint}`;
};
