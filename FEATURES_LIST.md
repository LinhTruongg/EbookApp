# DANH SÁCH CHỨC NĂNG HỆ THỐNG EBOOK STORE

## 📋 TỔNG QUAN
Hệ thống Ebook Store được chia thành 2 phần chính: **Admin Panel** và **User App (Mobile)**

---

## 👨‍💼 PHẦN ADMIN

### 1. Dashboard & Analytics
- **Dashboard tổng quan**
  - Thống kê tổng số sách, người dùng, danh mục, bình luận, đánh giá
  - Thống kê số lượng sách mới trong 30 ngày gần nhất
  - Thống kê số lượng người dùng mới trong 30 ngày gần nhất
  - Thống kê số lượng phiên đọc
  - Biểu đồ tăng trưởng người dùng (User Growth Chart)
  - Biểu đồ doanh thu (Revenue Chart)
  
- **Hoạt động gần đây (Recent Activities)**
  - Xem log các hoạt động của admin
  - Theo dõi các thao tác quản lý

### 2. Quản lý Sách (Books Management)
- **Xem danh sách sách**
  - Xem tất cả sách (bao gồm cả sách không active)
  - Phân trang và tìm kiếm
  
- **Xem chi tiết sách**
  - Xem thông tin đầy đủ của sách
  
- **Thêm sách mới**
  - Tạo sách mới với thông tin: title, description, categoryId
  - Upload file PDF (hỗ trợ Base64)
  - Upload ảnh bìa sách
  
- **Cập nhật sách**
  - Chỉnh sửa thông tin sách
  - Cập nhật file PDF
  - Cập nhật ảnh bìa
  
- **Xóa sách**
  - Xóa sách khỏi hệ thống

### 3. Quản lý Tác giả (Authors Management)
- **Xem danh sách tác giả**
  - Xem tất cả tác giả
  - Tìm kiếm và phân trang
  
- **Xem chi tiết tác giả**
  - Xem thông tin tác giả
  
- **Thêm tác giả mới**
  - Tạo tác giả mới với thông tin: name, bio, avatar, nationality
  
- **Cập nhật tác giả**
  - Chỉnh sửa thông tin tác giả
  
- **Xóa tác giả**
  - Xóa tác giả khỏi hệ thống

### 4. Quản lý Danh mục (Categories Management)
- **Xem danh sách danh mục**
  - Xem tất cả danh mục (bao gồm cả không active)
  
- **Xem chi tiết danh mục**
  - Xem thông tin danh mục
  
- **Thêm danh mục mới**
  - Tạo danh mục mới
  
- **Cập nhật danh mục**
  - Chỉnh sửa thông tin danh mục
  
- **Xóa danh mục**
  - Xóa danh mục khỏi hệ thống

### 5. Quản lý Người dùng (Users Management)
- **Xem danh sách người dùng**
  - Xem tất cả người dùng
  - Phân trang và tìm kiếm
  
- **Xem chi tiết người dùng**
  - Xem thông tin đầy đủ của người dùng
  
- **Thêm người dùng mới**
  - Tạo tài khoản người dùng mới
  
- **Cập nhật người dùng**
  - Chỉnh sửa thông tin người dùng
  
- **Xóa người dùng**
  - Xóa người dùng khỏi hệ thống
  
- **Reset mật khẩu người dùng**
  - Đặt lại mật khẩu cho người dùng

### 6. Quản lý Bình luận (Comments Management)
- **Xem tất cả bình luận**
  - Xem danh sách tất cả bình luận trong hệ thống
  - Phân trang và lọc
  
- **Thống kê bình luận**
  - Xem thống kê tổng quan về bình luận
  
- **Duyệt/Từ chối bình luận**
  - Cập nhật trạng thái bình luận (approve/reject)
  
- **Xóa bình luận**
  - Xóa bình luận khỏi hệ thống

### 7. Quản lý Đánh giá (Reviews Management)
- **Xem danh sách đánh giá**
  - Quản lý các đánh giá của người dùng

---

## 👤 PHẦN USER (MOBILE APP)

### 1. Xác thực (Authentication)
- **Đăng ký tài khoản**
  - Đăng ký với thông tin: firstName, lastName, email, password
  - Tùy chọn: phone, dateOfBirth, gender
  
- **Đăng nhập**
  - Đăng nhập bằng email và password
  - Nhận JWT token và refresh token
  
- **Quên mật khẩu**
  - Gửi OTP qua email để reset mật khẩu
  - Xác thực OTP
  - Đặt lại mật khẩu mới
  
- **Đổi mật khẩu**
  - Đổi mật khẩu khi đã đăng nhập
  
- **Xác thực email**
  - Verify email qua token
  
- **Refresh token**
  - Làm mới access token

### 2. Trang chủ (Home)
- **Xem sách nổi bật (Featured Books)**
  - Danh sách sách được đánh dấu nổi bật
  
- **Xem sách bán chạy (Bestsellers)**
  - Danh sách sách bán chạy nhất
  
- **Xem sách mới phát hành (New Releases)**
  - Danh sách sách mới nhất
  
- **Xem tất cả sách**
  - Danh sách tất cả sách với phân trang
  - Lọc theo danh mục, đánh giá
  - Sắp xếp theo nhiều tiêu chí
  
- **Tìm kiếm sách**
  - Tìm kiếm sách theo từ khóa
  - Tìm trong title, description, subtitle

### 3. Thể loại (Categories)
- **Xem danh sách thể loại**
  - Xem tất cả thể loại sách
  
- **Xem sách theo thể loại**
  - Xem danh sách sách trong một thể loại cụ thể
  - Phân trang và lọc

### 4. Chi tiết Sách (Book Detail)
- **Xem thông tin sách**
  - Thông tin đầy đủ: title, description, authors, category
  - Xem đánh giá và bình luận
  - Xem rating trung bình
  
- **Xem sách gợi ý**
  - Xem sách gợi ý dựa trên thể loại
  
- **Thêm/Xóa khỏi Wishlist**
  - Thêm sách vào danh sách yêu thích
  - Xóa sách khỏi danh sách yêu thích
  
- **Mua sách**
  - Mua sách bằng điểm (points)
  - Kiểm tra xem đã sở hữu sách chưa

### 5. Đọc sách (Book Reader)
- **Đọc sách PDF**
  - Xem file PDF của sách
  - Tải file PDF từ Cloudinary (signed URL)
  
- **Theo dõi tiến độ đọc**
  - Lưu tiến độ đọc (progress %)
  - Lưu số trang hiện tại (pageNumber)
  - Lấy lại phiên đọc (reading session)
  
- **Đánh dấu hoàn thành**
  - Đánh dấu sách đã đọc xong (100%)

### 6. Thư viện (Library)
- **Xem thư viện sách**
  - Xem tất cả sách đã mua/sở hữu
  - Phân loại theo: all, reading, completed, favorited
  - Phân trang và sắp xếp
  
- **Xem thư viện theo danh mục**
  - Xem sách đang đọc (1-99% progress)
  - Xem sách yêu thích (favorited)
  - Xem sách đã hoàn thành (100% progress)
  - Xem sách chưa đọc (0% progress)
  - Thống kê: tổng số sách, số sách đang đọc, đã hoàn thành, yêu thích, chưa đọc

### 7. Wishlist
- **Xem danh sách yêu thích**
  - Xem tất cả sách trong wishlist
  - Phân trang

### 8. Đánh giá & Bình luận
- **Đánh giá sách (Ratings)**
  - Tạo/cập nhật đánh giá (1-5 sao)
  - Xem đánh giá của mình
  - Xem thống kê đánh giá của sách
  - Xóa đánh giá
  
- **Bình luận sách (Comments)**
  - Xem bình luận của sách
  - Tạo bình luận mới
  - Trả lời bình luận (nested comments)
  - Chỉnh sửa bình luận của mình
  - Xóa bình luận của mình
  - Like/Unlike bình luận
  - Xem thống kê bình luận của sách

### 9. Hồ sơ (Profile)
- **Xem hồ sơ**
  - Xem thông tin cá nhân
  - Xem thống kê đọc sách
  
- **Chỉnh sửa hồ sơ**
  - Cập nhật: firstName, lastName, phone, dateOfBirth, gender
  - Cập nhật address, readingPreferences, favoriteCategories
  - Upload/đổi avatar (hỗ trợ Base64)

### 10. Ví điểm (Wallet)
- **Xem số dư**
  - Xem số điểm hiện có
  
- **Nạp điểm**
  - Nạp điểm bằng Stripe Payment
  - Tạo payment intent
  - Chuyển đổi tiền thành điểm (points)
  
- **Mua sách bằng điểm**
  - Mua sách từ điểm trong ví
  - Tự động thêm vào thư viện sau khi mua
  
- **Xem lịch sử giao dịch**
  - Xem tất cả giao dịch: nạp điểm, mua sách
  - Phân trang
  - Xem chi tiết: loại giao dịch, số điểm, số dư sau giao dịch, mô tả

### 11. Tìm kiếm (Search)
- **Tìm kiếm sách**
  - Tìm kiếm sách theo từ khóa
  - Hiển thị kết quả tìm kiếm

---

## 🔧 CÁC TÍNH NĂNG KỸ THUẬT

### Backend
- **API Documentation (Swagger)**
  - Tài liệu API tại `/api-docs`
  
- **Health Check**
  - Endpoint kiểm tra trạng thái server tại `/health`
  
- **File Upload**
  - Upload file lên Cloudinary
  - Hỗ trợ Base64 encoding
  - Signed URL cho download
  
- **Activity Logging**
  - Ghi log các hoạt động của admin
  
- **Authentication & Authorization**
  - JWT token authentication
  - Role-based access control (admin/user)
  - Refresh token mechanism

### Frontend (Mobile App)
- **Navigation**
  - Expo Router với file-based routing
  - Tab navigation cho user
  - Stack navigation cho admin
  
- **State Management**
  - React Context cho authentication
  - React Query cho data fetching
  
- **Payment Integration**
  - Stripe integration cho thanh toán

---

## 📊 THỐNG KÊ TỔNG QUAN

### Admin Features: **7 nhóm chức năng chính**
1. Dashboard & Analytics
2. Quản lý Sách
3. Quản lý Tác giả
4. Quản lý Danh mục
5. Quản lý Người dùng
6. Quản lý Bình luận
7. Quản lý Đánh giá

### User Features: **11 nhóm chức năng chính**
1. Xác thực (6 chức năng)
2. Trang chủ (5 chức năng)
3. Thể loại (2 chức năng)
4. Chi tiết Sách (5 chức năng)
5. Đọc sách (3 chức năng)
6. Thư viện (2 chức năng)
7. Wishlist (1 chức năng)
8. Đánh giá & Bình luận (8 chức năng)
9. Hồ sơ (2 chức năng)
10. Ví điểm (4 chức năng)
11. Tìm kiếm (1 chức năng)

---

## 📝 GHI CHÚ

- Hệ thống sử dụng **điểm (points)** thay vì tiền để mua sách
- File sách được lưu trữ trên **Cloudinary**
- Hệ thống hỗ trợ **nested comments** (bình luận có thể trả lời)
- Admin có thể **duyệt/từ chối** bình luận trước khi hiển thị
- Hệ thống theo dõi **tiến độ đọc** và **phiên đọc** của người dùng
- Hỗ trợ **đánh dấu yêu thích** sách trong thư viện
- Có hệ thống **activity logging** cho admin

