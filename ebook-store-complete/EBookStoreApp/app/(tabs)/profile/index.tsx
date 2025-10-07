import React from 'react';
import { useRouter } from 'expo-router';
import ProfileScreen from '../../../src/screens/profile/Profile/ProfileScreen';

export default function Profile() {
  const router = useRouter();

  return <ProfileScreen  />;
}