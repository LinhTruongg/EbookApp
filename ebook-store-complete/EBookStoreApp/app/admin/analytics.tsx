import React from 'react';
import AdminLayout from '../../src/components/admin/AdminLayout';
import AnalyticsScreen from '../../src/screens/admin/Analytics/AnalyticsScreen';

export default function AdminAnalytics() {
  return (
    <AdminLayout title="Thống kê">
      <AnalyticsScreen />
    </AdminLayout>
  );
}
