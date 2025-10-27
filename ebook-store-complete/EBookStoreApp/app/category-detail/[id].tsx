import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import CategoryDetailScreen from '../../src/screens/home/Categories/CategoryDetailScreen';
import { simpleApiService } from '../../src/services/simpleApi';
import { Category } from '../../src/types';
import { COLORS } from '../../src/constants';

export default function CategoryDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCategory = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const categoryId = Array.isArray(id) ? id[0] : id;
        const response = await simpleApiService.getCategoryById(categoryId);
        if (response.success && response.data) {
          setCategory(response.data);
        }
      } catch (err) {
        setError('Failed to load category details');
        console.error('Error fetching category:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  const navigation = {
    navigate: (screen: string, params?: any) => {
      if (screen === 'BookDetail') {
        router.push(`/book-detail/${params.book.id}`);
      }
    },
    goBack: () => {
      router.back();
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 16, fontSize: 16, color: COLORS.textSecondary }}>Loading category details...</Text>
      </View>
    );
  }

  if (error || !category) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }}>
        <Text style={{ fontSize: 16, color: COLORS.error, textAlign: 'center' }}>
          {error || 'Category not found'}
        </Text>
      </View>
    );
  }

  return (
    <CategoryDetailScreen
      route={{ params: { category } }}
      navigation={navigation}
    />
  );
}