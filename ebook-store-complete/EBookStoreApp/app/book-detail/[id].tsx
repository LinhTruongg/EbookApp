import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import BookDetailScreen from '../../src/screens/book/BookDetail/BookDetailScreen';
import { Book } from '../../src/types';
import { COLORS } from '../../src/constants';
import { apiService } from '../../src/services/api';

export default function BookDetail() {
  const { id } = useLocalSearchParams();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [inWishlist, setInWishlist] = useState<boolean>(false);
  const [isOwned, setIsOwned] = useState<boolean>(false);
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
          if ((response.data as any).userInfo) {
            setInWishlist(!!(response.data as any).userInfo.isInWishlist);
            setIsOwned(!!(response.data as any).userInfo.isOwned);
          }
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
        <Text style={{ marginTop: 16, fontSize: 16, color: COLORS.textSecondary }}>Loading book details...</Text>
      </View>
    );
  }

  if (error || !book) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }}>
        <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>{error || 'Book not found'}</Text>
      </View>
    );
  }
  return <BookDetailScreen book={book} initialInWishlist={inWishlist} initialIsUnlocked={isOwned} />;
}