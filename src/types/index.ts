export type RoleCrap = 'CAP_1_BQT' | 'CAP_2_NGANH' | 'CAP_3_HT';

export type ChucVu =
  | 'Cha Tuyên Úy'
  | 'Xứ Đoàn Trưởng'
  | 'Phó Quản Trị'
  | 'Phó Nghiên Huấn'
  | 'Thủ Quỹ'
  | 'Thư Ký'
  | 'Trưởng Ngành'
  | 'Phó Ngành'
  | 'Huynh Trưởng Phụ Trách';

export type NganhCode = 'CHIEN' | 'AU' | 'THIEU' | 'NGHIA' | 'HIEP' | 'DU_TRUONG';

export interface NganhInfo {
  code: NganhCode;
  ten: string;
  khanMau: string; // Màu khăn quàng TNTT
  bgClass: string;
  textClass: string;
  borderClass: string;
  moTaDoTuoi: string;
}

export interface KhoiInfo {
  id: string;
  nganhCode: NganhCode;
  tenKhoi: string;
  namTuoi: number;
}

export interface LopInfo {
  id: string;
  khoiId: string;
  nganhCode: NganhCode;
  tenLop: string;
  phongHoc?: string;
  huynhTruongPhuTrach: string[]; // Danh sách tên Huynh Trưởng
  siSo: number;
}

export interface ThieuNhi {
  id: string;
  maDinhDanh: string; // VD: TN-2015-0142
  tenThanh: string; // Giuse, Maria, Têrêsa...
  hoVaTen: string;
  hoVaTenKhongDau: string;
  ngaySinh: string; // YYYY-MM-DD
  gioiTinh: 'Nam' | 'Nữ';
  tenBo?: string;
  sdtBo?: string;
  tenMe?: string;
  sdtMe?: string;
  sdtChinh: string; // SĐT định danh duy nhất của phụ huynh (10 số chuẩn hóa)
  diaChi?: string;
  giaoHo?: string;
  lopId: string;
  anhDaiDien?: string;
  tongDiemChuyenCan: number;
  trangThai: 'DangHoc' | 'NghiHoc' | 'ChuyenXu';
  ngayTao: string;
}

export type ThuTrongTuan =
  | 'ThuHai'
  | 'ThuBa'
  | 'ThuTu'
  | 'ThuNam'
  | 'ThuSau'
  | 'ThuBay'
  | 'ChuaNhat';

export type CaLe = 'LE_SANG' | 'LE_CHIEU' | 'LE_CHUA_NHAT';

export interface DiemDanhRecord {
  id: string;
  thieuNhiId: string;
  ngay: string; // YYYY-MM-DD
  thuTrongTuan: ThuTrongTuan;
  caLe: CaLe;
  thamDuLe: boolean;
  thamDuGiaoLy: boolean; // Chỉ áp dụng ngày Chúa Nhật
  thoiGianQuet: string; // ISO String
  nguoiQuetTen: string;
  phuongThuc: 'QR_SCAN' | 'THU_CONG';
  diemCong: number;
}

export interface DuplicateCheckResult {
  hasDuplicate: boolean;
  isHardMatch: boolean; // Trùng đồng thời SĐT + Họ tên + Ngày sinh -> Chặn cứng
  isSoftMatch: boolean; // Trùng Họ tên + Ngày sinh (khác SĐT) hoặc Trùng SĐT + Ngày sinh (lệch tên) -> Cảnh báo
  matchedStudents: ThieuNhi[];
  message: string;
}

export interface UserAccount {
  id: string;
  tenThanh: string;
  hoVaTen: string;
  soDienThoai: string;
  vaiTro: RoleCrap;
  chucVu: ChucVu;
  nganhPhuTrach?: NganhCode;
  lopPhuTrachIds?: string[];
}
