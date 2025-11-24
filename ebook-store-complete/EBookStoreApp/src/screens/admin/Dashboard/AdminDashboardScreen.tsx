import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { apiService } from '../../../services/api';
import UserGrowthChart from '../../../components/admin/UserGrowthChart';
import RevenueChart from '../../../components/admin/RevenueChart';
import ExportExcel from '../../../components/admin/ExportExcel';

interface AdminDashboardScreenProps {
  navigation?: any;
}

const { width } = Dimensions.get('window');

const DashboardContent = ({ user }: { user: any }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [userGrowthData, setUserGrowthData] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDashboardStats();
      if (response.success) {
        setStats(response.data);
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể tải thống kê dashboard');
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi tải thống kê dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivities = async () => {
    try {
      console.log('🔄 Loading recent activities...');
      const response = await apiService.getRecentActivities(20);
      console.log('📋 Activities response:', response);
      if (response.success) {
        console.log('✅ Activities loaded:', response.data?.length || 0, 'items');
        setActivities(response.data || []);
      } else {
        console.warn('⚠️ Activities response not successful:', response.message);
        setActivities([]);
      }
    } catch (error: any) {
      console.error('❌ Error loading recent activities:', error);
      console.error('Error details:', error.response?.data || error.message);
      setActivities([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshKey(prev => prev + 1);
    await Promise.all([loadDashboardStats(), loadRecentActivities()]);
    setRefreshing(false);
  };

  useEffect(() => {
    loadDashboardStats();
    loadRecentActivities();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Đang tải thống kê...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không thể tải dữ liệu thống kê</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadDashboardStats}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statsCards = [
    { 
      title: 'Tổng số sách', 
      value: stats.overview.totalBooks.toLocaleString(), 
      trend: `+${stats.growth.newBooksLast30Days}`, 
      icon: '📚', 
      color: '#3B82F6' 
    },
    { 
      title: 'Tổng người dùng', 
      value: stats.overview.totalUsers.toLocaleString(), 
      trend: `+${stats.growth.newUsersLast30Days}`, 
      icon: '👥', 
      color: '#10B981' 
    },
    { 
      title: 'Danh mục', 
      value: stats.overview.totalCategories.toLocaleString(), 
      trend: '', 
      icon: '📂', 
      color: '#F59E0B' 
    },
    { 
      title: 'Tác giả', 
      value: stats.overview.totalAuthors.toLocaleString(), 
      trend: '', 
      icon: '✍️', 
      color: '#8B5CF6' 
    },
  ];


  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const getActivityIcon = (entityType: string, action: string) => {
    const icons: any = {
      book: { create: '📚', update: '📝', delete: '🗑️' },
      category: { create: '📂', update: '✏️', delete: '🗑️' },
      author: { create: '✍️', update: '✏️', delete: '🗑️' },
      user: { create: '👤', update: '✏️', delete: '🗑️' },
      comment: { create: '💬', update: '✏️', delete: '🗑️' },
      review: { create: '⭐', update: '✏️', delete: '🗑️' }
    };
    return icons[entityType]?.[action] || '📋';
  };

  const getActivityColor = (action: string) => {
    const colors: any = {
      create: '#10B981',
      update: '#3B82F6',
      delete: '#EF4444'
    };
    return colors[action] || '#6B7280';
  };

  return (
    <ScrollView 
      style={styles.dashboardContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >

      {/* Main Stats Grid - 2x2 Layout */}
      <View style={styles.statsContainer}>
        {/* Left Column - 2 items */}
        <View style={styles.statsLeftColumn}>
          {statsCards.slice(0, 2).map((card, index) => (
            <View key={index} style={styles.statCard}>
              <View style={styles.statCardContent}>
                <View style={styles.statCardLeft}>
                  <View style={[styles.statIcon, { backgroundColor: card.color }]}>
                    <Text style={styles.statIconText}>{card.icon}</Text>
                  </View>
                  <View style={styles.statCardInfo}>
                    <Text style={styles.statValue}>{card.value}</Text>
                    <Text style={styles.statTitle}>{card.title}</Text>
                  </View>
                </View>
                {card.trend && (
                  <View style={[
                    styles.trendBadge,
                    card.trend.startsWith('+') ? styles.positiveTrend : styles.negativeTrend
                  ]}>
                    <Text style={styles.trendText}>{card.trend}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Right Column - 2 items */}
        <View style={styles.statsRightColumn}>
          {statsCards.slice(2, 4).map((card, index) => (
            <View key={index + 2} style={styles.statCard}>
              <View style={styles.statCardContent}>
                <View style={styles.statCardLeft}>
                  <View style={[styles.statIcon, { backgroundColor: card.color }]}>
                    <Text style={styles.statIconText}>{card.icon}</Text>
                  </View>
                  <View style={styles.statCardInfo}>
                    <Text style={styles.statValue}>{card.value}</Text>
                    <Text style={styles.statTitle}>{card.title}</Text>
                  </View>
                </View>
                {card.trend && (
                  <View style={[
                    styles.trendBadge,
                    card.trend.startsWith('+') ? styles.positiveTrend : styles.negativeTrend
                  ]}>
                    <Text style={styles.trendText}>{card.trend}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Export Buttons */}
      <View style={styles.exportSection}>
        <View style={styles.exportButtonsRow}>
          <ExportExcel
            revenueData={revenueData}
            userGrowthData={null}
            dashboardStats={null}
            fileName="Dashboard_Report"
            exportType="revenue"
            buttonText="📊 Xuất Doanh Thu"
          />
          <ExportExcel
            revenueData={null}
            userGrowthData={userGrowthData}
            dashboardStats={null}
            fileName="Dashboard_Report"
            exportType="userGrowth"
            buttonText="📈 Xuất Tăng Trưởng"
          />
          <ExportExcel
            revenueData={revenueData}
            userGrowthData={userGrowthData}
            dashboardStats={stats}
            fileName="Dashboard_Report"
            exportType="all"
            buttonText="📋 Xuất Tất Cả"
          />
        </View>
      </View>

      {/* Charts Section - Side by Side */}
      <View style={styles.chartsRow}>
        <View style={styles.chartWrapper}>
          <UserGrowthChart onDataLoaded={setUserGrowthData} refreshKey={refreshKey} />
        </View>
        <View style={styles.chartWrapper}>
          <RevenueChart onDataLoaded={setRevenueData} refreshKey={refreshKey} />
        </View>
      </View>

      {/* Recent Activity - Bottom Section */}
      <View style={styles.recentActivitySection}>
        <View style={styles.compactRecentActivity}>
          <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
          <View style={styles.compactActivityList}>
            {activities.length > 0 ? (
              activities.slice(0, 10).map((activity) => (
                <View key={activity.id} style={styles.compactActivityItem}>
                  <View style={[
                    styles.compactActivityIcon,
                    { backgroundColor: `${getActivityColor(activity.action)}15` }
                  ]}>
                    <Text style={styles.compactActivityIconText}>
                      {getActivityIcon(activity.entityType, activity.action)}
                    </Text>
                  </View>
                  <View style={styles.compactActivityContent}>
                    <View style={styles.compactActivityHeader}>
                      <Text style={styles.compactActivityTitle} numberOfLines={1}>
                        {activity.description}
                      </Text>
                      <View style={[
                        styles.actionBadge,
                        { backgroundColor: getActivityColor(activity.action) }
                      ]}>
                        <Text style={styles.actionBadgeText}>
                          {activity.actionLabel}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.compactActivityDescription} numberOfLines={1}>
                      {activity.admin.name} • {activity.entityLabel}
                    </Text>
                    <Text style={styles.compactActivityTime}>
                      {formatTimeAgo(activity.createdAt)}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyActivity}>
                <Text style={styles.emptyActivityText}>Chưa có hoạt động nào</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const { user } = useAuth();

  return (
    <DashboardContent user={user} />
  );
};

const styles = StyleSheet.create({
  dashboardContent: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#F8FAFC',
  },
  statsContainer: {
    flexDirection: width > 768 ? 'row' : 'column',
    marginBottom: 24,
    gap: 16,
  },
  statsLeftColumn: {
    flex: 1,
    gap: 16,
  },
  statsRightColumn: {
    flex: 1,
    gap: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statIconText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  statCardInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  exportSection: {
    marginBottom: 16,
  },
  exportButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  chartsRow: {
    flexDirection: width > 768 ? 'row' : 'column',
    gap: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  chartWrapper: {
    flex: width > 768 ? 1 : undefined,
  },
  chartSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  recentActivitySection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  compactRecentActivity: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  compactActivityList: {
    gap: 8,
  },
  compactActivityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  compactActivityIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  compactActivityIconText: {
    fontSize: 12,
  },
  compactActivityContent: {
    flex: 1,
  },
  compactActivityTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  compactActivityDescription: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 2,
  },
  compactActivityTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  compactActivityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  actionBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyActivity: {
    padding: 20,
    alignItems: 'center',
  },
  emptyActivityText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  positiveTrend: {
    backgroundColor: '#DCFCE7',
  },
  negativeTrend: {
    backgroundColor: '#FEE2E2',
  },
  quickActions: {
    marginBottom: 24,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    minWidth: (width - 72) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  recentActivity: {
    flex: 1,
  },
  recentActivityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  activityItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminDashboardScreen;