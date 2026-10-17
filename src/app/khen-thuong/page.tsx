'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  Trophy,
  Medal,
  Calendar,
  Sparkles,
  Filter,
  Users,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { getStudents, getClassesWithCount, getAttendanceRecords } from '@/lib/storage';
import { ThieuNhi, LopInfo, DiemDanhRecord } from '@/types';
import { DANH_SACH_NGANH } from '@/lib/constants';

export default function KhenThuongPage() {
  const [students, setStudents] = useState<ThieuNhi[]>([]);
  const [classes, setClasses] = useState<LopInfo[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<DiemDanhRecord[]>([]);
  const [selectedNganh, setSelectedNganh] = useState<string>('ALL');

  useEffect(() => {
    setStudents(getStudents());
    setClasses(getClassesWithCount());
    setAttendanceRecords(getAttendanceRecords());
  }, []);

  // Filter students based on branch
  const filteredStudents = students.filter((s) => {
    if (selectedNganh === 'ALL') return true;
    const cl = classes.find((c) => c.id === s.lopId);
    return cl?.nganhCode === selectedNganh;
  });

  // Sort descending by attendance points
  const sortedStudents = [...filteredStudents].sort(
    (a, b) => (b.tongDiemChuyenCan || 0) - (a.tongDiemChuyenCan || 0)
  );

  const top1 = sortedStudents[0];
  const top2 = sortedStudents[1];
  const top3 = sortedStudents[2];

  const getClassName = (lopId: string) => {
    return classes.find((c) => c.id === lopId)?.tenLop || lopId;
  };

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 pt-6 space-y-6">
      {/* Title */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-red-600 p-6 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-yellow-100">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            Cơ chế Khen Thưởng & Tuyên Dương Chuyên Cần
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            Bảng Vàng Thi Đua & Chuyên Cần Đoàn Sinh
          </h2>
          <p className="text-xs sm:text-sm text-yellow-100 max-w-xl">
            Tích điểm tự động từ Thánh Lễ Chúa Nhật (+10đ), Giờ Giáo Lý (+10đ) và các Thánh Lễ ngày thường từ Thứ 2 đến Thứ 7 (+5đ/lễ).
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="bg-white hover:bg-yellow-50 text-red-900 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md self-start sm:self-auto transition-colors"
        >
          <Printer className="w-4 h-4 text-red-700" />
          <span>In Danh Sách Khen Thưởng</span>
        </button>
      </div>

      {/* Podium: Top 3 Siêng Năng Nhất */}
      {sortedStudents.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Top 2: Hạng Nhì */}
          {top2 && (
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-sm text-center flex flex-col items-center justify-between order-2 md:order-1 hover:border-gray-400 transition-colors">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-800 flex items-center justify-center font-black mx-auto shadow-inner">
                  🥈
                </div>
                <span className="text-xs uppercase font-extrabold text-gray-500 tracking-wider">
                  Hạng Nhì Xứ Đoàn
                </span>
                <h4 className="text-base font-black text-gray-900">
                  {top2.tenThanh} {top2.hoVaTen}
                </h4>
                <div className="text-xs text-gray-500">Lớp: {getClassName(top2.lopId)}</div>
              </div>
              <div className="mt-4 bg-gray-100 text-gray-800 font-black px-4 py-1.5 rounded-full text-sm">
                {top2.tongDiemChuyenCan} Điểm
              </div>
            </div>
          )}

          {/* Top 1: Hạng Nhất */}
          {top1 && (
            <div className="bg-gradient-to-b from-yellow-50 to-white rounded-2xl border-2 border-yellow-400 p-6 shadow-md text-center flex flex-col items-center justify-between order-1 md:order-2 transform md:-translate-y-2">
              <div className="space-y-2">
                <div className="w-16 h-16 rounded-full bg-yellow-400 text-yellow-950 flex items-center justify-center font-black text-2xl mx-auto shadow-md animate-bounce">
                  👑
                </div>
                <span className="text-xs uppercase font-extrabold text-amber-700 tracking-wider">
                  Quán Quân Chuyên Cần
                </span>
                <h4 className="text-lg font-black text-red-700">
                  {top1.tenThanh} {top1.hoVaTen}
                </h4>
                <div className="text-xs font-semibold text-gray-600">
                  Lớp: {getClassName(top1.lopId)} • Mã: {top1.maDinhDanh}
                </div>
              </div>
              <div className="mt-4 bg-yellow-400 text-yellow-950 font-black px-6 py-2 rounded-full text-base shadow-sm">
                {top1.tongDiemChuyenCan} Điểm Chuyên Cần
              </div>
            </div>
          )}

          {/* Top 3: Hạng Ba */}
          {top3 && (
            <div className="bg-white rounded-2xl border-2 border-amber-200 p-5 shadow-sm text-center flex flex-col items-center justify-between order-3 md:order-3 hover:border-amber-300 transition-colors">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-black mx-auto shadow-inner">
                  🥉
                </div>
                <span className="text-xs uppercase font-extrabold text-amber-700 tracking-wider">
                  Hạng Ba Xứ Đoàn
                </span>
                <h4 className="text-base font-black text-gray-900">
                  {top3.tenThanh} {top3.hoVaTen}
                </h4>
                <div className="text-xs text-gray-500">Lớp: {getClassName(top3.lopId)}</div>
              </div>
              <div className="mt-4 bg-amber-100 text-amber-900 font-black px-4 py-1.5 rounded-full text-sm">
                {top3.tongDiemChuyenCan} Điểm
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter and Full Leaderboard */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Bảng Xếp Hạng Toàn Bộ Đoàn Sinh
          </h3>

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedNganh}
              onChange={(e) => setSelectedNganh(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-1.5 bg-white text-gray-800 font-semibold"
            >
              <option value="ALL">-- Toàn Bộ Các Ngành --</option>
              {DANH_SACH_NGANH.map((n) => (
                <option key={n.code} value={n.code}>
                  {n.ten}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-700 uppercase font-bold border-b border-gray-200 text-[11px]">
              <tr>
                <th className="px-4 py-3 text-center">Xếp Hạng</th>
                <th className="px-4 py-3">Tên Thánh & Họ Tên</th>
                <th className="px-4 py-3">Lớp & Ngành</th>
                <th className="px-4 py-3">Mã Định Danh</th>
                <th className="px-4 py-3 text-right">Tổng Điểm Chuyên Cần</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedStudents.map((student, idx) => (
                <tr key={student.id} className="hover:bg-red-50/30 transition-colors">
                  <td className="px-4 py-3 text-center font-bold">
                    {idx === 0 ? (
                      <span className="text-yellow-600 font-black text-sm">🥇 #1</span>
                    ) : idx === 1 ? (
                      <span className="text-gray-600 font-black text-sm">🥈 #2</span>
                    ) : idx === 2 ? (
                      <span className="text-amber-700 font-black text-sm">🥉 #3</span>
                    ) : (
                      <span className="text-gray-500">#{idx + 1}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-bold text-red-700 uppercase block">
                      {student.tenThanh}
                    </span>
                    <strong className="text-sm text-gray-900 font-bold">
                      {student.hoVaTen}
                    </strong>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-200">
                      Lớp {getClassName(student.lopId)}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-500">{student.maDinhDanh}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="bg-emerald-100 text-emerald-800 font-black px-3 py-1 rounded-full text-xs">
                      {student.tongDiemChuyenCan} điểm
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
