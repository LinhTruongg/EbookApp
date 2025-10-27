import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SIZES } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  hideHeader?: boolean;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, hideHeader = false }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [sidebarWidth, setSidebarWidth] = useState(280);

  useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window);
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    // Responsive sidebar width
    if (screenData.width < 768) {
      setSidebarWidth(240);
    } else if (screenData.width < 1024) {
      setSidebarWidth(260);
    } else {
      setSidebarWidth(280);
    }
  }, [screenData.width]);

  const menuItems = [
    { 
      id: 'dashboard', 
      title: 'Dashboard', 
      route: '/admin/dashboard',
      icon: 'grid-outline' as keyof typeof Ionicons.glyphMap
    },
    { 
      id: 'books', 
      title: 'Quản lý sách', 
      route: '/admin/books',
      icon: 'book-outline' as keyof typeof Ionicons.glyphMap
    },
    { 
      id: 'categories', 
      title: 'Quản lý danh mục', 
      route: '/admin/categories',
      icon: 'folder-outline' as keyof typeof Ionicons.glyphMap
    },
    { 
      id: 'users', 
      title: 'Quản lý người dùng', 
      route: '/admin/users',
      icon: 'people-outline' as keyof typeof Ionicons.glyphMap
    },
    { 
      id: 'reviews', 
      title: 'Quản lý đánh giá', 
      route: '/admin/reviews',
      icon: 'star-outline' as keyof typeof Ionicons.glyphMap
    },
    { 
      id: 'comments', 
      title: 'Quản lý bình luận', 
      route: '/admin/comments',
      icon: 'chatbubble-outline' as keyof typeof Ionicons.glyphMap
    },
    { 
      id: 'analytics', 
      title: 'Thống kê', 
      route: '/admin/analytics',
      icon: 'analytics-outline' as keyof typeof Ionicons.glyphMap
    },
  ];

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      {/* Fixed Sidebar */}
      <View style={[styles.sidebar, { width: sidebarWidth }]}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="library-outline" size={32} color={COLORS.white} />
            <Text style={styles.headerTitle}>EBookStore</Text>
          </View>
          <Text style={styles.headerSubtitle}>Admin Panel</Text>
        </View>
        
        <View style={styles.userSection}>
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.userRole}>Administrator</Text>
          </View>
        </View>
        
        <ScrollView style={styles.menu} showsVerticalScrollIndicator={false}>
          {menuItems.map((item) => {
            const isActive = pathname === item.route;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  isActive && styles.menuItemActive
                ]}
                onPress={() => router.push(item.route)}
              >
                <Ionicons 
                  name={item.icon} 
                  size={20} 
                  color={isActive ? COLORS.primary : COLORS.white} 
                />
                <Text style={[
                  styles.menuItemText,
                  isActive && styles.menuItemTextActive
                ]}>
                  {item.title}
                </Text>
                {isActive && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        
        <View style={styles.footer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
            <Text style={styles.logoutButtonText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Main Content */}
      <View style={[styles.content, { marginLeft: sidebarWidth }]}>
     
        <ScrollView style={styles.contentBody} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.background,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.spacing.lg,
    paddingHorizontal: SIZES.spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  header: {
    marginBottom: SIZES.spacing.xl,
    paddingBottom: SIZES.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  headerTitle: {
    fontSize: SIZES.font.xl,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: SIZES.spacing.sm,
  },
  headerSubtitle: {
    fontSize: SIZES.font.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.xl,
    paddingVertical: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: SIZES.borderRadius.lg,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.spacing.sm,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 2,
  },
  userRole: {
    fontSize: SIZES.font.xs,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  menu: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.md,
    marginBottom: SIZES.spacing.xs,
    borderRadius: SIZES.borderRadius.lg,
    position: 'relative',
  },
  menuItemActive: {
    backgroundColor: COLORS.white,
    transform: [{ translateX: 4 }],
  },
  menuItemText: {
    fontSize: SIZES.font.md,
    color: COLORS.white,
    fontWeight: '500',
    marginLeft: SIZES.spacing.md,
    flex: 1,
  },
  menuItemTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    right: SIZES.spacing.sm,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  footer: {
    marginTop: SIZES.spacing.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.lg,
  },
  logoutButtonText: {
    fontSize: SIZES.font.md,
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: SIZES.spacing.sm,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentHeader: {
    backgroundColor: COLORS.white,
    paddingVertical: SIZES.spacing.lg,
    paddingHorizontal: SIZES.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentTitle: {
    fontSize: SIZES.font.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  contentSubtitle: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SIZES.spacing.sm,
  },
  contentBody: {
    flex: 1,
    padding: SIZES.spacing.lg,
  },
});

export default AdminLayout;
