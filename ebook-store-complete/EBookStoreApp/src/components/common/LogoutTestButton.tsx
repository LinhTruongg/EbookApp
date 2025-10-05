import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SIZES } from '../../constants';

export default function LogoutTestButton() {
  const { logout } = useAuth();

  const handleTestLogout = async () => {
    console.log('🧪 Test logout button pressed');
    Alert.alert(
      'Test Logout',
      'This will logout and clear refresh token. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            console.log('🧪 Test logout confirmed - starting logout process');
            try {
              await logout();
              console.log('🧪 Test logout completed successfully');
            } catch (error) {
              console.error('🧪 Test logout error:', error);
              Alert.alert('Error', 'Logout failed. Check console for details.');
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleTestLogout}>
      <Text style={styles.buttonText}>🧪 Test Logout</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.error,
    padding: 15,
    borderRadius: 8,
    margin: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.font.md,
    fontWeight: 'bold',
  },
});