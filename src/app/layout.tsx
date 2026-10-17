import './globals.css';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Xứ Đoàn Carlo Acutis - Giáo Họ Vĩnh Lộc | Quản Lý Giáo Lý & Thiếu Nhi',
  description: 'Hệ thống Quản lý 2.000 Thiếu Nhi, Điểm danh QR & In thẻ - Xứ Đoàn Carlo Acutis, Giáo Họ Vĩnh Lộc',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="antialiased min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 pb-16">{children}</main>
      </body>
    </html>
  );
}
