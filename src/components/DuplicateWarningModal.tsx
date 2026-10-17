'use client';

import React from 'react';
import { ThieuNhi, DuplicateCheckResult } from '@/types';
import { AlertTriangle, XCircle, CheckCircle2, UserCheck, Phone, Calendar, School } from 'lucide-react';
import { DANH_SACH_LOP_BAN_DAU } from '@/lib/constants';

interface DuplicateWarningModalProps {
  isOpen: boolean;
  checkResult: DuplicateCheckResult | null;
  newStudentData: {
    tenThanh: string;
    hoVaTen: string;
    ngaySinh: string;
    sdtChinh: string;
    sdtBo?: string;
    sdtMe?: string;
    lopId: string;
  };
  onCancel: () => void;
  onProceedSave?: () => void;
}

export default function DuplicateWarningModal({
  isOpen,
  checkResult,
  newStudentData,
  onCancel,
  onProceedSave,
}: DuplicateWarningModalProps) {
  if (!isOpen || !checkResult || !checkResult.hasDuplicate) return null;

  const getClassName = (lopId: string) => {
    return DANH_SACH_LOP_BAN_DAU.find((l) => l.id === lopId)?.tenLop || lopId;
  };

  const isHard = checkResult.isHardMatch;
  const matched = checkResult.matchedStudents[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div
          className={`px-6 py-4 flex items-center gap-3 text-white ${
            isHard ? 'bg-red-600' : 'bg-amber-500'
          }`}
        >
          {isHard ? (
            <XCircle className="w-8 h-8 flex-shrink-0 animate-bounce" />
          ) : (
            <AlertTriangle className="w-8 h-8 flex-shrink-0" />
          )}
          <div>
            <h3 className="text-lg font-bold">
              {isHard
                ? 'PHÁT HIỆN TRÙNG LẶP HỒ SƠ (CHẶN BẮT BUỘC)'
                : 'CẢNH BÁO: TÌM THẤY THIẾU NHI CÓ THÔNG TIN TƯƠNG ĐỒNG'}
            </h3>
            <p className="text-xs opacity-90">{checkResult.message}</p>
          </div>
        </div>

        {/* Comparison Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          <p className="text-sm text-gray-600 leading-relaxed">
            {isHard
              ? 'Hệ thống phát hiện thông tin bạn vừa nhập hoàn toàn trùng khớp với hồ sơ đã lưu trước đó. Để đảm bảo dữ liệu không bị nhân bản, hệ thống chặn lưu bản ghi này.'
              : 'Hệ thống tìm thấy hồ sơ có thông tin rất giống nhau. Vui lòng đối chiếu 2 cột bên dưới để xác nhận xem đây là 2 em khác nhau (như anh em ruột/sinh đôi) hay là nhập trùng:'}
          </p>

          {/* Side by side box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Newly entered data */}
            <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-4">
              <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                Dữ liệu bạn vừa nhập
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-xs text-gray-500 block">Tên Thánh & Họ Tên:</span>
                  <strong className="text-gray-900 text-base">
                    {newStudentData.tenThanh} {newStudentData.hoVaTen}
                  </strong>
                </div>
                <div className="flex items-center gap-1.5 text-gray-700">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Ngày sinh: <strong>{newStudentData.ngaySinh || 'Chưa nhập'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-700">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span>SĐT liên hệ: <strong>{newStudentData.sdtChinh || newStudentData.sdtBo || newStudentData.sdtMe || 'Chưa nhập'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-700">
                  <School className="w-4 h-4 text-blue-600" />
                  <span>Lớp dự kiến: <strong>{getClassName(newStudentData.lopId)}</strong></span>
                </div>
              </div>
            </div>

            {/* Existing student data in DB */}
            {matched && (
              <div className="border border-red-200 bg-red-50/50 rounded-xl p-4">
                <div className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  Hồ sơ đã lưu trước đó ({matched.maDinhDanh})
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-xs text-gray-500 block">Tên Thánh & Họ Tên:</span>
                    <strong className="text-red-900 text-base">
                      {matched.tenThanh} {matched.hoVaTen}
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <Calendar className="w-4 h-4 text-red-600" />
                    <span>Ngày sinh: <strong>{matched.ngaySinh}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <Phone className="w-4 h-4 text-red-600" />
                    <span>SĐT Phụ huynh: <strong>{matched.sdtChinh}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <School className="w-4 h-4 text-red-600" />
                    <span>Lớp hiện tại: <strong>{getClassName(matched.lopId)}</strong></span>
                  </div>
                  {matched.tenBo && (
                    <div className="text-xs text-gray-500 pt-1 border-t border-red-100">
                      Bố/Mẹ: {matched.tenBo || matched.tenMe}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {checkResult.matchedStudents.length > 1 && (
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs text-amber-800">
              ℹ️ Có thêm {checkResult.matchedStudents.length - 1} em khác cũng có tên hoặc SĐT gần tương tự trong hệ thống.
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors text-sm"
          >
            {isHard ? 'Đã hiểu, quay lại chỉnh sửa' : 'Hủy bỏ (Nhập lại)'}
          </button>

          {!isHard && onProceedSave && (
            <button
              type="button"
              onClick={onProceedSave}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium transition-colors text-sm flex items-center gap-2 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác nhận: Đây là em khác (Vẫn lưu hồ sơ)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
