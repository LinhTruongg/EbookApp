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
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { apiService } from '../../services/api';

const { width } = Dimensions.get('window');

const getChartWidth = () => {
  if (width > 768) {
    return Math.min(width - 120, 600);
  } else {
    return width - 80;
  }
};

interface RevenueData {
  period: string;
  totalRevenue: number;
  totalPurchases: number;
  growthPercentage: number;
  monthlyData: Array<{
    month: string;
    revenue: number;
    purchases: number;
  }>;
  currentMonth: {
    revenue: number;
    purchases: number;
  };
  previousMonth: {
    revenue: number;
    purchases: number;
  };
}

interface RevenueChartProps {
  onDataLoaded?: (data: RevenueData) => void;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ onDataLoaded }) => {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'6months' | '12months' | '24months'>('12months');

  const loadRevenueData = async (period: '6months' | '12months' | '24months' = '12months') => {
    try {
      setLoading(true);
      const response = await apiService.getRevenueStats(period);
      if (response.success) {
        setData(response.data || null);
        onDataLoaded?.(response.data);
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể tải dữ liệu doanh thu');
      }
    } catch (error) {
      console.error('Error loading revenue data:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi tải dữ liệu doanh thu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRevenueData(selectedPeriod);
  }, [selectedPeriod]);

  const formatMonthLabel = (month: string) => {
    const [year, monthNum] = month.split('-');
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return `${monthNames[parseInt(monthNum) - 1]} ${year.slice(-2)}`;
  };

  const formatRevenue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const getChartData = () => {
    if (!data) return null;

    const labels = data.monthlyData.map(item => formatMonthLabel(item.month));
    const datasets = [
      {
        data: data.monthlyData.map(item => item.revenue),
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
        strokeWidth: 3,
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
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Đang tải dữ liệu doanh thu...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không thể tải dữ liệu doanh thu</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadRevenueData(selectedPeriod)}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const chartData = getChartData();
  if (!chartData) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Doanh thu bán sách</Text>
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

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatRevenue(data.totalRevenue)}</Text>
          <Text style={styles.statLabel}>Tổng doanh thu</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, data.growthPercentage >= 0 ? styles.positiveValue : styles.negativeValue]}>
            {data.growthPercentage >= 0 ? '+' : ''}{data.growthPercentage.toFixed(1)}%
          </Text>
          <Text style={styles.statLabel}>Tăng trưởng</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{data.totalPurchases.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Tổng giao dịch</Text>
        </View>
      </View>

      <View style={styles.chartWrapper}>
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
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                style: {
                  borderRadius: 8,
                  marginHorizontal: 8,
                },
                propsForDots: {
                  r: '3',
                  strokeWidth: '2',
                  stroke: '#10B981',
                },
                propsForBackgroundLines: {
                  strokeDasharray: '3,3',
                  stroke: '#E5E7EB',
                },
                formatYLabel: (value) => formatRevenue(parseFloat(value)),
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
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Doanh thu (điểm)</Text>
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
    backgroundColor: '#10B981',
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
    backgroundColor: '#10B981',
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

export default RevenueChart;

