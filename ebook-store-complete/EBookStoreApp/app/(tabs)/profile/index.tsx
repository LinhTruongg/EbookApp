import React from 'react';
import { useRouter } from 'expo-router';
import ProfileScreen from '../../../src/screens/profile/Profile/ProfileScreen';

export default function Profile() {
  const router = useRouter();
  
  const navigation = {
    navigate: (screen: string) => {
      if (screen === 'EditProfile') {
        router.push('/(tabs)/profile/edit-profile');
      } else if (screen === 'ChangePassword') {
        router.push('/(tabs)/profile/change-password');
      }
    }
  };

  return <ProfileScreen navigation={navigation} />;
}