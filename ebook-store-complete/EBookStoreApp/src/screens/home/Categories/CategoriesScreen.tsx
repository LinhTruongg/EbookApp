import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import { COLORS, SIZES } from '../../../constants';
import { simpleApiService } from '../../../services/simpleApi';
import { Category } from '../../../types';

// Extended Category interface for UI purposes
interface CategoryWithUI extends Category {
  backgroundColor: string;
}

const CategoriesScreen: React.FC = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryWithUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Predefined colors and icons for categories
  const categoryStyles = [
    { backgroundColor: '#FF8C42'},
    { backgroundColor: '#8B4513'},
    { backgroundColor: '#D2691E'},
    { backgroundColor: '#32CD32'},
    { backgroundColor: '#2F4F4F'},
    { backgroundColor: '#20B2AA'},
    { backgroundColor: '#FFD700'},
    { backgroundColor: '#4169E1'},
    { backgroundColor: '#4B0082'},
    { backgroundColor: '#FF6B6B'},
    { backgroundColor: '#4ECDC4'},
    { backgroundColor: '#45B7D1'},
    { backgroundColor: '#96CEB4'},
    { backgroundColor: '#FFEAA7'},
    { backgroundColor: '#DDA0DD'},
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const response = await simpleApiService.getCategories();
      
      if (response.success && response.data) {
        // Map API categories to UI categories with colors and icons
        const categoriesWithUI: CategoryWithUI[] = response.data.map((category: any, index: number) => ({
          ...category,
          backgroundColor: categoryStyles[index % categoryStyles.length].backgroundColor,
        }));
        setCategories(categoriesWithUI);
      } else {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể tải danh sách thể loại' });
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể tải danh sách thể loại' });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadCategories();
  };

  const renderCategoryItem = ({ item }: { item: CategoryWithUI }) => (
    <TouchableOpacity
      style={[styles.categoryCard, { backgroundColor: item.backgroundColor }]}
      onPress={() => router.push(`/category-detail/${item.id}`)}
    >
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thể loại</Text>
      </View>

      {/* Categories Grid */}
      <View style={styles.categoriesContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải thể loại...</Text>
          </View>
        ) : (
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Không có thể loại nào</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: SIZES.spacing.lg,
    paddingHorizontal: SIZES.spacing.lg,
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: SIZES.font.xxl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  categoriesContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  categoriesList: {
    padding: SIZES.spacing.md,
  },
  categoryCard: {
    flex: 1,
    aspectRatio: 1,
    margin: SIZES.spacing.xs,
    borderRadius: SIZES.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  categoryIcon: {
    fontSize: SIZES.icon.lg,
    marginBottom: SIZES.spacing.sm,
  },
  categoryName: {
    fontSize: SIZES.font.xs,
    fontWeight: '700',
    color: COLORS.textInverse,
    textAlign: 'center',
    lineHeight: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.xxxl,
  },
  emptyText: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.xxxl,
  },
  loadingText: {
    marginTop: SIZES.spacing.md,
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
  },
});

export default CategoriesScreen;
