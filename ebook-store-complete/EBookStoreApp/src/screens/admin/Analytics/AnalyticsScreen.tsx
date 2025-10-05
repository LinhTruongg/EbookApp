import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AnalyticsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thống kê</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold' },
});

export default AnalyticsScreen;


