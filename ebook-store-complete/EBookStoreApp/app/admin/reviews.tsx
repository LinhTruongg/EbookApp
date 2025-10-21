import React from 'react';
import AdminLayout from '../../src/components/admin/AdminLayout';
import ManageReviewsScreen from '../../src/screens/admin/Reviews/ManageReviewsScreen';

export default function AdminReviews() {
  return (
    <AdminLayout title="Quản lý đánh giá">
      <ManageReviewsScreen />
    </AdminLayout>
  );
}
