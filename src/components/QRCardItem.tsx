'use client';

import React, { useEffect, useState } from 'react';
import { ThieuNhi, LopInfo, NganhInfo } from '@/types';
import { generateQRDataURL, encodeQRPayload } from '@/lib/qr-helper';
import { DANH_SACH_NGANH, DANH_SACH_LOP_BAN_DAU, TEN_XU_DOAN, KHAU_HIEU } from '@/lib/constants';
import { User } from 'lucide-react';

interface QRCardItemProps {
  student: ThieuNhi;
  compact?: boolean;
}

export default function QRCardItem({ student, compact = false }: QRCardItemProps) {
  const [qrSrc, setQrSrc] = useState<string>('');

  const lop: LopInfo | undefined = DANH_SACH_LOP_BAN_DAU.find((l) => l.id === student.lopId);
  const nganh: NganhInfo | undefined = DANH_SACH_NGANH.find(
    (n) => n.code === (lop?.nganhCode || 'THIEU')
  );

  useEffect(() => {
    async function loadQR() {
      const payload = encodeQRPayload(student.id, student.maDinhDanh, student.hoVaTen);
      const url = await generateQRDataURL(payload);
      setQrSrc(url);
    }
    loadQR();
  }, [student]);

  // Card color theme based on TNTT branch
  const getBannerGradient = () => {
    switch (nganh?.code) {
      case 'CHIEN':
        return 'from-pink-600 to-rose-500';
      case 'AU':
        return 'from-emerald-700 to-green-600';
      case 'THIEU':
        return 'from-blue-700 to-indigo-600';
      case 'NGHIA':
        return 'from-amber-600 to-yellow-500';
      case 'HIEP':
        return 'from-stone-700 to-amber-900';
      case 'DU_TRUONG':
        return 'from-red-700 to-rose-700';
      default:
        return 'from-red-700 to-blue-700';
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-md border-2 border-gray-300 overflow-hidden print:shadow-none print:border-gray-800 flex flex-col justify-between transition-all duration-200 ${
        compact ? 'w-full max-w-sm' : 'w-[85mm] h-[125mm] m-auto print:m-1'
      }`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* CARD HEADER */}
      <div className={`bg-gradient-to-r ${getBannerGradient()} text-white p-2.5 text-center relative`}>
        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          <span className="text-yellow-300 text-sm font-bold">✠</span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-yellow-200">
            GIÁO HỌ VĨNH LỘC • TNTT VN
          </span>
          <span className="text-yellow-300 text-sm font-bold">✠</span>
        </div>
        <h4 className="text-xs font-black uppercase tracking-tight text-white drop-shadow">
          {TEN_XU_DOAN}
        </h4>
        <div className="text-[9px] text-white/90 font-medium">THẺ ĐOÀN SINH NIÊN KHÓA 2025 - 2026</div>
      </div>

      {/* CARD BODY: Photo + Info */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div className="flex gap-3 items-center">
          {/* Avatar / Student Photo */}
          <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-lg border-2 border-gray-300 bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-inner">
            {student.anhDaiDien ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={student.anhDaiDien}
                alt={student.hoVaTen}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <User className="w-8 h-8" />
                <span className="text-[8px] uppercase font-bold text-gray-400 mt-0.5">Ảnh 3x4</span>
              </div>
            )}
          </div>

          {/* Student details */}
          <div className="flex-1 min-w-0 space-y-1">
            <div>
              <span className="text-[10px] uppercase font-bold text-red-600 block leading-tight">
                Tên Thánh:
              </span>
              <span className="text-sm font-black text-red-700 tracking-wide uppercase">
                {student.tenThanh}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500 block leading-tight">
                Họ và Tên:
              </span>
              <span className="text-sm sm:text-base font-extrabold text-gray-900 leading-tight block truncate uppercase">
                {student.hoVaTen}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded border border-blue-200">
                Lớp: {lop?.tenLop || 'Chưa xếp'}
              </span>
              <span className="text-[10px] text-gray-500">
                Sinh: {student.ngaySinh.split('-')[0]}
              </span>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="my-2 bg-gray-50 rounded-lg p-2 border border-dashed border-gray-300 flex flex-col items-center justify-center">
          {qrSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrSrc}
              alt={`Mã QR ${student.maDinhDanh}`}
              className="w-28 h-28 object-contain rounded bg-white p-1 border shadow-sm"
            />
          ) : (
            <div className="w-28 h-28 bg-gray-200 animate-pulse rounded"></div>
          )}
          <span className="text-[11px] font-mono font-bold text-gray-800 mt-1 tracking-wider">
            {student.maDinhDanh}
          </span>
          <span className="text-[8px] text-gray-500">Mã định danh duy nhất quét điểm danh</span>
        </div>
      </div>

      {/* CARD FOOTER */}
      <div className="bg-gray-100 border-t border-gray-200 px-2 py-1.5 text-center">
        <p className="text-[8px] font-extrabold text-red-700 tracking-widest uppercase">
          {KHAU_HIEU}
        </p>
      </div>
    </div>
  );
}
