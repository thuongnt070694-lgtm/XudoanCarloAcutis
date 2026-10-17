import { NganhInfo, KhoiInfo, LopInfo, NganhCode } from '@/types';

export const DANH_SACH_NGANH: NganhInfo[] = [
  {
    code: 'CHIEN',
    ten: 'Ngành Chiên Con',
    khanMau: 'Hồng viền vàng',
    bgClass: 'bg-pink-100 text-pink-800 border-pink-300',
    textClass: 'text-pink-600',
    borderClass: 'border-pink-500',
    moTaDoTuoi: 'Độ tuổi 4 - 6 tuổi',
  },
  {
    code: 'AU',
    ten: 'Ngành Ấu Nhi',
    khanMau: 'Xanh lá cây viền vàng',
    bgClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    textClass: 'text-emerald-600',
    borderClass: 'border-emerald-500',
    moTaDoTuoi: 'Độ tuổi 7 - 9 tuổi (Xưng tội & Rước lễ lần đầu)',
  },
  {
    code: 'THIEU',
    ten: 'Ngành Thiếu Nhi',
    khanMau: 'Xanh biển viền vàng',
    bgClass: 'bg-blue-100 text-blue-800 border-blue-300',
    textClass: 'text-blue-600',
    borderClass: 'border-blue-500',
    moTaDoTuoi: 'Độ tuổi 10 - 12 tuổi (Thêm sức)',
  },
  {
    code: 'NGHIA',
    ten: 'Ngành Nghĩa Sĩ',
    khanMau: 'Vàng viền đỏ',
    bgClass: 'bg-amber-100 text-amber-800 border-amber-300',
    textClass: 'text-amber-600',
    borderClass: 'border-amber-500',
    moTaDoTuoi: 'Độ tuổi 13 - 15 tuổi (Bao đồng)',
  },
  {
    code: 'HIEP',
    ten: 'Ngành Hiệp Sĩ',
    khanMau: 'Nâu viền vàng',
    bgClass: 'bg-stone-200 text-stone-800 border-stone-400',
    textClass: 'text-stone-700',
    borderClass: 'border-stone-600',
    moTaDoTuoi: 'Độ tuổi 16 - 17 tuổi (Vào đời)',
  },
  {
    code: 'DU_TRUONG',
    ten: 'Ngành Dự Trưởng',
    khanMau: 'Đỏ viền trắng',
    bgClass: 'bg-red-100 text-red-800 border-red-300',
    textClass: 'text-red-600',
    borderClass: 'border-red-500',
    moTaDoTuoi: 'Độ tuổi 18+ (Đào tạo Huynh Trưởng tương lai)',
  },
];

export const DANH_SACH_KHOI: KhoiInfo[] = [
  // Chiên
  { id: 'khoi-chien-1', nganhCode: 'CHIEN', tenKhoi: 'Khối Chiên Con 1', namTuoi: 4 },
  { id: 'khoi-chien-2', nganhCode: 'CHIEN', tenKhoi: 'Khối Chiên Con 2', namTuoi: 5 },
  // Ấu
  { id: 'khoi-au-1', nganhCode: 'AU', tenKhoi: 'Khối Ấu Nhi 1', namTuoi: 7 },
  { id: 'khoi-au-2', nganhCode: 'AU', tenKhoi: 'Khối Ấu Nhi 2', namTuoi: 8 },
  { id: 'khoi-au-3', nganhCode: 'AU', tenKhoi: 'Khối Ấu Nhi 3', namTuoi: 9 },
  // Thiếu
  { id: 'khoi-thieu-1', nganhCode: 'THIEU', tenKhoi: 'Khối Thiếu Nhi 1', namTuoi: 10 },
  { id: 'khoi-thieu-2', nganhCode: 'THIEU', tenKhoi: 'Khối Thiếu Nhi 2', namTuoi: 11 },
  { id: 'khoi-thieu-3', nganhCode: 'THIEU', tenKhoi: 'Khối Thiếu Nhi 3', namTuoi: 12 },
  // Nghĩa
  { id: 'khoi-nghia-1', nganhCode: 'NGHIA', tenKhoi: 'Khối Nghĩa Sĩ 1', namTuoi: 13 },
  { id: 'khoi-nghia-2', nganhCode: 'NGHIA', tenKhoi: 'Khối Nghĩa Sĩ 2', namTuoi: 14 },
  { id: 'khoi-nghia-3', nganhCode: 'NGHIA', tenKhoi: 'Khối Nghĩa Sĩ 3', namTuoi: 15 },
  // Hiệp
  { id: 'khoi-hiep-1', nganhCode: 'HIEP', tenKhoi: 'Khối Hiệp Sĩ 1', namTuoi: 16 },
  { id: 'khoi-hiep-2', nganhCode: 'HIEP', tenKhoi: 'Khối Hiệp Sĩ 2', namTuoi: 17 },
  // Dự Trưởng
  { id: 'khoi-du-truong-1', nganhCode: 'DU_TRUONG', tenKhoi: 'Khối Dự Trưởng 1', namTuoi: 18 },
];

export const DANH_SACH_LOP_BAN_DAU: LopInfo[] = [
  // Khối Thiếu 1
  {
    id: 'lop-thieu-1a',
    khoiId: 'khoi-thieu-1',
    nganhCode: 'THIEU',
    tenLop: 'Thiếu 1A',
    phongHoc: 'Phòng B201',
    huynhTruongPhuTrach: ['HT. Giuse Nguyễn Hữu Nghĩa', 'HT. Maria Trần Thu Thảo'],
    siSo: 35,
  },
  {
    id: 'lop-thieu-1b',
    khoiId: 'khoi-thieu-1',
    nganhCode: 'THIEU',
    tenLop: 'Thiếu 1B',
    phongHoc: 'Phòng B202',
    huynhTruongPhuTrach: ['HT. Phêrô Lê Minh Đức', 'HT. Anna Vũ Thanh Mai'],
    siSo: 38,
  },
  // Khối Thiếu 2
  {
    id: 'lop-thieu-2a',
    khoiId: 'khoi-thieu-2',
    nganhCode: 'THIEU',
    tenLop: 'Thiếu 2A',
    phongHoc: 'Phòng B203',
    huynhTruongPhuTrach: ['HT. Gioan Baotixita Hoàng Nam'],
    siSo: 32,
  },
  {
    id: 'lop-thieu-2b',
    khoiId: 'khoi-thieu-2',
    nganhCode: 'THIEU',
    tenLop: 'Thiếu 2B',
    phongHoc: 'Phòng B204',
    huynhTruongPhuTrach: ['HT. Catarina Phạm Quỳnh Nga'],
    siSo: 34,
  },
  // Khối Ấu 1 & 2
  {
    id: 'lop-au-1a',
    khoiId: 'khoi-au-1',
    nganhCode: 'AU',
    tenLop: 'Ấu 1A',
    phongHoc: 'Phòng A101',
    huynhTruongPhuTrach: ['HT. Têrêsa Đỗ Bích Ngọc', 'HT. Giuse Vũ Đình Trọng'],
    siSo: 30,
  },
  {
    id: 'lop-au-2a',
    khoiId: 'khoi-au-2',
    nganhCode: 'AU',
    tenLop: 'Ấu 2A',
    phongHoc: 'Phòng A102',
    huynhTruongPhuTrach: ['HT. Phaolô Bùi Tuấn Anh'],
    siSo: 33,
  },
  // Khối Nghĩa 1
  {
    id: 'lop-nghia-1a',
    khoiId: 'khoi-nghia-1',
    nganhCode: 'NGHIA',
    tenLop: 'Nghĩa 1A',
    phongHoc: 'Phòng C301',
    huynhTruongPhuTrach: ['HT. Antôn Đặng Thế Hùng'],
    siSo: 28,
  },
];

export const DIEM_THUONG = {
  LE_CHUA_NHAT: 10,
  GIAO_LY_CHUA_NHAT: 10,
  LE_NGAY_THUONG: 5, // Mỗi ca lễ ngày thường
  MAX_LE_NGAY_THUONG: 2, // Tối đa 2 lễ/ngày từ T2 - T7
};

export const TEN_XU_DOAN = 'XỨ ĐOÀN CARLO ACUTIS';
export const TEN_GIAO_HO = 'GIÁO HỌ VĨNH LỘC';
export const KHAU_HIEU = 'CẦU NGUYỆN - RƯỚC LỄ - HY SINH - LÀM TÔNG ĐỒ';
