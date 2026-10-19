'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  QrCode,
  Printer,
  Award,
  PlusCircle,
  GraduationCap,
  CalendarCheck,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { DANH_SACH_NGANH, DANH_SACH_LOP_BAN_DAU, TEN_XU_DOAN, TEN_GIAO_HO } from '@/lib/constants';
import { getStudents, getAttendanceRecords, getClassesWithCount } from '@/lib/storage';
import { ThieuNhi, LopInfo, DiemDanhRecord } from '@/types';
import QRScannerModal from '@/components/QRScannerModal';
import GitSyncButton from '@/components/GitSyncButton';

export default function DashboardPage() {
  const [students, setStudents] = useState<ThieuNhi[]>([]);
  const [classes, setClasses] = useState<LopInfo[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<DiemDanhRecord[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);

  const loadData = () => {
    setStudents(getStudents());
    setClasses(getClassesWithCount());
    setAttendanceRecords(getAttendanceRecords());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Top 5 most active students
  const topStudents = [...students]
    .sort((a, b) => (b.tongDiemChuyenCan || 0) - (a.tongDiemChuyenCan || 0))
    .slice(0, 5);

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 pt-6 space-y-8">
      {/* Banner Chào Mừng Full HD */}
      <div className="bg-gradient-to-r from-red-700 via-red-800 to-amber-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-5xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold text-yellow-200">
            <ShieldCheck className="w-4 h-4 text-yellow-300" />
            <span>{TEN_GIAO_HO}</span>
            <span>•</span>
            <span>PHONG TRÀO THIẾU NHI THÁNH THỂ VIỆT NAM</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight drop-shadow-md">
            {TEN_XU_DOAN}
          </h2>

          <p className="text-sm sm:text-base text-red-100 leading-relaxed max-w-4xl">
            Hệ thống quản lý quy mô <strong>2.000 Thiếu Nhi</strong> và <strong>100 Huynh Trưởng</strong> của {TEN_GIAO_HO}. Phân quyền chặt chẽ 3 cấp, chống trùng lặp hồ sơ thông minh, quét mã QR điểm danh chuyên cần cả tuần và xuất thẻ đeo in ấn PDF trọn gói.
          </p>

          {/* Quick Action CTA buttons */}
          <div className="pt-3 flex flex-wrap gap-3.5">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="bg-yellow-400 hover:bg-yellow-300 text-red-950 font-black px-6 py-3.5 rounded-2xl text-sm flex items-center gap-2.5 shadow-xl transition-transform hover:scale-105"
            >
              <QrCode className="w-5 h-5 text-red-900" />
              <span>Quét QR Điểm Danh Ngay</span>
            </button>

            <Link
              href="/thieu-nhi/them-moi"
              className="bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md text-white font-bold px-5 py-3.5 rounded-2xl text-sm flex items-center gap-2 transition-all hover:bg-white/25"
            >
              <PlusCircle className="w-5 h-5 text-yellow-300" />
              <span>Thêm Thiếu Nhi Mới (Chống trùng)</span>
            </Link>

            <Link
              href="/the-qr"
              className="bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md text-white font-bold px-5 py-3.5 rounded-2xl text-sm flex items-center gap-2 transition-all hover:bg-white/25"
            >
              <Printer className="w-5 h-5 text-yellow-300" />
              <span>In Thẻ Đeo Hàng Loạt (PDF)</span>
            </Link>

            <GitSyncButton />
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white/10 font-black text-[220px] select-none pointer-events-none hidden xl:block">
          ✝
        </div>
      </div>

      {/* Thống kê 4 số liệu trọng tâm Full HD */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5 hover:border-blue-300 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900">{students.length}</div>
            <div className="text-xs sm:text-sm text-gray-500 font-semibold">Thiếu Nhi đã lập hồ sơ</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5 hover:border-red-300 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900">100+</div>
            <div className="text-xs sm:text-sm text-gray-500 font-semibold">Huynh Trưởng & GLV</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5 hover:border-emerald-300 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <CalendarCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900">
              {attendanceRecords.length}
            </div>
            <div className="text-xs sm:text-sm text-gray-500 font-semibold">Lượt điểm danh đã ghi</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5 hover:border-amber-300 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900">98.2%</div>
            <div className="text-xs sm:text-sm text-gray-500 font-semibold">Chuyên cần Chúa Nhật</div>
          </div>
        </div>
      </div>

      {/* Cơ Cấu Ngành & Sĩ Số Lớp Full HD */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        {/* Cột 1 & 2: Danh sách 6 Ngành và Khối */}
        <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-gray-900 text-xl flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-red-600"></span>
                Cơ Cấu 6 Ngành Thiếu Nhi Thánh Thể
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Phân cấp Cấp 2 (Ban Trưởng Ngành) & Khối Lớp</p>
            </div>
            <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
              Niên khóa 2025 - 2026
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DANH_SACH_NGANH.map((nganh) => {
              const studentCount = students.filter((s) => {
                const lp = classes.find((c) => c.id === s.lopId);
                return lp?.nganhCode === nganh.code;
              }).length;

              return (
                <div
                  key={nganh.code}
                  className={`border-2 rounded-2xl p-4 sm:p-5 transition-all hover:shadow-lg ${nganh.bgClass} flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-base">{nganh.ten}</span>
                      <span className="text-xs font-mono font-bold bg-white/80 px-2.5 py-0.5 rounded-full shadow-sm">
                        {studentCount} em
                      </span>
                    </div>
                    <div className="text-xs opacity-90 mb-3">{nganh.moTaDoTuoi}</div>
                  </div>
                  <div className="text-[11px] font-semibold opacity-90 pt-2 border-t border-black/10">
                    Khăn quàng: <strong>{nganh.khanMau}</strong>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Danh mục các Lớp hiện tại */}
          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-black text-base text-gray-800">
                Các Lớp Giáo Lý Đang Hoạt Động (Cấp 3 - Huynh Trưởng):
              </h4>
              <Link
                href="/thieu-nhi"
                className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 group"
              >
                <span>Xem danh sách học sinh</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {classes.map((c) => (
                <div
                  key={c.id}
                  className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 text-xs space-y-1 hover:border-red-400 hover:bg-red-50/30 transition-all hover:shadow-sm"
                >
                  <div className="font-black text-gray-900 text-sm">{c.tenLop}</div>
                  <div className="text-gray-600 text-[11px]">Sĩ số: <strong className="text-red-700">{c.siSo} em</strong></div>
                  <div className="text-gray-400 text-[10px] truncate">{c.phongHoc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cột 3: Top Vinh Danh Chuyên Cần & Huynh Trưởng */}
        <div className="space-y-6">
          {/* Top Chuyên Cần */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-gray-900 text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Top Chuyên Cần Tuần Này
              </h3>
              <Link
                href="/khen-thuong"
                className="text-xs text-red-600 font-bold hover:underline"
              >
                Xem tất cả
              </Link>
            </div>

            <div className="space-y-3">
              {topStudents.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-red-50/50 transition-colors border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                        index === 0
                          ? 'bg-yellow-400 text-yellow-950 shadow-md ring-2 ring-yellow-200'
                          : index === 1
                          ? 'bg-gray-300 text-gray-900'
                          : index === 2
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <strong className="text-sm text-gray-900 block font-bold">
                        {item.tenThanh} {item.hoVaTen}
                      </strong>
                      <span className="text-[11px] text-gray-500 font-mono">
                        {item.maDinhDanh}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-red-700 bg-red-100 px-3 py-1 rounded-xl shadow-inner">
                    {item.tongDiemChuyenCan}đ
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quy chế điểm danh box */}
          <div className="bg-gradient-to-br from-red-50 to-amber-50 border border-red-200 rounded-3xl p-6 text-xs space-y-3 shadow-sm">
            <div className="font-black text-red-900 flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Quy chế Chuyên Cần Đoàn Sinh:</span>
            </div>
            <ul className="text-gray-700 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✓</span>
                <span><strong>Chúa Nhật:</strong> Tự động tích chọn Thánh Lễ (+10đ) & Giờ học Giáo Lý (+10đ).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✓</span>
                <span><strong>Ngày thường (T2 - T7):</strong> Mỗi ngày tối đa 2 ca lễ (+5đ/lễ) để khen thưởng.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onAttendanceSuccess={loadData}
      />
    </div>
  );
}
