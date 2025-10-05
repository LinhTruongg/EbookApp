import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import HomeScreen from '../screens/home/Home/HomeScreen';
import CategoriesScreen from '../screens/home/Categories/CategoriesScreen';
import LibraryScreen from '../screens/library/Library/LibraryScreen';
import ProfileScreen from '../screens/profile/Profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfile/EditProfileScreen';
import ChangePasswordScreen from '../screens/profile/ChangePassword/ChangePasswordScreen';

const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();

// LibraryScreen is now imported from the actual component

// Profile Stack Navigator
const ProfileStackNavigator = () => (
  <ProfileStack.Navigator>
    <ProfileStack.Screen 
      name="ProfileMain" 
      component={ProfileScreen}
      options={{ 
        title: 'Hồ sơ',
        headerStyle: { backgroundColor: '#4CAF50' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
    <ProfileStack.Screen 
      name="EditProfile" 
      component={EditProfileScreen}
      options={{ 
        title: 'Cập nhật thông tin',
        headerStyle: { backgroundColor: '#4CAF50' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
    <ProfileStack.Screen 
      name="ChangePassword" 
      component={ChangePasswordScreen}
      options={{ 
        title: 'Đổi mật khẩu',
        headerStyle: { backgroundColor: '#4CAF50' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
  </ProfileStack.Navigator>
);

const TabNavigator: React.FC = () => {
  console.log('🏠 TabNavigator - RENDERED!');
  return (
    <Tab.Navigator 
      screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: '#E53E3E',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Trang chủ',
          tabBarIcon: () => <Text>🏠</Text>,
        }}
      />
      <Tab.Screen 
        name="Categories" 
        component={CategoriesScreen}
        options={{
          tabBarLabel: 'Thể loại',
          tabBarIcon: () => <Text>⊞</Text>,
        }}
      />
      <Tab.Screen 
        name="Library" 
        component={LibraryScreen}
        options={{
          tabBarLabel: 'Thư viện',
          tabBarIcon: () => <Text>📚</Text>,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Cài đặt',
          tabBarIcon: () => <Text>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
