import React from 'react';
import { useRouter } from 'expo-router';
import RegisterScreen from '../../src/screens/auth/Register/RegisterScreen';

export default function Register() {
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

  return <RegisterScreen navigation={navigation} />;
}