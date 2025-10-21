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
} from '../types';

const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user_data',
};

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    const baseURL = `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}`;
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

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
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
      console.log('🔵 ApiService.login called with:', { email: data.email, baseURL: API_CONFIG.BASE_URL });
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

  async searchBooks(query: string): Promise<ApiResponse<Book[]>> {
    console.log('🔍 Searching books with query:', query);
    const response = await this.axiosInstance.get(`/books/search?q=${encodeURIComponent(query)}`);
    console.log('✅ Books search completed');
    return response.data;
  }

  async getBooksByCategory(categoryId: string): Promise<ApiResponse<Book[]>> {
    console.log('📂 Fetching books by category:', categoryId);
    const response = await this.axiosInstance.get(`/books/category/${categoryId}`);
    console.log('✅ Books by category fetched successfully');
    return response.data;
  }

  async getBooksByAuthor(authorId: string): Promise<ApiResponse<Book[]>> {
    console.log('✍️ Fetching books by author:', authorId);
    const response = await this.axiosInstance.get(`/books/author/${authorId}`);
    console.log('✅ Books by author fetched successfully');
    return response.data;
  }

  async getBookById(bookId: string): Promise<ApiResponse<BookDetailResponse>> {
    console.log('📖 Fetching book details:', bookId);
    const response = await this.axiosInstance.get(`/books/${bookId}`);
    console.log('✅ Book details fetched successfully');
    return response.data;
  }

  async toggleWishlist(bookId: string): Promise<ApiResponse<{ inWishlist: boolean }>> {
    console.log('🌟 Toggling wishlist for book:', bookId);
    const response = await this.axiosInstance.post(`/books/${bookId}/wishlist`);
    return response.data;
  }

  async updateReadingProgress(bookId: string, currentPage: number, totalPages: number): Promise<ApiResponse> {
    console.log('📊 Updating reading progress:', { bookId, currentPage, totalPages });
    const response = await this.axiosInstance.post('/users/reading-progress', {
      bookId,
      currentPage,
      totalPages,
      progress: Math.round((currentPage / totalPages) * 100)
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
    const response = await this.axiosInstance.post('/books/admin', bookData);
    console.log('✅ Book created successfully');
    return response.data;
  }

  async updateBook(id: string, bookData: any): Promise<ApiResponse<Book>> {
    console.log(`📝 Updating book ${id}...`);
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

  async getAllUsersAdmin(): Promise<ApiResponse<User[]>> {
    console.log('👥 Fetching all users for admin...');
    const response = await this.axiosInstance.get('/users/admin/all');
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
}

export const apiService = new ApiService();
export { STORAGE_KEYS };
