'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  QrCode,
  Printer,
  Award,
  PlusCircle,
  Home,
  ShieldCheck,
} from 'lucide-react';
import { TEN_XU_DOAN, TEN_GIAO_HO } from '@/lib/constants';
import { CURRENT_USER } from '@/lib/mock-data';
import GitSyncButton from './GitSyncButton';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Tổng quan', icon: Home },
    { href: '/thieu-nhi', label: 'Danh sách Thiếu Nhi', icon: Users },
    { href: '/thieu-nhi/them-moi', label: 'Thêm mới (Kiểm tra trùng)', icon: PlusCircle },
    { href: '/diem-danh', label: 'Quét QR Điểm danh', icon: QrCode, highlight: true },
    { href: '/the-qr', label: 'In thẻ đeo PDF', icon: Printer },
    { href: '/khen-thuong', label: 'Vinh danh Chuyên cần', icon: Award },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm print:hidden w-full">
      {/* Top Banner Full HD */}
      <div className="bg-red-700 text-white px-4 sm:px-8 py-2 text-xs font-semibold">
        <div className="w-full max-w-[1800px] mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse"></span>
            <span className="tracking-wide">
              {TEN_GIAO_HO} • {TEN_XU_DOAN} • PHONG TRÀO THIẾU NHI THÁNH THỂ VIỆT NAM
            </span>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <GitSyncButton compact />
            <span className="bg-red-800/90 px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-inner">
              <ShieldCheck className="w-4 h-4 text-yellow-300" />
              <span>{CURRENT_USER.chucVu}:</span>
              <strong className="text-yellow-200 font-bold">{CURRENT_USER.tenThanh} {CURRENT_USER.hoVaTen}</strong>
            </span>
            <span className="bg-yellow-400 text-red-950 font-black px-2 py-0.5 rounded text-[11px] shadow-sm">
              CẤP 1 - BAN ĐIỀU HÀNH
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar Full HD */}
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Title */}
          <Link href="/" className="flex items-center space-x-3.5 group flex-shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 via-red-700 to-amber-500 text-white flex items-center justify-center font-black text-2xl shadow-md group-hover:scale-105 transition-transform">
              ✝
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg lg:text-xl font-black text-gray-900 tracking-tight whitespace-nowrap">
                  {TEN_XU_DOAN}
                </h1>
                <span className="hidden xl:inline-block bg-red-100 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {TEN_GIAO_HO}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium whitespace-nowrap">
                Hệ thống Quản lý Giáo Lý, Điểm danh QR & In thẻ Đoàn Sinh
              </p>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center space-x-2 xl:space-x-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    item.highlight
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 hover:scale-105'
                      : isActive
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile / Tablet Nav Bar */}
      <div className="lg:hidden border-t border-gray-100 px-3 py-2 flex items-center justify-around overflow-x-auto bg-gray-50 text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1.5 px-3 rounded-xl whitespace-nowrap font-medium ${
                isActive
                  ? 'text-red-700 font-bold bg-red-100/70'
                  : item.highlight
                  ? 'text-white bg-red-600 font-bold px-3.5'
                  : 'text-gray-600'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
