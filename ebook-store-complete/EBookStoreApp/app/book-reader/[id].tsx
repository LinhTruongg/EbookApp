import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BookReaderScreen from '../../src/screens/book/BookReader/BookReaderScreen';
import { apiService } from '../../src/services/api';
import { Book } from '../../src/types';
import { COLORS } from '../../src/constants';

export default function BookReader() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const bookId = Array.isArray(id) ? id[0] : id;
        const response = await apiService.getBookById(bookId);
        if (response.success && response.data) {
          setBook(response.data.book);
        }
      } catch (err) {
        setError('Failed to load book details');
        console.error('Error fetching book:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 16, fontSize: 16, color: COLORS.textSecondary }}>Loading book reader...</Text>
      </View>
    );
  }

  if (error || !book) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }}>
        <Text style={{ fontSize: 16, color: COLORS.error, textAlign: 'center' }}>
          {error || 'Book not found'}
        </Text>
      </View>
    );
  }

  return (
    <BookReaderScreen
      route={{ params: { book } }}
    />
  );
}