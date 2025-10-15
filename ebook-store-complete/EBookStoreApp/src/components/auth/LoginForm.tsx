import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SIZES, COMMON_STYLES } from '../../constants';
import { useRouter } from 'expo-router';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('nguyenvanan@gmail.com'); // Pre-filled for demo
  const [password, setPassword] = useState('123456'); // Pre-filled for demo
  const { login, isLoading } = useAuth();
  const router = useRouter();


  const handleLogin = async () => {
    console.log('🔵 LoginForm.handleLogin called with:', { email });
    console.log('🔵 Current environment:', __DEV__ ? 'development' : 'production');
    console.log('🔵 Window object exists:', typeof window !== 'undefined');
    
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      console.log('🔵 LoginForm calling login...');
      await login(email, password);
      router.push('/(tabs)');
      console.log('✅ LoginForm login successful');
      // Login successful - navigation will be handled by AuthContext
    } catch (error) {
      console.error('❌ LoginForm login error:', error);
      Alert.alert('Login Failed', `Error: ${error instanceof Error ? error.message : 'Invalid email or password'}`);
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chào mừng trở lại</Text>
        <Text style={styles.subtitle}>Đăng nhập để tiếp tục khám phá thư viện sách</Text>
      </View>
      
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập email của bạn"
            placeholderTextColor={COLORS.textPlaceholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mật khẩu</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu"
            placeholderTextColor={COLORS.textPlaceholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.spacing.lg,
    justifyContent: 'center',
  },
  header: {
    marginBottom: SIZES.spacing.xxxl,
    alignItems: 'center',
  },
  title: {
    fontSize: SIZES.font.xxxl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  subtitle: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    gap: SIZES.spacing.lg,
  },
  inputContainer: {
    gap: SIZES.spacing.sm,
  },
  label: {
    fontSize: SIZES.font.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  input: {
    ...COMMON_STYLES.input,
    fontSize: SIZES.font.md,
  },
  button: {
    ...COMMON_STYLES.buttonPrimary,
    marginTop: SIZES.spacing.md,
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray400,
  },
  buttonText: {
    ...COMMON_STYLES.textButton,
    fontSize: SIZES.font.md,
  },
});

export default LoginForm;
