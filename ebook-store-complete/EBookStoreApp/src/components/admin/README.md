# Admin Dialog Components

Bộ các component dialog chuyên dụng cho chức năng quản lý admin, đặc biệt là quản lý bình luận.

## 📦 Components

### 1. CommentDeleteDialog
Dialog xác nhận xóa bình luận với thông tin chi tiết và cảnh báo tác động.

**Features:**
- Hiển thị thông tin đầy đủ của bình luận
- Cảnh báo về tác động khi xóa (replies, likes)
- Loading state khi xử lý
- Responsive design

**Props:**
```typescript
interface CommentDeleteDialogProps {
  visible: boolean;
  comment: Comment | null;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
```

**Usage:**
```tsx
import CommentDeleteDialog from './CommentDeleteDialog';

<CommentDeleteDialog
  visible={deleteDialogVisible}
  comment={selectedComment}
  loading={deleteLoading}
  onConfirm={handleDelete}
  onCancel={handleCancel}
/>
```

### 2. CommentStatusDialog
Dialog xác nhận duyệt/từ chối bình luận.

**Features:**
- Hỗ trợ cả duyệt và từ chối
- Hiển thị tác động của hành động
- Preview bình luận
- Custom icons và colors

**Props:**
```typescript
interface CommentStatusDialogProps {
  visible: boolean;
  comment: Comment | null;
  action: 'approve' | 'reject';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
```

**Usage:**
```tsx
import CommentStatusDialog from './CommentStatusDialog';

// Duyệt bình luận
<CommentStatusDialog
  visible={approveDialogVisible}
  comment={selectedComment}
  action="approve"
  loading={loading}
  onConfirm={handleApprove}
  onCancel={handleCancel}
/>

// Từ chối bình luận
<CommentStatusDialog
  visible={rejectDialogVisible}
  comment={selectedComment}
  action="reject"
  loading={loading}
  onConfirm={handleReject}
  onCancel={handleCancel}
/>
```

### 3. AdvancedConfirmDialog
Dialog xác nhận nâng cao có thể tùy chỉnh nội dung.

**Features:**
- Custom content support
- Multiple types (danger, warning, info, success)
- Custom icons
- Loading state
- Scrollable content

**Props:**
```typescript
interface AdvancedConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  loading?: boolean;
  showIcon?: boolean;
  customIcon?: keyof typeof Ionicons.glyphMap;
  customContent?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}
```

**Usage:**
```tsx
import AdvancedConfirmDialog from '../common/AdvancedConfirmDialog';

<AdvancedConfirmDialog
  visible={dialogVisible}
  title="Xác nhận hành động"
  message="Bạn có chắc chắn muốn thực hiện hành động này?"
  type="warning"
  confirmText="Xác nhận"
  cancelText="Hủy"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
/>
```

## 🎨 Design Features

### Visual Elements
- **Icons**: Sử dụng Ionicons với màu sắc phù hợp
- **Colors**: Hệ thống màu nhất quán với COLORS constants
- **Typography**: Font sizes và weights theo SIZES constants
- **Spacing**: Padding và margins theo SIZES.spacing

### Interactive States
- **Loading**: Hiển thị loading state với icon và text
- **Disabled**: Disable buttons khi đang loading
- **Active**: Visual feedback khi touch

### Responsive Design
- **Max width**: 500px cho desktop, full width cho mobile
- **Max height**: 90% viewport height với scrollable content
- **Padding**: Responsive padding theo screen size

## 🔧 Integration

### Với ManageCommentsScreen
```tsx
// State management
const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);
const [deleteLoading, setDeleteLoading] = useState(false);

// Event handlers
const handleDeleteComment = (comment: Comment) => {
  setCommentToDelete(comment);
  setDeleteDialogVisible(true);
};

const confirmDeleteComment = async () => {
  if (!commentToDelete) return;
  
  try {
    setDeleteLoading(true);
    const response = await apiService.adminDeleteComment(commentToDelete.id);
    if (response.success) {
      // Handle success
      setDeleteDialogVisible(false);
      setCommentToDelete(null);
    }
  } catch (error) {
    // Handle error
  } finally {
    setDeleteLoading(false);
  }
};

// Render
<CommentDeleteDialog
  visible={deleteDialogVisible}
  comment={commentToDelete}
  loading={deleteLoading}
  onConfirm={confirmDeleteComment}
  onCancel={() => {
    setDeleteDialogVisible(false);
    setCommentToDelete(null);
  }}
/>
```

## 🎯 Best Practices

### 1. State Management
- Sử dụng separate state cho mỗi dialog
- Reset state khi đóng dialog
- Handle loading state properly

### 2. Error Handling
- Wrap API calls trong try-catch
- Show appropriate error messages
- Reset loading state trong finally block

### 3. UX Considerations
- Provide clear feedback cho user actions
- Show loading states cho long operations
- Use appropriate icons và colors
- Keep dialogs focused và concise

### 4. Performance
- Lazy load dialogs khi cần thiết
- Memoize expensive computations
- Avoid unnecessary re-renders

## 🚀 Future Enhancements

### Planned Features
- [ ] Animation transitions
- [ ] Keyboard shortcuts support
- [ ] Accessibility improvements
- [ ] Theme customization
- [ ] Multi-language support
- [ ] Undo functionality
- [ ] Bulk operations dialogs

### Customization Options
- [ ] Custom color schemes
- [ ] Custom animations
- [ ] Custom layouts
- [ ] Custom validation rules

## 📱 Demo

Xem file `DialogExamples.tsx` để có ví dụ đầy đủ về cách sử dụng các components này.

## 🤝 Contributing

Khi thêm tính năng mới:
1. Follow existing patterns
2. Update TypeScript interfaces
3. Add proper error handling
4. Include loading states
5. Test trên multiple screen sizes
6. Update documentation
