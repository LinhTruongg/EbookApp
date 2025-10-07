import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { AuthProvider } from '../src/context/AuthContext';

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
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(admin)" options={{ headerShown: false }} />
            <Stack.Screen name="book-detail/[id]" options={{ headerShown: true, title: 'Chi tiết sách' }} />
            <Stack.Screen name="book-reader/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="category-detail/[id]" options={{ headerShown: true, title: 'Thể loại sách' }} />
            <Stack.Screen name="payment-method/[id]" options={{ headerShown: true, title: 'Phương thức thanh toán' }} />
            <Stack.Screen name="search" options={{ headerShown: true, title: 'Tìm kiếm' }} />
          </Stack>
          <Toast />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}