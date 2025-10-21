import React from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { Redirect } from 'expo-router';

export default function AdminLayout() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="books" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="users" />
      <Stack.Screen name="reviews" />
      <Stack.Screen name="comments" />
      <Stack.Screen name="analytics" />
    </Stack>
  );
}
