import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SIZES, COMMON_STYLES } from '../../constants';
import { apiService } from '../../services/api';

interface WalletTransaction {
  id: number;
  userId: number;
  type: 'deposit' | 'purchase' | 'refund';
  points: number;
  balanceAfter: number;
  bookId?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export default function TransactionHistoryScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const limit = 20;

  const fetchTransactions = async (pageNum: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await apiService.getWalletTransactions({
        page: pageNum,
        limit,
      });

      if (response?.success && response?.data) {
        const { items, total: totalCount } = response.data;
        
        if (pageNum === 1) {
          setTransactions(items);
        } else {
          setTransactions((prev) => [...prev, ...items]);
        }

        setTotal(totalCount);
        const currentTotal = pageNum === 1 ? items.length : (pageNum - 1) * limit + items.length;
        setHasMore(items.length === limit && currentTotal < totalCount);
      }
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1);
  }, []);

  const handleRefresh = () => {
    setPage(1);
    fetchTransactions(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTransactions(nextPage);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTransactionTypeLabel = (type: string): string => {
    switch (type) {
      case 'deposit':
        return 'Nạp điểm';
      case 'purchase':
        return 'Mua sách';
      case 'refund':
        return 'Hoàn tiền';
      default:
        return type;
    }
  };

  const getTransactionTypeColor = (type: string): string => {
    switch (type) {
      case 'deposit':
        return COLORS.success;
      case 'purchase':
        return COLORS.error;
      case 'refund':
        return COLORS.info;
      default:
        return COLORS.textSecondary;
    }
  };

  const getTransactionIcon = (type: string): string => {
    switch (type) {
      case 'deposit':
        return '➕';
      case 'purchase':
        return '📚';
      case 'refund':
        return '↩️';
      default:
        return '💰';
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lịch sử biến động điểm</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử biến động điểm</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Chưa có giao dịch</Text>
            <Text style={styles.emptyText}>Lịch sử giao dịch của bạn sẽ hiển thị ở đây</Text>
          </View>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Tổng số giao dịch</Text>
              <Text style={styles.summaryValue}>{total}</Text>
            </View>

            {transactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionCard}>
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionIconContainer}>
                    <Text style={styles.transactionIcon}>
                      {getTransactionIcon(transaction.type)}
                    </Text>
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionType}>
                      {getTransactionTypeLabel(transaction.type)}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(transaction.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.transactionAmountContainer}>
                    <Text
                      style={[
                        styles.transactionAmount,
                        { color: getTransactionTypeColor(transaction.type) },
                      ]}
                    >
                      {transaction.points > 0 ? '+' : ''}
                      {formatCurrency(transaction.points)} điểm
                    </Text>
                  </View>
                </View>

                {transaction.description && (
                  <Text style={styles.transactionDescription}>
                    {transaction.description}
                  </Text>
                )}

                <View style={styles.transactionFooter}>
                  <Text style={styles.balanceLabel}>Số dư sau giao dịch:</Text>
                  <Text style={styles.balanceValue}>
                    {formatCurrency(transaction.balanceAfter)} điểm
                  </Text>
                </View>
              </View>
            ))}

            {hasMore && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={handleLoadMore}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.primary} />
                ) : (
                  <Text style={styles.loadMoreText}>Tải thêm</Text>
                )}
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...COMMON_STYLES.shadow,
  },
  backButton: {
    padding: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.md,
  },
  backIcon: {
    fontSize: SIZES.font.xl,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SIZES.spacing.lg,
  },
  emptyTitle: {
    fontSize: SIZES.font.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.spacing.sm,
  },
  emptyText: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius.xl,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
    alignItems: 'center',
    ...COMMON_STYLES.shadowMd,
  },
  summaryLabel: {
    fontSize: SIZES.font.md,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: SIZES.spacing.xs,
  },
  summaryValue: {
    fontSize: SIZES.font.xxxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  transactionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
    ...COMMON_STYLES.shadow,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  transactionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.md,
  },
  transactionIcon: {
    fontSize: SIZES.icon.lg,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
  },
  transactionDate: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
  },
  transactionDescription: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    marginTop: SIZES.spacing.xs,
    marginBottom: SIZES.spacing.sm,
    paddingLeft: 56,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SIZES.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SIZES.spacing.xs,
  },
  balanceLabel: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  balanceValue: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  loadMoreButton: {
    ...COMMON_STYLES.buttonSecondary,
    marginTop: SIZES.spacing.md,
    marginBottom: SIZES.spacing.lg,
  },
  loadMoreText: {
    ...COMMON_STYLES.textButtonSecondary,
  },
});

