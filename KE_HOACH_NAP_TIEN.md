# Kế Hoạch Xây Dựng Tính Năng Nạp Tiền & Mua Sách Có Phí

## 📋 Tổng Quan

Xây dựng hệ thống ví điện tử và thanh toán để người dùng có thể nạp tiền và mua sách có tính phí.

---

## 🗄️ PHASE 1: Backend - Database & Models

### 1.1. Cập Nhật User Model
**File**: `backend-api/models/user.js`

**Thay đổi:**
- Thêm trường `balance` (DECIMAL 10,2) - số dư ví
- Thêm trường `totalDeposit` (DECIMAL 10,2) - tổng tiền đã nạp
- Thêm trường `totalSpent` (DECIMAL 10,2) - tổng tiền đã chi

**Migration cần tạo:**
- Migration để thêm các trường mới vào bảng `users`

### 1.2. Cập Nhật Book Model
**File**: `backend-api/models/book.js`

**Thay đổi:**
- Thêm trường `price` (DECIMAL 10,2) - giá sách
- Thêm trường `isFree` (BOOLEAN) - sách miễn phí hay có phí
- Thêm trường `currency` (STRING, default: 'VND') - loại tiền tệ

**Migration cần tạo:**
- Migration để thêm các trường mới vào bảng `books`

### 1.3. Tạo Transaction Model (Mới)
**File**: `backend-api/models/transaction.js`

**Các trường:**
- `id` (INTEGER, PRIMARY KEY)
- `userId` (INTEGER, FOREIGN KEY -> users)
- `type` (ENUM: 'deposit', 'purchase', 'refund')
- `amount` (DECIMAL 10,2)
- `status` (ENUM: 'pending', 'completed', 'failed', 'cancelled')
- `paymentMethod` (STRING) - 'bank_transfer', 'momo', 'zalopay', 'viettelpay', etc.
- `transactionCode` (STRING, UNIQUE) - mã giao dịch
- `description` (TEXT)
- `bookId` (INTEGER, FOREIGN KEY -> books, nullable) - null nếu là deposit
- `metadata` (JSON) - thông tin bổ sung (payment gateway response, etc.)
- `createdAt`, `updatedAt`

**Migration cần tạo:**
- Migration để tạo bảng `transactions`

### 1.4. Tạo Payment Method Model (Mới - Optional)
**File**: `backend-api/models/paymentmethod.js`

**Các trường:**
- `id` (INTEGER, PRIMARY KEY)
- `userId` (INTEGER, FOREIGN KEY -> users)
- `type` (ENUM: 'bank_account', 'momo', 'zalopay', 'viettelpay')
- `accountNumber` (STRING) - số tài khoản/số điện thoại
- `accountName` (STRING) - tên chủ tài khoản
- `isDefault` (BOOLEAN)
- `isActive` (BOOLEAN)
- `createdAt`, `updatedAt`

**Migration cần tạo:**
- Migration để tạo bảng `payment_methods`

---

## 🔌 PHASE 2: Backend - API Routes & Controllers

### 2.1. Tạo Wallet Routes
**File mới**: `backend-api/routes/wallet.js`

**Endpoints:**
```
GET    /api/wallet/balance          - Lấy số dư hiện tại
GET    /api/wallet/transactions     - Lấy lịch sử giao dịch
POST   /api/wallet/deposit          - Tạo yêu cầu nạp tiền
GET    /api/wallet/deposit/:id      - Kiểm tra trạng thái nạp tiền
POST   /api/wallet/verify-deposit   - Xác minh nạp tiền (webhook từ payment gateway)
```

### 2.2. Tạo Payment Routes
**File mới**: `backend-api/routes/payments.js`

**Endpoints:**
```
POST   /api/payments/purchase-book  - Mua sách
POST   /api/payments/refund         - Hoàn tiền (admin only)
GET    /api/payments/history        - Lịch sử thanh toán
```

### 2.3. Tạo Wallet Controller
**File mới**: `backend-api/controllers/walletController.js`

**Các method:**
- `getBalance(req, res)` - Lấy số dư
- `getTransactions(req, res)` - Lấy lịch sử giao dịch (có pagination)
- `createDeposit(req, res)` - Tạo yêu cầu nạp tiền
- `checkDepositStatus(req, res)` - Kiểm tra trạng thái nạp tiền
- `verifyDeposit(req, res)` - Xác minh nạp tiền (từ webhook)

### 2.4. Tạo Payment Controller
**File mới**: `backend-api/controllers/paymentController.js`

**Các method:**
- `purchaseBook(req, res)` - Mua sách
- `refundTransaction(req, res)` - Hoàn tiền (admin only)
- `getPaymentHistory(req, res)` - Lịch sử thanh toán

### 2.5. Cập Nhật Book Controller
**File**: `backend-api/controllers/bookController.js`

**Thay đổi:**
- Cập nhật `getBookById` để kiểm tra quyền truy cập (free vs paid)
- Thêm method kiểm tra user đã mua sách chưa

### 2.6. Cập Nhật User Library Controller
**File**: `backend-api/controllers/users.js`

**Thay đổi:**
- Khi thêm sách vào library, kiểm tra xem sách có phí hay không
- Nếu có phí, yêu cầu thanh toán trước

---

## 🏦 PHASE 3: Backend - Payment Gateway Integration

### 3.1. Tạo Payment Service
**File mới**: `backend-api/services/paymentService.js`

**Các method:**
- `generateTransactionCode()` - Tạo mã giao dịch duy nhất
- `processDeposit(amount, paymentMethod, userId)` - Xử lý nạp tiền
- `processPurchase(bookId, userId)` - Xử lý mua sách
- `verifyTransaction(transactionCode)` - Xác minh giao dịch

### 3.2. Tích hợp Payment Gateway (Tùy chọn)
**Các phương thức thanh toán phổ biến ở Việt Nam:**
- **MoMo** (MoMo Payment Gateway)
- **ZaloPay** (ZaloPay API)
- **ViettelPay**
- **Bank Transfer** (Chuyển khoản ngân hàng - manual verification)

**File mới**: `backend-api/services/gateways/`
- `momoService.js`
- `zalopayService.js`
- `viettelpayService.js`
- `bankTransferService.js`

**Lưu ý**: Cần API keys và credentials từ các nhà cung cấp

### 3.3. Webhook Handlers
**File mới**: `backend-api/routes/webhooks.js`

**Endpoints:**
```
POST   /api/webhooks/momo           - Webhook từ MoMo
POST   /api/webhooks/zalopay       - Webhook từ ZaloPay
POST   /api/webhooks/viettelpay    - Webhook từ ViettelPay
```

---

## 📱 PHASE 4: Frontend - React Native Screens

### 4.1. Wallet Screen
**File mới**: `EBookStoreApp/src/screens/wallet/WalletScreen.tsx`

**Chức năng:**
- Hiển thị số dư hiện tại
- Button "Nạp tiền"
- Lịch sử giao dịch (gần đây)
- Button "Xem tất cả" để xem đầy đủ lịch sử

### 4.2. Deposit Screen
**File mới**: `EBookStoreApp/src/screens/wallet/DepositScreen.tsx`

**Chức năng:**
- Form nhập số tiền muốn nạp
- Chọn phương thức thanh toán (MoMo, ZaloPay, Bank Transfer, etc.)
- Hiển thị thông tin chuyển khoản (nếu chọn bank transfer)
- QR code hoặc link thanh toán (nếu dùng e-wallet)
- Kiểm tra trạng thái nạp tiền

### 4.3. Transaction History Screen
**File mới**: `EBookStoreApp/src/screens/wallet/TransactionHistoryScreen.tsx`

**Chức năng:**
- Danh sách tất cả giao dịch (pagination)
- Filter theo loại (nạp tiền, mua sách, hoàn tiền)
- Filter theo trạng thái (thành công, đang xử lý, thất bại)
- Chi tiết từng giao dịch

### 4.4. Purchase Book Screen/Modal
**File mới**: `EBookStoreApp/src/screens/book/PurchaseBookScreen.tsx`

**Hoặc cập nhật**: `EBookStoreApp/src/screens/book/BookReader/BookReaderScreen.tsx`

**Chức năng:**
- Hiển thị thông tin sách và giá
- Kiểm tra số dư hiện tại
- Nút "Mua ngay" hoặc "Nạp tiền nếu không đủ"
- Xử lý thanh toán và thêm sách vào library sau khi mua thành công

### 4.5. Cập Nhật Book Detail Screen
**File**: `EBookStoreApp/src/screens/book/BookDetailScreen.tsx` (nếu có)

**Thay đổi:**
- Hiển thị giá sách
- Nút "Đọc miễn phí" nếu sách free
- Nút "Mua sách" nếu sách có phí
- Kiểm tra xem user đã mua chưa

---

## 🔧 PHASE 5: Frontend - API Services

### 5.1. Cập Nhật API Service
**File**: `EBookStoreApp/src/services/api.ts`

**Thêm các method:**

```typescript
// Wallet methods
async getWalletBalance(): Promise<ApiResponse<{ balance: number }>>
async getTransactions(params?: { page?, limit?, type?, status? }): Promise<ApiResponse<Transaction[]>>
async createDeposit(data: { amount: number, paymentMethod: string }): Promise<ApiResponse<DepositResponse>>
async checkDepositStatus(transactionId: string): Promise<ApiResponse<Transaction>>

// Payment methods
async purchaseBook(bookId: string): Promise<ApiResponse<PurchaseResponse>>
async getPaymentHistory(params?: { page?, limit? }): Promise<ApiResponse<Transaction[]>>
```

### 5.2. Thêm Types
**File**: `EBookStoreApp/src/types/index.ts`

**Thêm các interface:**

```typescript
export interface Transaction {
  id: number;
  userId: number;
  type: 'deposit' | 'purchase' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: string;
  transactionCode: string;
  description: string;
  bookId?: number;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface DepositResponse {
  transactionId: string;
  qrCode?: string;
  paymentUrl?: string;
  bankInfo?: {
    accountNumber: string;
    accountName: string;
    bankName: string;
    amount: number;
    content: string;
  };
}

export interface PurchaseResponse {
  success: boolean;
  transactionId: string;
  bookId: string;
  message: string;
}
```

### 5.3. Cập Nhật Constants
**File**: `EBookStoreApp/src/constants/api.ts`

**Thêm endpoints:**

```typescript
WALLET: {
  BALANCE: '/wallet/balance',
  TRANSACTIONS: '/wallet/transactions',
  DEPOSIT: '/wallet/deposit',
  DEPOSIT_STATUS: '/wallet/deposit/:id',
},
PAYMENTS: {
  PURCHASE_BOOK: '/payments/purchase-book',
  REFUND: '/payments/refund',
  HISTORY: '/payments/history',
}
```

---

## 🎨 PHASE 6: Frontend - UI Components

### 6.1. Wallet Card Component
**File mới**: `EBookStoreApp/src/components/wallet/WalletCard.tsx`

**Hiển thị:**
- Số dư ví
- Icon/Design đẹp

### 6.2. Transaction Item Component
**File mới**: `EBookStoreApp/src/components/wallet/TransactionItem.tsx`

**Hiển thị:**
- Loại giao dịch (icon + màu sắc)
- Số tiền
- Trạng thái
- Thời gian
- Mô tả

### 6.3. Payment Method Selector
**File mới**: `EBookStoreApp/src/components/wallet/PaymentMethodSelector.tsx`

**Chức năng:**
- Radio buttons hoặc cards để chọn phương thức thanh toán
- Hiển thị logo của từng phương thức

### 6.4. Amount Input Component
**File mới**: `EBookStoreApp/src/components/wallet/AmountInput.tsx`

**Chức năng:**
- Input số tiền với format VND
- Quick select buttons (50k, 100k, 200k, 500k, 1M)

---

## 🔐 PHASE 7: Security & Validation

### 7.1. Backend Validation
- Validate số tiền nạp (min, max)
- Validate số dư khi mua sách
- Prevent duplicate transactions
- Verify transaction signatures từ payment gateways

### 7.2. Rate Limiting
- Giới hạn số lần nạp tiền trong 1 khoảng thời gian
- Giới hạn số lần kiểm tra trạng thái giao dịch

### 7.3. Transaction Security
- Mã hóa thông tin giao dịch nhạy cảm
- Log tất cả các hoạt động liên quan đến tiền
- Xác thực webhook từ payment gateways

---

## 📊 PHASE 8: Admin Features (Optional)

### 8.1. Admin Transaction Management
**File**: `backend-api/routes/admin.js`

**Thêm endpoints:**
```
GET    /api/admin/transactions      - Xem tất cả giao dịch
PUT    /api/admin/transactions/:id/status - Cập nhật trạng thái giao dịch (manual)
GET    /api/admin/revenue          - Thống kê doanh thu
```

### 8.2. Admin Dashboard Updates
- Thêm metrics về doanh thu
- Thống kê giao dịch theo ngày/tuần/tháng
- Top sách bán chạy

---

## 🧪 PHASE 9: Testing

### 9.1. Backend Tests
- Unit tests cho controllers
- Integration tests cho payment flow
- Webhook tests

### 9.2. Frontend Tests
- Component tests
- Integration tests cho purchase flow

---

## 📝 PHASE 10: Documentation

### 10.1. API Documentation
- Cập nhật Swagger/OpenAPI docs
- Document các payment gateway endpoints

### 10.2. User Guide
- Hướng dẫn nạp tiền
- Hướng dẫn mua sách

---

## 🚀 Triển Khai Theo Thứ Tự Ưu Tiên

### Giai Đoạn 1 (Core Functionality)
1. ✅ Cập nhật database models (User balance, Book price, Transaction)
2. ✅ Tạo transaction model và migration
3. ✅ API endpoints cơ bản (get balance, deposit, purchase)
4. ✅ Wallet screen trên mobile
5. ✅ Deposit screen với bank transfer (manual)

### Giai Đoạn 2 (Payment Integration)
6. ✅ Tích hợp 1 payment gateway (ví dụ: MoMo)
7. ✅ Webhook handlers
8. ✅ Transaction history screen
9. ✅ Purchase flow hoàn chỉnh

### Giai Đoạn 3 (Enhancement)
10. ✅ Thêm các payment gateways khác
11. ✅ Admin dashboard
12. ✅ Advanced features (refund, vouchers, etc.)

---

## 📌 Lưu Ý Quan Trọng

1. **Security**: Xử lý tiền bạc cần rất cẩn thận về bảo mật
2. **Testing**: Test kỹ các flow thanh toán trước khi deploy production
3. **Error Handling**: Xử lý tốt các trường hợp lỗi và edge cases
4. **User Experience**: Làm rõ ràng quy trình nạp tiền và mua sách
5. **Compliance**: Tuân thủ các quy định về thanh toán điện tử ở Việt Nam
6. **Backup**: Luôn có backup và rollback plan cho database
7. **Monitoring**: Theo dõi các giao dịch và log mọi thứ

---

## 🔗 Dependencies Cần Thêm

### Backend
```json
{
  "axios": "^1.x.x",  // Nếu chưa có - cho payment gateway API calls
  "crypto": "^1.x.x"  // Nếu chưa có - cho transaction signing
}
```

### Frontend
- Có thể cần thêm thư viện để hiển thị QR code
- Có thể cần thêm thư viện để format số tiền VND

---

## 📞 Liên Hệ Payment Gateways

Cần đăng ký và lấy credentials từ:
- **MoMo**: https://developers.momo.vn/
- **ZaloPay**: https://developers.zalopay.vn/
- **ViettelPay**: https://viettelpay.vn/

---

**Ngày tạo**: 2025-01-XX
**Phiên bản**: 1.0

