import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';

interface AdminDashboardScreenProps {
  navigation?: any;
}

const { width } = Dimensions.get('window');

const DashboardContent = ({ user }: { user: any }) => {
  const statsCards = [
    { title: 'Tổng doanh thu', value: '7,455', trend: '+12%', icon: '🛒', color: '#8B5CF6' },
    { title: 'Sách mới', value: '946', trend: '-0.5%', icon: '📖', color: '#F59E0B' },
    { title: 'Người dùng', value: '7,459', trend: '', icon: '👥', color: '#10B981' },
    { title: 'Đơn hàng', value: '5,166', trend: '+1.5%', icon: '📦', color: '#EF4444' },
  ];

  const quickActions = [
    { title: 'Thêm sách', icon: '📚', action: 'add-book' },
    { title: 'Quản lý người dùng', icon: '👥', action: 'manage-users' },
    { title: 'Thêm chủ đề', icon: '📂', action: 'add-category' },
    { title: 'Xem báo cáo', icon: '📊', action: 'view-reports' },
  ];

  const recentActivities = [
    { title: 'Sách mới được thêm', description: 'Harry Potter và Hòn đá Phù thủy', time: '2 giờ trước', icon: '📚' },
    { title: 'Người dùng mới đăng ký', description: 'Nguyễn Văn A đã tạo tài khoản', time: '4 giờ trước', icon: '👤' },
    { title: 'Đơn hàng mới', description: 'Đơn hàng #1234 - 250,000 VNĐ', time: '6 giờ trước', icon: '🛒' },
    { title: 'Đánh giá mới', description: '5 sao cho cuốn "Dế Mèn Phiêu Lưu Ký"', time: '8 giờ trước', icon: '⭐' },
  ];

  return (
    <ScrollView style={styles.dashboardContent}>
      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        {statsCards.map((card, index) => (
          <View key={index} style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <View style={[styles.statIcon, { backgroundColor: card.color }]}>
                <Text style={styles.statIconText}>{card.icon}</Text>
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
            <Text style={styles.statValue}>{card.value}</Text>
            <Text style={styles.statTitle}>{card.title}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.quickActionsTitle}>Thao tác nhanh</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity key={index} style={styles.quickActionButton}>
              <Text style={styles.quickActionIcon}>{action.icon}</Text>
              <Text style={styles.quickActionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.recentActivity}>
        <Text style={styles.recentActivityTitle}>Hoạt động gần đây</Text>
        {recentActivities.map((activity, index) => (
          <View key={index} style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Text style={styles.activityIconText}>{activity.icon}</Text>
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityDescription}>{activity.description}</Text>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
          </View>
        ))}
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
    padding: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 16,
  },
  statCard: {
    width: (width - 72) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIconText: {
    fontSize: 20,
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  positiveTrend: {
    backgroundColor: '#DCFCE7',
  },
  negativeTrend: {
    backgroundColor: '#FEE2E2',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
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
});

export default AdminDashboardScreen;