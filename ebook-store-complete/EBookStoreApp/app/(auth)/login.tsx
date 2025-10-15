import React from 'react';
import { useRouter } from 'expo-router';
import LoginScreen from '../../src/screens/auth/Login/LoginScreen';

export default function Login() {
  const router = useRouter();
  
  const navigation = {
    navigate: (screen: string) => {
      if (screen === 'Register') {
        router.push('/(auth)/register');
      } else if (screen === 'ForgotPassword') {
        router.push('/(auth)/forgot-password');
      } else if (screen === 'Home') {
        router.push('/(tabs)');
      }
    }
  };

  return <LoginScreen navigation={navigation} />;
}