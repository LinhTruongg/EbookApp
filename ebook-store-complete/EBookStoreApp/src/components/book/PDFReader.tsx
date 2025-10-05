import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { COLORS, SIZES } from '../../constants';
import CloudinaryPDFViewer from './CloudinaryPDFViewer';

interface PDFReaderProps {
  pdfUrl: string;
  bookTitle: string;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

const PDFReader: React.FC<PDFReaderProps> = ({ pdfUrl, bookTitle, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(206); // Mock total pages
  const [pageInput, setPageInput] = useState('1');
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const pdfRef = useRef<any>(null);

  const handlePageChange = (page: number, numberOfPages: number) => {
    setCurrentPage(page);
    setTotalPages(numberOfPages);
    setPageInput(page.toString());
  };

  const goToPage = () => {
    const pageNumber = parseInt(pageInput);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      setPageInput(pageNumber.toString());
    } else {
      Alert.alert('Lỗi', `Trang phải từ 1 đến ${totalPages}`);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      setPageInput(newPage.toString());
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      setPageInput(newPage.toString());
    }
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 3.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.5, 0.5));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setShowControls(!isFullscreen);
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  return (
    <SafeAreaView style={[styles.container, isFullscreen && styles.fullscreenContainer]}>
      <StatusBar hidden={isFullscreen} />
      
      {/* Header */}
      {!isFullscreen && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            {bookTitle}
          </Text>
          <TouchableOpacity style={styles.fullscreenButton} onPress={toggleFullscreen}>
            <Text style={styles.fullscreenIcon}>⛶</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* PDF Controls */}
      {showControls && (
        <View style={[styles.controls, isFullscreen && styles.fullscreenControls]}>
          <View style={styles.leftControls}>
            <TouchableOpacity style={styles.controlButton} onPress={goToPreviousPage}>
              <Text style={styles.controlIcon}>◀</Text>
            </TouchableOpacity>
            
            <View style={styles.pageInfo}>
              <Text style={styles.pageLabel}>Trang:</Text>
              <TextInput
                style={styles.pageInput}
                value={pageInput}
                onChangeText={setPageInput}
                onSubmitEditing={goToPage}
                keyboardType="numeric"
                selectTextOnFocus
              />
              <Text style={styles.pageTotal}>/{totalPages}</Text>
            </View>
            
            <TouchableOpacity style={styles.controlButton} onPress={goToNextPage}>
              <Text style={styles.controlIcon}>▶</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.centerControls}>
            <TouchableOpacity style={styles.controlButton} onPress={zoomOut}>
              <Text style={styles.controlIcon}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomButton} onPress={resetZoom}>
              <Text style={styles.zoomText}>Tự động</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={zoomIn}>
              <Text style={styles.controlIcon}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rightControls}>
            {isFullscreen && (
              <TouchableOpacity style={styles.controlButton} onPress={toggleFullscreen}>
                <Text style={styles.controlIcon}>⛶</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.controlButton}>
              <Text style={styles.controlIcon}>🏠</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Text style={styles.controlIcon}>📄</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Text style={styles.controlIcon}>⬇</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* PDF Viewer */}
      <View style={styles.pdfContainer}>
        <View style={styles.webPdfContainer}>
          <View style={styles.pdfHeader}>
            <Text style={styles.webPdfText}>📄 {bookTitle}</Text>
            <Text style={styles.webPdfSubtext}>Trang {currentPage} / {totalPages}</Text>
          </View>
          
          {/* PDF Content */}
          <View style={styles.pdfContent}>
            <CloudinaryPDFViewer 
              pdfUrl={pdfUrl}
              width="100%"
              height="100%"
            />
          </View>
          
          <TouchableOpacity 
            style={styles.webPdfButton}
            onPress={() => {
              if (Platform.OS === 'web' && typeof window !== 'undefined') {
                window.open(pdfUrl, '_blank');
              } else {
                Alert.alert('Thông báo', 'Mở PDF trong ứng dụng khác');
              }
            }}
          >
            <Text style={styles.webPdfButtonText}>Mở PDF trong Tab mới</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.floatingButton}>
        <Text style={styles.floatingButtonText}>MUA SÁCH GIẤY</Text>
        <TouchableOpacity style={styles.closeButton}>
          <Text style={styles.closeIcon}>×</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Tap to toggle controls */}
      <TouchableOpacity 
        style={styles.tapArea} 
        onPress={toggleControls}
        activeOpacity={1}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  fullscreenContainer: {
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  backIcon: {
    fontSize: 20,
    color: COLORS.primary,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  fullscreenButton: {
    padding: 8,
  },
  fullscreenIcon: {
    fontSize: 18,
    color: COLORS.primary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  fullscreenControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(248, 250, 252, 0.95)',
  },
  leftControls: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  centerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  controlButton: {
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  controlIcon: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
  pageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  pageLabel: {
    fontSize: 14,
    color: COLORS.text,
    marginRight: 8,
  },
  pageInput: {
    width: 50,
    height: 32,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: '#FFFFFF',
  },
  pageTotal: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  zoomButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  zoomText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  pdf: {
    flex: 1,
    width: width,
    height: height,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#EC4899',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
  },
  closeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tapArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  webPdfContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 20,
  },
  pdfHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pdfContent: {
    flex: 1,
    marginVertical: 20,
  },
  webPdfText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  webPdfSubtext: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  webPdfUrl: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  webPdfButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  webPdfButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  mockPdfContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockPdfTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 20,
  },
  mockPdfPage: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 16,
  },
  mockPdfText: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});

export default PDFReader;
