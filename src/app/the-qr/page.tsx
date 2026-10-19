'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Printer,
  QrCode,
  Filter,
  CheckSquare,
  Square,
  HelpCircle,
  FileDown,
} from 'lucide-react';
import { getStudents, getClassesWithCount } from '@/lib/storage';
import { ThieuNhi, LopInfo } from '@/types';
import { DANH_SACH_NGANH } from '@/lib/constants';
import QRCardItem from '@/components/QRCardItem';

function InTheQRContent() {
  const searchParams = useSearchParams();
  const preselectedStudentId = searchParams.get('studentId');

  const [students, setStudents] = useState<ThieuNhi[]>([]);
  const [classes, setClasses] = useState<LopInfo[]>([]);
  const [selectedNganh, setSelectedNganh] = useState<string>('ALL');
  const [selectedLop, setSelectedLop] = useState<string>('ALL');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  useEffect(() => {
    const st = getStudents();
    const cl = getClassesWithCount();
    setStudents(st);
    setClasses(cl);

    if (preselectedStudentId) {
      setSelectedStudentIds([preselectedStudentId]);
    } else {
      // Default: select all
      setSelectedStudentIds(st.map((s) => s.id));
    }
  }, [preselectedStudentId]);

  // Filter students based on branch and class
  const filteredStudents = students.filter((s) => {
    const studentClass = classes.find((c) => c.id === s.lopId);
    if (selectedNganh !== 'ALL' && studentClass?.nganhCode !== selectedNganh) return false;
    if (selectedLop !== 'ALL' && s.lopId !== selectedLop) return false;
    return true;
  });

  const handleSelectAllFiltered = () => {
    setSelectedStudentIds(filteredStudents.map((s) => s.id));
  };

  const handleDeselectAll = () => {
    setSelectedStudentIds([]);
  };

  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  const studentsToPrint = students.filter((s) => selectedStudentIds.includes(s.id));

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 pt-6 space-y-6">
      {/* Top Banner (Hidden when printing) */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <Printer className="w-6 h-6 text-red-600" />
            Xuất File In Thẻ Đeo Trọn Gói (PDF Ready-to-print)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Đầy đủ Logo TNTT, Tên Thánh, Họ và Tên, Chi Đoàn/Lớp, Ảnh và Mã QR định danh
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerPrint}
            disabled={studentsToPrint.length === 0}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
          >
            <Printer className="w-4 h-4" />
            <span>In {studentsToPrint.length} Thẻ Đã Chọn (Xuất PDF)</span>
          </button>
        </div>
      </div>

      {/* Filter and Selection Controls (Hidden when printing) */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-4 print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Nganh */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Lọc theo Ngành:
            </label>
            <select
              value={selectedNganh}
              onChange={(e) => {
                setSelectedNganh(e.target.value);
                setSelectedLop('ALL');
              }}
              className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2 bg-white text-gray-800 font-semibold"
            >
              <option value="ALL">-- Tất cả các Ngành --</option>
              {DANH_SACH_NGANH.map((n) => (
                <option key={n.code} value={n.code}>
                  {n.ten}
                </option>
              ))}
            </select>
          </div>

          {/* Class */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Lọc theo Lớp:
            </label>
            <select
              value={selectedLop}
              onChange={(e) => setSelectedLop(e.target.value)}
              className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2 bg-white text-gray-800 font-semibold"
            >
              <option value="ALL">-- Tất cả các Lớp --</option>
              {classes
                .filter((c) => selectedNganh === 'ALL' || c.nganhCode === selectedNganh)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    Lớp {c.tenLop} ({c.siSo} em)
                  </option>
                ))}
            </select>
          </div>

          {/* Quick selection actions */}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={handleSelectAllFiltered}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl"
            >
              Chọn tất cả ({filteredStudents.length})
            </button>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-xl"
            >
              Bỏ chọn
            </button>
          </div>
        </div>

        {/* Print guide hint */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>
              <strong>Mẹo in ấn:</strong> Khi hộp thoại In (Print) của trình duyệt hiện ra, chọn mục{' '}
              <strong>"Lưu dưới dạng PDF"</strong> (Save as PDF) hoặc máy in màu. Thẻ đã được định dạng chuẩn khổ giấy A4, mỗi trang gồm 4-6 thẻ đeo.
            </span>
          </div>
          <span className="font-bold text-red-700 ml-2 whitespace-nowrap">
            Đang chọn {studentsToPrint.length} thẻ
          </span>
        </div>
      </div>

      {/* Printable Cards Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider print:hidden">
          Xem trước bản in ({studentsToPrint.length} thẻ):
        </h3>

        {studentsToPrint.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center text-gray-400 text-xs print:hidden">
            Chưa chọn thiếu nhi nào để in thẻ. Vui lòng tick chọn ít nhất 1 em phía trên.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 print:grid print:grid-cols-2 print:gap-4 print:p-0">
            {studentsToPrint.map((student) => (
              <div key={student.id} className="relative group">
                {/* Checkbox overlay (hidden in print) */}
                <button
                  type="button"
                  onClick={() => toggleSelectStudent(student.id)}
                  className="absolute top-2 right-2 z-10 bg-white/90 p-1.5 rounded-lg shadow-md border border-gray-200 hover:scale-110 transition-transform print:hidden"
                >
                  {selectedStudentIds.includes(student.id) ? (
                    <CheckSquare className="w-5 h-5 text-red-600" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                <QRCardItem student={student} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function InTheQRPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 pt-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent mb-3"></div>
          <p className="text-xs text-gray-500 font-bold">Đang chuẩn bị danh sách thẻ đoàn sinh...</p>
        </div>
      }
    >
      <InTheQRContent />
    </Suspense>
  );
}
