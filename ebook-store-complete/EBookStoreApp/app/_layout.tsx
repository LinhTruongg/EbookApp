import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { AuthProvider } from '../src/context/AuthContext';
// @ts-ignore - Expo automatically resolves .native.tsx and .web.tsx
import StripeProvider from '../src/providers/StripeProvider';
import { ErrorBoundary } from '../src/components/common/ErrorBoundary';
import { Platform } from 'react-native';

// Suppress React Native Web warnings
import '../src/utils/suppressWarnings.js';

// Suppress expo-updates errors and Stripe warnings globally
if (typeof global !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const message = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg || '')).join(' ');
    if (message?.includes('Failed to download remote update') || 
        message?.includes('expo-updates') ||
        message?.includes('Updates') ||
        message?.includes('java.io.IOException') ||
        message?.includes('StripeKeepJsAwakeTask') ||
        message?.includes('No task registered for key') ||
        message?.includes('status code 401') ||
        message?.includes('ERR_BAD_REQUEST') ||
        message?.includes('Email hoặc mật khẩu không đúng') ||
        message?.includes('SimpleApiService.login error') ||
        message?.includes('AuthContext.login error') ||
        (message?.includes('status') && message?.includes('401'))) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  useEffect(() => {
    // Catch any unhandled promise rejections related to updates (web only)
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const rejectionHandler = (event: PromiseRejectionEvent) => {
        const errorMessage = event.reason?.message || String(event.reason || '');
        if (errorMessage.includes('Failed to download remote update') ||
            errorMessage.includes('expo-updates') ||
            errorMessage.includes('Updates') ||
            errorMessage.includes('java.io.IOException')) {
          console.warn('⚠️ Suppressing updates promise rejection');
          event.preventDefault();
        }
      };
      
      window.addEventListener('unhandledrejection', rejectionHandler);
      return () => {
        window.removeEventListener('unhandledrejection', rejectionHandler);
      };
    }
    
    // For React Native, use ErrorUtils
    if (Platform.OS !== 'web' && typeof ErrorUtils !== 'undefined') {
      const originalHandler = ErrorUtils.getGlobalHandler();
      ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
        const errorMessage = error?.message || String(error || '');
        if (errorMessage.includes('Failed to download remote update') ||
            errorMessage.includes('expo-updates') ||
            errorMessage.includes('Updates') ||
            errorMessage.includes('java.io.IOException')) {
          console.warn('⚠️ Suppressing updates error in ErrorUtils');
          return;
        }
        if (originalHandler) {
          originalHandler(error, isFatal);
        }
      });
      
      return () => {
        ErrorUtils.setGlobalHandler(originalHandler);
      };
    }
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StripeProvider>
            <AuthProvider>
              <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(admin)" options={{ headerShown: false }} />
              
              <Stack.Screen name="book-detail/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="book-reader/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="category-detail/[id]" options={{ headerShown: true, title: 'Thể loại sách' }} />
              <Stack.Screen name="payment-method/[id]" options={{ headerShown: true, title: 'Phương thức thanh toán' }} />
              <Stack.Screen name="search" options={{ headerShown: true, title: 'Tìm kiếm' }} />
              <Stack.Screen name="wallet/deposit" options={{ headerShown: false }} />
              <Stack.Screen name="wallet/transactions" options={{ headerShown: false }} />
              </Stack>
              <Toast />
            </AuthProvider>
          </StripeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}