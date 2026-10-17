'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UserPlus,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { getStudents, addOrUpdateStudent, getClassesWithCount } from '@/lib/storage';
import { checkDuplicateStudent, removeVietnameseTones, normalizePhoneNumber } from '@/lib/duplicate-checker';
import { generateUniqueStudentCode } from '@/lib/qr-helper';
import { ThieuNhi, LopInfo, DuplicateCheckResult, NganhCode } from '@/types';
import DuplicateWarningModal from '@/components/DuplicateWarningModal';

const POPULAR_BAPTISMAL_NAMES = [
  'Giuse',
  'Maria',
  'Phêrô',
  'Têrêsa',
  'Gioan Baotixita',
  'Anna',
  'Đaminh',
  'Phaolô',
  'Catarina',
  'Antôn',
  'Matthêu',
  'Micae',
];

export default function ThemMoiThieuNhiPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<LopInfo[]>([]);
  const [existingStudents, setExistingStudents] = useState<ThieuNhi[]>([]);

  // Form State
  const [tenThanh, setTenThanh] = useState<string>('Giuse');
  const [customTenThanh, setCustomTenThanh] = useState<string>('');
  const [hoVaTen, setHoVaTen] = useState<string>('');
  const [ngaySinh, setNgaySinh] = useState<string>('');
  const [gioiTinh, setGioiTinh] = useState<'Nam' | 'Nữ'>('Nam');
  const [lopId, setLopId] = useState<string>('');
  const [sdtChinh, setSdtChinh] = useState<string>('');
  const [tenBo, setTenBo] = useState<string>('');
  const [sdtBo, setSdtBo] = useState<string>('');
  const [tenMe, setTenMe] = useState<string>('');
  const [sdtMe, setSdtMe] = useState<string>('');
  const [diaChi, setDiaChi] = useState<string>('');
  const [giaoHo, setGiaoHo] = useState<string>('');

  // Duplicate Check Modal State
  const [dupResult, setDupResult] = useState<DuplicateCheckResult | null>(null);
  const [isDupModalOpen, setIsDupModalOpen] = useState<boolean>(false);
  const [liveDuplicateHint, setLiveDuplicateHint] = useState<string | null>(null);

  useEffect(() => {
    const cls = getClassesWithCount();
    setClasses(cls);
    if (cls.length > 0) {
      setLopId(cls[0].id);
    }
    setExistingStudents(getStudents());
  }, []);

  // Quick live check while user is typing
  useEffect(() => {
    if (hoVaTen.trim().length >= 3 && ngaySinh && sdtChinh.trim().length >= 9) {
      const result = checkDuplicateStudent(
        {
          hoVaTen,
          ngaySinh,
          sdtChinh,
          sdtBo,
          sdtMe,
        },
        existingStudents
      );

      if (result.hasDuplicate) {
        setLiveDuplicateHint(result.message);
      } else {
        setLiveDuplicateHint(null);
      }
    } else {
      setLiveDuplicateHint(null);
    }
  }, [hoVaTen, ngaySinh, sdtChinh, sdtBo, sdtMe, existingStudents]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedBaptism = tenThanh === 'KHAC' ? customTenThanh.trim() : tenThanh;
    if (!selectedBaptism || !hoVaTen.trim() || !ngaySinh || !sdtChinh.trim() || !lopId) {
      alert('Vui lòng điền đầy đủ Tên Thánh, Họ và Tên, Ngày sinh, Số điện thoại và Lớp!');
      return;
    }

    // Run deep duplicate detection
    const result = checkDuplicateStudent(
      {
        hoVaTen,
        ngaySinh,
        sdtChinh,
        sdtBo,
        sdtMe,
      },
      existingStudents
    );

    if (result.hasDuplicate) {
      setDupResult(result);
      setIsDupModalOpen(true);
      return;
    }

    // No duplicate -> Proceed save directly
    executeSaveStudent();
  };

  const executeSaveStudent = () => {
    const selectedBaptism = tenThanh === 'KHAC' ? customTenThanh.trim() : tenThanh;
    const currentClass = classes.find((c) => c.id === lopId);
    const nganhCode: NganhCode = currentClass?.nganhCode || 'THIEU';

    const normalizedPhone = normalizePhoneNumber(sdtChinh);
    const uniqueCode = generateUniqueStudentCode(
      nganhCode,
      hoVaTen,
      ngaySinh,
      normalizedPhone,
      existingStudents.length + 1
    );

    const newStudent: ThieuNhi = {
      id: 'tn-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      maDinhDanh: uniqueCode,
      tenThanh: selectedBaptism,
      hoVaTen: hoVaTen.trim(),
      hoVaTenKhongDau: removeVietnameseTones(hoVaTen),
      ngaySinh,
      gioiTinh,
      tenBo: tenBo.trim() || undefined,
      sdtBo: normalizePhoneNumber(sdtBo) || undefined,
      tenMe: tenMe.trim() || undefined,
      sdtMe: normalizePhoneNumber(sdtMe) || undefined,
      sdtChinh: normalizedPhone,
      diaChi: diaChi.trim() || undefined,
      giaoHo: giaoHo.trim() || undefined,
      lopId,
      tongDiemChuyenCan: 0,
      trangThai: 'DangHoc',
      ngayTao: new Date().toISOString(),
    };

    addOrUpdateStudent(newStudent);
    setIsDupModalOpen(false);

    alert(`Đã lưu thành công em [${selectedBaptism} ${hoVaTen}] với Mã định danh: ${uniqueCode}!`);
    router.push('/thieu-nhi');
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/thieu-nhi"
            className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-red-600" />
              Thêm Mới Thiếu Nhi & Sinh Mã QR
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Tự động kiểm tra trùng Họ tên, Ngày sinh và Số điện thoại phụ huynh
            </p>
          </div>
        </div>
      </div>

      {/* Live Warning Notification Banner */}
      {liveDuplicateHint && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-3 shadow-sm animate-pulse">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <strong>Cảnh báo thời gian thực:</strong> {liveDuplicateHint}
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-red-700 border-b border-red-100 pb-2">
            1. Thông Tin Cá Nhân Của Thiếu Nhi
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Tên Thánh */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Tên Thánh <span className="text-red-500">*</span>
              </label>
              <select
                value={tenThanh}
                onChange={(e) => setTenThanh(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 bg-white text-gray-800 font-semibold focus:ring-2 focus:ring-red-500 outline-none"
              >
                {POPULAR_BAPTISMAL_NAMES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
                <option value="KHAC">-- Tên Thánh Khác --</option>
              </select>

              {tenThanh === 'KHAC' && (
                <input
                  type="text"
                  placeholder="Nhập Tên Thánh..."
                  value={customTenThanh}
                  onChange={(e) => setCustomTenThanh(e.target.value)}
                  className="mt-2 w-full text-xs border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                  required
                />
              )}
            </div>

            {/* Họ và Tên */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Họ và Tên Khai Sinh <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="VD: Nguyễn Văn An"
                value={hoVaTen}
                onChange={(e) => setHoVaTen(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-red-500 outline-none font-semibold text-gray-900"
                required
              />
            </div>

            {/* Ngày tháng năm sinh */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Ngày Tháng Năm Sinh <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={ngaySinh}
                onChange={(e) => setNgaySinh(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-red-500 outline-none font-medium"
                required
              />
            </div>

            {/* Giới tính */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Giới Tính <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4 pt-1 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="gioiTinh"
                    value="Nam"
                    checked={gioiTinh === 'Nam'}
                    onChange={() => setGioiTinh('Nam')}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <span>Nam</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="gioiTinh"
                    value="Nữ"
                    checked={gioiTinh === 'Nữ'}
                    onChange={() => setGioiTinh('Nữ')}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <span>Nữ</span>
                </label>
              </div>
            </div>

            {/* Lớp Học */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Xếp Vào Lớp <span className="text-red-500">*</span>
              </label>
              <select
                value={lopId}
                onChange={(e) => setLopId(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 bg-white text-gray-800 font-semibold focus:ring-2 focus:ring-red-500 outline-none"
                required
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    Lớp {c.tenLop} ({c.siSo} em)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Thông tin Phụ huynh */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-red-700 border-b border-red-100 pb-2">
            2. Thông Tin Phụ Huynh & Định Danh Chống Trùng
          </h3>

          <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-xs text-red-800">
            💡 <strong>Lưu ý:</strong> SĐT chính của bố hoặc mẹ là yếu tố quyết định để sinh mã QR không trùng lặp khi có nhiều em cùng họ tên và năm sinh.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* SĐT Chính định danh */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Số Điện Thoại Chính Của Gia Đình (Dùng Định Danh Mã QR) <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="VD: 0912345678"
                value={sdtChinh}
                onChange={(e) => {
                  setSdtChinh(e.target.value);
                  if (!sdtBo) setSdtBo(e.target.value);
                }}
                className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-red-500 outline-none font-mono font-bold text-gray-900"
                required
              />
            </div>

            {/* Bố */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Họ và Tên Bố
              </label>
              <input
                type="text"
                placeholder="VD: Nguyễn Văn Hùng"
                value={tenBo}
                onChange={(e) => setTenBo(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                SĐT Riêng Của Bố (nếu có)
              </label>
              <input
                type="tel"
                placeholder="0912..."
                value={sdtBo}
                onChange={(e) => setSdtBo(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none font-mono"
              />
            </div>

            {/* Mẹ */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Họ và Tên Mẹ
              </label>
              <input
                type="text"
                placeholder="VD: Trần Thị Mai"
                value={tenMe}
                onChange={(e) => setTenMe(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                SĐT Riêng Của Mẹ (nếu có)
              </label>
              <input
                type="tel"
                placeholder="0987..."
                value={sdtMe}
                onChange={(e) => setSdtMe(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none font-mono"
              />
            </div>

            {/* Giáo họ & Địa chỉ */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Thuộc Giáo Họ
              </label>
              <input
                type="text"
                placeholder="VD: Giáo họ Thánh Tâm"
                value={giaoHo}
                onChange={(e) => setGiaoHo(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Địa Chỉ Nhà / Xóm
              </label>
              <input
                type="text"
                placeholder="Số nhà, đường, thôn xóm..."
                value={diaChi}
                onChange={(e) => setDiaChi(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <Link
            href="/thieu-nhi"
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-100 transition-colors"
          >
            Hủy Bỏ
          </Link>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-transform hover:scale-105 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Kiểm Tra & Lưu Hồ Sơ Mới</span>
          </button>
        </div>
      </form>

      {/* Duplicate Warning Modal */}
      <DuplicateWarningModal
        isOpen={isDupModalOpen}
        checkResult={dupResult}
        newStudentData={{
          tenThanh: tenThanh === 'KHAC' ? customTenThanh : tenThanh,
          hoVaTen,
          ngaySinh,
          sdtChinh,
          sdtBo,
          sdtMe,
          lopId,
        }}
        onCancel={() => setIsDupModalOpen(false)}
        onProceedSave={executeSaveStudent}
      />
    </div>
  );
}
