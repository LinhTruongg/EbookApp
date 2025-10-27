import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import UserGrowthChart from '../../components/admin/UserGrowthChart';

const TestChartScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <UserGrowthChart />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});

export default TestChartScreen;
