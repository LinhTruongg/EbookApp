import React from 'react';
import AdminLayout from '../../src/components/admin/AdminLayout';
import ManageCommentsScreen from '../../src/screens/admin/Comments/ManageCommentsScreen';

export default function AdminComments() {
  return (
    <AdminLayout title="Quản lý bình luận">
      <ManageCommentsScreen />
    </AdminLayout>
  );
}
