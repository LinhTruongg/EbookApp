import React from 'react';
import AdminLayout from '../../src/components/admin/AdminLayout';
import ManageAuthorsScreen from '../../src/screens/admin/Authors/ManageAuthorsScreen';

export default function AdminAuthors() {
  return (
    <AdminLayout title="Quản lý tác giả">
      <ManageAuthorsScreen />
    </AdminLayout>
  );
}




