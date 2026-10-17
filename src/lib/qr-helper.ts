import QRCode from 'qrcode';
import { removeVietnameseTones, normalizePhoneNumber } from './duplicate-checker';
import { NganhCode } from '@/types';

/**
 * Tạo chuỗi hash ngắn (4-6 ký tự hex) từ chuỗi đầu vào (FNV-1a 32-bit hash)
 */
function createShortHash(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).toUpperCase().padStart(8, '0').slice(0, 4);
}

/**
 * Sinh mã định danh duy nhất cho Thiếu Nhi:
 * Dựa vào: Ngành + Họ tên + Ngày tháng năm sinh + Số điện thoại chính + Số thứ tự
 * Ví dụ kết quả: TN-2015-D8A2-024
 */
export function generateUniqueStudentCode(
  nganhCode: NganhCode,
  hoVaTen: string,
  ngaySinh: string,
  sdtChinh: string,
  sequenceIndex: number
): string {
  const normName = removeVietnameseTones(hoVaTen);
  const normPhone = normalizePhoneNumber(sdtChinh);
  const birthYear = ngaySinh ? ngaySinh.split('-')[0] : '2015';

  // Chuỗi hạt giống gồm họ tên + ngày sinh + số điện thoại
  const seedString = `${normName}_${ngaySinh}_${normPhone}`;
  const hashPart = createShortHash(seedString);
  const indexPart = String(sequenceIndex).padStart(4, '0');

  // Tiền tố ngành
  const prefixMap: Record<NganhCode, string> = {
    CHIEN: 'CC',
    AU: 'AN',
    THIEU: 'TN',
    NGHIA: 'NS',
    HIEP: 'HS',
    DU_TRUONG: 'DT',
  };

  const prefix = prefixMap[nganhCode] || 'TN';
  return `${prefix}-${birthYear}-${hashPart}-${indexPart}`;
}

/**
 * Cấu trúc Payload mã QR được in lên thẻ đeo
 */
export interface QRPayload {
  id: string;
  code: string;
  n: string; // Tên viết tắt
  v: number; // Phiên bản dữ liệu
}

/**
 * Tạo chuỗi payload nén cho mã QR
 */
export function encodeQRPayload(studentId: string, studentCode: string, name: string): string {
  const payload: QRPayload = {
    id: studentId,
    code: studentCode,
    n: name,
    v: 1,
  };
  return JSON.stringify(payload);
}

/**
 * Giải mã chuỗi QR khi camera đọc được
 */
export function decodeQRPayload(qrText: string): QRPayload | null {
  try {
    const data = JSON.parse(qrText);
    if (data && data.id && data.code) {
      return data as QRPayload;
    }
  } catch {
    // Nếu quét mã dạng text thường là mã định danh
    if (qrText.startsWith('CC-') || qrText.startsWith('AN-') || qrText.startsWith('TN-') ||
        qrText.startsWith('NS-') || qrText.startsWith('HS-') || qrText.startsWith('DT-')) {
      return {
        id: '',
        code: qrText,
        n: '',
        v: 1,
      };
    }
  }
  return null;
}

/**
 * Sinh ảnh QR dạng Data URL (base64) để hiển thị và in thẻ
 */
export async function generateQRDataURL(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 320,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Lỗi sinh ảnh mã QR:', err);
    return '';
  }
}
