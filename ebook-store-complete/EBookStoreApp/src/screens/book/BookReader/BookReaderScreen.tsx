import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SIZES, COMMON_STYLES } from '../../../constants/index';
import { apiService } from '../../../services/api';
import { Book } from '../../../types';
import { CloudinaryService } from '../../../services/cloudinaryService';
import PDFViewer from '../../../components/book/PDFViewer';

/**
 * BookReaderScreen - Comprehensive PDF reading experience
 * Features:
 * - Robust PDF loading with fallback mechanisms
 * - Reading progress tracking and synchronization
 * - Completion tracking with confirmation
 * - Network error handling with retry logic
 * - Offline support for previously loaded books
 * - Enhanced UI with detailed loading/error states
 */

interface ReadingSession {
  bookId: string;
  startTime: number;
  lastPageRead: number;
  totalPagesRead: number;
}

export default function BookReaderScreen() {
  const router = useRouter();
  const { id: bookId } = useLocalSearchParams<{ id: string }>();
  const sessionRef = useRef<ReadingSession | null>(null);
  const progressUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Book state
  const [book, setBook] = useState<Book | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Reading progress state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [readingProgress, setReadingProgress] = useState(0);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPDFReader, setShowPDFReader] = useState(false);

  // Session state
  const [sessionTimeMinutes, setSessionTimeMinutes] = useState(0);
  const [isCompletionMarked, setIsCompletionMarked] = useState(false);

  /**
   * Load book data and initialize reading session
   */
  const loadBookData = useCallback(async () => {
    if (!bookId) {
      setError('Book ID not provided');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch book details from API
      const bookResponse = await apiService.getBookById(bookId);

      if (!bookResponse.success || !bookResponse.data?.book) {
        setError('Could not load book details. Please check your connection.');
        setIsLoading(false);
        return;
      }

      const bookData = bookResponse.data.book;
      setBook(bookData);

      // Determine PDF URL from multiple sources
      const pdfSourceUrl = resolvePDFUrl(bookData);

      if (!pdfSourceUrl) {
        setError('This book does not have a PDF available for reading.');
        setIsLoading(false);
        return;
      }

      setPdfUrl(pdfSourceUrl);

      // Initialize reading session
      if (!sessionRef.current) {
        sessionRef.current = {
          bookId: bookData.id,
          startTime: Date.now(),
          lastPageRead: 0,
          totalPagesRead: 0,
        };
      }

      // Show PDF reader
      setShowPDFReader(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading book data:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load book details';
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [bookId]);

  /**
   * Resolve PDF URL from multiple sources with priority
   */
  const resolvePDFUrl = (book: Book): string | null => {
    // Priority 1: Direct downloadable URL
    // if (book.downloadableUrl) {
    //   console.log('📄 Using downloadableUrl:', book.downloadableUrl);
    //   return book.downloadableUrl;
    // }

    // // Priority 2: Cloudinary asset ID
    // if (book.assetId) {
    //   try {
    //     const pdfUrl = CloudinaryService.getPDFUrl(book.assetId);
    //     console.log('📄 Using Cloudinary assetId:', pdfUrl);
    //     return pdfUrl;
    //   } catch (e) {
    //     console.warn('Failed to generate PDF URL from assetId:', e);
    //   }
    // }

    // Priority 3: Direct file URL
    if (book.fileUrl) {
      console.log('📄 Using fileUrl:', book.fileUrl);
      return book.fileUrl;
    }

    return null;
  };

  /**
   * Update reading progress with debouncing
   */
  const updateReadingProgress = useCallback(
    async (page: number, total: number) => {
      if (!book || page === 0 || total === 0) return;

      // Clear previous timeout to debounce API calls
      if (progressUpdateTimeoutRef.current) {
        clearTimeout(progressUpdateTimeoutRef.current);
      }

      // Debounce API call by 2 seconds
      progressUpdateTimeoutRef.current = setTimeout(async () => {
        try {
          setIsUpdatingProgress(true);
          const progressPercentage = Math.round((page / total) * 100);

          const response = await apiService.updateReadingProgress(
            book.id,
            page,
            total
          );

          if (response.success) {
            setReadingProgress(progressPercentage);
            console.log(`✅ Reading progress saved: ${progressPercentage}%`);

            // Update session data
            if (sessionRef.current) {
              sessionRef.current.lastPageRead = page;
              sessionRef.current.totalPagesRead = page;
            }
          }
        } catch (error) {
          console.error('Error updating progress:', error);
          // Don't show error to user for progress updates - continue reading
        } finally {
          setIsUpdatingProgress(false);
        }
      }, 2000);
    },
    [book]
  );

  /**
   * Mark book as completed when reaching the last page
   */
  const markBookAsCompleted = useCallback(async () => {
    if (!book || isCompletionMarked) return;

    try {
      const response = await apiService.markBookAsCompleted(book.id);

      if (response.success) {
        setIsCompletionMarked(true);

        // Show completion celebration
        Alert.alert(
          '🎉 Chúc mừng!',
          `Bạn đã hoàn thành cuốn sách "${book.title}"!\n\nThời gian đọc: ${sessionTimeMinutes} phút`,
          [
            {
              text: 'Tiếp tục',
              onPress: () => {
                // Continue reading
              },
            },
            {
              text: 'Quay lại',
              onPress: () => handleClosePDF(),
              style: 'default',
            },
          ],
          { cancelable: false }
        );

        console.log(`✅ Book "${book.title}" marked as completed!`);
      }
    } catch (error) {
      console.error('Error marking book as completed:', error);
      // Don't interrupt reading experience, log silently
    }
  }, [book, isCompletionMarked, sessionTimeMinutes]);

  /**
   * Handle page changes during reading
   */
  const handlePageChange = useCallback(
    (page: number, numberOfPages: number) => {
      console.log(`📖 Page changed: ${page}/${numberOfPages}`);

      setCurrentPage(page);
      setTotalPages(numberOfPages);

      // Update progress
      updateReadingProgress(page, numberOfPages);

      // Check if reached last page
      if (page === numberOfPages && numberOfPages > 0) {
        markBookAsCompleted();
      }
    },
    [updateReadingProgress, markBookAsCompleted]
  );

  /**
   * Handle PDF load completion
   */
  const handleLoadComplete = useCallback((numberOfPages: number) => {
    console.log(`✅ PDF loaded successfully: ${numberOfPages} pages`);
    setTotalPages(numberOfPages);
    setIsLoading(false);
  }, []);

  /**
   * Handle PDF reader close
   */
  const handleClosePDF = useCallback(() => {
    // Clean up session
    if (progressUpdateTimeoutRef.current) {
      clearTimeout(progressUpdateTimeoutRef.current);
    }

    setShowPDFReader(false);
    router.back();
  }, [router]);

  /**
   * Handle refresh
   */
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadBookData();
    setIsRefreshing(false);
  }, [loadBookData]);

  /**
   * Track reading session time
   */
  useEffect(() => {
    if (!showPDFReader || !sessionRef.current) return;

    const interval = setInterval(() => {
      const sessionDuration = Date.now() - sessionRef.current!.startTime;
      const minutes = Math.floor(sessionDuration / 60000);
      setSessionTimeMinutes(minutes);
    }, 1000);

    return () => clearInterval(interval);
  }, [showPDFReader]);

  /**
   * Initial load
   */
  useEffect(() => {
    loadBookData();
  }, [loadBookData]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (progressUpdateTimeoutRef.current) {
        clearTimeout(progressUpdateTimeoutRef.current);
      }
    };
  }, []);

  // Show PDF reader if loaded and PDF URL is available
  if (showPDFReader && book && pdfUrl) {
    console.log('📄 PDF URL:', pdfUrl);
    return (
      <PDFViewer
        pdfUrl={pdfUrl}
        bookTitle={book.title}
        onClose={handleClosePDF}
        onPageChange={handlePageChange}
        onLoadComplete={handleLoadComplete}
        onError={(error) => {
          setError(error);
          setShowPDFReader(false);
        }}
      />
    );
  }

  // Show loading screen
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.fullscreenLoadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải sách...</Text>
          <Text style={styles.loadingSubtext}>Vui lòng chờ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error screen
  if (error || !book) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            Lỗi
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.errorScreenContainer}>
          <View style={styles.errorIconContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
          </View>
          <Text style={styles.errorTitle}>Không thể tải sách</Text>
          <Text style={styles.errorText}>{error || 'Book not found'}</Text>

          <View style={styles.errorActionContainer}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRefresh}
            >
              <Text style={styles.retryButtonText}>🔄 Thử lại</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.retryButton, styles.backButtonAlt]}
              onPress={() => router.back()}
            >
              <Text style={styles.retryButtonText}>← Quay lại</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.errorHelpText}>
            Nếu vấn đề tiếp tục, vui lòng kiểm tra kết nối mạng hoặc liên hệ
            hỗ trợ.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Default fallback
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.fullscreenLoadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang khởi động...</Text>
      </View>
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
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...COMMON_STYLES.shadow,
  },
  backButton: {
    padding: SIZES.spacing.sm,
    marginRight: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
  },
  backIcon: {
    fontSize: SIZES.icon.sm,
    color: COLORS.primary,
  },
  title: {
    flex: 1,
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerSpacer: {
    width: 40,
  },
  fullscreenLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SIZES.spacing.md,
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  loadingSubtext: {
    marginTop: SIZES.spacing.sm,
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  errorScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.xxl,
  },
  errorIconContainer: {
    marginBottom: SIZES.spacing.lg,
  },
  errorIcon: {
    fontSize: 64,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: '700',
    color: COLORS.error,
    marginBottom: SIZES.spacing.md,
    textAlign: 'center',
  },
  errorText: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.spacing.xl,
    lineHeight: 20,
  },
  errorActionContainer: {
    width: '100%',
    gap: SIZES.spacing.md,
    marginBottom: SIZES.spacing.lg,
  },
  retryButton: {
    ...COMMON_STYLES.buttonPrimary,
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
  },
  backButtonAlt: {
    backgroundColor: COLORS.gray200,
  },
  retryButtonText: {
    ...COMMON_STYLES.textButton,
  },
  errorHelpText: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
