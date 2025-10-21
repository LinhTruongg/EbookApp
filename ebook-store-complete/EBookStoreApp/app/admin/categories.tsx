import React from 'react';
import AdminLayout from '../../src/components/admin/AdminLayout';
import ManageCategoriesScreen from '../../src/screens/admin/Categories/ManageCategoriesScreen';

export default function AdminCategories() {
  return (
    <AdminLayout title="Quản lý danh mục">
      <ManageCategoriesScreen />
    </AdminLayout>
  );
}
