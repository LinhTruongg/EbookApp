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
import { simpleApiService } from '../../services/simpleApi';
import { COLORS, SIZES, COMMON_STYLES } from '../../constants';
import { useRouter } from 'expo-router';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('nguyenvanan@gmail.com');
  const [password, setPassword] = useState('123456');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { login, isLoading, user } = useAuth();
  const router = useRouter();


  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');
    
    let hasError = false;
    
    if (!email || !email.trim()) {
      setEmailError('Vui lòng nhập email');
      hasError = true;
    }
    
    if (!password || !password.trim()) {
      setPasswordError('Vui lòng nhập mật khẩu');
      hasError = true;
    }
    
    if (hasError) {
      return;
    }
    
    try {
    console.log('🔵 LoginForm.handleLogin called with:', { email });
    console.log('🔵 Current environment:', __DEV__ ? 'development' : 'production');
    console.log('🔵 Window object exists:', typeof window !== 'undefined');

      console.log('🔵 LoginForm calling login from AuthContext...');
      const loggedInUser = await login(email, password);
      
      // Check user role and navigate accordingly
      if (loggedInUser && loggedInUser.role) {
        try {
          if (loggedInUser.role === 'admin') {
        router.push('/admin/dashboard');
        console.log('✅ Admin login successful - redirected to admin dashboard');
      } else {
        router.push('/(tabs)');
        console.log('✅ User login successful - redirected to user tabs');
          }
        } catch (navError: any) {
          console.error('❌ Navigation error:', navError);
          Alert.alert('Error', 'Login successful but navigation failed. Please try again.');
        }
      } else {
        console.warn('⚠️ Logged in user missing role:', loggedInUser);
        Alert.alert('Error', 'Login successful but user data is invalid.');
      }
    } catch (error: any) {
      const isAuthError = error?.response?.status === 401 || error?.response?.status === 403 || error?.status === 401 || error?.status === 403;
      
      if (!isAuthError && __DEV__) {
        console.error('❌ LoginForm login error:', error);
        console.error('❌ Error details:', {
          message: error?.message,
          response: error?.response?.data,
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          config: error?.config?.url,
          code: error?.code
        });
      }
      
      let errorMessage = 'Invalid email or password';
      
      try {
        if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
        } else if (error?.message) {
        errorMessage = error.message;
        } else if (error?.code === 'NETWORK_ERROR' || error?.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
        }
      } catch (msgError) {
        console.warn('⚠️ Error extracting message:', msgError);
      }
      
      try {
      Alert.alert('Login Failed', errorMessage);
      } catch (alertError) {
        if (__DEV__) {
          console.error('❌ Alert.alert error:', alertError);
        }
      }
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
            style={[styles.input, emailError && styles.inputError]}
            placeholder="Nhập email của bạn"
            placeholderTextColor={COLORS.textPlaceholder}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>
        
        <View style={styles.inputContainer}>
          <View style={styles.passwordHeader}>
            <Text style={styles.label}>Mật khẩu</Text>
          </View>
          <TextInput
            style={[styles.input, passwordError && styles.inputError]}
            placeholder="Nhập mật khẩu"
            placeholderTextColor={COLORS.textPlaceholder}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError('');
            }}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
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
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: SIZES.font.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  forgotPasswordText: {
    fontSize: SIZES.font.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  input: {
    ...COMMON_STYLES.input,
    fontSize: SIZES.font.md,
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 1,
  },
  errorText: {
    fontSize: SIZES.font.sm,
    color: '#ef4444',
    marginTop: SIZES.spacing.xs,
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
