import React from 'react';
import { useRouter } from 'expo-router';
import ChangePasswordScreen from '../../../src/screens/profile/ChangePassword/ChangePasswordScreen';

export default function ChangePassword() {
  const router = useRouter();
  
  return <ChangePasswordScreen  />;
}