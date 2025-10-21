import React from 'react';
import AdminLayout from '../../src/components/admin/AdminLayout';
import ManageUsersScreen from '../../src/screens/admin/Users/ManageUsersScreen';

export default function AdminUsers() {
  return (
    <AdminLayout title="Quản lý người dùng">
      <ManageUsersScreen />
    </AdminLayout>
  );
}
