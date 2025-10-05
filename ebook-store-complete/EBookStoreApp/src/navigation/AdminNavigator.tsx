import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboardScreen from '../screens/admin/Dashboard/AdminDashboardScreen';
import ManageUsersScreen from '../screens/admin/Users/ManageUsersScreen';
import ManageCategoriesScreen from '../screens/admin/Categories/ManageCategoriesScreen';
import ManageBooksScreen from '../screens/admin/Books/ManageBooksScreen';
import ManageReviewsScreen from '../screens/admin/Reviews/ManageReviewsScreen';
import ManageCommentsScreen from '../screens/admin/Comments/ManageCommentsScreen';
import AnalyticsScreen from '../screens/admin/Analytics/AnalyticsScreen';

const Stack = createNativeStackNavigator();

const AdminNavigator: React.FC = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        headerStyle: {
          backgroundColor: '#1E293B',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen 
        name="AdminDashboard" 
        component={AdminDashboardScreen} 
        options={{ 
          headerShown: false,
          title: 'Admin Dashboard' 
        }} 
      />
      <Stack.Screen 
        name="ManageUsers" 
        component={ManageUsersScreen} 
        options={{ 
          headerShown: true,
          title: 'Quản lý người dùng',
          headerBackTitle: 'Quay lại'
        }} 
      />
      <Stack.Screen 
        name="ManageCategories" 
        component={ManageCategoriesScreen} 
        options={{ 
          headerShown: true,
          title: 'Quản lý chủ đề',
          headerBackTitle: 'Quay lại'
        }} 
      />
      <Stack.Screen 
        name="ManageBooks" 
        component={ManageBooksScreen} 
        options={{ 
          headerShown: true,
          title: 'Quản lý sách',
          headerBackTitle: 'Quay lại'
        }} 
      />
      <Stack.Screen 
        name="ManageReviews" 
        component={ManageReviewsScreen} 
        options={{ 
          headerShown: true,
          title: 'Quản lý đánh giá',
          headerBackTitle: 'Quay lại'
        }} 
      />
      <Stack.Screen 
        name="ManageComments" 
        component={ManageCommentsScreen} 
        options={{ 
          headerShown: true,
          title: 'Quản lý bình luận',
          headerBackTitle: 'Quay lại'
        }} 
      />
      <Stack.Screen 
        name="Analytics" 
        component={AnalyticsScreen} 
        options={{ 
          headerShown: true,
          title: 'Thống kê',
          headerBackTitle: 'Quay lại'
        }} 
      />
    </Stack.Navigator>
  );
};

export default AdminNavigator;


