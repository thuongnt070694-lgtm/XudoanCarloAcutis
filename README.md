# HỆ THỐNG QUẢN LÝ GIÁO LÝ & THIẾU NHI THÁNH THỂ (XỨ ĐOÀN)

Ứng dụng Web App đa nền tảng (chạy mượt trên cả Máy tính Desktop và Điện thoại Huynh Trưởng) xây dựng trên nền tảng **Next.js (App Router)**, **TypeScript** và **Tailwind CSS**.

---

## 🌟 TÍNH NĂNG NỔI BẬT ĐÃ HOÀN THIỆN

### 1. Quản lý Quy mô 2.000 Thiếu Nhi & 100 Huynh Trưởng
- Cơ cấu 3 cấp chuẩn phong trào Thiếu Nhi Thánh Thể:
  - **Cấp 1**: Cha Tuyên Úy / Quản Xứ, Xứ Đoàn Trưởng, Phó Quản Trị, Phó Nghiên Huấn, Thủ Quỹ, Thư Ký.
  - **Cấp 2**: Trưởng Ngành & Phó Ngành (Chiên Con, Ấu Nhi, Thiếu Nhi, Nghĩa Sĩ, Hiệp Sĩ, Dự Trưởng).
  - **Cấp 3**: Khối & Lớp (VD: Khối Thiếu 1 -> Lớp Thiếu 1A, Thiếu 1B...).

### 2. Thuật toán Chống Trùng Lặp 2 Tầng Thông Minh
- **Tầng 1 (Chặn Cứng - Hard Match)**: Tự động khóa và chặn lưu khi phát hiện trùng cả 3 thông tin: **Họ và Tên + Ngày Sinh + Số Điện Thoại Phụ Huynh**.
- **Tầng 2 (Cảnh báo Đối Chiếu - Soft Match)**: Khi nhập hồ sơ trùng Họ tên + Ngày sinh (nhưng khác SĐT) hoặc trùng SĐT + Ngày sinh (tên lệch dấu hoặc ký tự), hệ thống bật modal bảng so sánh 2 cột để người quản trị kiểm tra xem đây là anh em sinh đôi hay nhập nhầm.

### 3. Sinh Mã QR Định Danh Duy Nhất (Unique Student Code)
- Thuật toán sinh mã dựa vào: `[Tiền Tố Ngành]-[Năm Sinh]-[Mã Băm FNV-1a Họ Tên + SĐT]-[Số Thứ Tự]`.
- Mã QR chứa payload bảo mật an toàn, tránh để lộ số điện thoại phụ huynh khi quét bằng camera thông thường.

### 4. Quy Chế Điểm Danh Chuyên Cần & Khen Thưởng
- **Chúa Nhật**: Điểm danh kép (**Thánh Lễ + Giáo Lý**). Mặc định tích chọn cả 2 (+20đ). Nếu em chỉ đi 1 trong 2, Huynh trưởng chỉ cần chạm 1 chạm để bỏ tick.
- **Ngày thường (Thứ 2 đến Thứ 7)**: Hỗ trợ điểm danh chuyên cần lễ ngày thường (+5đ/lễ), giới hạn **tối đa 2 ca lễ / ngày** (Lễ Sáng & Lễ Chiều). Quét đến lần thứ 3 sẽ tự động báo rung cảnh báo.
- **Bảng Vàng Thi Đua**: Tự động xếp hạng Top đoàn sinh siêng năng theo Tuần, Tháng và Năm.

### 5. Xuất File In Thẻ Đeo Hoàn Chỉnh Ra PDF (Ready-to-print)
- Thẻ đeo được thiết kế trang trọng: Đầy đủ **Logo Phong trào TNTT**, **Tên Thánh** (chữ đỏ nổi bật), **Họ và Tên**, **Ngành/Khối/Lớp**, **Khẩu hiệu TNTT**, **Ảnh thẻ 3x4** và **Mã QR sắc nét**.
- Tối ưu hóa in ấn `@media print`: Bố cục tự động dàn trang lưới chuẩn giấy A4 (mỗi tờ 4-6 thẻ), người dùng chỉ cần bấm **"In Thẻ / Xuất PDF"** (Ctrl+P) là có thể gửi xưởng in ngay.

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY ỨNG DỤNG

### Bước 1: Mở Terminal tại thư mục dự án
```bash
cd d:\QUANLYNHANSU
```

### Bước 2: Cài đặt các thư viện cần thiết
```bash
npm install
```

### Bước 3: Khởi chạy môi trường phát triển (Dev Server)
```bash
npm run dev
```

### Bước 4: Trải nghiệm ứng dụng
Mở trình duyệt web (Chrome, Edge, Safari...) và truy cập:
```
http://localhost:3000
```

> **Mẹo trên điện thoại của Huynh Trưởng:**
> Khi mở trang web trên điện thoại (iPhone hoặc Android), Huynh Trưởng có thể chọn **"Thêm vào màn hình chính"** (Add to Home Screen) để sử dụng như một App độc lập toàn màn hình rất mượt mà!
