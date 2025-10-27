import axios, { AxiosInstance } from 'axios';
import { Platform } from 'react-native';

// Simple API configuration
const getApiUrl = () => {
  if (__DEV__) {
    // Use network IP for both Android and iOS for better compatibility
    return 'http://192.168.2.25:3000/api';
  }
  return 'https://your-production-api.com/api';
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
      return response.data;
    } catch (error: any) {
      console.error('❌ SimpleApiService.login error:', error.response?.data || error.message);
      throw error;
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
      const response = await this.axiosInstance.get('/users/library');
      console.log('✅ SimpleApiService.getUserLibrary success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ SimpleApiService.getUserLibrary error:', error.response?.data || error.message);
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
      console.log('🔵 SimpleApiService.register called with:', userData);
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
      const response = await this.axiosInstance.put('/auth/profile', userData);
      console.log('✅ SimpleApiService.updateProfile success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ SimpleApiService.updateProfile error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export const simpleApiService = new SimpleApiService();
