import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SIZES } from '../../../constants/index';
import PDFReader from '../../../components/book/PDFReader';
import { apiService } from '../../../services/api';
import { Book } from '../../../types';
import { CloudinaryService } from '../../../services/cloudinaryService';

interface BookReaderScreenProps {
  route: {
    params: {
      book: Book;
    };
  };
}

export default function BookReaderScreen({ route }: BookReaderScreenProps) {
  const { book: initialBook } = route.params;
  const router = useRouter();
  const [book, setBook] = useState<Book>(initialBook);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialBook.pageCount || 10);
  const [readingMode, setReadingMode] = useState<'text' | 'pdf'>('text');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

  useEffect(() => {
    loadBookData();
  }, []);

  const loadBookData = async () => {
    try {
      setIsLoading(true);
      
      // Load book details
      const bookResponse = await apiService.getBookById(book.id);
      if (bookResponse.success && bookResponse.data && bookResponse.data.book) {
        setBook(bookResponse.data.book);
        setTotalPages(bookResponse.data.book.pageCount || 10);
      }

      // Load reading session
      const sessionResponse = await apiService.getReadingSession(book.id);
      if (sessionResponse.success && sessionResponse.data) {
        setCurrentPage(sessionResponse.data.currentPage || 1);
      }
    } catch (error) {
      console.error('Error loading book data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu sách');
    } finally {
      setIsLoading(false);
    }
  };

  const bookContent = [
    {
      page: 1,
      title: "Mở đầu",
      content: "Tôi hy vọng cuốn sách này sẽ giúp bạn có thêm từ vựng để thảo luận về những quyết định nhanh chóng trong cuộc sống, chẳng hạn như thảo luận về những phán xét của người khác, chính sách của công ty, hoặc quyết định đầu tư. Tôi cũng hy vọng nó sẽ giúp bạn hiểu rõ hơn về bản chất con người.\n\nTại sao mọi người lại quan tâm đến chuyện tầm phào? Tại sao chúng ta lại thích nghe những câu chuyện về người khác? Tại sao chúng ta lại thích phán xét người khác?\n\nCó lẽ vì việc đổ lỗi cho người khác hoặc nói xấu người khác thường dễ dàng và thú vị hơn là thừa nhận lỗi lầm của chính mình. Chúng ta thường cảm thấy khó khăn khi phải đặt câu hỏi về những niềm tin sâu sắc nhất của mình và những gì chúng ta thực sự muốn.\n\nTuy nhiên, việc nhận được phản hồi và ý kiến từ người khác, bao gồm cả bạn bè và đồng nghiệp, về những lựa chọn cá nhân của chúng ta là rất có giá trị."
    },
    {
      page: 2,
      title: "Chương 1: Nghệ thuật giao tiếp cơ bản",
      content: "Đắc nhân tâm – How to win friends and Influence People của Dale Carnegie là quyển sách nổi tiếng nhất, bán chạy nhất và có tầm ảnh hưởng nhất của mọi thời đại. Tác phẩm đã được chuyển ngữ sang hầu hết các thứ tiếng trên thế giới và có mặt ở hàng trăm quốc gia.\n\nĐây là quyển sách duy nhất về thể loại tự giúp bản thân liên tục đứng đầu danh mục sách bán chạy nhất của thế giới trong suốt nhiều thập kỷ qua. Riêng tại thị trường Việt Nam, tác phẩm đã có hơn 50 bản dịch khác nhau và được coi là quyển sách gối đầu giường của nhiều thế hệ."
    },
    {
      page: 3,
      title: "Nguyên tắc 1: Đừng chỉ trích, phàn nàn hay than phiền",
      content: "Thay vì chỉ trích người khác, hãy tìm cách hiểu họ. Mọi người đều có lý do riêng cho hành động của mình. Khi bạn hiểu được lý do đó, bạn sẽ có thể giao tiếp hiệu quả hơn và xây dựng mối quan hệ tốt đẹp hơn.\n\nCarnegie đã chỉ ra rằng việc chỉ trích người khác không bao giờ mang lại kết quả tích cực. Thay vào đó, nó chỉ tạo ra sự phòng thủ và thù địch. Khi chúng ta chỉ trích ai đó, họ sẽ có xu hướng bảo vệ bản thân và tìm cách biện minh cho hành động của mình."
    }
  ];

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      
      // Update reading progress
      updateReadingProgress(newPage, totalPages);
      
      // If reached last page, mark as completed
      if (newPage === totalPages) {
        markBookAsCompleted();
      }
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      updateReadingProgress(newPage, totalPages);
    }
  };

  const updateReadingProgress = async (currentPage: number, totalPages: number) => {
    try {
      setIsUpdatingProgress(true);
      const response = await apiService.updateReadingProgress(book.id, currentPage, totalPages);
      if (response.success) {
        console.log(`Reading progress updated: ${Math.round((currentPage / totalPages) * 100)}%`);
      }
    } catch (error) {
      console.error('Error updating reading progress:', error);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const markBookAsCompleted = async () => {
    try {
      const response = await apiService.markBookAsCompleted(book.id);
      if (response.success) {
        Alert.alert('Chúc mừng!', `Bạn đã hoàn thành cuốn sách "${book.title}"!`);
        console.log(`Book "${book.title}" completed!`);
      }
    } catch (error) {
      console.error('Error marking book as completed:', error);
      Alert.alert('Lỗi', 'Không thể đánh dấu sách đã hoàn thành');
    }
  };

  const handleSwitchToPDF = () => {
    if (book.downloadableUrl || book.assetId || book.fileUrl) {
      setReadingMode('pdf');
    } else {
      Alert.alert('Thông báo', 'Sách này chưa có file PDF');
    }
  };

  const getPDFUrl = (): string => {
    // Use downloadableUrl from API if available, otherwise fallback to assetId or fileUrl
    if (book.downloadableUrl) {
      return book.downloadableUrl;
    }
    if (book.assetId) {
      // Use CloudinaryService to generate PDF URL with assetId (public_id)
      return CloudinaryService.getPDFViewerUrl(book.assetId);
    }
    return book.fileUrl || '';
  };

  const handleClosePDF = () => {
    setReadingMode('text');
  };

  const currentContent = bookContent.find(content => content.page === currentPage) || bookContent[0];

  // Show loading screen
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải sách...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // If PDF mode is selected and book has PDF URL, show PDF reader
  if (readingMode === 'pdf' && (book.downloadableUrl || book.assetId || book.fileUrl)) {
    return (
      <PDFReader
        pdfUrl={getPDFUrl()}
        bookTitle={book.title}
        onClose={handleClosePDF}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Control Bar */}
      <View style={styles.controlBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.controlButton}>
          <Text style={styles.controlButtonText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.controlButtons}>
          <TouchableOpacity onPress={handleSwitchToPDF} style={styles.pdfButton}>
            <Text style={styles.pdfButtonText}>📄 PDF</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Reading Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(currentPage / totalPages) * 100}%` }]} />
        </View>
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressText}>
            {Math.round((currentPage / totalPages) * 100)}% hoàn thành
          </Text>
          {isUpdatingProgress && (
            <ActivityIndicator size="small" color={COLORS.primary} style={styles.progressLoader} />
          )}
        </View>
      </View>

      {/* Reading Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.pageContent}>
          <Text style={styles.pageTitle}>{currentContent.title}</Text>
          <Text style={styles.pageText}>{currentContent.content}</Text>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity 
          style={[styles.navButton, currentPage === 1 && styles.disabledButton]}
          onPress={handlePrevPage}
          disabled={currentPage === 1}
        >
          <Text style={[styles.navButtonText, currentPage === 1 && styles.disabledButtonText]}>
            ←
          </Text>
        </TouchableOpacity>
        
        <View style={styles.pageIndicator}>
          <Text style={styles.pageIndicatorText}>
            {currentPage} / {totalPages}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.navButton, currentPage === totalPages && styles.disabledButton]}
          onPress={handleNextPage}
          disabled={currentPage === totalPages}
        >
          <Text style={[styles.navButtonText, currentPage === totalPages && styles.disabledButtonText]}>
            →
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  controlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.gray50,
  },
  controlButtonText: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '500',
  },
  pdfButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  pdfButtonText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.gray50,
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  progressLoader: {
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  pageContent: {
    padding: 20,
    paddingTop: 30,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 30,
    textAlign: 'left',
    fontFamily: 'System',
  },
  pageText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 26,
    textAlign: 'justify',
    fontFamily: 'System',
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: COLORS.primary,
  },
  disabledButton: {
    backgroundColor: COLORS.gray50,
  },
  navButtonText: {
    fontSize: 20,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  disabledButtonText: {
    color: COLORS.textSecondary,
  },
  pageIndicator: {
    flex: 1,
    alignItems: 'center',
  },
  pageIndicatorText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
});
