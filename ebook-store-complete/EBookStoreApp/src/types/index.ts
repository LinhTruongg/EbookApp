export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  lastLogin?: string;
  isActive: boolean;
  readingPreferences: {
    theme: 'light' | 'dark';
    fontSize: number;
    fontFamily: string;
    lineHeight: number;
  };
  favoriteCategories: number[];
  booksRead: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  otpToken: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface Rating {
  id: string;
  userId: string;
  bookId: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface CreateRatingRequest {
  bookId: string;
  rating: number;
}

export interface RatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    rating: number;
    count: number;
  }[];
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
  error?: string;
}

export interface BookDetailResponse {
  book: Book;
  userInfo: {
    isOwned: boolean;
    isInWishlist: boolean;
    readingProgress: number;
    currentPage: number;
    isFavorite: boolean;
    purchaseDate?: string;
    hasLiked?: boolean;
  };
}

export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  isbn: string;
  // Removed price and discountPrice fields as this is now a free reading app
  coverImage?: string;
  fileUrl?: string;
  fileSize?: number;
  previewUrl?: string;
  samplePages?: number;
  assetId?: string;
  downloadableUrl?: string;
  pageCount: number;
  language: string;
  publicationDate?: string;
  publishedDate: string;
  publisher: string;
  isActive: boolean;
  isFeatured: boolean;
  isBestseller?: boolean;
  isNewRelease?: boolean;
  downloadCount: number;
  viewCount: number;
  rating: number;
  reviewCount: number;
  totalReviews?: number;
  likesCount?: number;
  hasLiked?: boolean;
  // Removed totalPurchases and totalRevenue fields as this is now a free reading app
  categoryId?: number;
  category?: Category;
  authors?: Author[];
  categories?: Category[];
  tags?: string[];
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface UserLibaryEntity {
  id: string;
  userId: string;
  bookId: string;
  book: Book;
  readProgress: number;
  currentPage: number;
  isFavorite: boolean;
  addedDate?: string;
  readingTimeInMinutes?: number;
  accessType: 'free' | 'subscription';
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  image?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  booksCount: number;
  parent?: Category;
  subcategories?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface Author {
  id: string;
  name: string;
  biography?: string;
  avatar?: string;
  birthDate?: string;
  nationality?: string;
  website?: string;
  socialMedia?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  isActive: boolean;
  bookCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  likesCount: number;
  hasLiked: boolean;
  createdAt: string;
  timeAgo: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  replies: Comment[];
  repliesCount: number;
  parentId?: string;
}

export interface CommentStats {
  totalComments: number;
  totalLikes: number;
}

export interface CommentPagination {
  currentPage: number;
  totalPages: number;
  totalComments: number;
  hasNextPage: boolean;
}

export interface CommentsResponse {
  comments: Comment[];
  pagination: CommentPagination;
}

export interface CreateCommentRequest {
  content: string;
  parentId?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (user: User) => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  sendRegistrationOTP: (email: string) => Promise<any>;
  verifyRegistrationOTP: (token: string, otpCode: string) => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  verifyForgotPassword: (token: string, otpCode: string) => Promise<any>;
  resetPassword: (token: string, password: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}
