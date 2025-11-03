import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { simpleApiService } from '../services/simpleApi';
import { STORAGE_KEYS } from '../services/api';
import { AuthContextType, User, RegisterRequest } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'AUTH_LOADING'; payload: boolean }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_INITIAL_STATE'; payload: { user: User | null; token: string | null } };

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  console.log('🔄 AuthReducer - Action:', action.type);
  console.log('🔄 AuthReducer - Current state:', {
    isAuthenticated: state.isAuthenticated,
    hasUser: !!state.user,
    hasToken: !!state.token,
    isLoading: state.isLoading
  });
  
  switch (action.type) {
    case 'AUTH_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'AUTH_SUCCESS':
      const newState = {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
      console.log('🔄 AuthReducer - AUTH_SUCCESS - New state:', {
        isAuthenticated: newState.isAuthenticated,
        hasUser: !!newState.user,
        hasToken: !!newState.token,
        userName: newState.user?.firstName,
        isLoading: newState.isLoading
      });
      return newState;
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_INITIAL_STATE':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: !!action.payload.token,
        isLoading: false,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadStoredAuthData();
  }, []);

  // Auto-refresh token when user is authenticated
  useEffect(() => {
    if (state.isAuthenticated && state.token) {
      startTokenRefresh();
    } else {
      stopTokenRefresh();
    }

    return () => {
      stopTokenRefresh();
    };
  }, [state.isAuthenticated, state.token]);

  // Token refresh management
  const startTokenRefresh = () => {
    console.log('🔄 Starting token refresh interval');
    // Refresh token every 50 minutes (tokens expire in 1 hour)
    refreshIntervalRef.current = setInterval(async () => {
      try {
        console.log('🔄 Auto-refreshing token...');
        await refreshToken();
        console.log('✅ Token auto-refreshed successfully');
      } catch (error) {
        console.error('❌ Auto token refresh failed:', error);
        // If refresh fails, logout user
        await logout();
      }
    }, 50 * 60 * 1000); // 50 minutes
  };

  const stopTokenRefresh = () => {
    if (refreshIntervalRef.current) {
      console.log('🛑 Stopping token refresh interval');
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  };

  const loadStoredAuthData = async () => {
    // Set a fallback timeout to ensure loading state is cleared
    const fallbackTimeout = setTimeout(() => {
      console.log('⚠️ Fallback timeout reached, clearing loading state');
      dispatch({ type: 'AUTH_LOADING', payload: false });
    }, 15000); // 15 seconds fallback

    try {
      dispatch({ type: 'AUTH_LOADING', payload: true });
      
      // Get stored auth data from AsyncStorage
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      const userStr = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      const user = userStr ? JSON.parse(userStr) : null;
      const storedRefreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (token && user) {
        console.log('🔄 Found stored auth data, setting initial state...');
        
        // Set token in SimpleApiService
        simpleApiService.setToken(token);
        
        // Set initial state with stored data first to avoid loading screen
        dispatch({
          type: 'SET_INITIAL_STATE',
          payload: { user, token },
        });
        
        // Skip token validation on app start to avoid loops
        // Token will be validated when user makes actual API calls
        console.log('✅ Using stored auth data, skipping validation to avoid loops');
        
        // Stop any existing token refresh interval
        stopTokenRefresh();
        
        // Do not clear stored tokens here; keep them for auth headers and refresh
      } else {
        console.log('❌ No stored auth data found');
        dispatch({
          type: 'SET_INITIAL_STATE',
          payload: { user: null, token: null },
        });
      }
      
      // Clear fallback timeout
      clearTimeout(fallbackTimeout);
    } catch (error) {
      console.error('❌ Error loading stored auth data:', error);
      dispatch({
        type: 'SET_INITIAL_STATE',
        payload: { user: null, token: null },
      });
      // Clear fallback timeout
      clearTimeout(fallbackTimeout);
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      console.log('🔵 AuthContext.login called with:', { email });
      dispatch({ type: 'AUTH_LOADING', payload: true });
      
      const response = await simpleApiService.login(email, password);
      console.log('🔵 AuthContext received response:', response);
      console.log('🔵 Response type:', typeof response);
      console.log('🔵 Response.success:', response.success, typeof response.success);
      console.log('🔵 Response.data:', response.data);
      
      if (response.success) {
        console.log('🎯 Response validation passed, proceeding with auth save...');
        // Save auth data to AsyncStorage
        await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
        console.log('🎯 Auth data saved successfully');
        
        // Set token in SimpleApiService
        simpleApiService.setToken(response.data.token);
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: response.data.user, token: response.data.token },
        });
        console.log('🎯 Auth state updated');
        console.log('🎯 Should now be authenticated: isAuthenticated should be TRUE');
        
        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: response.message,
        });
        console.log('✅ AuthContext.login successful - ALL STEPS COMPLETED');
        
        // Return user data for navigation logic
        return response.data.user;
      } else {
        console.log('❌ Response.success is false:', response.success);
        console.log('❌ Response message:', response.message);
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('❌ AuthContext.login error:', error);
      dispatch({ type: 'AUTH_LOADING', payload: false });
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: errorMessage,
      });
      throw error;
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_LOADING', payload: true });
      const response = await simpleApiService.register(userData);
      
      if (response.success) {
        // Save auth data to AsyncStorage
        await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
        
        // Set token in SimpleApiService
        simpleApiService.setToken(response.data.token);
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: response.data.user, token: response.data.token },
        });
        Toast.show({
          type: 'success',
          text1: 'Registration Successful',
          text2: response.message,
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      dispatch({ type: 'AUTH_LOADING', payload: false });
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: errorMessage,
      });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🚪 Starting logout process...');
      
      // Stop token refresh interval
      stopTokenRefresh();
      
      // Clear token from SimpleApiService
      simpleApiService.setToken(null);
      
      // Clear auth data (including refresh token)
      await simpleApiService.logout();
      console.log('✅ Auth data cleared successfully');
      
      // Update state
      dispatch({ type: 'AUTH_LOGOUT' });
      console.log('✅ Auth state updated to logged out');
      
      // Show success message
      Toast.show({
        type: 'success',
        text1: 'Logged Out',
        text2: 'You have been successfully logged out',
      });
      console.log('✅ Logout completed successfully');
    } catch (error: any) {
      console.error('❌ Logout error:', error);
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      console.log('🔄 Attempting to refresh token...');
      const storedRefreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (!storedRefreshToken) {
        console.log('❌ No refresh token found');
        throw new Error('No refresh token available');
      }

      const response = await simpleApiService.refreshToken(storedRefreshToken);
      
      if (response.success) {
        const updatedUser = state.user;
        if (updatedUser) {
          // Save updated auth data to AsyncStorage
          await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
          await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken);
          
          // Set new token in SimpleApiService
          simpleApiService.setToken(response.data.token);
          
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: updatedUser, token: response.data.token },
          });
          console.log('✅ Token refreshed successfully');
        }
      } else {
        throw new Error(response.message || 'Token refresh failed');
      }
    } catch (error: any) {
      console.error('❌ Token refresh failed:', error);
      // Don't call logout here to avoid infinite loop, just clear auth state
      await simpleApiService.logout();
      dispatch({ type: 'AUTH_LOGOUT' });
      throw error;
    }
  };

  const updateUser = (user: User): void => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  const forgotPassword = async (email: string): Promise<any> => {
    try {
      const response = await simpleApiService.forgotPassword(email);
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Password Reset',
          text2: response.message,
        });
        return response;
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Password reset failed';
      Toast.show({
        type: 'error',
        text1: 'Password Reset Failed',
        text2: errorMessage,
      });
      throw error;
    }
  };

  const verifyForgotPassword = async (token: string, otpCode: string): Promise<any> => {
    try {
      const response = await simpleApiService.verifyForgotPassword(token, otpCode);
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'OTP Verified',
          text2: response.message,
        });
        return response;
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'OTP verification failed';
      Toast.show({
        type: 'error',
        text1: 'OTP Verification Failed',
        text2: errorMessage,
      });
      throw error;
    }
  };

  const resetPassword = async (token: string, password: string): Promise<void> => {
    try {
      const response = await simpleApiService.resetPassword(token, password);
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Password Reset',
          text2: response.message,
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Password reset failed';
      Toast.show({
        type: 'error',
        text1: 'Password Reset Failed',
        text2: errorMessage,
      });
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      const response = await simpleApiService.changePassword(currentPassword, newPassword);
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Password Changed',
          text2: response.message,
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Password change failed';
      Toast.show({
        type: 'error',
        text1: 'Password Change Failed',
        text2: errorMessage,
      });
      throw error;
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      const response = await simpleApiService.updateProfile(userData);
      if (response.success && response.data) {
        dispatch({
          type: 'UPDATE_USER',
          payload: response.data,
        });
        
        // Update stored user data
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
        
        Toast.show({
          type: 'success',
          text1: 'Profile Updated',
          text2: response.message,
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Profile update failed';
      Toast.show({
        type: 'error',
        text1: 'Profile Update Failed',
        text2: errorMessage,
      });
      throw error;
    }
  };

  const value: AuthContextType = {
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
    updateProfile,
    forgotPassword,
    verifyForgotPassword,
    resetPassword,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
