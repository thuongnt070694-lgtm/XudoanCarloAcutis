'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Calendar,
  CheckCircle,
  Clock,
  Award,
  Users,
  Search,
  AlertTriangle,
  History,
  Volume2,
  ShieldCheck,
  Camera,
  CameraOff,
} from 'lucide-react';
import { getStudents, getAttendanceRecords, recordAttendance, getClassesWithCount } from '@/lib/storage';
import { decodeQRPayload } from '@/lib/qr-helper';
import { ThieuNhi, DiemDanhRecord, LopInfo, CaLe } from '@/types';
import { CURRENT_USER } from '@/lib/mock-data';
import { DIEM_THUONG } from '@/lib/constants';

export default function DiemDanhPage() {
  const [students, setStudents] = useState<ThieuNhi[]>([]);
  const [classes, setClasses] = useState<LopInfo[]>([]);
  const [attendanceList, setAttendanceList] = useState<DiemDanhRecord[]>([]);

  // Attendance Mode Setup
  const [isSunday, setIsSunday] = useState<boolean>(true);
  const [thamDuLe, setThamDuLe] = useState<boolean>(true);
  const [thamDuGiaoLy, setThamDuGiaoLy] = useState<boolean>(true);
  const [caLe, setCaLe] = useState<CaLe>('LE_CHUA_NHAT');

  // Input code & Camera
  const [inputCode, setInputCode] = useState<string>('');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraLoading, setCameraLoading] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html5QrCodeRef = useRef<any>(null);

  const [statusAlert, setStatusAlert] = useState<{
    type: 'success' | 'warning' | 'error';
    text: string;
  } | null>(null);

  const loadAll = () => {
    setStudents(getStudents());
    setClasses(getClassesWithCount());
    setAttendanceList(getAttendanceRecords());
  };

  useEffect(() => {
    loadAll();
    const today = new Date();
    if (today.getDay() === 0) {
      setIsSunday(true);
      setCaLe('LE_CHUA_NHAT');
      setThamDuLe(true);
      setThamDuGiaoLy(true);
    } else {
      setIsSunday(false);
      setCaLe(today.getHours() < 12 ? 'LE_SANG' : 'LE_CHIEU');
      setThamDuLe(true);
      setThamDuGiaoLy(false);
    }

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraLoading(true);
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('page-camera-scanner-view');
      html5QrCodeRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        },
        (decodedText) => {
          handleScanCode(decodedText);
        },
        () => {}
      );
      setCameraActive(true);
    } catch (err) {
      console.error('Lỗi camera:', err);
      alert('Không thể mở camera. Vui lòng kiểm tra quyền cho phép Camera trên trình duyệt!');
      setCameraActive(false);
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Lỗi dừng camera:', err);
      }
    }
    setCameraActive(false);
  };

  const playBeep = (success: boolean) => {
    try {
      const audioCtx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(success ? 880 : 250, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + (success ? 0.15 : 0.35));
    } catch {}
  };

  const handleScanCode = (code: string) => {
    if (!code.trim()) return;

    let targetStudent: ThieuNhi | undefined;
    const decoded = decodeQRPayload(code);
    if (decoded) {
      targetStudent = students.find((s) => s.id === decoded.id || s.maDinhDanh === decoded.code);
    } else {
      targetStudent = students.find(
        (s) => s.maDinhDanh.toUpperCase() === code.trim().toUpperCase()
      );
    }

    if (!targetStudent) {
      playBeep(false);
      setStatusAlert({
        type: 'error',
        text: `Không tìm thấy thiếu nhi có mã [${code}] trong cơ sở dữ liệu!`,
      });
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const res = recordAttendance({
      thieuNhiId: targetStudent.id,
      ngay: todayStr,
      isSunday,
      thamDuLe,
      thamDuGiaoLy: isSunday ? thamDuGiaoLy : false,
      caLe: isSunday ? 'LE_CHUA_NHAT' : caLe,
      nguoiQuetTen: `${CURRENT_USER.chucVu} ${CURRENT_USER.hoVaTen}`,
      phuongThuc: 'QR_SCAN',
    });

    if (res.success) {
      playBeep(true);
      setStatusAlert({
        type: 'success',
        text: res.message,
      });
      loadAll();
    } else {
      playBeep(false);
      setStatusAlert({
        type: 'warning',
        text: res.message,
      });
    }

    setInputCode('');
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = attendanceList.filter((r) => r.ngay === todayStr);

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 pt-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2.5">
            <QrCode className="w-7 h-7 text-red-600" />
            Trạm Quét QR Điểm Danh Chuyên Cần
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Xứ Đoàn Carlo Acutis • Giáo Họ Vĩnh Lộc • Tối ưu quét camera tốc độ cao
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold bg-red-50 text-red-900 px-4 py-2.5 rounded-2xl border border-red-200">
          <Calendar className="w-4 h-4 text-red-600" />
          <span>Hôm nay: {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Mode Bar */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-black uppercase tracking-wider text-gray-700">
            Chế độ điểm danh hiện tại:
          </span>

          <div className="flex items-center rounded-2xl bg-gray-100 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setIsSunday(true);
                setCaLe('LE_CHUA_NHAT');
                setThamDuLe(true);
                setThamDuGiaoLy(true);
              }}
              className={`px-4 py-2 rounded-xl transition-all ${
                isSunday ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600'
              }`}
            >
              ✝ Chúa Nhật (Thánh Lễ + Giáo Lý)
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSunday(false);
                setCaLe('LE_SANG');
                setThamDuGiaoLy(false);
              }}
              className={`px-4 py-2 rounded-xl transition-all ${
                !isSunday ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600'
              }`}
            >
              📅 Ngày thường (Thứ 2 - Thứ 7, Tối đa 2 lễ)
            </button>
          </div>
        </div>

        {/* Options */}
        {isSunday ? (
          <div className="p-4 rounded-2xl bg-red-50/80 border border-red-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="text-red-900 font-bold">
              Mặc định tích chọn cả 2 mục. Bỏ tích nếu em vắng 1 trong 2:
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-red-200 shadow-sm font-bold text-gray-800">
                <input
                  type="checkbox"
                  checked={thamDuLe}
                  onChange={(e) => setThamDuLe(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <span>✓ Dự Thánh Lễ (+10đ)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-red-200 shadow-sm font-bold text-gray-800">
                <input
                  type="checkbox"
                  checked={thamDuGiaoLy}
                  onChange={(e) => setThamDuGiaoLy(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <span>✓ Học Giáo Lý (+10đ)</span>
              </label>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="text-amber-900 font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Quy chế ngày thường: Tối đa 2 Thánh Lễ/ngày (+5đ/lễ).</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-700">Ca lễ quét:</span>
              <select
                value={caLe}
                onChange={(e) => setCaLe(e.target.value as CaLe)}
                className="bg-white border border-amber-300 rounded-xl px-3 py-1.5 font-bold text-gray-800"
              >
                <option value="LE_SANG">🌅 Lễ Sáng (05:00)</option>
                <option value="LE_CHIEU">🌇 Lễ Chiều (18:00)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Alert Status */}
      {statusAlert && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between shadow-md animate-fadeIn ${
            statusAlert.type === 'success'
              ? 'bg-emerald-600 text-white'
              : statusAlert.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-amber-500 text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusAlert.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{statusAlert.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusAlert(null)}
            className="text-white/80 hover:text-white ml-2 text-base font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Scan and Manual Entry Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column: Input Scanner & Camera */}
        <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600"></span>
              Quét Thẻ Đoàn Sinh (Camera / Súng Bắn Mã)
            </h3>

            {cameraActive ? (
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <CameraOff className="w-4 h-4" />
                <span>Tắt Camera</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={startCamera}
                disabled={cameraLoading}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all hover:scale-105"
              >
                <Camera className="w-4 h-4" />
                <span>{cameraLoading ? 'Đang bật...' : 'Bật Camera Quét Mã'}</span>
              </button>
            )}
          </div>

          {/* Live Camera Viewport */}
          <div
            className={`bg-gray-950 rounded-2xl overflow-hidden p-3 text-center transition-all ${
              cameraActive ? 'block' : 'hidden'
            }`}
          >
            <div
              id="page-camera-scanner-view"
              className="w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-black min-h-[240px]"
            ></div>
            <p className="text-[11px] text-gray-400 mt-2 font-medium">
              Chĩa camera vào mã QR trên thẻ đoàn sinh (khoảng cách 10 - 20cm)
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleScanCode(inputCode);
            }}
            className="space-y-3"
          >
            <div className="flex gap-2.5">
              <input
                type="text"
                placeholder="Hoặc gõ mã định danh: VD TN-2014-9B21-0001 (hay quét súng mã vạch)"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                autoFocus
                className="flex-1 px-4 py-3.5 text-sm border-2 border-red-300 rounded-2xl focus:border-red-600 outline-none uppercase font-mono font-bold shadow-inner"
              />
              <button
                type="submit"
                className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-2xl shadow-md transition-colors"
              >
                Ghi Nhận
              </button>
            </div>
          </form>

          {/* Quick Demo Student Pills */}
          <div className="pt-2">
            <span className="text-xs text-gray-500 font-semibold block mb-2">
              Bấm nhanh vào đoàn sinh bên dưới để thử nghiệm quét:
            </span>
            <div className="flex flex-wrap gap-2">
              {students.slice(0, 6).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleScanCode(s.maDinhDanh)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-red-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 hover:text-red-800 transition-colors shadow-sm"
                >
                  {s.tenThanh} {s.hoVaTen}
                </button>
              ))}
            </div>
          </div>

          {/* History of Today */}
          <div className="pt-6 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-red-600" />
                Lịch sử đã điểm danh hôm nay ({todayRecords.length} em):
              </h4>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 border border-gray-100 rounded-2xl bg-gray-50">
              {todayRecords.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400 font-medium">
                  Chưa có lượt điểm danh nào trong ngày hôm nay. Hãy bật camera hoặc gõ mã để bắt đầu!
                </div>
              ) : (
                todayRecords.map((rec) => {
                  const st = students.find((s) => s.id === rec.thieuNhiId);
                  return (
                    <div
                      key={rec.id}
                      className="p-3.5 flex items-center justify-between text-xs hover:bg-white transition-colors"
                    >
                      <div>
                        <strong className="text-gray-900 text-sm font-bold">
                          {st?.tenThanh} {st?.hoVaTen}
                        </strong>{' '}
                        <span className="text-gray-400 font-mono text-[11px]">
                          ({st?.maDinhDanh})
                        </span>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          Quét lúc:{' '}
                          {new Date(rec.thoiGianQuet).toLocaleTimeString('vi-VN')} • Ca: {rec.caLe}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="bg-white border border-gray-200 text-gray-800 px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-sm">
                          {rec.thamDuLe && '✓ Lễ'} {rec.thamDuGiaoLy && '• ✓ Học'}
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 font-black px-2.5 py-1 rounded-lg text-xs">
                          +{rec.diemCong}đ
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Attendance Summary by Class */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h3 className="font-black text-gray-900 text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-red-600" />
            Theo Dõi Sĩ Số Theo Lớp Hôm Nay
          </h3>

          <div className="space-y-3">
            {classes.map((c) => {
              const checkedCount = todayRecords.filter((r) => {
                const st = students.find((s) => s.id === r.thieuNhiId);
                return st?.lopId === c.id;
              }).length;

              const percent = c.siSo > 0 ? Math.round((checkedCount / c.siSo) * 100) : 0;

              return (
                <div
                  key={c.id}
                  className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-xs space-y-2 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-gray-900 font-bold text-sm">{c.tenLop}</strong>
                    <span className="font-bold text-gray-700">
                      {checkedCount} / {c.siSo} em ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-red-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
