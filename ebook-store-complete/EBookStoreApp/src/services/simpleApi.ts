import axios, { AxiosInstance } from 'axios';
import { Platform } from 'react-native';

// Simple API configuration
const getApiUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.endsWith('/api')
      ? process.env.EXPO_PUBLIC_API_URL
      : `${process.env.EXPO_PUBLIC_API_URL}/api`;
  }
  if (__DEV__) {
    const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
    return `http://${host}:3000/api`;
  }
  return '';
};

class SimpleApiService {
  private axiosInstance: AxiosInstance;
  private token: string | null = null;

  constructor() {
    const baseURL = getApiUrl();
    console.log('🔧 SimpleApiService initialized with baseURL:', baseURL);
    
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string | null) {
    this.token = token;
    console.log('🔧 SimpleApiService token set:', token ? 'Token present' : 'No token');
  }

  async login(email: string, password: string) {
    try {
      console.log('🔵 SimpleApiService.login called with:', { email, baseURL: this.axiosInstance.defaults.baseURL });
      
      const response = await this.axiosInstance.post('/auth/login', {
        email,
        password
      });
      
      console.log('✅ SimpleApiService.login success:', response.data);
      
      // Validate response structure
      if (response && response.data) {
      return response.data;
      } else {
        console.error('❌ Invalid response structure:', response);
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      const isAuthError = error?.response?.status === 401 || error?.response?.status === 403;
      
      if (!isAuthError && __DEV__) {
        console.error('❌ SimpleApiService.login error:', {
          message: error?.message,
          response: error?.response?.data,
          status: error?.response?.status,
          code: error?.code
        });
      }
      
      // Re-throw with better error structure
      if (error?.response?.data) {
        // Server returned an error response
        const serverError = new Error(error.response.data.message || 'Login failed');
        (serverError as any).response = error.response;
        (serverError as any).status = error.response.status;
        throw serverError;
      } else if (error?.message) {
        // Network or other error
      throw error;
      } else {
        // Unknown error
        throw new Error('An unexpected error occurred during login');
      }
    }
  }

  async getBooks() {
    try {
      console.log('🔵 SimpleApiService.getBooks called');
      const response = await this.axiosInstance.get('/books');
      console.log('✅ SimpleApiService.getBooks success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ SimpleApiService.getBooks error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getFeaturedBooks() {
    try {
      console.log('🔵 SimpleApiService.getFeaturedBooks called');
      const response = await this.axiosInstance.get('/books/featured');
      console.log('✅ SimpleApiService.getFeaturedBooks success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ SimpleApiService.getFeaturedBooks error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getBestsellerBooks() {
    try {
      console.log('🔵 SimpleApiService.getBestsellerBooks called');
      const response = await this.axiosInstance.get('/books/bestsellers');
      console.log('✅ SimpleApiService.getBestsellerBooks success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ SimpleApiService.getBestsellerBooks error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getNewReleaseBooks() {
    try {
      console.log('🔵 SimpleApiService.getNewReleaseBooks called');
      const response = await this.axiosInstance.get('/books/new-releases');
      console.log('✅ SimpleApiService.getNewReleaseBooks success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ SimpleApiService.getNewReleaseBooks error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getCategories() {
    try {
      console.log('🔵 SimpleApiService.getCategories called');
      const response = await this.axiosInstance.get('/categories');
      console.log('✅ SimpleApiService.getCategories success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ SimpleApiService.getCategories error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getCategoryById(categoryId: string) {
    try {
      console.log('🔵 SimpleApiService.getCategoryById called with:', categoryId);
      const response = await this.axiosInstance.get(`/categories/${categoryId}`);
      console.log('✅ SimpleApiService.getCategoryById success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ SimpleApiService.getCategoryById error:', error.response?.data || error.message);
      throw error;
    }
  }

  async searchBooks(query: string) {
    try {
      console.log('🔵 SimpleApiService.searchBooks called with:', query);
      const response = await this.axiosInstance.get(`/books/search?q=${encodeURIComponent(query)}`);
      console.log('✅ SimpleApiService.searchBooks success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ SimpleApiService.searchBooks error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getBooksByCategoryId(categoryId: string) {
    try {
      console.log('🔵 SimpleApiService.getBooksByCategoryId called with:', categoryId);
      const response = await this.axiosInstance.get(`/categories/${categoryId}/books`);
      console.log('✅ SimpleApiService.getBooksByCategoryId success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ SimpleApiService.getBooksByCategoryId error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getBookById(bookId: string) {
    try {
      console.log('🔵 SimpleApiService.getBookById called with:', bookId);
      const response = await this.axiosInstance.get(`/books/${bookId}`);
      console.log('✅ SimpleApiService.getBookById success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ SimpleApiService.getBookById error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getUserLibrary() {
    try {
      console.log('🔵 SimpleApiService.getUserLibrary called');
      const response = await this.axiosInstance.get('/users/library/categorized');
      console.log('✅ SimpleApiService.getUserLibrary success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ SimpleApiService.getUserLibrary error:', error.response?.data || error.message);
      throw error;
    }
  }

  async addToLibrary(bookId: string) {
    try {
      console.log('🔵 SimpleApiService.addToLibrary called with bookId:', bookId);
      const response = await this.axiosInstance.post('/users/library/add', { bookId });
      console.log('✅ SimpleApiService.addToLibrary success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ SimpleApiService.addToLibrary error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getUserWishlist() {
    try {
      console.log('🔵 SimpleApiService.getUserWishlist called');
      const response = await this.axiosInstance.get('/users/wishlist');
      console.log('✅ SimpleApiService.getUserWishlist success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ SimpleApiService.getUserWishlist error:', error.response?.data || error.message);
      throw error;
    }
  }

  async toggleWishlist(bookId: string) {
    try {
      console.log('🔵 SimpleApiService.toggleWishlist called with bookId:', bookId);
      const response = await this.axiosInstance.post(`/books/${bookId}/wishlist`);
      console.log('✅ SimpleApiService.toggleWishlist success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ SimpleApiService.toggleWishlist error:', error.response?.data || error.message);
      throw error;
    }
  }

  async register(userData: any) {
    try {
      console.log('🔵 SimpleApiService.register called with:', { ...userData, password: '***' });
      const response = await this.axiosInstance.post('/auth/register', userData);
      console.log('✅ SimpleApiService.register success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ SimpleApiService.register error:', error.response?.data || error.message);
      throw error;
    }
  }

  async logout() {
    try {
      console.log('🔵 SimpleApiService.logout called');
      const response = await this.axiosInstance.post('/auth/logout');
      console.log('✅ SimpleApiService.logout success:', response.data);
      return response.data;
    } catch (error: any) {
      // If backend doesn't implement logout, ignore 404 and proceed with local cleanup
      if (error?.response?.status === 404) {
        console.warn('⚠️ /auth/logout not implemented on server; proceeding with local logout.');
        return { success: true, message: 'Logged out locally' } as any;
      }
      console.error('❌ SimpleApiService.logout error:', error.response?.data || error.message);
      throw error;
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      console.log('🔵 SimpleApiService.refreshToken called');
      const response = await this.axiosInstance.post('/auth/refresh-token', { refreshToken });
      console.log('✅ SimpleApiService.refreshToken success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ SimpleApiService.refreshToken error:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendRegistrationOTP(email: string) {
    try {
      console.log('🔵 SimpleApiService.sendRegistrationOTP called with:', email);
      const response = await this.axiosInstance.post('/auth/send-registration-otp', { email });
      console.log('✅ SimpleApiService.sendRegistrationOTP success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ SimpleApiService.sendRegistrationOTP error:', error.response?.data || error.message);
      throw error;
    }
  }

  async verifyRegistrationOTP(token: string, otpCode: string) {
    try {
      console.log('🔵 SimpleApiService.verifyRegistrationOTP called');
      const response = await this.axiosInstance.post('/auth/verify-registration-otp', { token, otpCode });
      console.log('✅ SimpleApiService.verifyRegistrationOTP success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ SimpleApiService.verifyRegistrationOTP error:', error.response?.data || error.message);
      throw error;
    }
  }

  async forgotPassword(email: string) {
    try {
      console.log('🔵 SimpleApiService.forgotPassword called with:', email);
      const response = await this.axiosInstance.post('/auth/forgot-password', { email });
      console.log('✅ SimpleApiService.forgotPassword success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ SimpleApiService.forgotPassword error:', error.response?.data || error.message);
      throw error;
    }
  }

  async verifyForgotPassword(token: string, otpCode: string) {
    try {
      console.log('🔵 SimpleApiService.verifyForgotPassword called');
      const response = await this.axiosInstance.post('/auth/verify-forgot-password', { token, otpCode });
      console.log('✅ SimpleApiService.verifyForgotPassword success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ SimpleApiService.verifyForgotPassword error:', error.response?.data || error.message);
      throw error;
    }
  }

  async resetPassword(token: string, password: string) {
    try {
      console.log('🔵 SimpleApiService.resetPassword called');
      const response = await this.axiosInstance.post('/auth/reset-password', { token, password });
      console.log('✅ SimpleApiService.resetPassword success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ SimpleApiService.resetPassword error:', error.response?.data || error.message);
      throw error;
    }
  }

  async changePassword(currentPassword: string, newPassword: string) {
    try {
      console.log('🔵 SimpleApiService.changePassword called');
      const response = await this.axiosInstance.post('/auth/change-password', { currentPassword, newPassword });
      console.log('✅ SimpleApiService.changePassword success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ SimpleApiService.changePassword error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getProfile() {
    try {
      console.log('🔵 SimpleApiService.getProfile called');
      const response = await this.axiosInstance.get('/auth/profile');
      console.log('✅ SimpleApiService.getProfile success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ SimpleApiService.getProfile error:', error.response?.data || error.message);
      throw error;
    }
  }

  async updateProfile(userData: any) {
    try {
      console.log('🔵 SimpleApiService.updateProfile called with:', userData);
      const response = await this.axiosInstance.put('/users/profile', userData);
      console.log('✅ SimpleApiService.updateProfile success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ SimpleApiService.updateProfile error:', error.response?.data || error.message);
      throw error;
    }
  }

  async updateReadingProgress(bookId: string, currentPage: number, totalPages: number) {
    try {
      console.log('🔵 SimpleApiService.updateReadingProgress called with:', { bookId, currentPage, totalPages });
      const response = await this.axiosInstance.put(`/users/reading-progress/${bookId}`, {
        progress: Math.round((currentPage / totalPages) * 100),
        pageNumber: currentPage
      });
      console.log('✅ SimpleApiService.updateReadingProgress success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ SimpleApiService.updateReadingProgress error:', error.response?.data || error.message);
      throw error;
    }
  }

  async markBookAsCompleted(bookId: string) {
    try {
      console.log('🔵 SimpleApiService.markBookAsCompleted called with:', bookId);
      const response = await this.axiosInstance.post('/users/complete-book', {
        bookId
      });
      console.log('✅ SimpleApiService.markBookAsCompleted success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ SimpleApiService.markBookAsCompleted error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getReadingSession(bookId: string) {
    try {
      console.log('🔵 SimpleApiService.getReadingSession called with:', bookId);
      const response = await this.axiosInstance.get(`/users/reading-session/${bookId}`);
      console.log('✅ SimpleApiService.getReadingSession success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ SimpleApiService.getReadingSession error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export const simpleApiService = new SimpleApiService();
