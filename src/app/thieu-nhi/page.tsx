'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  PlusCircle,
  Printer,
  Trash2,
  QrCode,
  Phone,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { getStudents, deleteStudent, getClassesWithCount } from '@/lib/storage';
import { ThieuNhi, LopInfo } from '@/types';
import { DANH_SACH_NGANH } from '@/lib/constants';

export default function DanhSachThieuNhiPage() {
  const [students, setStudents] = useState<ThieuNhi[]>([]);
  const [classes, setClasses] = useState<LopInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNganh, setSelectedNganh] = useState<string>('ALL');
  const [selectedLop, setSelectedLop] = useState<string>('ALL');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadData = () => {
    setStudents(getStudents());
    setClasses(getClassesWithCount());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = (id: string) => {
    deleteStudent(id);
    setDeleteConfirmId(null);
    loadData();
  };

  // Filter students based on search and dropdowns
  const filteredStudents = students.filter((student) => {
    const studentClass = classes.find((c) => c.id === student.lopId);

    // Filter by branch
    if (selectedNganh !== 'ALL' && studentClass?.nganhCode !== selectedNganh) {
      return false;
    }

    // Filter by class
    if (selectedLop !== 'ALL' && student.lopId !== selectedLop) {
      return false;
    }

    // Filter by search text
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = student.hoVaTen.toLowerCase().includes(q);
      const matchHoly = student.tenThanh.toLowerCase().includes(q);
      const matchCode = student.maDinhDanh.toLowerCase().includes(q);
      const matchPhone = student.sdtChinh.includes(q);
      return matchName || matchHoly || matchCode || matchPhone;
    }

    return true;
  });

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 pt-6 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-red-600" />
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              Danh Sách Thiếu Nhi Toàn Đoàn
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Quản lý hồ sơ định danh, mã QR duy nhất và sĩ số các lớp
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/the-qr"
            className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-xs hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-gray-600" />
            <span>In Thẻ Đeo Hàng Loạt</span>
          </Link>

          <Link
            href="/thieu-nhi/them-moi"
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm Thiếu Nhi Mới</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Tìm theo Tên Thánh, Họ tên, Mã QR, SĐT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>

        {/* Nganh Filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <select
            value={selectedNganh}
            onChange={(e) => {
              setSelectedNganh(e.target.value);
              setSelectedLop('ALL'); // Reset class when branch changes
            }}
            className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2 bg-white text-gray-800 font-medium"
          >
            <option value="ALL">-- Tất cả các Ngành --</option>
            {DANH_SACH_NGANH.map((n) => (
              <option key={n.code} value={n.code}>
                {n.ten}
              </option>
            ))}
          </select>
        </div>

        {/* Class Filter */}
        <div>
          <select
            value={selectedLop}
            onChange={(e) => setSelectedLop(e.target.value)}
            className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2 bg-white text-gray-800 font-medium"
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

        {/* Quick Result Summary */}
        <div className="flex items-center justify-between sm:justify-end text-xs text-gray-500 font-semibold px-2">
          <span>
            Tìm thấy: <strong className="text-red-700">{filteredStudents.length}</strong> / {students.length} em
          </span>
        </div>
      </div>

      {/* Main Student Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-700 uppercase font-bold border-b border-gray-200 text-[11px]">
              <tr>
                <th className="px-4 py-3.5">Mã Thiếu Nhi</th>
                <th className="px-4 py-3.5">Tên Thánh & Họ Tên</th>
                <th className="px-4 py-3.5">Ngày Sinh & Giới Tính</th>
                <th className="px-4 py-3.5">SĐT Phụ Huynh</th>
                <th className="px-4 py-3.5">Lớp Phụ Trách</th>
                <th className="px-4 py-3.5 text-center">Điểm Chuyên Cần</th>
                <th className="px-4 py-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    Không tìm thấy thiếu nhi nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const studentClass = classes.find((c) => c.id === s.lopId);
                  return (
                    <tr key={s.id} className="hover:bg-red-50/40 transition-colors">
                      {/* Code */}
                      <td className="px-4 py-3 font-mono font-bold text-gray-800">
                        <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-[11px] border border-gray-200">
                          {s.maDinhDanh}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                            {s.hoVaTen.charAt(0)}
                          </div>
                          <div>
                            <span className="text-[11px] font-bold text-red-700 uppercase block">
                              {s.tenThanh}
                            </span>
                            <strong className="text-sm text-gray-900 font-bold">
                              {s.hoVaTen}
                            </strong>
                          </div>
                        </div>
                      </td>

                      {/* DOB */}
                      <td className="px-4 py-3 text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{s.ngaySinh}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {s.gioiTinh}
                        </span>
                      </td>

                      {/* Parent Phone */}
                      <td className="px-4 py-3 text-gray-700">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Phone className="w-3.5 h-3.5 text-blue-600" />
                          <span>{s.sdtChinh}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {s.tenBo ? `Bố: ${s.tenBo}` : s.tenMe ? `Mẹ: ${s.tenMe}` : 'Phụ huynh'}
                        </span>
                      </td>

                      {/* Class */}
                      <td className="px-4 py-3">
                        <span className="inline-block bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded border border-blue-200 text-xs">
                          {studentClass?.tenLop || 'Chưa xếp'}
                        </span>
                      </td>

                      {/* Attendance points */}
                      <td className="px-4 py-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 font-black px-2.5 py-1 rounded-full text-xs">
                          {s.tongDiemChuyenCan}đ
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/the-qr?studentId=${s.id}`}
                            title="In thẻ đeo của em này"
                            className="p-1.5 rounded-lg text-gray-600 hover:text-red-700 hover:bg-gray-100 transition-colors"
                          >
                            <QrCode className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(s.id)}
                            title="Xóa hồ sơ"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-gray-200">
            <h4 className="font-bold text-gray-900 text-base">Xác nhận xóa hồ sơ Thiếu Nhi?</h4>
            <p className="text-xs text-gray-600">
              Hành động này sẽ xóa vĩnh viễn thông tin và lịch sử điểm danh của em khỏi hệ thống.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
