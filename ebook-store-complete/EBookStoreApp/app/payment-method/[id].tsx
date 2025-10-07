import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import PaymentMethodScreen from '../../src/screens/payment/PaymentMethodScreen';
import { apiService } from '../../src/services/api';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../src/constants';
import { Book } from '../../src/types';

export default function PaymentMethod() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const bookId = Array.isArray(id) ? id[0] : id;
        const response = await apiService.getBookById(bookId);
        
        if (response.success && response.data) {
          setBook(response.data.book);
        } else {
          setError('Failed to load book details');
        }
      } catch (err) {
        setError('Error loading book details');
        console.error('Error fetching book details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookDetails();
    }
  }, [id]);

  const navigation = {
    goBack: () => router.back(),
    navigate: (screen: string) => {
      if (screen === 'Tabs') {
        router.push('/(tabs)');
      }
    },
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading payment options...</Text>
      </View>
    );
  }

  if (error || !book) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Book not found'}</Text>
      </View>
    );
  }

  return (
    <PaymentMethodScreen
      route={{ 
        params: { 
          book: {
            id: book.id,
            title: book.title,
            author: book.authors?.[0]?.name || 'Unknown Author',
            price: book.price.toString(),
            originalPrice: book.discountPrice?.toString(),
            coverImage: book.coverImage || ''
          }
        } 
      }}
      navigation={navigation}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: SIZES.font.md,
    color: COLORS.error,
    textAlign: 'center',
  },
});