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
  Modal,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { apiService } from '../../services/api';

const { width } = Dimensions.get('window');

const getChartWidth = (monthsCount: number) => {
  // Tính available width cho container
  const screenPadding = 40;
  const chartGap = 16;
  const containerPadding = 24;
  const chartPadding = 0;
  const availableWidth = (width - screenPadding - chartGap) / 2 - containerPadding - chartPadding;
  
  // Đảm bảo mỗi cột có đủ không gian (ít nhất 60px mỗi cột)
  // Với tối đa 4 tháng, cần ít nhất 240px
  const minWidthPerBar = 60;
  const calculatedWidth = monthsCount * minWidthPerBar;
  
  // Sử dụng width lớn hơn để đảm bảo hiển thị đủ tất cả các cột
  return Math.max(availableWidth, calculatedWidth);
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
  refreshKey?: number;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ onDataLoaded, refreshKey }) => {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const getDefaultDates = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);
    startDate.setDate(1);
    return {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    };
  };

  const getMaxStartDate = (end: Date) => {
    const maxStart = new Date(end);
    maxStart.setMonth(maxStart.getMonth() - 3);
    maxStart.setDate(1);
    return maxStart;
  };

  const getMinEndDate = (start: Date) => {
    const minEnd = new Date(start);
    minEnd.setMonth(minEnd.getMonth() + 3);
    const lastDay = new Date(minEnd.getFullYear(), minEnd.getMonth() + 1, 0);
    return lastDay;
  };

  const [startDate, setStartDate] = useState<string>(getDefaultDates().start);
  const [endDate, setEndDate] = useState<string>(getDefaultDates().end);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  
  const startDateInputRef = React.useRef<HTMLInputElement | null>(null);
  const endDateInputRef = React.useRef<HTMLInputElement | null>(null);
  
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const startInput = document.createElement('input');
      startInput.type = 'date';
      startInput.id = 'start-date-input-hidden';
      startInput.style.position = 'fixed';
      startInput.style.opacity = '0';
      startInput.style.pointerEvents = 'auto';
      startInput.style.width = '1px';
      startInput.style.height = '1px';
      startInput.style.left = '0';
      startInput.style.top = '0';
      startInput.style.zIndex = '-1';
      document.body.appendChild(startInput);
      startDateInputRef.current = startInput;
      
      const endInput = document.createElement('input');
      endInput.type = 'date';
      endInput.id = 'end-date-input-hidden';
      endInput.style.position = 'fixed';
      endInput.style.opacity = '0';
      endInput.style.pointerEvents = 'auto';
      endInput.style.width = '1px';
      endInput.style.height = '1px';
      endInput.style.left = '0';
      endInput.style.top = '0';
      endInput.style.zIndex = '-1';
      document.body.appendChild(endInput);
      endDateInputRef.current = endInput;
      
      return () => {
        if (startInput.parentNode) {
          startInput.parentNode.removeChild(startInput);
        }
        if (endInput.parentNode) {
          endInput.parentNode.removeChild(endInput);
        }
      };
    }
  }, []);

  const loadRevenueData = async (start: string, end: string) => {
    try {
      setLoading(true);
      console.log('📊 Loading revenue data from:', start, 'to', end);
      const response = await apiService.getRevenueStatsByDateRange(start, end);
      console.log('📊 API Response:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data) {
        console.log('📊 Revenue data loaded:', response.data);
        console.log('📊 Monthly data details:', {
          count: response.data.monthlyData?.length || 0,
          firstItem: response.data.monthlyData?.[0],
          lastItem: response.data.monthlyData?.[response.data.monthlyData?.length - 1],
          allItems: response.data.monthlyData,
          totalRevenue: response.data.totalRevenue,
          totalPurchases: response.data.totalPurchases
        });
        setData(response.data);
        onDataLoaded?.(response.data);
      } else {
        console.error('❌ Revenue API error:', response.message);
        Alert.alert('Lỗi', response.message || 'Không thể tải dữ liệu doanh thu');
      }
    } catch (error: any) {
      console.error('❌ Error loading revenue data:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi tải dữ liệu doanh thu');
    } finally {
      setLoading(false);
    }
  };

  const openWebDatePicker = (type: 'start' | 'end') => {
    console.log('📅 Opening web date picker for:', type, 'Platform.OS:', Platform.OS);
    
    if (Platform.OS !== 'web') {
      console.log('⚠️ Not web platform, skipping web date picker');
      return;
    }
    
    if (typeof document === 'undefined') {
      console.error('❌ document is not available');
      return;
    }
    
    const input = type === 'start' ? startDateInputRef.current : endDateInputRef.current;
    
    if (!input) {
      console.error('❌ Input ref is not available');
      return;
    }
    
    try {
      const currentDate = type === 'start' ? new Date(startDate) : new Date(endDate);
      const yyyy = currentDate.getFullYear();
      const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
      const dd = String(currentDate.getDate()).padStart(2, '0');
      input.value = `${yyyy}-${mm}-${dd}`;
      console.log('📅 Current date value:', input.value);

      if (type === 'start') {
        const endDateValue = new Date(endDate);
        const maxStartDate = getMaxStartDate(endDateValue);
        const minYyyy = maxStartDate.getFullYear();
        const minMm = String(maxStartDate.getMonth() + 1).padStart(2, '0');
        const minDd = String(maxStartDate.getDate()).padStart(2, '0');
        input.min = `${minYyyy}-${minMm}-${minDd}`;
        
        const maxDateValue = new Date(endDate);
        const maxYyyy = maxDateValue.getFullYear();
        const maxMm = String(maxDateValue.getMonth() + 1).padStart(2, '0');
        const maxDd = String(maxDateValue.getDate()).padStart(2, '0');
        input.max = `${maxYyyy}-${maxMm}-${maxDd}`;
        console.log('📅 Start date min:', input.min, 'max:', input.max);
      } else {
        const minDateValue = new Date(startDate);
        const minYyyy = minDateValue.getFullYear();
        const minMm = String(minDateValue.getMonth() + 1).padStart(2, '0');
        const minDd = String(minDateValue.getDate()).padStart(2, '0');
        input.min = `${minYyyy}-${minMm}-${minDd}`;
        
        const maxDateValue = new Date();
        const maxYyyy = maxDateValue.getFullYear();
        const maxMm = String(maxDateValue.getMonth() + 1).padStart(2, '0');
        const maxDd = String(maxDateValue.getDate()).padStart(2, '0');
        input.max = `${maxYyyy}-${maxMm}-${maxDd}`;
        console.log('📅 End date min:', input.min, 'max:', input.max);
      }

      input.onchange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        console.log('📅 Date changed:', target.value);
        if (target.value) {
          const selected = new Date(`${target.value}T00:00:00`);
          console.log('📅 Selected date:', selected.toISOString());
          if (type === 'start') {
            const end = new Date(endDate);
            const maxStart = getMaxStartDate(end);
            if (selected < maxStart) {
              Alert.alert('Thông báo', 'Khoảng thời gian tối đa là 3 tháng. Đã tự động điều chỉnh ngày bắt đầu.');
              setStartDate(maxStart.toISOString());
            } else {
            setStartDate(selected.toISOString());
            }
          } else {
            const start = new Date(startDate);
            const maxStart = getMaxStartDate(selected);
            if (start < maxStart) {
              Alert.alert('Thông báo', 'Khoảng thời gian tối đa là 3 tháng. Đã tự động điều chỉnh ngày bắt đầu.');
              setStartDate(maxStart.toISOString());
            }
            setEndDate(selected.toISOString());
          }
        }
      };

      console.log('📅 Attempting to open date picker');
      
      setTimeout(() => {
        if ('showPicker' in input && typeof (input as any).showPicker === 'function') {
          try {
            console.log('📅 Using showPicker() method');
            (input as any).showPicker();
          } catch (showPickerError) {
            console.error('❌ Error using showPicker:', showPickerError);
            triggerInputClick(input);
          }
        } else {
          console.log('📅 Using click() method');
          triggerInputClick(input);
        }
      }, 50);
      
      function triggerInputClick(inputElement: HTMLInputElement) {
        try {
          inputElement.style.pointerEvents = 'auto';
          inputElement.style.zIndex = '9999';
          inputElement.focus();
          
          setTimeout(() => {
            try {
              inputElement.click();
              console.log('📅 Input clicked successfully');
            } catch (clickError) {
              console.error('❌ Error clicking input:', clickError);
              try {
                const clickEvent = new MouseEvent('click', {
                  view: window,
                  bubbles: true,
                  cancelable: true
                });
                inputElement.dispatchEvent(clickEvent);
                console.log('📅 Dispatched click event');
              } catch (dispatchError) {
                console.error('❌ Error dispatching click event:', dispatchError);
                Alert.alert('Lỗi', 'Không thể mở date picker. Vui lòng thử lại.');
              }
            }
            
            setTimeout(() => {
              inputElement.style.pointerEvents = 'auto';
              inputElement.style.zIndex = '-1';
            }, 100);
          }, 10);
        } catch (error) {
          console.error('❌ Error in triggerInputClick:', error);
          Alert.alert('Lỗi', 'Không thể mở date picker. Vui lòng thử lại.');
        }
      }
    } catch (e) {
      console.error('❌ Error opening web date picker:', e);
      Alert.alert('Lỗi', 'Không thể mở date picker. Vui lòng thử lại.');
    }
  };

  const handleStartDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartPicker(false);
    }
    if (event.type === 'set' && selectedDate) {
      const end = new Date(endDate);
      const maxStart = getMaxStartDate(end);
      
      // Ensure start date is not more than 3 months before end date
      let adjustedStart = selectedDate;
      if (selectedDate < maxStart) {
        adjustedStart = maxStart;
        Alert.alert('Thông báo', 'Khoảng thời gian tối đa là 3 tháng. Đã tự động điều chỉnh ngày bắt đầu.');
      }
      
      setStartDate(adjustedStart.toISOString());
      if (Platform.OS === 'ios') {
        setShowStartPicker(false);
      }
    } else if (event.type === 'dismissed') {
      setShowStartPicker(false);
    }
  };

  const handleEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndPicker(false);
    }
    if (event.type === 'set' && selectedDate) {
      const start = new Date(startDate);
      const maxStart = getMaxStartDate(selectedDate);
      
      // If end date makes range > 3 months, adjust start date
      if (start < maxStart) {
        setStartDate(maxStart.toISOString());
        Alert.alert('Thông báo', 'Khoảng thời gian tối đa là 3 tháng. Đã tự động điều chỉnh ngày bắt đầu.');
      }
      
      setEndDate(selectedDate.toISOString());
      if (Platform.OS === 'ios') {
        setShowEndPicker(false);
      }
    } else if (event.type === 'dismissed') {
      setShowEndPicker(false);
    }
  };

  const handleApplyDateRange = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      Alert.alert('Lỗi', 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
      return;
    }
    
    if (end > new Date()) {
      Alert.alert('Lỗi', 'Ngày kết thúc không được lớn hơn ngày hiện tại');
      return;
    }

    // Check if range is more than 3 months
    const maxStart = getMaxStartDate(end);
    if (start < maxStart) {
      Alert.alert('Lỗi', 'Khoảng thời gian tối đa là 3 tháng. Vui lòng chọn lại.');
      return;
    }

    loadRevenueData(startDate, endDate);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    loadRevenueData(startDate, endDate);
  }, [refreshKey]);

  const formatMonthLabel = (month: string, index: number, allMonths: string[]) => {
    if (!month || typeof month !== 'string') {
      return month || '';
    }
    const parts = month.split('-');
    if (parts.length < 2) {
      return month;
    }
    const [year, monthNum] = parts;
    const monthIndex = parseInt(monthNum, 10) - 1;
    if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
      return month;
    }
    const monthNames = [
      'T1', 'T2', 'T3', 'T4', 'T5', 'T6',
      'T7', 'T8', 'T9', 'T10', 'T11', 'T12'
    ];
    
    const shortYear = year.slice(-2);
    const monthName = monthNames[monthIndex];
    
    if (index === 0) {
      return `${monthName}\n'${shortYear}`;
    }
    
    const prevMonth = allMonths[index - 1];
    if (prevMonth) {
      const prevParts = prevMonth.split('-');
      const prevYear = prevParts[0];
      
      if (year !== prevYear) {
        return `${monthName}\n'${shortYear}`;
      }
    }
    
    if (monthIndex === 0) {
      return `${monthName}\n'${shortYear}`;
    }
    
    if (monthIndex === 6) {
      return `${monthName}\n'${shortYear}`;
    }
    
    return monthName;
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
    if (!data || !data.monthlyData || data.monthlyData.length === 0) {
      console.warn('⚠️ No revenue data available for chart');
      return null;
    }

    try {
      console.log('📊 Raw monthlyData:', JSON.stringify(data.monthlyData, null, 2));
      
      const allMonths = data.monthlyData.map(item => item.month).filter(Boolean);
      
      const chartDataPairs = data.monthlyData
        .map((item, index) => {
          if (!item.month) {
            return null;
          }
          
          let label = '';
          try {
            label = formatMonthLabel(item.month, index, allMonths);
          } catch (e) {
            label = item.month;
          }
          
          if (!label || label.trim() === '') {
            return null;
          }
          
        let value = 0;
          const rawRevenue = item.revenue;
          
          if (rawRevenue === null || rawRevenue === undefined) {
            value = 0;
          } else if (typeof rawRevenue === 'number') {
            value = rawRevenue;
          } else if (typeof rawRevenue === 'string') {
            const cleaned = String(rawRevenue).replace(/[,\s]/g, '');
            value = parseFloat(cleaned);
            if (isNaN(value)) {
              value = 0;
            }
          } else {
            value = Number(rawRevenue);
          if (isNaN(value)) {
            value = 0;
          }
        }
          
        const finalValue = Math.max(0, value);
          
          return { label, value: finalValue };
        })
        .filter((pair): pair is { label: string; value: number } => {
          return pair !== null;
        });

      const labels = chartDataPairs.map(pair => pair.label);
      const revenueValues = chartDataPairs.map(pair => pair.value);
      
      console.log('📊 Chart data (only months with data):', {
        monthsWithData: labels.length,
        totalMonths: data.monthlyData.length,
        labels: labels,
        revenue: revenueValues,
        maxRevenue: revenueValues.length > 0 ? Math.max(...revenueValues) : 0,
        minRevenue: revenueValues.length > 0 ? Math.min(...revenueValues) : 0,
        rawMonthlyData: data.monthlyData,
        totalRevenue: data.totalRevenue,
        totalPurchases: data.totalPurchases
      });

      if (labels.length === 0) {
        console.warn('⚠️ Empty chart data after processing');
        return null;
      }

      if (labels.length !== revenueValues.length) {
        console.warn('⚠️ Labels and revenue values length mismatch:', {
          labelsLength: labels.length,
          revenueValuesLength: revenueValues.length
        });
        return null;
      }

      const maxValue = revenueValues.length > 0 ? Math.max(...revenueValues) : 0;
      const minValue = revenueValues.length > 0 ? Math.min(...revenueValues) : 0;
      
      console.log('📊 Final chart data:', {
        labelsCount: labels.length,
        revenueValuesCount: revenueValues.length,
        maxValue,
        minValue,
        hasData: maxValue > 0 || minValue > 0,
        labels: labels.slice(0, 5),
        values: revenueValues.slice(0, 5)
      });

      if (revenueValues.some(v => typeof v !== 'number' || isNaN(v))) {
        console.error('❌ Invalid values in revenueValues:', revenueValues);
        return null;
      }

      const datasets = [
        {
          data: revenueValues,
          color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
          strokeWidth: 3,
        }
      ];

      const chartDataResult = {
        labels,
        datasets,
      };
      
      console.log('📊 Chart data result:', JSON.stringify(chartDataResult, null, 2));

      return chartDataResult;
    } catch (error) {
      console.error('❌ Error processing chart data:', error);
      return null;
    }
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
        <TouchableOpacity style={styles.retryButton} onPress={() => loadRevenueData(startDate, endDate)}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const chartData = getChartData();
  if (!chartData) {
    console.warn('⚠️ Chart data is null, showing error message');
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Doanh thu bán sách</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không có dữ liệu để hiển thị biểu đồ</Text>
          {data && data.monthlyData && data.monthlyData.length > 0 && (
            <Text style={[styles.errorText, { fontSize: 12, marginTop: 8 }]}>
              Dữ liệu có {data.monthlyData.length} tháng nhưng không thể xử lý
            </Text>
          )}
        </View>
      </View>
    );
  }

  const getXLabelInterval = () => {
    const monthsCount = chartData.labels.length;
    if (monthsCount <= 6) return 1;
    if (monthsCount <= 12) return 1;
    if (monthsCount <= 24) return 2;
    return 3;
  };

  const chartWidth = getChartWidth(chartData.labels.length);
  const xLabelInterval = getXLabelInterval();
  
  console.log('📊 Rendering chart with data:', {
    labelsCount: chartData.labels.length,
    datasetsCount: chartData.datasets.length,
    firstDatasetDataCount: chartData.datasets[0]?.data?.length || 0,
    chartWidth,
    xLabelInterval,
    sampleLabels: chartData.labels.slice(0, 3),
    sampleData: chartData.datasets[0]?.data?.slice(0, 3)
  });

  const maxDate = new Date();
  const getMinStartDate = () => {
    const end = new Date(endDate);
    return getMaxStartDate(end);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Doanh thu bán sách</Text>
      </View>

      <View style={styles.dateRangeContainer}>
        <View style={styles.datePickerRow}>
          <View style={styles.dateFieldWrapper}>
            <Text style={styles.dateLabel}>Từ ngày</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => {
                console.log('📅 Start date button pressed, Platform.OS:', Platform.OS);
                if (Platform.OS === 'web') {
                  console.log('📅 Calling openWebDatePicker for start');
                  openWebDatePicker('start');
                } else {
                  setShowStartPicker(true);
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.dateButtonText}>{formatDate(startDate)}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateFieldWrapper}>
            <Text style={styles.dateLabel}>Đến ngày</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => {
                console.log('📅 End date button pressed, Platform.OS:', Platform.OS);
                if (Platform.OS === 'web') {
                  console.log('📅 Calling openWebDatePicker for end');
                  openWebDatePicker('end');
                } else {
                  setShowEndPicker(true);
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.dateButtonText}>{formatDate(endDate)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.applyButton} onPress={handleApplyDateRange}>
          <Text style={styles.applyButtonText}>Áp dụng</Text>
        </TouchableOpacity>

        {showStartPicker && Platform.OS === 'ios' && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showStartPicker}
            onRequestClose={() => setShowStartPicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Chọn ngày bắt đầu</Text>
                  <TouchableOpacity
                    onPress={() => setShowStartPicker(false)}
                    style={styles.closeButton}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={new Date(startDate)}
                  mode="date"
                  display="spinner"
                  onChange={handleStartDateChange}
                  maximumDate={new Date(endDate)}
                  minimumDate={getMinStartDate()}
                  style={styles.datePickerModal}
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => setShowStartPicker(false)}
                  >
                    <Text style={styles.confirmButtonText}>Xác nhận</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {showStartPicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={new Date(startDate)}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
            maximumDate={new Date(endDate)}
            minimumDate={getMinStartDate()}
          />
        )}

        {showEndPicker && Platform.OS === 'ios' && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showEndPicker}
            onRequestClose={() => setShowEndPicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Chọn ngày kết thúc</Text>
                  <TouchableOpacity
                    onPress={() => setShowEndPicker(false)}
                    style={styles.closeButton}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={new Date(endDate)}
                  mode="date"
                  display="spinner"
                  onChange={handleEndDateChange}
                  maximumDate={maxDate}
                  minimumDate={new Date(startDate)}
                  style={styles.datePickerModal}
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => setShowEndPicker(false)}
                  >
                    <Text style={styles.confirmButtonText}>Xác nhận</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {showEndPicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={new Date(endDate)}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
            maximumDate={maxDate}
            minimumDate={new Date(startDate)}
          />
        )}
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
          <View style={styles.chartContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 0 }}
            style={{ width: '100%' }}
          >
          <BarChart
              data={chartData}
              width={getChartWidth(chartData.labels.length)}
              height={220}
              fromZero={true}
              yAxisLabel=""
              yAxisSuffix=""
              segments={4}
              chartConfig={{
                backgroundColor: '#FFFFFF',
                backgroundGradientFrom: '#FFFFFF',
                backgroundGradientTo: '#FFFFFF',
                decimalPlaces: 0,
                color: (opacity = 1) => {
                  const baseColor = { r: 16, g: 185, b: 129 };
                  return `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${opacity})`;
                },
                labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                fillShadowGradient: '#10B981',
                fillShadowGradientOpacity: 0.8,
                style: {
                  borderRadius: 8,
                },
                propsForBackgroundLines: {
                  strokeDasharray: '3,3',
                  stroke: '#E5E7EB',
                  strokeWidth: 1,
                },
                propsForLabels: {
                fontSize: 10,
                  fontWeight: '600',
                },
                formatYLabel: (value) => formatRevenue(parseFloat(value)),
                barPercentage: 0.85,
                barRadius: 4,
              }}
              style={styles.chart}
            showValuesOnTopOfBars={true}
              withInnerLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              verticalLabelRotation={0}
            />
          </ScrollView>
          </View>
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
    padding: 12,
    maxWidth: '100%',
    alignSelf: 'center',
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
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  dateRangeContainer: {
    marginBottom: 16,
  },
  datePickerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  dateFieldWrapper: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  applyButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  datePickerModal: {
    width: '100%',
    height: 200,
  },
  modalActions: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  confirmButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
    overflow: 'visible',
  },
  chartScrollContainer: {
    paddingHorizontal: 8,
  },
  chartContainer: {
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  chart: {
    borderRadius: 8,
    marginVertical: 8,
  },
  scrollHint: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 8,
    fontStyle: 'italic',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    flexWrap: 'wrap',
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
