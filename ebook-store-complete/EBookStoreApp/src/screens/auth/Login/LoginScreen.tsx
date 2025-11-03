import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LoginForm from '../../../components/auth/LoginForm';
import { COLORS, SIZES } from '../../../constants';

interface LoginScreenProps {
  navigation: any;
}

const { width, height } = Dimensions.get('window');

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const handleNavigateToRegister = () => {
    navigation.navigate('Register');
  };

  const handleNavigateToForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradient}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Header Section */}
            <View style={styles.headerSection}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>📚</Text>
              </View>
              <Text style={styles.appTitle}>BookStore</Text>
              <Text style={styles.appSubtitle}>Thư viện sách số của bạn</Text>
            </View>


            {/* Login Form Section */}
            <View style={styles.formSection}>
              <View style={styles.formContainer}>
                <LoginForm />
                
                {/* debug section removed */}
                
                {/* Forgot Password Link */}
                <TouchableOpacity
                  style={styles.forgotPasswordContainer}
                  onPress={handleNavigateToForgotPassword}
                >
                  <Text style={styles.forgotPasswordText}>
                    Quên mật khẩu?
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Section */}
            <View style={styles.bottomSection}>
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>hoặc</Text>
                <View style={styles.divider} />
              </View>

              <TouchableOpacity
                style={styles.registerContainer}
                onPress={handleNavigateToRegister}
              >
                <Text style={styles.registerText}>
                  Chưa có tài khoản?{' '}
                  <Text style={styles.registerLink}>Đăng ký ngay</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradient: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  logoText: {
    fontSize: 40,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 12,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '300',
  },
  formSection: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 16,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  bottomSection: {
    paddingVertical: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '400',
  },
  registerContainer: {
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  registerLink: {
    color: '#ffffff',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  debugSection: {
    paddingVertical: 10,
    alignItems: 'center',
  },
});

export default LoginScreen;
