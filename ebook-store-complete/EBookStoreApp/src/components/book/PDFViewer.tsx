import React, { useState, useRef, useCallback, useEffect } from 'react';
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
import { WebView } from 'react-native-webview';
import { COLORS, SIZES, COMMON_STYLES } from '../../constants';

/**
 * PDFViewer - Reliable PDF reader component
 *
 * Features:
 * - Fetches PDF in React Native layer (no WebView CORS issues)
 * - Converts to base64 for WebView processing
 * - PDF.js for rendering with page navigation
 * - Reading progress tracking
 * - Clear error messages
 */

interface PDFViewerProps {
  pdfUrl: string;
  bookTitle: string;
  onClose: () => void;
  onPageChange?: (page: number, totalPages: number) => void;
  onLoadComplete?: (totalPages: number) => void;
  onError?: (error: string) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  bookTitle,
  onClose,
  onPageChange,
  onLoadComplete,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);

  // Fetch PDF in React Native layer to avoid WebView CORS issues
  useEffect(() => {
    if (!pdfUrl) {
      setError('No PDF URL provided');
      return;
    }

    const fetchPDFNatively = async () => {
      try {
        console.log('📥 Fetching PDF from URL:', pdfUrl);
        const response = await fetch(pdfUrl);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const blob = await response.blob();
        console.log('✅ PDF fetched, size:', blob.size, 'bytes');

        // Convert blob to base64
        return new Promise<void>((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => {
            try {
              const result = reader.result as string;
              // Extract base64 from data URL
              const base64 = result.split(',')[1];
              if (base64) {
                console.log('✅ PDF converted to base64');
                setPdfBase64(base64);
              } else {
                reject(new Error('Failed to convert PDF to base64'));
              }
              resolve();
            } catch (e) {
              reject(e);
            }
          };

          reader.onerror = () => {
            reject(new Error('Failed to read PDF file'));
          };

          reader.readAsDataURL(blob);
        });
      } catch (error: any) {
        console.error('❌ PDF fetch error:', error.message);
        setError(`Failed to load PDF: ${error.message}`);
        setIsLoading(false);
        onError?.(error.message);
      }
    };

    fetchPDFNatively();
  }, [pdfUrl, onError]);

  const generateSimpleHTML = useCallback((base64Data: string | null) => {
    // If no base64 data yet, show loading placeholder
    if (!base64Data) {
      return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF Viewer</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, html { width: 100%; height: 100%; }
        body {
            background: #333;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            color: #fff;
            font-size: 18px;
        }
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255,255,255,0.3);
            border-top-color: #fff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="loading">
        <div class="spinner"></div>
        <div>Loading PDF...</div>
    </div>
</body>
</html>`;
    }

    // HTML with base64 PDF embedded
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF Viewer</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, html { width: 100%; height: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
        body {
            background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        #container {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            background: #ffffff;
        }

        #pdf-viewport {
            flex: 1;
            overflow: auto;
            background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
            padding: 12px;
            display: grid;
            place-items: center;
        }

        #pdf-content {
            display: grid;
            place-items: center;
        }

        #canvas {
            display: block;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border-radius: 4px;
            background: white;
        }

        .controls {
            background: #ffffff;
            padding: 14px 16px;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 12px;
            border-top: 1px solid #e5e7eb;
            box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
        }

        button {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
            user-select: none;
        }

        button:active {
            opacity: 0.9;
            transform: translateY(1px);
            box-shadow: 0 1px 2px rgba(37, 99, 235, 0.2);
        }

        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .page-info {
            color: #374151;
            font-size: 14px;
            font-weight: 500;
            padding: 8px 12px;
            min-width: 100px;
            text-align: center;
            background: #f3f4f6;
            border-radius: 6px;
        }

        .page-info .current {
            color: #2563eb;
            font-weight: 600;
        }

        /* Toolbar Styles */
        .toolbar {
            background: #ffffff;
            border-bottom: 1px solid #e5e7eb;
            padding: 10px 14px;
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .toolbar-section {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .toolbar-divider {
            width: 1px;
            height: 24px;
            background: #e5e7eb;
            margin: 0 4px;
        }

        .icon-btn {
            background: transparent;
            color: #6b7280;
            border: 1px solid #e5e7eb;
            padding: 6px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s ease;
            min-width: 32px;
            min-height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .icon-btn:hover {
            background: #f3f4f6;
            color: #2563eb;
            border-color: #2563eb;
        }

        .icon-btn:active {
            background: #e5e7eb;
        }

        .icon-btn.active {
            background: #2563eb;
            color: #ffffff;
            border-color: #2563eb;
        }

        .zoom-display {
            min-width: 50px;
            text-align: center;
            font-size: 12px;
            font-weight: 600;
            color: #374151;
            padding: 4px 8px;
            background: #f3f4f6;
            border-radius: 4px;
        }

        #pdf-viewport.night-mode {
            background: #1f2937 !important;
            filter: invert(1) hue-rotate(180deg);
        }

        #pdf-viewport.night-mode #canvas {
            filter: invert(1) hue-rotate(180deg);
        }

        @media (max-width: 600px) {
            .controls {
                padding: 12px 8px;
                gap: 8px;
            }
            button {
                padding: 8px 12px;
                font-size: 13px;
            }
            .toolbar {
                padding: 8px 10px;
                gap: 6px;
            }
            .icon-btn {
                padding: 5px 8px;
                font-size: 13px;
                min-width: 28px;
                min-height: 28px;
            }
            .toolbar-divider {
                height: 20px;
                margin: 0 2px;
            }
        }
    </style>
</head>
<body>
    <div id="container">
        <!-- Toolbar -->
        <div class="toolbar">
            <div class="toolbar-section">
                <button id="zoomOutBtn" class="icon-btn" title="Zoom Out">−</button>
                <div class="zoom-display" id="zoomDisplay">100%</div>
                <button id="zoomInBtn" class="icon-btn" title="Zoom In">+</button>
            </div>
            <div class="toolbar-divider"></div>
            <div class="toolbar-section">
                <button id="fitPageBtn" class="icon-btn" title="Fit Page">⊡</button>
                <button id="fitWidthBtn" class="icon-btn" title="Fit Width">⊟</button>
            </div>
            <div style="flex: 1;"></div>
            <div class="toolbar-section">
                <button id="brightnessBtn" class="icon-btn" title="Night Mode">🌙</button>
            </div>
        </div>

        <!-- PDF Viewport -->
        <div id="pdf-viewport">
            <div id="pdf-content">
                <canvas id="canvas"></canvas>
            </div>
        </div>

        <!-- Controls -->
        <div class="controls">
            <button id="prevBtn">← Previous</button>
            <div class="page-info" id="pageInfo"><span class="current">-</span> / -</div>
            <button id="nextBtn">Next →</button>
        </div>
    </div>

    <script>
        // PDF.js viewer using base64 data
        const pdfBase64 = '${base64Data}';
        let pdfDoc = null;
        let currentPage = 1;
        let baseScale = 1.5;
        let scale = baseScale;
        let nightMode = false;

        console.log('🔍 PDF Viewer initializing with base64 data');

        // Set up PDF.js worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        // Zoom functionality
        const zoomLevels = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0];
        let currentZoomIndex = 4; // Start at 1.5 (150%)

        function updateZoom() {
            const zoomPercent = Math.round(scale * 100);
            document.getElementById('zoomDisplay').textContent = zoomPercent + '%';
            renderPage(currentPage);
        }

        function zoomIn() {
            if (currentZoomIndex < zoomLevels.length - 1) {
                currentZoomIndex++;
                scale = zoomLevels[currentZoomIndex];
                updateZoom();
            }
        }

        function zoomOut() {
            if (currentZoomIndex > 0) {
                currentZoomIndex--;
                scale = zoomLevels[currentZoomIndex];
                updateZoom();
            }
        }

        function fitPage() {
            const canvas = document.getElementById('canvas');
            const viewport = document.getElementById('pdf-viewport');
            if (pdfDoc && canvas && canvas.width > 0) {
                const pageRatio = canvas.width / canvas.height;
                const containerRatio = viewport.clientWidth / viewport.clientHeight;
                let newScale = containerRatio > pageRatio
                    ? (viewport.clientHeight / canvas.height)
                    : (viewport.clientWidth / canvas.width);

                // Clamp to available zoom levels
                newScale = Math.max(0.5, Math.min(3.0, newScale));
                scale = newScale;

                // Find closest zoom level
                let closest = 0;
                let minDiff = Math.abs(zoomLevels[0] - scale);
                for (let i = 1; i < zoomLevels.length; i++) {
                    const diff = Math.abs(zoomLevels[i] - scale);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closest = i;
                    }
                }
                currentZoomIndex = closest;
                updateZoom();
            }
        }

        function fitWidth() {
            const canvas = document.getElementById('canvas');
            const viewport = document.getElementById('pdf-viewport');
            if (canvas && canvas.width > 0) {
                let newScale = viewport.clientWidth / canvas.width;

                // Clamp to available zoom levels
                newScale = Math.max(0.5, Math.min(3.0, newScale));
                scale = newScale;

                // Find closest zoom level
                let closest = 0;
                let minDiff = Math.abs(zoomLevels[0] - scale);
                for (let i = 1; i < zoomLevels.length; i++) {
                    const diff = Math.abs(zoomLevels[i] - scale);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closest = i;
                    }
                }
                currentZoomIndex = closest;
                updateZoom();
            }
        }

        // Night mode toggle
        function toggleNightMode() {
            nightMode = !nightMode;
            const viewport = document.getElementById('pdf-viewport');
            const btn = document.getElementById('brightnessBtn');

            if (nightMode) {
                viewport.classList.add('night-mode');
                btn.classList.add('active');
            } else {
                viewport.classList.remove('night-mode');
                btn.classList.remove('active');
            }
        }

        function renderPage(pageNum) {
            if (!pdfDoc) return;

            pdfDoc.getPage(pageNum).then(function(page) {
                const viewport = page.getViewport({scale: scale});
                const canvas = document.getElementById('canvas');
                const context = canvas.getContext('2d');

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };

                page.render(renderContext).promise.then(function() {
                    console.log('✅ Page ' + pageNum + ' rendered');

                    // Update page info
                    const pageInfo = document.getElementById('pageInfo');
                    if (pageInfo) {
                        pageInfo.innerHTML = '<span class="current">' + pageNum + '</span> / ' + pdfDoc.numPages;
                    }

                    // Update button states
                    const prevBtn = document.getElementById('prevBtn');
                    const nextBtn = document.getElementById('nextBtn');
                    if (prevBtn) prevBtn.disabled = pageNum <= 1;
                    if (nextBtn) nextBtn.disabled = pageNum >= pdfDoc.numPages;

                    // Notify React Native
                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'pageChanged',
                            currentPage: pageNum,
                            totalPages: pdfDoc.numPages
                        }));
                    }
                });
            });
        }

        function loadPDF() {
            if (!pdfBase64) {
                console.error('No PDF data');
                return;
            }

            console.log('📄 Parsing PDF from base64 data');

            // Convert base64 to binary
            const binaryString = atob(pdfBase64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Load PDF from binary data
            pdfjsLib.getDocument({ data: bytes }).promise
                .then(pdf => {
                    pdfDoc = pdf;
                    console.log('✅ PDF loaded successfully: ' + pdf.numPages + ' pages');

                    // Setup navigation buttons
                    document.getElementById('prevBtn').onclick = function() {
                        if (currentPage > 1) {
                            currentPage--;
                            renderPage(currentPage);
                        }
                    };

                    document.getElementById('nextBtn').onclick = function() {
                        if (currentPage < pdf.numPages) {
                            currentPage++;
                            renderPage(currentPage);
                        }
                    };

                    // Setup toolbar buttons
                    document.getElementById('zoomInBtn').onclick = zoomIn;
                    document.getElementById('zoomOutBtn').onclick = zoomOut;
                    document.getElementById('fitPageBtn').onclick = fitPage;
                    document.getElementById('fitWidthBtn').onclick = fitWidth;
                    document.getElementById('brightnessBtn').onclick = toggleNightMode;

                    // Initial button states
                    document.getElementById('prevBtn').disabled = true;

                    // Render first page
                    renderPage(currentPage);

                    // Notify React Native
                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'pdfLoaded',
                            totalPages: pdf.numPages
                        }));
                    }
                })
                .catch(function(error) {
                    console.error('❌ PDF parsing failed:', error);

                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'error',
                            message: 'Failed to parse PDF: ' + error.message
                        }));
                    }
                });
        }

        // Start loading when document is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadPDF);
        } else {
            loadPDF();
        }
    </script>
</body>
</html>`;
  }, []);

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('📨 Message from WebView:', data);

      if (data.type === 'pdfLoaded') {
        setIsLoading(false);
        setError(null);
        onLoadComplete?.(data.totalPages || 1);
      } else if (data.type === 'pageChanged') {
        // Handle page changes from PDF viewer
        onPageChange?.(data.currentPage, data.totalPages);
      } else if (data.type === 'error') {
        const errorMsg = data.message || 'Failed to load PDF';
        setError(errorMsg);
        setIsLoading(false);
        onError?.(errorMsg);
        console.error('PDF Error:', errorMsg);
      }
    } catch (e) {
      console.error('Error parsing WebView message:', e);
    }
  }, [onLoadComplete, onPageChange, onError]);

  const handleWebViewError = useCallback((event: any) => {
    const errorMsg = event.nativeEvent.description || 'WebView error loading PDF';
    console.error('WebView Error:', errorMsg);
    setError(errorMsg);
    setIsLoading(false);
    onError?.(errorMsg);
  }, [onError]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {bookTitle}
        </Text>
        <View style={styles.spacer} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading PDF...</Text>
            <Text style={styles.loadingSubtext}>This may take a moment</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Failed to Load PDF</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={onClose}>
              <Text style={styles.retryText}>← Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {!error && (
          <WebView
            ref={webViewRef}
            source={{ html: generateSimpleHTML(pdfBase64) }}
            style={styles.webview}
            onMessage={handleWebViewMessage}
            onError={handleWebViewError}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            originWhitelist={['*']}
            allowsInlineMediaPlayback={true}
            scalesPageToFit={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading PDF...</Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

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
  },
  closeButton: {
    padding: SIZES.spacing.sm,
    marginRight: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
  },
  closeIcon: {
    fontSize: SIZES.font.xl,
    color: COLORS.text,
    fontWeight: '600',
  },
  title: {
    flex: 1,
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  spacer: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  webview: {
    flex: 1,
    backgroundColor: COLORS.white,
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
    color: COLORS.text,
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: SIZES.spacing.sm,
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.spacing.lg,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: SIZES.spacing.lg,
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
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.spacing.lg,
    lineHeight: 20,
  },
  retryButton: {
    ...COMMON_STYLES.buttonPrimary,
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
  },
  retryText: {
    ...COMMON_STYLES.textButton,
  },
});

export default PDFViewer;
