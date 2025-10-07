import React from 'react';
import { useRouter } from 'expo-router';
import ForgotPasswordScreen from '../../src/screens/auth/ForgotPassword/ForgotPasswordScreen';

export default function ForgotPassword() {
  const router = useRouter();
  
  const navigation = {
    navigate: (screen: string) => {
      if (screen === 'Login') {
        router.push('/(auth)/login');
      }
    },
    goBack: () => {
      router.back();
    }
  };

  return <ForgotPasswordScreen navigation={navigation} />;
}