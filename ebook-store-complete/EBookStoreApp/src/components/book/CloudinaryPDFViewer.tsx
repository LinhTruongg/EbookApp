import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

interface CloudinaryPDFViewerProps {
  pdfUrl: string;
  width?: string | number;
  height?: string | number;
}

const CloudinaryPDFViewer: React.FC<CloudinaryPDFViewerProps> = ({ 
  pdfUrl, 
  width = '100%', 
  height = '100%' 
}) => {
  if (Platform.OS === 'web') {
    return (
      <iframe
        src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
        style={[styles.iframe, { width, height }]}
        title="PDF Viewer"
        allowFullScreen
      />
    );
  }

  // For mobile platforms, show a placeholder
  return (
    <View style={[styles.mobilePlaceholder, { width, height }]}>
      {/* Mobile PDF viewer would go here */}
    </View>
  );
};

const styles = StyleSheet.create({
  iframe: {
    border: 'none',
    borderRadius: 12,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  mobilePlaceholder: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CloudinaryPDFViewer;
