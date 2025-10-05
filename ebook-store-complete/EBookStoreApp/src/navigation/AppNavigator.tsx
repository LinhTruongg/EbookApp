import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/common/LoadingScreen';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import AdminNavigator from './AdminNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Debug authentication state
  console.log('🏠 AppNavigator - Auth State:', {
    isAuthenticated,
    isLoading,
    shouldShowMain: isAuthenticated,
    shouldShowAuth: !isAuthenticated
  });

  if (isLoading) {
    console.log('🏠 AppNavigator - Showing LoadingScreen');
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            {user?.role === 'admin' ? (
              <>
                {console.log('🏠 AppNavigator - Rendering AdminNavigator (ADMIN)')}
                <Stack.Screen name="Admin" component={AdminNavigator} />
              </>
            ) : (
              <>
                {console.log('🏠 AppNavigator - Rendering MainNavigator (HOME)')}
                <Stack.Screen name="Main" component={MainNavigator} />
              </>
            )}
          </>
        ) : (
          <>
            {console.log('🏠 AppNavigator - Rendering AuthNavigator (LOGIN)')}
            <Stack.Screen name="Auth" component={AuthNavigator} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
