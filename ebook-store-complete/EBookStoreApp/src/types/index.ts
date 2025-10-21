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
  totalSpent: number;
  booksPurchased: number;
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
  };
}

export interface Book {
  id: string;
  title: string;
  description: string;
  isbn: string;
  price: number;
  discountPrice?: number;
  coverImage?: string;
  fileUrl?: string;
  assetId?: string;
  downloadableUrl?: string;
  pageCount: number;
  language: string;
  publishedDate: string;
  publisher: string;
  isActive: boolean;
  isFeatured: boolean;
  downloadCount: number;
  viewCount: number;
  rating: number;
  reviewCount: number;
  authors?: Author[];
  categories?: Category[];
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
  purchaseDate?: string;
  readingTimeInMinutes?: number;
  accessType: string;
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
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}
