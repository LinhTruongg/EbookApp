import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AdminLayout from '../../src/components/admin/AdminLayout';
import AdminDashboardScreen from '../../src/screens/admin/Dashboard/AdminDashboardScreen';

export default function AdminDashboard() {
  return (
    <AdminLayout title="Dashboard">
      <AdminDashboardScreen />
    </AdminLayout>
  );
}
