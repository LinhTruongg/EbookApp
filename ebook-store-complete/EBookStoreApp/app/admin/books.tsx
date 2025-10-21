import React from 'react';
import AdminLayout from '../../src/components/admin/AdminLayout';
import ManageBooksScreen from '../../src/screens/admin/Books/ManageBooksScreen';

export default function AdminBooks() {
  return (
    <AdminLayout title="Quản lý sách">
      <ManageBooksScreen />
    </AdminLayout>
  );
}
