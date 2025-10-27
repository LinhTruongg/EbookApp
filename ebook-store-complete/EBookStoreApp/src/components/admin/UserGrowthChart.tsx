import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { apiService } from '../../services/api';

const { width } = Dimensions.get('window');

// Calculate responsive chart width
const getChartWidth = () => {
  if (width > 768) {
    // Desktop/tablet - full width layout
    return Math.min(width - 120, 600);
  } else {
    // Mobile - full width
    return width - 80;
  }
};

interface UserGrowthData {
  period: string;
  totalUsers: number;
  growthPercentage: number;
  monthlyData: Array<{
    month: string;
    newUsers: number;
    totalUsers: number;
  }>;
  currentMonth: {
    newUsers: number;
    totalUsers: number;
  };
  previousMonth: {
    newUsers: number;
    totalUsers: number;
  };
}

interface UserGrowthChartProps {
  onDataLoaded?: (data: UserGrowthData) => void;
}

const UserGrowthChart: React.FC<UserGrowthChartProps> = ({ onDataLoaded }) => {
  const [data, setData] = useState<UserGrowthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'6months' | '12months' | '24months'>('12months');

  const loadUserGrowthData = async (period: '6months' | '12months' | '24months' = '12months') => {
    try {
      setLoading(true);
      const response = await apiService.getUserGrowthStats(period);
      if (response.success) {
        setData(response.data);
        onDataLoaded?.(response.data);
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể tải dữ liệu tăng trưởng người dùng');
      }
    } catch (error) {
      console.error('Error loading user growth data:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi tải dữ liệu tăng trưởng người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserGrowthData(selectedPeriod);
  }, [selectedPeriod]);

  const formatMonthLabel = (month: string) => {
    const [year, monthNum] = month.split('-');
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return `${monthNames[parseInt(monthNum) - 1]} ${year.slice(-2)}`;
  };

  const getChartData = () => {
    if (!data) return null;

    const labels = data.monthlyData.map(item => formatMonthLabel(item.month));
    const datasets = [
      {
        data: data.monthlyData.map(item => item.totalUsers),
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue color
        strokeWidth: 3,
      },
      {
        data: data.monthlyData.map(item => item.newUsers),
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green color
        strokeWidth: 2,
      }
    ];

    return {
      labels,
      datasets,
    };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Đang tải dữ liệu tăng trưởng...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không thể tải dữ liệu tăng trưởng</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadUserGrowthData(selectedPeriod)}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const chartData = getChartData();
  if (!chartData) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tăng trưởng người dùng</Text>
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === '6months' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('6months')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === '6months' && styles.periodButtonTextActive]}>
              6 tháng
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === '12months' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('12months')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === '12months' && styles.periodButtonTextActive]}>
              12 tháng
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === '24months' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('24months')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === '24months' && styles.periodButtonTextActive]}>
              24 tháng
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{data.totalUsers.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Tổng người dùng</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, data.growthPercentage >= 0 ? styles.positiveValue : styles.negativeValue]}>
            {data.growthPercentage >= 0 ? '+' : ''}{data.growthPercentage.toFixed(1)}%
          </Text>
          <Text style={styles.statLabel}>Tăng trưởng</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{data.currentMonth.newUsers}</Text>
          <Text style={styles.statLabel}>Tháng này</Text>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        {Platform.OS === 'web' ? (
          <View style={styles.webChartContainer}>
            <Text style={styles.webChartText}>📊 Biểu đồ tăng trưởng</Text>
            <Text style={styles.webChartSubtext}>
              Tổng: {data.totalUsers.toLocaleString()} người dùng
            </Text>
            <Text style={styles.webChartSubtext}>
              Tăng trưởng: {data.growthPercentage >= 0 ? '+' : ''}{data.growthPercentage.toFixed(1)}%
            </Text>
          </View>
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chartScrollContainer}
          >
            <View style={styles.chartContainer}>
              <LineChart
                data={chartData}
                width={getChartWidth()}
                height={160}
                chartConfig={{
                  backgroundColor: '#F8FAFC',
                  backgroundGradientFrom: '#F8FAFC',
                  backgroundGradientTo: '#F8FAFC',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                  style: {
                    borderRadius: 8,
                    marginHorizontal: 8,
                  },
                  propsForDots: {
                    r: '3',
                    strokeWidth: '2',
                    stroke: '#3B82F6',
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: '3,3',
                    stroke: '#E5E7EB',
                  },
                  paddingLeft: 16,
                  paddingRight: 16,
                  paddingTop: 16,
                  paddingBottom: 16,
                }}
                bezier
                style={styles.chart}
              />
            </View>
          </ScrollView>
        )}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>Tổng người dùng</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Người dùng mới</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: '#3B82F6',
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  positiveValue: {
    color: '#10B981',
  },
  negativeValue: {
    color: '#EF4444',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  chartWrapper: {
    marginBottom: 16,
  },
  chartScrollContainer: {
    alignItems: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
  },
  chart: {
    borderRadius: 8,
    marginHorizontal: 8,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#64748B',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
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
  webChartContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
  webChartText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  webChartSubtext: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
});

export default UserGrowthChart;
