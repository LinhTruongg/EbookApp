import React from 'react';
import { useRouter } from 'expo-router';
import EditProfileScreen from '../../../src/screens/profile/EditProfile/EditProfileScreen';

export default function EditProfile() {
  const router = useRouter();
  
  return <EditProfileScreen />;
}