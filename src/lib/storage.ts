import { ThieuNhi, DiemDanhRecord, LopInfo } from '@/types';
import { MOCK_THIEU_NHI_LIST } from './mock-data';
import { DANH_SACH_LOP_BAN_DAU, DIEM_THUONG } from './constants';

const STORAGE_KEYS = {
  STUDENTS: 'qngl_students_v1',
  ATTENDANCE: 'qngl_attendance_v1',
  CLASSES: 'qngl_classes_v1',
};

// Khởi tạo dữ liệu nếu chưa có
function isClient(): boolean {
  return typeof window !== 'undefined';
}

export function getStudents(): ThieuNhi[] {
  if (!isClient()) return MOCK_THIEU_NHI_LIST;
  const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(MOCK_THIEU_NHI_LIST));
    return MOCK_THIEU_NHI_LIST;
  }
  try {
    return JSON.parse(data);
  } catch {
    return MOCK_THIEU_NHI_LIST;
  }
}

export function saveStudents(list: ThieuNhi[]): void {
  if (!isClient()) return;
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(list));
}

export function getStudentById(id: string): ThieuNhi | undefined {
  const list = getStudents();
  return list.find((s) => s.id === id);
}

export function getStudentByCode(code: string): ThieuNhi | undefined {
  const list = getStudents();
  const trimmedCode = code.trim().toUpperCase();
  return list.find((s) => s.maDinhDanh.toUpperCase() === trimmedCode);
}

export function addOrUpdateStudent(student: ThieuNhi): void {
  const list = getStudents();
  const idx = list.findIndex((s) => s.id === student.id);
  if (idx >= 0) {
    list[idx] = student;
  } else {
    list.unshift(student);
  }
  saveStudents(list);
}

export function deleteStudent(id: string): void {
  const list = getStudents();
  const filtered = list.filter((s) => s.id !== id);
  saveStudents(filtered);
}

// ==========================================
// QUẢN LÝ ĐIỂM DANH & QUY TẮC NGÀY THƯỜNG / CHÚA NHẬT
// ==========================================

export function getAttendanceRecords(dateFilter?: string): DiemDanhRecord[] {
  if (!isClient()) return [];
  const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
  if (!data) return [];
  try {
    const records: DiemDanhRecord[] = JSON.parse(data);
    if (dateFilter) {
      return records.filter((r) => r.ngay === dateFilter);
    }
    return records;
  } catch {
    return [];
  }
}

export function saveAttendanceRecords(records: DiemDanhRecord[]): void {
  if (!isClient()) return;
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
}

export interface AttendanceResult {
  success: boolean;
  message: string;
  pointsAdded: number;
  record?: DiemDanhRecord;
}

/**
 * Ghi nhận điểm danh tuân thủ quy chế:
 * - Chúa Nhật: Thánh Lễ + Giáo Lý (mặc định cả 2)
 * - Thứ 2 - Thứ 7: Tối đa 2 lần/ngày (cho 2 ca lễ)
 */
export function recordAttendance(params: {
  thieuNhiId: string;
  ngay: string; // YYYY-MM-DD
  isSunday: boolean;
  thamDuLe: boolean;
  thamDuGiaoLy: boolean;
  caLe: 'LE_SANG' | 'LE_CHIEU' | 'LE_CHUA_NHAT';
  nguoiQuetTen: string;
  phuongThuc: 'QR_SCAN' | 'THU_CONG';
}): AttendanceResult {
  const student = getStudentById(params.thieuNhiId);
  if (!student) {
    return { success: false, message: 'Không tìm thấy thiếu nhi!', pointsAdded: 0 };
  }

  const allRecords = getAttendanceRecords();
  const recordsOnDate = allRecords.filter(
    (r) => r.thieuNhiId === params.thieuNhiId && r.ngay === params.ngay
  );

  // QUY TẮC NGÀY THƯỜNG (Thứ 2 - Thứ 7): Tối đa 2 lần / ngày
  if (!params.isSunday) {
    if (recordsOnDate.length >= DIEM_THUONG.MAX_LE_NGAY_THUONG) {
      return {
        success: false,
        message: `Em [${student.tenThanh} ${student.hoVaTen}] đã điểm danh đủ 2 Thánh Lễ trong ngày hôm nay rồi!`,
        pointsAdded: 0,
      };
    }
    // Chống quét trùng cùng 1 ca lễ trong ngày
    const sameCa = recordsOnDate.find((r) => r.caLe === params.caLe);
    if (sameCa) {
      return {
        success: false,
        message: `Em [${student.tenThanh} ${student.hoVaTen}] đã được điểm danh ca này rồi!`,
        pointsAdded: 0,
      };
    }
  } else {
    // QUY TẮC CHÚA NHẬT: Kiểm tra xem đã quét điểm danh Chúa Nhật hôm nay chưa
    const alreadyScannedSunday = recordsOnDate.some((r) => r.caLe === 'LE_CHUA_NHAT');
    if (alreadyScannedSunday) {
      return {
        success: false,
        message: `Em [${student.tenThanh} ${student.hoVaTen}] đã điểm danh Chúa Nhật hôm nay rồi!`,
        pointsAdded: 0,
      };
    }
  }

  // TÍNH ĐIỂM CHUYÊN CẦN
  let points = 0;
  if (params.isSunday) {
    if (params.thamDuLe) points += DIEM_THUONG.LE_CHUA_NHAT;
    if (params.thamDuGiaoLy) points += DIEM_THUONG.GIAO_LY_CHUA_NHAT;
  } else {
    if (params.thamDuLe) points += DIEM_THUONG.LE_NGAY_THUONG;
  }

  const newRecord: DiemDanhRecord = {
    id: 'dd-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    thieuNhiId: student.id,
    ngay: params.ngay,
    thuTrongTuan: params.isSunday ? 'ChuaNhat' : 'ThuHai',
    caLe: params.caLe,
    thamDuLe: params.thamDuLe,
    thamDuGiaoLy: params.thamDuGiaoLy,
    thoiGianQuet: new Date().toISOString(),
    nguoiQuetTen: params.nguoiQuetTen,
    phuongThuc: params.phuongThuc,
    diemCong: points,
  };

  allRecords.unshift(newRecord);
  saveAttendanceRecords(allRecords);

  // Cập nhật tổng điểm chuyên cần của học sinh
  student.tongDiemChuyenCan = (student.tongDiemChuyenCan || 0) + points;
  addOrUpdateStudent(student);

  return {
    success: true,
    message: `Điểm danh thành công em [${student.tenThanh} ${student.hoVaTen}]. +${points} điểm chuyên cần!`,
    pointsAdded: points,
    record: newRecord,
  };
}

// ==========================================
// DANH SÁCH LỚP HỌC KÈM SĨ SỐ THỰC TẾ
// ==========================================

export function getClassesWithCount(): LopInfo[] {
  const students = getStudents();
  return DANH_SACH_LOP_BAN_DAU.map((cls) => {
    const count = students.filter((s) => s.lopId === cls.id).length;
    return {
      ...cls,
      siSo: count > 0 ? count : cls.siSo,
    };
  });
}
