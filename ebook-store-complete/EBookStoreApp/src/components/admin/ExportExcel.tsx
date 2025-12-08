import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';

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

interface DashboardStats {
  overview: {
    totalBooks: number;
    totalUsers: number;
    totalCategories: number;
    totalComments: number;
    totalReviews: number;
    totalReadingSessions: number;
  };
  growth: {
    newBooksLast30Days: number;
    newUsersLast30Days: number;
  };
}

type ExportType = 'revenue' | 'userGrowth' | 'all';

interface ExportExcelProps {
  revenueData?: RevenueData | null;
  userGrowthData?: UserGrowthData | null;
  dashboardStats?: DashboardStats | null;
  fileName?: string;
  exportType?: ExportType;
  buttonText?: string;
  isPrimary?: boolean;
}

const ExportExcel: React.FC<ExportExcelProps> = ({
  revenueData,
  userGrowthData,
  dashboardStats,
  fileName = 'Dashboard_Report',
  exportType = 'all',
  buttonText,
  isPrimary = false
}) => {
  const formatMonthLabel = (month: string) => {
    const [year, monthNum] = month.split('-');
    const monthNames = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
  };

  const exportToExcel = async () => {
    try {
      const workbook = XLSX.utils.book_new();

      const shouldIncludeStats = exportType === 'all';
      const shouldIncludeRevenue = exportType === 'revenue' || exportType === 'all';
      const shouldIncludeUserGrowth = exportType === 'userGrowth' || exportType === 'all';

      if (dashboardStats && shouldIncludeStats) {
        const statsData = [
          ['Tổng quan Dashboard'],
          [],
          ['Chỉ số', 'Giá trị'],
          ['Tổng số sách', dashboardStats.overview.totalBooks],
          ['Tổng người dùng', dashboardStats.overview.totalUsers],
          ['Tổng danh mục', dashboardStats.overview.totalCategories],
          ['Tổng bình luận', dashboardStats.overview.totalComments],
          ['Tổng đánh giá', dashboardStats.overview.totalReviews],
          ['Tổng phiên đọc', dashboardStats.overview.totalReadingSessions],
          [],
          ['Tăng trưởng 30 ngày qua'],
          ['Sách mới', dashboardStats.growth.newBooksLast30Days],
          ['Người dùng mới', dashboardStats.growth.newUsersLast30Days],
        ];

        const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
        const statsColWidths = [
          { wch: 25 },
          { wch: 15 }
        ];
        statsSheet['!cols'] = statsColWidths;
        XLSX.utils.book_append_sheet(workbook, statsSheet, 'Tổng quan');
      }

      if (revenueData && shouldIncludeRevenue) {
        const revenueSheetData = [
          ['Doanh thu bán sách'],
          [],
          ['Tổng doanh thu', revenueData.totalRevenue],
          ['Tổng giao dịch', revenueData.totalPurchases],
          ['Tăng trưởng (%)', `${revenueData.growthPercentage >= 0 ? '+' : ''}${revenueData.growthPercentage.toFixed(2)}%`],
          [],
          ['Tháng hiện tại'],
          ['Doanh thu', revenueData.currentMonth.revenue],
          ['Giao dịch', revenueData.currentMonth.purchases],
          [],
          ['Tháng trước'],
          ['Doanh thu', revenueData.previousMonth.revenue],
          ['Giao dịch', revenueData.previousMonth.purchases],
          [],
          ['Dữ liệu theo tháng'],
          ['Tháng', 'Doanh thu', 'Số giao dịch'],
        ];

        revenueData.monthlyData.forEach(item => {
          revenueSheetData.push([
            formatMonthLabel(item.month),
            item.revenue,
            item.purchases
          ]);
        });

        const revenueSheet = XLSX.utils.aoa_to_sheet(revenueSheetData);
        const revenueColWidths = [
          { wch: Math.max(20, ...revenueData.monthlyData.map(item => formatMonthLabel(item.month).length)) },
          { wch: 15 },
          { wch: 15 }
        ];
        revenueSheet['!cols'] = revenueColWidths;
        XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Doanh thu');
      }

      if (userGrowthData && shouldIncludeUserGrowth) {
        const userGrowthSheetData = [
          ['Tăng trưởng người dùng'],
          [],
          ['Tổng người dùng', userGrowthData.totalUsers],
          ['Tăng trưởng (%)', `${userGrowthData.growthPercentage >= 0 ? '+' : ''}${userGrowthData.growthPercentage.toFixed(2)}%`],
          [],
          ['Tháng hiện tại'],
          ['Người dùng mới', userGrowthData.currentMonth.newUsers],
          ['Tổng người dùng', userGrowthData.currentMonth.totalUsers],
          [],
          ['Tháng trước'],
          ['Người dùng mới', userGrowthData.previousMonth.newUsers],
          ['Tổng người dùng', userGrowthData.previousMonth.totalUsers],
          [],
          ['Dữ liệu theo tháng'],
          ['Tháng', 'Người dùng mới', 'Tổng người dùng'],
        ];

        userGrowthData.monthlyData.forEach(item => {
          userGrowthSheetData.push([
            formatMonthLabel(item.month),
            item.newUsers,
            item.totalUsers
          ]);
        });

        const userGrowthSheet = XLSX.utils.aoa_to_sheet(userGrowthSheetData);
        const userGrowthColWidths = [
          { wch: Math.max(20, ...userGrowthData.monthlyData.map(item => formatMonthLabel(item.month).length)) },
          { wch: 18 },
          { wch: 18 }
        ];
        userGrowthSheet['!cols'] = userGrowthColWidths;
        XLSX.utils.book_append_sheet(workbook, userGrowthSheet, 'Tăng trưởng');
      }

      const fileDate = new Date().toISOString().split('T')[0];
      let fileSuffix = '';
      if (exportType === 'revenue') fileSuffix = '_DoanhThu';
      else if (exportType === 'userGrowth') fileSuffix = '_TangTruong';
      const fullFileName = `${fileName}${fileSuffix}_${fileDate}.xlsx`;

      if (Platform.OS === 'web') {
        const wbout = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fullFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        Alert.alert('Thành công', 'File Excel đã được tải xuống');
      } else {
        const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
        const documentDir = (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory || '';
        const uri = documentDir + fullFileName;

        await FileSystem.writeAsStringAsync(uri, wbout, {
          encoding: 'base64' as any,
        });

        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            dialogTitle: 'Xuất báo cáo Excel',
          });
          Alert.alert('Thành công', 'File Excel đã được tạo và sẵn sàng để chia sẻ');
        } else {
          Alert.alert('Thành công', `File Excel đã được lưu tại: ${uri}`);
        }
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      Alert.alert('Lỗi', 'Không thể xuất file Excel. Vui lòng thử lại.');
    }
  };

  const getButtonText = () => {
    if (buttonText) return buttonText;
    if (exportType === 'revenue') return 'Xuất Doanh Thu';
    if (exportType === 'userGrowth') return 'Xuất Tăng Trưởng';
    return 'Xuất Tất Cả';
  };

  return (
    <TouchableOpacity 
      style={[styles.exportButton, isPrimary && styles.primaryButton]} 
      onPress={exportToExcel}
    >
      <Text style={[styles.exportButtonText, isPrimary && styles.primaryButtonText]}>
        {getButtonText()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  exportButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: '100%',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ExportExcel;

