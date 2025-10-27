import React from 'react';
import { Stack } from 'expo-router';
import { COLORS } from '../../../src/constants';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Hồ sơ',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="edit-profile"
        options={{
          title: 'Cập nhật thông tin',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="change-password"
        options={{
          title: 'Đổi mật khẩu',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerTitleAlign: 'center',
        }}
      />
    </Stack>
  );
}