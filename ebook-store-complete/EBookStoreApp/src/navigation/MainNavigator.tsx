import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import BookDetailScreen from '../screens/book/BookDetail/BookDetailScreen';
import BookReaderScreen from '../screens/book/BookReader/BookReaderScreen';
import CategoryDetailScreen from '../screens/home/Categories/CategoryDetailScreen';
import PaymentMethodScreen from '../screens/payment/PaymentMethodScreen';
import SearchScreen from '../screens/home/Search/SearchScreen';
import { COLORS } from '../constants';

const Stack = createNativeStackNavigator();

const MainNavigator: React.FC = () => {
  console.log('🏠 MainNavigator - RENDERED! User is now authenticated');
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen 
        name="BookDetail" 
        component={BookDetailScreen}
        options={{
          headerShown: true,
          title: 'Chi tiết sách',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Stack.Screen 
        name="BookReader" 
        component={BookReaderScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="CategoryDetail" 
        component={CategoryDetailScreen}
        options={{
          headerShown: true,
          title: 'Thể loại sách',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Stack.Screen 
        name="PaymentMethod" 
        component={PaymentMethodScreen}
        options={{
          headerShown: true,
          title: 'Thanh toán',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Stack.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;
