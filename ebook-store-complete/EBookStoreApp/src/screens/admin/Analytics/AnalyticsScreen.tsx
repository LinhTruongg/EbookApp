import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import RevenueChart from '../../../components/admin/RevenueChart';
import UserGrowthChart from '../../../components/admin/UserGrowthChart';

const AnalyticsScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.chartsContainer}>
        <View style={styles.chartWrapper}>
          <RevenueChart />
        </View>
        <View style={styles.chartWrapper}>
          <UserGrowthChart />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chartsContainer: {
    padding: 16,
    gap: 16,
  },
  chartWrapper: {
    marginBottom: 16,
  },
});

export default AnalyticsScreen;


