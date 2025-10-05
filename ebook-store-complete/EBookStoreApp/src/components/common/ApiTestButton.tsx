import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { API_CONFIG, FALLBACK_URLS } from '../../constants/api';

const ApiTestButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'failed'>('unknown');
  const [lastSuccessfulUrl, setLastSuccessfulUrl] = useState<string>('');

  const testSingleUrl = async (baseUrl: string): Promise<boolean> => {
    try {
      console.log(`🔵 Testing connection to: ${baseUrl}/health`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.log(`❌ ${baseUrl} - HTTP ${response.status}: ${response.statusText}`);
        return false;
      }
      
      const data = await response.json();
      console.log(`✅ ${baseUrl} - SUCCESS:`, data);
      return true;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log(`⏰ ${baseUrl} - TIMEOUT after 5 seconds`);
      } else {
        console.log(`❌ ${baseUrl} - ERROR:`, error.message);
      }
      return false;
    }
  };

  const testConnection = async () => {
    setIsLoading(true);
    setConnectionStatus('unknown');
    console.log('🔍 Starting comprehensive API connection test...');
    
    // List of URLs to test (primary + fallbacks)
    const urlsToTest = [API_CONFIG.BASE_URL, ...FALLBACK_URLS.filter(url => url !== API_CONFIG.BASE_URL)];
    
    console.log('🔍 URLs to test:', urlsToTest);
    
    let successfulUrl = '';
    
    for (const baseUrl of urlsToTest) {
      const success = await testSingleUrl(baseUrl);
      if (success) {
        successfulUrl = baseUrl;
        break;
      }
    }
    
    if (successfulUrl) {
      console.log(`🎉 FOUND WORKING URL: ${successfulUrl}`);
      setConnectionStatus('success');
      setLastSuccessfulUrl(successfulUrl);
      Alert.alert(
        '✅ Connection Successful!', 
        `Working URL: ${successfulUrl}\n\nYou can now try logging in.`,
        [{ text: 'OK' }]
      );
    } else {
      console.log('💥 ALL CONNECTION ATTEMPTS FAILED');
      setConnectionStatus('failed');
      Alert.alert(
        '❌ Connection Failed', 
        `Cannot reach backend server.\n\nTried URLs:\n${urlsToTest.join('\n')}\n\nPlease check:\n1. Backend server is running\n2. Network connectivity\n3. Firewall settings`,
        [{ text: 'OK' }]
      );
    }
    
    setIsLoading(false);
  };

  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    if (connectionStatus === 'success') {
      baseStyle.push(styles.buttonSuccess);
    } else if (connectionStatus === 'failed') {
      baseStyle.push(styles.buttonError);
    }
    return baseStyle;
  };

  const getButtonText = () => {
    if (isLoading) return 'Testing...';
    if (connectionStatus === 'success') return `✅ Connected: ${lastSuccessfulUrl}`;
    if (connectionStatus === 'failed') return '❌ Failed - Tap to Retry';
    return '🔍 Test Connection';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={testConnection}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>{getButtonText()}</Text>
        )}
      </TouchableOpacity>
      
      {connectionStatus === 'success' && (
        <Text style={styles.successText}>
          🎯 Ready to test login!
        </Text>
      )}
      
      {connectionStatus === 'failed' && (
        <Text style={styles.errorText}>
          💡 Make sure backend server is running
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonSuccess: {
    backgroundColor: '#4CAF50',
  },
  buttonError: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  successText: {
    color: '#4CAF50',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ApiTestButton;