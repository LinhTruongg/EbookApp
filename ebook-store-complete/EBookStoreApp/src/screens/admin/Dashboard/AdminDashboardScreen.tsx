import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Dimensions,
  FlatList,
  Alert
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { apiService } from '../../../services/api';
import { Category } from '../../../types';

interface AdminDashboardScreenProps {
  navigation: any;
}

const { width } = Dimensions.get('window');

// Tab Content Components
const DashboardContent = ({ user }: { user: any }) => {
  const statsCards = [
    { title: 'Tổng doanh thu', value: '7,455', trend: '+12%', icon: '🛒', color: '#8B5CF6' },
    { title: 'Sách mới', value: '946', trend: '-0.5%', icon: '📖', color: '#F59E0B' },
    { title: 'Người dùng', value: '7,459', trend: '', icon: '👥', color: '#10B981' },
    { title: 'Đơn hàng', value: '5,166', trend: '+1.5%', icon: '📦', color: '#EF4444' },
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

      {/* Main Content Row */}
      <View style={styles.contentRow}>
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeTitle}>Chào mừng, {user?.firstName || 'Admin'}!</Text>
            <Text style={styles.welcomeSubtitle}>Bạn đã hoàn thành 72% công việc.</Text>
            <View style={styles.taskList}>
              <View style={styles.taskItem}>
                <Text style={styles.taskIcon}>✅</Text>
                <Text style={styles.taskText}>Nhiệm vụ hoàn thành</Text>
              </View>
              <View style={styles.taskItem}>
                <Text style={styles.taskIcon}>✅</Text>
                <Text style={styles.taskText}>Dự án 84%</Text>
              </View>
              <View style={styles.taskItem}>
                <Text style={styles.taskIcon}>✅</Text>
                <Text style={styles.taskText}>Thanh toán 10.5</Text>
              </View>
            </View>
          </View>
          <View style={styles.welcomeIllustration}>
            <Text style={styles.illustrationEmoji}>🚀</Text>
          </View>
        </View>

        {/* Charts Section */}
        <View style={styles.chartsSection}>
          <View style={styles.chartHeader}>
            <TouchableOpacity style={styles.chartButton}>
              <Text style={styles.chartButtonText}>Xem tất cả</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chartButton}>
              <Text style={styles.chartButtonText}>Theo dõi</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.chartsGrid}>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Lượt xem trang</Text>
              <Text style={styles.chartValue}>100K</Text>
              <View style={styles.chartPlaceholder}>
                <Text style={styles.chartPlaceholderText}>📈</Text>
              </View>
            </View>
            
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Khách truy cập</Text>
              <Text style={styles.chartValue}>50K</Text>
              <View style={styles.chartPlaceholder}>
                <Text style={styles.chartPlaceholderText}>📊</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Sales Overview */}
      <View style={styles.salesCard}>
        <Text style={styles.salesTitle}>Tổng quan bán hàng</Text>
        <Text style={styles.salesValue}>5,337</Text>
        <Text style={styles.salesSubtitle}>Doanh số tháng này</Text>
        <View style={styles.salesChart}>
          <Text style={styles.salesChartText}>📊 Biểu đồ doanh số</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const UsersContent = ({ navigation }: { navigation: any }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllUsersAdmin();
      if (response.success) {
        setUsers(response.data || []);
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể tải danh sách người dùng');
      }
    } catch (error) {
      console.error('Load users error:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const renderUserItem = ({ item }: { item: any }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userRole}>
          {item.role === 'admin' ? '👑 Admin' : '👤 User'}
        </Text>
        <View style={styles.userMeta}>
          <Text style={styles.userStats}>
            📚 {item.booksPurchased || 0} sách
          </Text>
          <Text style={styles.userStats}>
            💰 {item.totalSpent?.toLocaleString() || 0} VNĐ
          </Text>
          <View style={[
            styles.statusBadge,
            item.isActive ? styles.activeBadge : styles.inactiveBadge
          ]}>
            <Text style={[
              styles.statusText,
              item.isActive ? styles.activeText : styles.inactiveText
            ]}>
              {item.isActive ? 'Hoạt động' : 'Tạm dừng'}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.editButton}
        onPress={() => navigation.navigate('ManageUsers', { editUser: item })}
      >
        <Text style={styles.editButtonText}>✏️</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.tabContent}>
        <View style={styles.contentHeader}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('ManageUsers')}
          >
            <Text style={styles.addButtonText}>+ Thêm người dùng</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải danh sách người dùng...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      <View style={styles.contentHeader}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('ManageUsers')}
        >
          <Text style={styles.addButtonText}>+ Thêm người dùng</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.usersContainer}>
        <View style={styles.usersHeader}>
          <Text style={styles.usersTitle}>Danh sách người dùng</Text>
          <Text style={styles.usersCount}>Tổng: {users.length} người dùng</Text>
        </View>
        
        {users.length > 0 ? (
          <FlatList
            data={users}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id.toString()}
            style={styles.usersList}
            showsVerticalScrollIndicator={false}
            refreshing={loading}
            onRefresh={loadUsers}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>👥 Chưa có người dùng nào</Text>
            <Text style={styles.emptySubtext}>Hãy thêm người dùng đầu tiên</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('ManageUsers')}
        >
          <Text style={styles.viewAllButtonText}>Quản lý chi tiết</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const CategoriesContent = ({ navigation }: { navigation: any }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllCategories();
      if (response.success) {
        setCategories(response.data || []);
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể tải danh sách chủ đề');
      }
    } catch (error) {
      console.error('Load categories error:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách chủ đề');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <View style={styles.categoryItem}>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categorySlug}>/{item.slug}</Text>
        {item.description && (
          <Text style={styles.categoryDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.categoryMeta}>
          <Text style={styles.categoryBooksCount}>
            📚 {item.booksCount} sách
          </Text>
          <View style={[
            styles.statusBadge,
            item.isActive ? styles.activeBadge : styles.inactiveBadge
          ]}>
            <Text style={[
              styles.statusText,
              item.isActive ? styles.activeText : styles.inactiveText
            ]}>
              {item.isActive ? 'Hoạt động' : 'Tạm dừng'}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.editButton}
        onPress={() => navigation.navigate('ManageCategories', { editCategory: item })}
      >
        <Text style={styles.editButtonText}>✏️</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.tabContent}>
        <View style={styles.contentHeader}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('ManageCategories')}
          >
            <Text style={styles.addButtonText}>+ Thêm chủ đề</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải danh sách chủ đề...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      <View style={styles.contentHeader}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('ManageCategories')}
        >
          <Text style={styles.addButtonText}>+ Thêm chủ đề</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.categoriesContainer}>
        <View style={styles.categoriesHeader}>
          <Text style={styles.categoriesTitle}>Danh sách chủ đề</Text>
          <Text style={styles.categoriesCount}>Tổng: {categories.length} chủ đề</Text>
        </View>
        
        {categories.length > 0 ? (
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            style={styles.categoriesList}
            showsVerticalScrollIndicator={false}
            refreshing={loading}
            onRefresh={loadCategories}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📂 Chưa có chủ đề nào</Text>
            <Text style={styles.emptySubtext}>Hãy thêm chủ đề đầu tiên của bạn</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('ManageCategories')}
        >
          <Text style={styles.viewAllButtonText}>Quản lý chi tiết</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const BooksContent = ({ navigation }: { navigation: any }) => {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllBooksAdmin();
      if (response.success) {
        // API admin trả về { data: [...], pagination: {...} }
        setBooks(response.data || []);
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể tải danh sách sách');
      }
    } catch (error) {
      console.error('Load books error:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách sách');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const renderBookItem = ({ item }: { item: any }) => (
    <View style={styles.bookItem}>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <Text style={styles.bookAuthor}>
          Tác giả: {item.authors?.[0]?.name || 'Chưa có'}
        </Text>
        <Text style={styles.bookCategory}>
          📂 {item.category?.name || 'Chưa phân loại'}
        </Text>
        {item.description && (
          <Text style={styles.bookDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.bookMeta}>
          <Text style={styles.bookPrice}>
            💰 {item.discountPrice ? item.discountPrice.toLocaleString() : item.price.toLocaleString()} VNĐ
          </Text>
          <View style={[
            styles.statusBadge,
            item.status === 'active' ? styles.activeBadge : styles.inactiveBadge
          ]}>
            <Text style={[
              styles.statusText,
              item.status === 'active' ? styles.activeText : styles.inactiveText
            ]}>
              {item.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
            </Text>
          </View>
        </View>
        <View style={styles.bookStats}>
          <Text style={styles.bookStat}>⭐ {item.rating || 0}</Text>
          <Text style={styles.bookStat}>👀 {item.totalReviews || 0} đánh giá</Text>
          <Text style={styles.bookStat}>📖 {item.pageCount || 0} trang</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.editButton}
        onPress={() => navigation.navigate('ManageBooks', { editBook: item })}
      >
        <Text style={styles.editButtonText}>✏️</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.tabContent}>
        <View style={styles.contentHeader}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('ManageBooks')}
          >
            <Text style={styles.addButtonText}>+ Thêm sách</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải danh sách sách...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      <View style={styles.contentHeader}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('ManageBooks')}
        >
          <Text style={styles.addButtonText}>+ Thêm sách</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.booksContainer}>
        <View style={styles.booksHeader}>
          <Text style={styles.booksTitle}>Danh sách sách</Text>
          <Text style={styles.booksCount}>Tổng: {books.length} cuốn sách</Text>
        </View>
        
        {books.length > 0 ? (
          <FlatList
            data={books}
            renderItem={renderBookItem}
            keyExtractor={(item) => item.id}
            style={styles.booksList}
            showsVerticalScrollIndicator={false}
            refreshing={loading}
            onRefresh={loadBooks}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📚 Chưa có sách nào</Text>
            <Text style={styles.emptySubtext}>Hãy thêm cuốn sách đầu tiên của bạn</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('ManageBooks')}
        >
          <Text style={styles.viewAllButtonText}>Quản lý chi tiết</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ReviewsContent = () => (
  <ScrollView style={styles.tabContent}>
    <View style={styles.contentHeader}>
      <Text style={styles.contentTitle}>Quản lý đánh giá</Text>
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Xem tất cả</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.contentPlaceholder}>
      <Text style={styles.placeholderText}>⭐ Danh sách đánh giá</Text>
      <Text style={styles.placeholderSubtext}>Tổng: 2,847 đánh giá</Text>
    </View>
  </ScrollView>
);

const CommentsContent = () => (
  <ScrollView style={styles.tabContent}>
    <View style={styles.contentHeader}>
      <Text style={styles.contentTitle}>Quản lý bình luận</Text>
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Xem tất cả</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.contentPlaceholder}>
      <Text style={styles.placeholderText}>💬 Danh sách bình luận</Text>
      <Text style={styles.placeholderSubtext}>Tổng: 1,234 bình luận</Text>
    </View>
  </ScrollView>
);

const AnalyticsContent = () => (
  <ScrollView style={styles.tabContent}>
    <View style={styles.contentHeader}>
      <Text style={styles.contentTitle}>Thống kê</Text>
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>📊 Xuất báo cáo</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.contentPlaceholder}>
      <Text style={styles.placeholderText}>📈 Biểu đồ thống kê</Text>
      <Text style={styles.placeholderSubtext}>Doanh thu, người dùng, sách bán chạy</Text>
    </View>
  </ScrollView>
);

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Người dùng', icon: '👥' },
    { id: 'categories', label: 'Chủ đề', icon: '🗂️' },
    { id: 'books', label: 'Sách', icon: '📚' },
    { id: 'reviews', label: 'Đánh giá', icon: '⭐' },
    { id: 'comments', label: 'Bình luận', icon: '💬' },
    { id: 'analytics', label: 'Thống kê', icon: '📈' },
  ];

  const handleSidebarPress = (itemId: string) => {
    setActiveTab(itemId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent user={user} />;
      case 'users':
        return <UsersContent navigation={navigation} />;
      case 'categories':
        return <CategoriesContent navigation={navigation} />;
      case 'books':
        return <BooksContent navigation={navigation} />;
      case 'reviews':
        return <ReviewsContent />;
      case 'comments':
        return <CommentsContent />;
      case 'analytics':
        return <AnalyticsContent />;
      default:
        return <DashboardContent user={user} />;
    }
  };

  const handleLogout = async () => {
    try {
      setIsMenuOpen(false);
      await logout();
    } catch (e) {}
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.layout}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.brandName}>BookStore</Text>
          </View>
          <ScrollView style={styles.sidebarContent}>
            {sidebarItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.sidebarItem,
                  activeTab === item.id && styles.activeSidebarItem
                ]}
                onPress={() => handleSidebarPress(item.id)}
              >
                <Text style={styles.sidebarIcon}>{item.icon}</Text>
                <Text style={[
                  styles.sidebarText,
                  activeTab === item.id && styles.activeSidebarText
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>
                {sidebarItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerIcon}>
                <Text style={styles.iconText}>🔍</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIcon}>
                <Text style={styles.iconText}>🔔</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIcon}>
                <Text style={styles.iconText}>⚙️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.userInfo} onPress={() => setIsMenuOpen((v) => !v)}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>👤</Text>
                </View>
                <Text style={styles.userName}>{user?.firstName || 'Admin'}</Text>
                <Text style={styles.dropdown}>▼</Text>
              </TouchableOpacity>
              {isMenuOpen && (
                <View style={styles.menuContainer}>
                  <TouchableOpacity style={styles.menuItem} onPress={() => setIsMenuOpen(false)}>
                    <Text style={styles.menuItemText}>Hồ sơ</Text>
                  </TouchableOpacity>
                  <View style={styles.menuDivider} />
                  <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                    <Text style={[styles.menuItemText, styles.logoutText]}>Đăng xuất</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Tab Content */}
          {renderTabContent()}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  layout: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 250,
    backgroundColor: '#1E293B',
    paddingTop: 20,
  },
  sidebarHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  brandName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sidebarContent: {
    flex: 1,
    paddingTop: 20,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  activeSidebarItem: {
    backgroundColor: '#0EA5E9',
  },
  sidebarIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  sidebarText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  activeSidebarText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    overflow: 'visible',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    position: 'relative',
    zIndex: 50,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    padding: 8,
    marginLeft: 8,
  },
  iconText: {
    fontSize: 18,
    color: '#64748B',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#64748B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginRight: 4,
  },
  dropdown: {
    fontSize: 10,
    color: '#64748B',
  },
  menuContainer: {
    position: 'absolute',
    top: 56,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    width: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 999,
  },
  menuItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  menuItemText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  logoutText: {
    color: '#DC2626',
  },
  dashboardContent: {
    flex: 1,
    padding: 24,
  },
  tabContent: {
    flex: 1,
    padding: 24,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  addButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  viewAllButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'center',
  },
  viewAllButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  contentPlaceholder: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 16,
  },
  statCard: {
    width: (width - 250 - 72) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  contentRow: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 16,
  },
  welcomeCard: {
    flex: 2,
    backgroundColor: '#0F766E',
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#CCFBF1',
    marginBottom: 16,
  },
  taskList: {
    gap: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  taskText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  welcomeIllustration: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationEmoji: {
    fontSize: 60,
  },
  chartsSection: {
    flex: 1,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chartButton: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  chartButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  chartsGrid: {
    gap: 16,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  chartValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  chartPlaceholder: {
    height: 60,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholderText: {
    fontSize: 24,
  },
  salesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  salesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  salesValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  salesSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
  },
  salesChart: {
    height: 120,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  salesChartText: {
    fontSize: 16,
    color: '#64748B',
  },
  // Categories styles
  categoriesContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  categoriesHeader: {
    marginBottom: 20,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  categoriesCount: {
    fontSize: 14,
    color: '#64748B',
  },
  categoriesList: {
    flex: 1,
    marginBottom: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  categorySlug: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBooksCount: {
    fontSize: 12,
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#DCFCE7',
  },
  inactiveBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: '#166534',
  },
  inactiveText: {
    color: '#DC2626',
  },
  editButton: {
    padding: 8,
    marginLeft: 12,
  },
  editButtonText: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  // Books styles
  booksContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  booksHeader: {
    marginBottom: 20,
  },
  booksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  booksCount: {
    fontSize: 14,
    color: '#64748B',
  },
  booksList: {
    flex: 1,
    marginBottom: 20,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  bookDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  bookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookPrice: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  bookCategory: {
    fontSize: 12,
    color: '#6366F1',
    marginBottom: 4,
  },
  bookStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  bookStat: {
    fontSize: 11,
    color: '#64748B',
  },
  // Users styles
  usersContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  usersHeader: {
    marginBottom: 20,
  },
  usersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  usersCount: {
    fontSize: 14,
    color: '#64748B',
  },
  usersList: {
    flex: 1,
    marginBottom: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#6366F1',
    marginBottom: 4,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userStats: {
    fontSize: 11,
    color: '#64748B',
  },
});

export default AdminDashboardScreen;


