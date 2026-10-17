import { ThieuNhi, DuplicateCheckResult } from '@/types';

/**
 * Chuẩn hóa chuỗi tiếng Việt: bỏ dấu, viết thường, xóa khoảng trắng thừa
 */
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Chuẩn hóa số điện thoại: bỏ ký tự đặc biệt, chuẩn hóa về dạng 0xxxxxxxxx (10 số)
 */
export function normalizePhoneNumber(phone?: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('84')) {
    cleaned = '0' + cleaned.slice(2);
  }
  return cleaned;
}

/**
 * Tính khoảng cách Levenshtein kiểm tra sai lệch ký tự giữa 2 tên
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

/**
 * Thuật toán kiểm tra trùng lặp thông minh 2 tầng:
 * Tầng 1 (Hard Match): Trùng SĐT + Họ tên + Ngày sinh -> Chặn cứng không cho lưu
 * Tầng 2 (Soft Match): Trùng 2 trong 3 yếu tố (Họ tên + Ngày sinh HOẶC SĐT + Ngày sinh) -> Cảnh báo đối chiếu
 */
export function checkDuplicateStudent(
  candidate: {
    hoVaTen: string;
    ngaySinh: string;
    sdtChinh?: string;
    sdtBo?: string;
    sdtMe?: string;
    excludeId?: string; // Bỏ qua chính bản ghi đang sửa
  },
  existingList: ThieuNhi[]
): DuplicateCheckResult {
  const normCandName = removeVietnameseTones(candidate.hoVaTen);
  const candPhones = [
    normalizePhoneNumber(candidate.sdtChinh),
    normalizePhoneNumber(candidate.sdtBo),
    normalizePhoneNumber(candidate.sdtMe),
  ].filter(Boolean);

  const matchedStudents: ThieuNhi[] = [];

  for (const item of existingList) {
    if (candidate.excludeId && item.id === candidate.excludeId) {
      continue;
    }

    const itemNormName = removeVietnameseTones(item.hoVaTen);
    const itemPhones = [
      normalizePhoneNumber(item.sdtChinh),
      normalizePhoneNumber(item.sdtBo),
      normalizePhoneNumber(item.sdtMe),
    ].filter(Boolean);

    // Kiểm tra xem có chung số điện thoại nào không
    const hasSamePhone = candPhones.some((p) => itemPhones.includes(p));
    const hasSameDOB = candidate.ngaySinh === item.ngaySinh;
    const hasSameName = normCandName === itemNormName;

    // 1. HARD MATCH: Trùng cả 3 thông tin quan trọng nhất
    if (hasSamePhone && hasSameDOB && hasSameName) {
      return {
        hasDuplicate: true,
        isHardMatch: true,
        isSoftMatch: false,
        matchedStudents: [item],
        message: `Hồ sơ đã tồn tại! Trùng khớp 100% Họ tên, Ngày sinh và Số điện thoại với em [${item.tenThanh} ${item.hoVaTen}] - Mã ${item.maDinhDanh}. Không thể thêm mới!`,
      };
    }

    // 2. SOFT MATCH - Trường hợp A: Trùng Họ Tên + Ngày Sinh (nhưng SĐT khác)
    if (hasSameName && hasSameDOB && !hasSamePhone) {
      matchedStudents.push(item);
    }

    // 3. SOFT MATCH - Trường hợp B: Trùng SĐT + Ngày Sinh (tên có thể gõ sai chính tả hoặc là anh em sinh đôi)
    if (hasSamePhone && hasSameDOB && !hasSameName) {
      matchedStudents.push(item);
    }

    // 4. SOFT MATCH - Trường hợp C: Trùng SĐT + Tên giống nhau (sai ngày sinh do gõ nhầm)
    if (hasSamePhone && !hasSameDOB) {
      const distance = levenshteinDistance(normCandName, itemNormName);
      if (distance <= 2) {
        matchedStudents.push(item);
      }
    }
  }

  if (matchedStudents.length > 0) {
    return {
      hasDuplicate: true,
      isHardMatch: false,
      isSoftMatch: true,
      matchedStudents,
      message: `Cảnh báo: Phát hiện ${matchedStudents.length} em có thông tin tương đồng trong hệ thống. Vui lòng kiểm tra đối chiếu tránh nhập trùng hồ sơ!`,
    };
  }

  return {
    hasDuplicate: false,
    isHardMatch: false,
    isSoftMatch: false,
    matchedStudents: [],
    message: 'Thông tin hợp lệ, không phát hiện trùng lặp.',
  };
}
