import { Platform } from 'react-native';

// Function to get the correct localhost URL based on platform
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (__DEV__) {
    const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
    return `http://192.168.2.25:3000`;
  }
  return '';
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
  WALLET: {
    BALANCE: '/wallet/balance',
    TRANSACTIONS: '/wallet/transactions',
    DEPOSIT: '/wallet/deposit',
    DEPOSIT_STATUS: '/wallet/deposit',
  },
  PAYMENTS: {
    PURCHASE_BOOK: '/payments/purchase-book',
    REFUND: '/payments/refund',
    HISTORY: '/payments/history',
  },
};

export const getApiUrl = (endpoint: string): string => {
  console.log('API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}${endpoint}`;
};
