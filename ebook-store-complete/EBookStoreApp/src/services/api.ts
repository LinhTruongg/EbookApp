import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, API_ENDPOINTS, getApiUrl } from '../constants/api';
import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  RefreshTokenRequest,
  User,
  Book,
  Category,
  Author,
  BookDetailResponse,
  Comment,
  CommentStats,
  CommentsResponse,
  CreateCommentRequest,
  UserLibaryEntity,
  Rating,
  RatingStats,
} from '../types';

const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user_data',
};

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    const alreadyHasApi = (API_CONFIG.BASE_URL || '').endsWith('/api');
    const baseURL = alreadyHasApi
      ? API_CONFIG.BASE_URL
      : `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}`;
    console.log('🔧 ApiService initialized with baseURL:', baseURL);
    
    this.axiosInstance = axios.create({
      baseURL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('🔧 Axios instance created:', {
      baseURL: this.axiosInstance.defaults.baseURL,
      timeout: this.axiosInstance.defaults.timeout,
      headers: this.axiosInstance.defaults.headers
    });

    this.setupInterceptors();
  }

  private async testUrl(baseUrl: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.log(`❌ URL ${baseUrl} failed:`, error);
      return false;
    }
  }

  private async findWorkingUrl(): Promise<string | null> {
    const urlsToTest = [this.axiosInstance.defaults.baseURL || ''];
    console.log('🔍 Testing URLs:', urlsToTest);
    
    for (const url of urlsToTest) {
      console.log(`🔍 Testing: ${url}`);
      const isWorking = await this.testUrl(url);
      if (isWorking) {
        console.log(`✅ Found working URL: ${url}`);
        return url;
      }
    }
    
    console.log('❌ No working URLs found');
    return null;
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // DEBUG: Log request details
        if (config.url?.includes('/books/admin')) {
          console.log('🔍 [interceptor] Request to /books/admin');
          console.log('🔍 [interceptor] config.headers:', config.headers);
          console.log('🔍 [interceptor] config.data type:', config.data instanceof FormData ? 'FormData' : typeof config.data);
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
          (originalRequest as any)._retry = true;

          console.log('🔄 401 error detected, attempting token refresh...');
          try {
            const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
            if (refreshToken) {
              const response = await this.refreshToken({ refreshToken });
              if (response.success) {
                await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
                await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken);
                
                originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
                console.log('✅ Token refreshed, retrying original request');
                return this.axiosInstance(originalRequest);
              } else {
                throw new Error(response.message || 'Token refresh failed');
              }
            } else {
              throw new Error('No refresh token available');
            }
          } catch (refreshError) {
            console.error('❌ Token refresh failed in interceptor:', refreshError);
            await this.clearAuthData();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async clearAuthData() {
    console.log('🧹 Clearing auth data from storage...');
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER,
    ]);
    // Remove any lingering Authorization header from axios instance
    if (this.axiosInstance?.defaults?.headers) {
      delete (this.axiosInstance.defaults.headers as any).Authorization;
    }
    console.log('✅ Auth data cleared from storage (token, refresh token, user)');
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('🔵 ApiService.login called with:', { email: data.email, baseURL: this.axiosInstance.defaults.baseURL });
      const response = await this.axiosInstance.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        data
      );
      console.log('✅ ApiService.login raw response:', {
        status: response.status,
        headers: response.headers,
        data: response.data
      });
      console.log('✅ ApiService.login response.data:', response.data);
      console.log('✅ ApiService.login response.data.success:', response.data.success);
      console.log('✅ Response.data keys:', Object.keys(response.data));
      console.log('✅ Response.data.data exists:', !!response.data.data);
      console.log('✅ Response.data.message:', response.data.message);
      
      // Validate response structure
      if (typeof response.data.success !== 'boolean') {
        console.warn('⚠️ response.data.success is not boolean:', typeof response.data.success);
      }
      if (!response.data.data) {
        console.warn('⚠️ response.data.data is missing');
      }
      if (!response.data.data?.user) {
        console.warn('⚠️ response.data.data.user is missing');
      }
      if (!response.data.data?.token) {
        console.warn('⚠️ response.data.data.token is missing');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ ApiService.login error:', error.response?.data || error.message);
    
      throw error;
    }
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.axiosInstance.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    return response.data;
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse> {
    const response = await this.axiosInstance.post<ApiResponse>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      data
    );
    return response.data;
  }

  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse> {
    const response = await this.axiosInstance.post<ApiResponse>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      data
    );
    return response.data;
  }


  async refreshToken(data: RefreshTokenRequest): Promise<{ success: boolean; message: string; data: { token: string; refreshToken: string } }> {
    const response = await this.axiosInstance.post<{ success: boolean; message: string; data: { token: string; refreshToken: string } }>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      data
    );
    return response.data;
  }

  async getProfile(): Promise<{ data: User }> {
    const response = await this.axiosInstance.get<{ data: User }>(
      API_ENDPOINTS.AUTH.PROFILE
    );
    return response.data;
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    const response = await this.axiosInstance.get<ApiResponse>(
      `${API_ENDPOINTS.AUTH.VERIFY_EMAIL}/${token}`
    );
    return response.data;
  }

  async saveAuthData(authResponse: AuthResponse): Promise<void> {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.TOKEN, authResponse.data.token],
      [STORAGE_KEYS.REFRESH_TOKEN, authResponse.data.refreshToken],
      [STORAGE_KEYS.USER, JSON.stringify(authResponse.data.user)],
    ]);
  }

  async getStoredAuthData(): Promise<{
    token: string | null;
    refreshToken: string | null;
    user: User | null;
  }> {
    const [token, refreshToken, userData] = await AsyncStorage.multiGet([
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER,
    ]);

    return {
      token: token[1],
      refreshToken: refreshToken[1],
      user: userData[1] ? JSON.parse(userData[1]) : null,
    };
  }

  async logout(): Promise<void> {
    await this.clearAuthData();
  }

  // Profile management methods
  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    console.log('🔄 Updating profile:', userData);
    const response = await this.axiosInstance.put('/users/profile', userData);
    console.log('✅ Profile updated successfully');
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    console.log('🔄 Changing password...');
    const response = await this.axiosInstance.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    console.log('✅ Password changed successfully');
    return response.data;
  }

  async getUserLibraryCategorized(): Promise<ApiResponse<{
    categories: {
      reading: UserLibaryEntity[];
      favorited: UserLibaryEntity[];
      completed: UserLibaryEntity[];
    };
    statistics: {
      totalBooks: number;
      reading: number;
      favorited: number;
      completed: number;
      unread: number;
    };
  }>> {
    const response = await this.axiosInstance.get('/users/library/categorized');
    return response.data;
  }

  async getUserWishlist(): Promise<ApiResponse<{ wishlist: Array<{ book: Book }> }>> {
    const response = await this.axiosInstance.get('/users/wishlist');
    return response.data as any;
  }

  async uploadAvatar(imageUri: string): Promise<ApiResponse<{ avatar: string }>> {
    console.log('🔄 Uploading avatar:', imageUri);
    
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);

    const response = await this.axiosInstance.post('/auth/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('✅ Avatar uploaded successfully');
    return response.data;
  }

  // Library methods
  async getBooks(): Promise<ApiResponse<Book[]>> {
    console.log('📚 Fetching books...');
    const response = await this.axiosInstance.get('/books');
    console.log('✅ Books fetched successfully');
    return response.data;
  }

  async getCategories(): Promise<ApiResponse<Category[]>> {
    console.log('📂 Fetching categories...');
    const response = await this.axiosInstance.get('/categories');
    console.log('✅ Categories fetched successfully');
    return response.data;
  }

  // Admin category management methods
  async getAllCategories(): Promise<ApiResponse<Category[]>> {
    console.log('📂 Fetching all categories for admin...');
    const response = await this.axiosInstance.get('/categories/all');
    console.log('✅ All categories fetched successfully');
    return response.data;
  }

  async getBooksByCategoryId(
    categoryId: string,
    options?: { page?: number; limit?: number; sortBy?: string; sortOrder?: 'ASC' | 'DESC'; minPrice?: number; maxPrice?: number }
  ): Promise<ApiResponse<{ category: Category; books: Book[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>> {
    console.log('📂 Fetching books by category (categories/:id/books):', categoryId, options);
    const params = new URLSearchParams();
    if (options?.page) params.append('page', String(options.page));
    if (options?.limit) params.append('limit', String(options.limit));
    if (options?.sortBy) params.append('sortBy', options.sortBy);
    if (options?.sortOrder) params.append('sortOrder', options.sortOrder);
    if (options?.minPrice !== undefined) params.append('minPrice', String(options.minPrice));
    if (options?.maxPrice !== undefined) params.append('maxPrice', String(options.maxPrice));

    const query = params.toString();
    const url = query ? `/categories/${categoryId}/books?${query}` : `/categories/${categoryId}/books`;
    const response = await this.axiosInstance.get(url);
    console.log('✅ Books by category (via categories route) fetched successfully');
    return response.data;
  }

  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    console.log('📂 Fetching category by ID:', id);
    const response = await this.axiosInstance.get(`/categories/${id}`);
    console.log('✅ Category fetched successfully');
    return response.data;
  }

  async createCategory(categoryData: {
    name: string;
    slug: string;
    description?: string;
    parentId?: number;
    image?: string;
    icon?: string;
    sortOrder?: number;
  }): Promise<ApiResponse<Category>> {
    console.log('📂 Creating category:', categoryData);
    const response = await this.axiosInstance.post('/categories', categoryData);
    console.log('✅ Category created successfully');
    return response.data;
  }

  async updateCategory(id: string, categoryData: {
    name?: string;
    slug?: string;
    description?: string;
    parentId?: number;
    image?: string;
    icon?: string;
    sortOrder?: number;
    isActive?: boolean;
  }): Promise<ApiResponse<Category>> {
    console.log('📂 Updating category:', id, categoryData);
    const response = await this.axiosInstance.put(`/categories/${id}`, categoryData);
    console.log('✅ Category updated successfully');
    return response.data;
  }

  async deleteCategory(id: string): Promise<ApiResponse> {
    console.log('📂 Deleting category:', id);
    const response = await this.axiosInstance.delete(`/categories/${id}`);
    console.log('✅ Category deleted successfully');
    return response.data;
  }

  async getAuthors(): Promise<ApiResponse<Author[]>> {
    console.log('✍️ Fetching authors...');
    const response = await this.axiosInstance.get('/authors');
    console.log('✅ Authors fetched successfully');
    return response.data;
  }

  // ===== ADMIN AUTHOR CRUD METHODS =====

  async getAllAuthorsAdmin(params: { search?: string; page?: number; limit?: number } = {}): Promise<ApiResponse<Author[]>> {
    console.log('✍️ Fetching all authors for admin...', params);
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    const url = query.toString() ? `/authors/admin/all?${query.toString()}` : '/authors/admin/all';
    const response = await this.axiosInstance.get(url);
    return response.data;
  }

  async getAuthorByIdAdmin(id: string): Promise<ApiResponse<Author>> {
    console.log(`✍️ Fetching author ${id} for admin...`);
    const response = await this.axiosInstance.get(`/authors/admin/${id}`);
    return response.data;
  }

  async createAuthor(data: Partial<Author> & { name: string }): Promise<ApiResponse<Author>> {
    console.log('✍️ Creating author...', data);
    const payload: any = {
      name: data.name,
      bio: (data as any).bio || data.biography || undefined,
      avatar: data.avatar,
      birthDate: data.birthDate,
      nationality: data.nationality,
      socialLinks: (data as any).socialLinks || data.socialMedia,
      isActive: data.isActive,
    };
    const response = await this.axiosInstance.post('/authors/admin', payload);
    return response.data;
  }

  async updateAuthor(id: string, data: Partial<Author>): Promise<ApiResponse<Author>> {
    console.log('✍️ Updating author...', id, data);
    const payload: any = {
      name: data.name,
      bio: (data as any).bio || data.biography,
      avatar: data.avatar,
      birthDate: data.birthDate,
      nationality: data.nationality,
      socialLinks: (data as any).socialLinks || data.socialMedia,
      isActive: data.isActive,
    };
    const response = await this.axiosInstance.put(`/authors/admin/${id}`, payload);
    return response.data;
  }

  async deleteAuthor(id: string): Promise<ApiResponse> {
    console.log('✍️ Deleting author...', id);
    const response = await this.axiosInstance.delete(`/authors/admin/${id}`);
    return response.data;
  }

  async searchBooks(query: string): Promise<ApiResponse<Book[]>> {
    console.log('🔍 Searching books with query:', query);
    const response = await this.axiosInstance.get(`/books/search?q=${encodeURIComponent(query)}`);
    console.log('✅ Books search completed');
    return response.data;
  }

  async chatWithAI(message: string, conversationHistory: any[] = []): Promise<ApiResponse<{ message: string; suggestedBooks: Book[]; searchKeywords: string[] }>> {
    console.log('🤖 Chatting with AI:', message);
    const response = await this.axiosInstance.post('/chatbot/chat', {
      message,
      conversationHistory
    });
    console.log('✅ AI chat completed');
    return response.data;
  }

  async getBooksByCategory(categoryId: string): Promise<ApiResponse<Book[]>> {
    console.log('📂 Fetching books by category:', categoryId);
    const response = await this.axiosInstance.get(`/categories/${categoryId}/books`);
    console.log('✅ Books by category fetched successfully');
    return response.data;
  }

  // Note: getBooksByAuthor endpoint not implemented in backend yet
  // async getBooksByAuthor(authorId: string): Promise<ApiResponse<Book[]>> {
  //   console.log('✍️ Fetching books by author:', authorId);
  //   const response = await this.axiosInstance.get(`/books/author/${authorId}`);
  //   console.log('✅ Books by author fetched successfully');
  //   return response.data;
  // }

  async getBookById(bookId: string): Promise<ApiResponse<BookDetailResponse>> {
    console.log('📖 Fetching book details:', bookId);
    const response = await this.axiosInstance.get(`/books/${bookId}`);
    console.log('✅ Book details fetched successfully');
    return response.data;
  }

  async getBookFile(bookId: string): Promise<ApiResponse<{ bookId: string; title: string; file: string }>> {
    console.log('📥 Fetching book file data:', bookId);
    const response = await this.axiosInstance.get(`/books/${bookId}/file`);
    console.log('✅ Book file fetched successfully');
    return response.data;
  }

  async toggleWishlist(bookId: string): Promise<ApiResponse<{ inWishlist: boolean }>> {
    console.log('🌟 Toggling wishlist for book:', bookId);
    const response = await this.axiosInstance.post(`/books/${bookId}/wishlist`);
    return response.data;
  }

  async likeBook(bookId: string): Promise<ApiResponse<{ likesCount: number; hasLiked: boolean }>> {
    console.log('❤️ Liking book:', bookId);
    const response = await this.axiosInstance.post(`/books/${bookId}/like`);
    console.log('✅ Book liked successfully');
    return response.data;
  }

  async updateReadingProgress(bookId: string, currentPage: number, totalPages: number): Promise<ApiResponse> {
    console.log('📊 Updating reading progress:', { bookId, currentPage, totalPages });
    const response = await this.axiosInstance.put(`/users/reading-progress/${bookId}`, {
      progress: Math.round((currentPage / totalPages) * 100),
      pageNumber: currentPage
    });
    console.log('✅ Reading progress updated successfully');
    return response.data;
  }

  async markBookAsCompleted(bookId: string): Promise<ApiResponse> {
    console.log('✅ Marking book as completed:', bookId);
    const response = await this.axiosInstance.post('/users/complete-book', {
      bookId
    });
    console.log('✅ Book marked as completed successfully');
    return response.data;
  }

  async getReadingSession(bookId: string): Promise<ApiResponse<{ currentPage: number; totalPages: number; progress: number }>> {
    console.log('📖 Fetching reading session:', bookId);
    const response = await this.axiosInstance.get(`/users/reading-session/${bookId}`);
    console.log('✅ Reading session fetched successfully');
    return response.data;
  }

  async getFeaturedBooks(): Promise<ApiResponse<Book[]>> {
    console.log('⭐ Fetching featured books...');
    const response = await this.axiosInstance.get('/books/featured');
    console.log('✅ Featured books fetched successfully');
    return response.data;
  }

  async getBestsellerBooks(): Promise<ApiResponse<Book[]>> {
    console.log('🔥 Fetching bestseller books...');
    const response = await this.axiosInstance.get('/books/bestsellers');
    console.log('✅ Bestseller books fetched successfully');
    return response.data;
  }

  async getNewReleaseBooks(): Promise<ApiResponse<Book[]>> {
    console.log('🆕 Fetching new release books...');
    const response = await this.axiosInstance.get('/books/new-releases');
    console.log('✅ New release books fetched successfully');
    return response.data;
  }

  // ===== ADMIN BOOK CRUD METHODS =====

  async getAllBooksAdmin(): Promise<ApiResponse<Book[]>> {
    console.log('📚 Fetching all books for admin...');
    const response = await this.axiosInstance.get('/books/admin/all');
    console.log('✅ All books fetched successfully');
    return response.data;
  }

  async getBookByIdAdmin(id: string): Promise<ApiResponse<Book>> {
    console.log(`📖 Fetching book ${id} for admin...`);
    const response = await this.axiosInstance.get(`/books/admin/${id}`);
    console.log('✅ Book fetched successfully');
    return response.data;
  }

  async createBook(bookData: any): Promise<ApiResponse<Book>> {
    console.log('📝 Creating new book...');
    console.log('📦 Data type:', bookData instanceof FormData ? 'FormData' : 'JSON');
    console.log('📦 Data:', bookData instanceof FormData ? 'FormData object' : bookData);

    // Handle FormData with native fetch (more reliable in React Native)
    if (bookData instanceof FormData) {
      console.log('⚙️ FormData detected - using native fetch instead of axios');
      console.log('📋 FormData contents:');
      // Log FormData entries for debugging
      const formDataEntries: any = {};
      if (typeof (bookData as any).entries === 'function') {
        for (const [key, value] of (bookData as any).entries()) {
          if (key === 'file') {
            formDataEntries[key] = typeof value === 'object' ?
              { uri: (value as any).uri, type: (value as any).type, name: (value as any).name } :
              value;
          } else {
            formDataEntries[key] = value;
          }
          console.log(`  ✓ ${key}:`, formDataEntries[key]);
        }
      }
      console.log('📦 Total fields:', Object.keys(formDataEntries).length);
      console.log('📝 Has file field:', 'file' in formDataEntries);

      try {
        console.log('🚀 Sending request using fetch to /books/admin');
        const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
        const headers: any = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const baseURL = this.axiosInstance.defaults.baseURL;
        const url = `${baseURL}/books/admin`;

        console.log('🔗 URL:', url);
        console.log('📋 Headers:', headers);
        console.log('📡 Request method: POST');
        console.log('📦 Request body type:', 'FormData');

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: bookData,
        });

        console.log('✅ Response status:', response.status);
        const responseData = await response.json();
        console.log('📨 Response data:', responseData);

        if (!response.ok) {
          console.error('❌ Server error:', responseData.message || `HTTP error! status: ${response.status}`);
          throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
        }

        console.log('✅ Book created successfully');
        return responseData;
      } catch (error) {
        console.error('❌ Error creating book with fetch:', error);
        throw error;
      }
    }

    // For regular JSON data, use axios
    try {
      console.log('🚀 Sending JSON request to /books/admin');
      const response = await this.axiosInstance.post('/books/admin', bookData);
      console.log('✅ Book created successfully');
      console.log('📨 Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating book:', error);
      throw error;
    }
  }

  async updateBook(id: string, bookData: any): Promise<ApiResponse<Book>> {
    console.log(`📝 Updating book ${id}...`);

    // Handle FormData with native fetch (more reliable in React Native)
    if (bookData instanceof FormData) {
      console.log('⚙️ FormData detected - using native fetch instead of axios');

      try {
        console.log('🚀 Sending request using fetch to /books/admin/' + id);
        const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
        const headers: any = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const baseURL = this.axiosInstance.defaults.baseURL;
        const url = `${baseURL}/books/admin/${id}`;

        console.log('🔗 URL:', url);

        const response = await fetch(url, {
          method: 'PUT',
          headers,
          body: bookData,
        });

        console.log('✅ Response status:', response.status);
        const responseData = await response.json();
        console.log('📨 Response:', responseData);

        if (!response.ok) {
          throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
        }

        return responseData;
      } catch (error) {
        console.error('❌ Error updating book with fetch:', error);
        throw error;
      }
    }

    // For regular JSON data, use axios
    const response = await this.axiosInstance.put(`/books/admin/${id}`, bookData);
    console.log('✅ Book updated successfully');
    return response.data;
  }

  async deleteBook(id: string): Promise<ApiResponse<any>> {
    console.log(`🗑️ Deleting book ${id}...`);
    const response = await this.axiosInstance.delete(`/books/admin/${id}`);
    console.log('✅ Book deleted successfully');
    return response.data;
  }

  // ===== ADMIN USER CRUD METHODS =====

  async getAllUsersAdmin(searchParams: any = {}): Promise<ApiResponse<User[]>> {
    console.log('👥 Fetching all users for admin...', searchParams);
    const queryParams = new URLSearchParams();
    
    if (searchParams.search) queryParams.append('search', searchParams.search);
    if (searchParams.bookTitle) queryParams.append('bookTitle', searchParams.bookTitle);
    if (searchParams.role) queryParams.append('role', searchParams.role);
    if (searchParams.isActive !== undefined) queryParams.append('isActive', searchParams.isActive.toString());
    if (searchParams.page) queryParams.append('page', searchParams.page.toString());
    if (searchParams.limit) queryParams.append('limit', searchParams.limit.toString());
    if (searchParams.sortBy) queryParams.append('sortBy', searchParams.sortBy);
    if (searchParams.sortOrder) queryParams.append('sortOrder', searchParams.sortOrder);
    
    const query = queryParams.toString();
    const url = query ? `/users/admin/all?${query}` : '/users/admin/all';
    const response = await this.axiosInstance.get(url);
    console.log('✅ All users fetched successfully');
    return response.data;
  }

  async getUserByIdAdmin(id: string): Promise<ApiResponse<User>> {
    console.log(`👤 Fetching user ${id} for admin...`);
    const response = await this.axiosInstance.get(`/users/admin/${id}`);
    console.log('✅ User fetched successfully');
    return response.data;
  }

  async createUser(userData: any): Promise<ApiResponse<User>> {
    console.log('👤 Creating new user...');
    const response = await this.axiosInstance.post('/users/admin', userData);
    console.log('✅ User created successfully');
    return response.data;
  }

  async updateUser(id: string, userData: any): Promise<ApiResponse<User>> {
    console.log(`👤 Updating user ${id}...`);
    const response = await this.axiosInstance.put(`/users/admin/${id}`, userData);
    console.log('✅ User updated successfully');
    return response.data;
  }

  async deleteUser(id: string): Promise<ApiResponse<any>> {
    console.log(`🗑️ Deleting user ${id}...`);
    const response = await this.axiosInstance.delete(`/users/admin/${id}`);
    console.log('✅ User deleted successfully');
    return response.data;
  }

  async resetUserPassword(id: string, newPassword: string): Promise<ApiResponse<any>> {
    console.log(`🔑 Resetting password for user ${id}...`);
    const response = await this.axiosInstance.post(`/users/admin/${id}/reset-password`, { newPassword });
    console.log('✅ Password reset successfully');
    return response.data;
  }

  // ===== COMMENT METHODS =====

  async getBookComments(bookId: string, page: number = 1, limit: number = 20, parentId?: string): Promise<ApiResponse<CommentsResponse>> {
    console.log('💬 Fetching book comments:', { bookId, page, limit, parentId });
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    if (parentId) {
      params.append('parentId', parentId);
    }
    
    const response = await this.axiosInstance.get(`/comments/book/${bookId}?${params.toString()}`);
    console.log('✅ Book comments fetched successfully');
    return response.data;
  }

  async getCommentStats(bookId: string): Promise<ApiResponse<CommentStats>> {
    console.log('📊 Fetching comment stats for book:', bookId);
    const response = await this.axiosInstance.get(`/comments/book/${bookId}/stats`);
    console.log('✅ Comment stats fetched successfully');
    return response.data;
  }

  async createComment(bookId: string, commentData: CreateCommentRequest): Promise<ApiResponse<Comment>> {
    console.log('💬 Creating comment:', { bookId, commentData });
    const response = await this.axiosInstance.post(`/comments/book/${bookId}`, commentData);
    console.log('✅ Comment created successfully');
    return response.data;
  }

  async updateComment(commentId: string, content: string): Promise<ApiResponse> {
    console.log('✏️ Updating comment:', commentId);
    const response = await this.axiosInstance.put(`/comments/${commentId}`, { content });
    console.log('✅ Comment updated successfully');
    return response.data;
  }

  async deleteComment(commentId: string): Promise<ApiResponse> {
    console.log('🗑️ Deleting comment:', commentId);
    const response = await this.axiosInstance.delete(`/comments/${commentId}`);
    console.log('✅ Comment deleted successfully');
    return response.data;
  }

  async likeComment(commentId: string): Promise<ApiResponse<{ likesCount: number; hasLiked: boolean }>> {
    console.log('❤️ Liking comment:', commentId);
    const response = await this.axiosInstance.post(`/comments/${commentId}/like`);
    console.log('✅ Comment liked successfully');
    return response.data;
  }

  // ===== ADMIN COMMENT METHODS =====

  async getAllCommentsAdmin(params: {
    page?: number;
    limit?: number;
    status?: 'all' | 'approved' | 'pending';
    search?: string;
    bookId?: string;
    userId?: string;
  } = {}): Promise<ApiResponse<{
    comments: any[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalComments: number;
      hasNextPage: boolean;
    };
  }>> {
    console.log('💬 Fetching all comments for admin:', params);
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    if (params.bookId) queryParams.append('bookId', params.bookId);
    if (params.userId) queryParams.append('userId', params.userId);
    
    const response = await this.axiosInstance.get(`/comments/admin/all?${queryParams.toString()}`);
    console.log('✅ All comments fetched successfully for admin');
    return response.data;
  }

  async getAdminCommentStats(): Promise<ApiResponse<{
    totalComments: number;
    approvedComments: number;
    pendingComments: number;
    totalLikes: number;
    recentComments: number;
  }>> {
    console.log('📊 Fetching admin comment stats...');
    const response = await this.axiosInstance.get('/comments/admin/stats');
    console.log('✅ Admin comment stats fetched successfully');
    return response.data;
  }

  async updateCommentStatus(commentId: string, isApproved: boolean): Promise<ApiResponse<any>> {
    console.log(`✏️ Updating comment status for ${commentId}:`, isApproved);
    const response = await this.axiosInstance.put(`/comments/admin/${commentId}/status`, { isApproved });
    console.log('✅ Comment status updated successfully');
    return response.data;
  }

  async adminDeleteComment(commentId: string): Promise<ApiResponse<any>> {
    console.log(`🗑️ Admin deleting comment:`, commentId);
    const response = await this.axiosInstance.delete(`/comments/admin/${commentId}`);
    console.log('✅ Comment deleted successfully by admin');
    return response.data;
  }

  async getSuggestedBooks(bookId: string, limit: number = 6): Promise<ApiResponse<Book[]>> {
    console.log('💡 Fetching suggested books for:', bookId);
    const response = await this.axiosInstance.get(`/books/${bookId}/suggested?limit=${limit}`);
    console.log('✅ Suggested books fetched successfully');
    return response.data;
  }

  // ===== ADMIN DASHBOARD METHODS =====

  async getDashboardStats(): Promise<ApiResponse<{
    overview: {
      totalBooks: number;
      totalUsers: number;
      totalCategories: number;
      totalComments: number;
      totalReviews: number;
      totalReadingSessions: number;
      totalAuthors: number;
    };
    growth: {
      newBooksLast30Days: number;
      newUsersLast30Days: number;
    };
    popularBooks: Array<{
      id: string;
      title: string;
      coverImage?: string;
      readingCount: number;
    }>;
    recentActivity: {
      recentBooks: Array<{
        id: string;
        title: string;
        category?: string;
        createdAt: string;
      }>;
      recentUsers: Array<{
        id: string;
        name: string;
        email: string;
        createdAt: string;
      }>;
    };
  }>> {
    console.log('📊 Fetching dashboard statistics...');
    const response = await this.axiosInstance.get('/admin/dashboard/stats');
    console.log('✅ Dashboard statistics fetched successfully');
    return response.data;
  }

  async getUserGrowthStats(period: '6months' | '12months' | '24months' = '12months'): Promise<ApiResponse<{
    period: string;
    totalUsers: number;
    growthPercentage: number;
    monthlyData: Array<{
      month: string;
      newUsers: number;
      totalUsers: number;
    }>;
    currentMonth: {
      newUsers: number;
      totalUsers: number;
    };
    previousMonth: {
      newUsers: number;
      totalUsers: number;
    };
  }>> {
    console.log('📈 Fetching user growth statistics...');
    const response = await this.axiosInstance.get(`/admin/dashboard/user-growth?period=${period}`);
    console.log('✅ User growth statistics fetched successfully');
    return response.data;
  }

  async getUserGrowthStatsByDateRange(startDate: string, endDate: string): Promise<ApiResponse<{
    period: string;
    totalUsers: number;
    growthPercentage: number;
    monthlyData: Array<{
      month: string;
      newUsers: number;
      totalUsers: number;
    }>;
    currentMonth: {
      newUsers: number;
      totalUsers: number;
    };
    previousMonth: {
      newUsers: number;
      totalUsers: number;
    };
  }>> {
    console.log('📈 Fetching user growth statistics by date range...');
    const response = await this.axiosInstance.get(`/admin/dashboard/user-growth?startDate=${startDate}&endDate=${endDate}`);
    console.log('✅ User growth statistics fetched successfully');
    return response.data;
  }

  async getRecentActivities(limit: number = 20): Promise<ApiResponse<Array<{
    id: number;
    action: 'create' | 'update' | 'delete';
    actionLabel: string;
    entityType: 'book' | 'user' | 'category' | 'author' | 'review' | 'comment';
    entityLabel: string;
    entityId: number | null;
    entityName: string | null;
    description: string;
    changes: any;
    admin: {
      id: number;
      name: string;
      email: string;
      avatar: string | null;
    };
    createdAt: string;
  }>>> {
    console.log('📋 Fetching recent activities...', { limit });
    const response = await this.axiosInstance.get(`/admin/dashboard/activities?limit=${limit}`);
    console.log('✅ Recent activities fetched successfully');
    return response.data;
  }

  async getRevenueStats(period: '6months' | '12months' | '24months' = '12months'): Promise<ApiResponse<{
    period: string;
    totalRevenue: number;
    totalPurchases: number;
    growthPercentage: number;
    monthlyData: Array<{
      month: string;
      revenue: number;
      purchases: number;
    }>;
    currentMonth: {
      revenue: number;
      purchases: number;
    };
    previousMonth: {
      revenue: number;
      purchases: number;
    };
  }>> {
    console.log('💰 Fetching revenue statistics...');
    const response = await this.axiosInstance.get(`/admin/dashboard/revenue?period=${period}`);
    console.log('✅ Revenue statistics fetched successfully');
    return response.data;
  }

  async getRevenueStatsByDateRange(startDate: string, endDate: string): Promise<ApiResponse<{
    period: string;
    totalRevenue: number;
    totalPurchases: number;
    growthPercentage: number;
    monthlyData: Array<{
      month: string;
      revenue: number;
      purchases: number;
    }>;
    currentMonth: {
      revenue: number;
      purchases: number;
    };
    previousMonth: {
      revenue: number;
      purchases: number;
    };
  }>> {
    console.log('💰 Fetching revenue statistics by date range...');
    const response = await this.axiosInstance.get(`/admin/dashboard/revenue?startDate=${startDate}&endDate=${endDate}`);
    console.log('✅ Revenue statistics fetched successfully');
    return response.data;
  }

  // Rating methods
  async createOrUpdateRating(bookId: string, rating: number): Promise<ApiResponse<Rating>> {
    console.log('⭐ Creating/updating rating for book:', bookId, 'rating:', rating);
    const response = await this.axiosInstance.post('/ratings', {
      bookId,
      rating
    });
    console.log('✅ Rating created/updated successfully');
    return response.data;
  }

  async getUserRating(bookId: string): Promise<ApiResponse<Rating | null>> {
    console.log('⭐ Fetching user rating for book:', bookId);
    const response = await this.axiosInstance.get(`/ratings/book/${bookId}`);
    console.log('✅ User rating fetched successfully');
    return response.data;
  }

  async getBookRatingStats(bookId: string): Promise<ApiResponse<RatingStats>> {
    console.log('⭐ Fetching rating statistics for book:', bookId);
    const response = await this.axiosInstance.get(`/ratings/book/${bookId}/stats`);
    console.log('✅ Rating statistics fetched successfully');
    return response.data;
  }

  async deleteRating(bookId: string): Promise<ApiResponse<void>> {
    console.log('⭐ Deleting rating for book:', bookId);
    const response = await this.axiosInstance.delete(`/ratings/book/${bookId}`);
    console.log('✅ Rating deleted successfully');
    return response.data;
  }

  // ===== WALLET METHODS =====

  async getWalletBalance(): Promise<ApiResponse<{ balance: number }>> {
    console.log('💰 Fetching wallet balance...');
    const response = await this.axiosInstance.get('/wallet/balance');
    console.log('✅ Wallet balance fetched successfully');
    return response.data;
  }

  async convertToPoints(payload: { amountCents: number; rate?: number }): Promise<ApiResponse<{ pointsAdded: number; balance: number }>> {
    const response = await this.axiosInstance.post('/wallet/convert', payload);
    return response.data as any;
  }

  async purchaseBookWithPoints(payload: { bookId: string; pricePoints: number }): Promise<ApiResponse<{ balance: number }>> {
    const response = await this.axiosInstance.post('/wallet/purchase-book', payload);
    return response.data as any;
  }

  async getWalletTransactions(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    total: number;
    page: number;
    limit: number;
    items: Array<{
      id: number;
      userId: number;
      type: 'deposit' | 'purchase' | 'refund';
      points: number;
      balanceAfter: number;
      bookId?: number;
      description?: string;
      createdAt: string;
      updatedAt: string;
    }>;
  }>> {
    console.log('💰 Fetching wallet transactions...', params);
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const query = queryParams.toString();
    const url = query ? `/wallet/transactions?${query}` : '/wallet/transactions';
    const response = await this.axiosInstance.get(url);
    console.log('✅ Wallet transactions fetched successfully');
    return response.data;
  }

  async getTransactions(params?: {
    page?: number;
    limit?: number;
    type?: 'deposit' | 'purchase' | 'refund';
    status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  }): Promise<ApiResponse<Array<{
    id: number;
    userId: number;
    type: string;
    amount: number;
    status: string;
    paymentMethod: string;
    transactionCode: string;
    description: string;
    bookId?: number;
    createdAt: string;
    updatedAt: string;
  }>>> {
    console.log('💰 Fetching transactions...', params);
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    
    const query = queryParams.toString();
    const url = query ? `/wallet/transactions?${query}` : '/wallet/transactions';
    const response = await this.axiosInstance.get(url);
    console.log('✅ Transactions fetched successfully');
    return response.data;
  }

  async createDeposit(data: {
    amount: number;
    paymentMethod: string;
  }): Promise<ApiResponse<{
    transactionId: string;
    qrCode?: string;
    paymentUrl?: string;
    bankInfo?: {
      accountNumber: string;
      accountName: string;
      bankName: string;
      amount: number;
      content: string;
    };
  }>> {
    console.log('💰 Creating deposit request...', data);
    const response = await this.axiosInstance.post('/wallet/deposit', data);
    console.log('✅ Deposit request created successfully');
    return response.data;
  }

  async checkDepositStatus(transactionId: string): Promise<ApiResponse<{
    id: number;
    status: string;
    amount: number;
    createdAt: string;
  }>> {
    console.log('💰 Checking deposit status...', transactionId);
    const response = await this.axiosInstance.get(`/wallet/deposit/${transactionId}`);
    console.log('✅ Deposit status checked successfully');
    return response.data;
  }

  // ===== PAYMENT METHODS =====

  async purchaseBook(bookId: string): Promise<ApiResponse<{
    success: boolean;
    transactionId: string;
    bookId: string;
    message: string;
  }>> {
    console.log('💳 Purchasing book...', bookId);
    const response = await this.axiosInstance.post('/payments/purchase-book', { bookId });
    console.log('✅ Book purchased successfully');
    return response.data;
  }

  async getPaymentHistory(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Array<{
    id: number;
    type: string;
    amount: number;
    status: string;
    bookId?: number;
    createdAt: string;
  }>>> {
    console.log('💳 Fetching payment history...', params);
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const query = queryParams.toString();
    const url = query ? `/payments/history?${query}` : '/payments/history';
    const response = await this.axiosInstance.get(url);
    console.log('✅ Payment history fetched successfully');
    return response.data;
  }

  async createPaymentIntent(payload: { amount: number; currency?: string }): Promise<{ success: boolean; data: { clientSecret: string } }> {
    const response = await this.axiosInstance.post('/payments/create-payment-intent', payload);
    return response.data;
  }
}

export const apiService = new ApiService();
export { STORAGE_KEYS };
