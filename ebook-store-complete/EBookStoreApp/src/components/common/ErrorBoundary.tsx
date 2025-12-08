import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State | null {
    const errorAny = error as any;
    
    if (error.message?.includes('Failed to download remote update') || 
        error.message?.includes('expo-updates') ||
        error.message?.includes('Updates')) {
      return null;
    }

    if (errorAny?.response || errorAny?.status || errorAny?.config) {
      return null;
    }

    if (error.message?.includes('Email hoặc mật khẩu') || 
        error.message?.includes('Login failed') ||
        error.message?.includes('Invalid email or password') ||
        error.message?.includes('authentication') ||
        error.message?.includes('401') ||
        error.message?.includes('403') ||
        error.message?.includes('404') ||
        error.message?.includes('500')) {
      return null;
    }

    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    if (error.message?.includes('Failed to download remote update') || 
        error.message?.includes('expo-updates') ||
        error.message?.includes('Updates')) {
      console.warn('⚠️ Updates error detected, ignoring...');
      this.setState({ hasError: false, error: null });
      return;
    }

    const errorAny = error as any;
    if (errorAny?.response || errorAny?.status || errorAny?.config) {
      console.warn('⚠️ API/Network error detected in ErrorBoundary, ignoring...');
      this.setState({ hasError: false, error: null });
      return;
    }

    if (error.message?.includes('Email hoặc mật khẩu') || 
        error.message?.includes('Login failed') ||
        error.message?.includes('Invalid email or password') ||
        error.message?.includes('authentication') ||
        error.message?.includes('401') ||
        error.message?.includes('403') ||
        error.message?.includes('404') ||
        error.message?.includes('500')) {
      console.warn('⚠️ Authentication/API error detected, ignoring...');
      this.setState({ hasError: false, error: null });
      return;
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const errorMessage = this.state.error.message || 'Unknown error';
      const errorAny = this.state.error as any;
      
      if (errorMessage.includes('Failed to download remote update') || 
          errorMessage.includes('expo-updates') ||
          errorMessage.includes('Updates')) {
        console.warn('⚠️ Ignoring updates error, continuing app...');
        return this.props.children;
      }

      if (errorAny?.response || errorAny?.status || errorAny?.config) {
        console.warn('⚠️ Ignoring API/Network error, continuing app...');
        return this.props.children;
      }

      if (errorMessage.includes('Email hoặc mật khẩu') || 
          errorMessage.includes('Login failed') ||
          errorMessage.includes('Invalid email or password') ||
          errorMessage.includes('authentication') ||
          errorMessage.includes('401') ||
          errorMessage.includes('403') ||
          errorMessage.includes('404') ||
          errorMessage.includes('500')) {
        console.warn('⚠️ Ignoring authentication/API error, continuing app...');
        return this.props.children;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{errorMessage}</Text>
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


