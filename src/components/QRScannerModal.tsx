'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ThieuNhi, CaLe } from '@/types';
import { getStudentByCode, getStudentById, recordAttendance, getStudents } from '@/lib/storage';
import { decodeQRPayload } from '@/lib/qr-helper';
import { CURRENT_USER } from '@/lib/mock-data';
import {
  Camera,
  CameraOff,
  CheckCircle,
  AlertCircle,
  Volume2,
  X,
  Sparkles,
  Search,
  Calendar,
  Clock,
  ShieldAlert,
  Zap,
} from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttendanceSuccess?: () => void;
}

export default function QRScannerModal({
  isOpen,
  onClose,
  onAttendanceSuccess,
}: QRScannerModalProps) {
  // Mode: Sunday vs Weekdays
  const [isSunday, setIsSunday] = useState<boolean>(true);
  const [thamDuLe, setThamDuLe] = useState<boolean>(true);
  const [thamDuGiaoLy, setThamDuGiaoLy] = useState<boolean>(true);
  const [caLe, setCaLe] = useState<CaLe>('LE_CHUA_NHAT');

  // Input states
  const [manualCode, setManualCode] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraLoading, setCameraLoading] = useState<boolean>(false);

  // Status feedback
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'warning';
    title: string;
    detail: string;
    points?: number;
  } | null>(null);

  // Recent scans list during this session
  const [sessionLogs, setSessionLogs] = useState<
    Array<{
      time: string;
      studentName: string;
      tenThanh: string;
      code: string;
      points: number;
      le: boolean;
      giaoLy: boolean;
    }>
  >([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html5QrCodeRef = useRef<any>(null);

  // Automatically detect day of week on mount
  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday
    if (dayOfWeek === 0) {
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
  }, [isOpen]);

  // Cleanup camera on close
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraLoading(true);
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('camera-scanner-view');
      html5QrCodeRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        },
        (decodedText) => {
          handleProcessScan(decodedText);
        },
        () => {
          // ignore scan frame errors
        }
      );
      setCameraActive(true);
    } catch (err) {
      console.error('Lỗi khởi động camera:', err);
      alert('Không thể truy cập camera. Vui lòng cấp quyền truy cập Camera trên trình duyệt của bạn!');
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

  const handleClose = async () => {
    await stopCamera();
    onClose();
  };

  // Web Audio beep sound effect
  const playBeep = (isSuccess: boolean) => {
    try {
      const audioCtx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (isSuccess) {
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch A5
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else {
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // Low buzz
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch {
      // AudioContext may be restricted until user gesture
    }
  };

  // Process scanning a student code / token
  const handleProcessScan = (rawScanText: string) => {
    if (!rawScanText) return;

    let targetStudent: ThieuNhi | undefined;

    // Check if it's a JSON QR payload
    const decoded = decodeQRPayload(rawScanText);
    if (decoded) {
      if (decoded.id) {
        targetStudent = getStudentById(decoded.id);
      }
      if (!targetStudent && decoded.code) {
        targetStudent = getStudentByCode(decoded.code);
      }
    } else {
      // Raw string: check student code or id
      targetStudent = getStudentByCode(rawScanText) || getStudentById(rawScanText);
    }

    if (!targetStudent) {
      playBeep(false);
      setStatusMessage({
        type: 'error',
        title: 'Không nhận diện được thiếu nhi!',
        detail: `Mã [${rawScanText}] không có trong cơ sở dữ liệu xứ đoàn.`,
      });
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const result = recordAttendance({
      thieuNhiId: targetStudent.id,
      ngay: todayStr,
      isSunday,
      thamDuLe,
      thamDuGiaoLy: isSunday ? thamDuGiaoLy : false,
      caLe: isSunday ? 'LE_CHUA_NHAT' : caLe,
      nguoiQuetTen: `${CURRENT_USER.tenThanh} ${CURRENT_USER.hoVaTen}`,
      phuongThuc: 'QR_SCAN',
    });

    if (result.success) {
      playBeep(true);
      setStatusMessage({
        type: 'success',
        title: 'Điểm danh THÀNH CÔNG!',
        detail: `[${targetStudent.tenThanh} ${targetStudent.hoVaTen}] • Mã: ${targetStudent.maDinhDanh}`,
        points: result.pointsAdded,
      });

      // Add to session logs
      setSessionLogs((prev) => [
        {
          time: new Date().toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          studentName: targetStudent!.hoVaTen,
          tenThanh: targetStudent!.tenThanh,
          code: targetStudent!.maDinhDanh,
          points: result.pointsAdded,
          le: thamDuLe,
          giaoLy: isSunday ? thamDuGiaoLy : false,
        },
        ...prev,
      ]);

      if (onAttendanceSuccess) {
        onAttendanceSuccess();
      }
    } else {
      playBeep(false);
      setStatusMessage({
        type: 'warning',
        title: 'Không thể điểm danh!',
        detail: result.message,
      });
    }

    setManualCode('');
  };

  const allStudents = getStudents();
  const searchResults = searchQuery.trim()
    ? allStudents
        .filter(
          (s) =>
            s.hoVaTen.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.maDinhDanh.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.sdtChinh.includes(searchQuery)
        )
        .slice(0, 5)
    : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[95vh] border border-gray-200">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Camera className="w-6 h-6 text-yellow-300" />
            <div>
              <h3 className="font-black text-base sm:text-lg">QUÉT MÃ QR ĐIỂM DANH CHUYÊN CẦN</h3>
              <p className="text-xs text-red-100 font-medium">
                Xứ Đoàn Carlo Acutis • Giáo Họ Vĩnh Lộc
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Bar (Sunday vs Weekday) */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Mode Selector */}
            <div className="flex items-center rounded-xl bg-gray-200 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setIsSunday(true);
                  setCaLe('LE_CHUA_NHAT');
                  setThamDuLe(true);
                  setThamDuGiaoLy(true);
                }}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  isSunday ? 'bg-red-600 text-white shadow-sm' : 'text-gray-700'
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
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  !isSunday ? 'bg-red-600 text-white shadow-sm' : 'text-gray-700'
                }`}
              >
                📅 Ngày thường (Thứ 2 - Thứ 7)
              </button>
            </div>

            <div className="text-xs text-gray-500 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>Hôm nay: {new Date().toLocaleDateString('vi-VN')}</span>
            </div>
          </div>

          {/* Attendance Options based on mode */}
          {isSunday ? (
            <div className="bg-red-50/90 border border-red-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-red-900">
                Quy chế Chúa Nhật (Mặc định tích chọn cả 2, bỏ tick nếu vắng 1 mục):
              </span>
              <div className="flex items-center gap-3 text-xs font-bold">
                <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-red-200 shadow-sm text-gray-800">
                  <input
                    type="checkbox"
                    checked={thamDuLe}
                    onChange={(e) => setThamDuLe(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  />
                  <span>✓ Dự Thánh Lễ (+10đ)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-red-200 shadow-sm text-gray-800">
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
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span className="text-amber-900 font-semibold">
                  <strong>Giới hạn ngày thường:</strong> Tối đa 2 Thánh Lễ/ngày (+5đ/lễ) để khen thưởng.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="font-bold text-gray-700">Chọn Ca Lễ:</label>
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

        {/* Live Status Feedback Banner */}
        {statusMessage && (
          <div
            className={`px-5 py-3.5 flex items-center justify-between text-sm animate-fadeIn ${
              statusMessage.type === 'success'
                ? 'bg-emerald-600 text-white'
                : statusMessage.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-amber-500 text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {statusMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <div>
                <strong className="block text-sm font-black">{statusMessage.title}</strong>
                <span className="text-xs opacity-95">{statusMessage.detail}</span>
              </div>
            </div>
            {statusMessage.points !== undefined && statusMessage.points > 0 && (
              <span className="bg-white/20 font-black px-3 py-1 rounded-full text-xs">
                +{statusMessage.points} Điểm
              </span>
            )}
          </div>
        )}

        {/* Scanner & Manual Input Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* CAMERA SCANNER VIEWPORT */}
          <div className="bg-gray-900 rounded-2xl overflow-hidden p-4 text-center text-white relative shadow-inner">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold flex items-center gap-1.5 text-yellow-300">
                <Camera className="w-4 h-4" />
                Camera Quét Mã QR Trực Tiếp
              </span>

              {cameraActive ? (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1 text-xs"
                >
                  <CameraOff className="w-3.5 h-3.5" />
                  <span>Tắt Camera</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startCamera}
                  disabled={cameraLoading}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 text-xs shadow-md transition-all hover:scale-105"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{cameraLoading ? 'Đang mở...' : 'Bật Camera Quét Mã'}</span>
                </button>
              )}
            </div>

            {/* Video container for html5-qrcode */}
            <div
              id="camera-scanner-view"
              className={`w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-black ${
                cameraActive ? 'min-h-[240px]' : 'hidden'
              }`}
            ></div>

            {!cameraActive && (
              <div className="py-8 px-4 text-center text-gray-400 space-y-2">
                <Camera className="w-12 h-12 mx-auto text-gray-600 animate-pulse" />
                <p className="text-xs text-gray-300">
                  Bấm nút <strong>"Bật Camera Quét Mã"</strong> ở trên để cho phép sử dụng camera điện thoại/máy tính quét thẻ đeo của đoàn sinh.
                </p>
              </div>
            )}
          </div>

          {/* Quick Manual Code Input / USB Barcode Scanner Input */}
          <div className="bg-gray-100 p-4 rounded-2xl border border-gray-200">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              Nhập mã định danh (hoặc dùng Súng bắn mã QR cắm USB):
            </label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleProcessScan(manualCode);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="VD: TN-2014-9B21-0001 (hoặc quét súng mã vạch vào đây)"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none uppercase font-mono font-bold"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 text-xs transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Ghi nhận</span>
              </button>
            </form>

            {/* Quick Demo Test Buttons */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-500 font-semibold">Thử quét nhanh mẫu:</span>
              <button
                type="button"
                onClick={() => handleProcessScan('TN-2014-9B21-0001')}
                className="bg-white hover:bg-gray-50 border border-gray-300 px-2.5 py-1 rounded-lg text-blue-700 font-bold shadow-sm"
              >
                Giuse Nguyễn Văn An
              </button>
              <button
                type="button"
                onClick={() => handleProcessScan('TN-2014-3C7A-0002')}
                className="bg-white hover:bg-gray-50 border border-gray-300 px-2.5 py-1 rounded-lg text-purple-700 font-bold shadow-sm"
              >
                Maria Trần Thu Trang
              </button>
              <button
                type="button"
                onClick={() => handleProcessScan('AN-2017-1F44-0007')}
                className="bg-white hover:bg-gray-50 border border-gray-300 px-2.5 py-1 rounded-lg text-emerald-700 font-bold shadow-sm"
              >
                Giuse Nguyễn Minh Quân
              </button>
            </div>
          </div>

          {/* Search by Name if student forgot QR card */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Tìm theo tên khi em quên mang thẻ đeo:
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Gõ tên hoặc số điện thoại phụ huynh để tìm nhanh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-medium"
              />
            </div>

            {searchResults.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-xl divide-y divide-gray-100 bg-white shadow-sm overflow-hidden">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 hover:bg-red-50 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <strong className="text-gray-900 text-sm font-bold">
                        {item.tenThanh} {item.hoVaTen}
                      </strong>{' '}
                      <span className="text-gray-500 font-mono">({item.maDinhDanh})</span>
                      <div className="text-[11px] text-gray-500">
                        SĐT: {item.sdtChinh} • Sinh: {item.ngaySinh}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleProcessScan(item.maDinhDanh);
                        setSearchQuery('');
                      }}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm"
                    >
                      Điểm danh
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Session Logs: List of scanned students in this turn */}
          {sessionLogs.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Nhật ký vừa quét phiên này ({sessionLogs.length} em):</span>
                <span className="text-emerald-700 font-black">
                  Tổng điểm: +{sessionLogs.reduce((acc, curr) => acc + curr.points, 0)}đ
                </span>
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {sessionLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-emerald-50 border border-emerald-100"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 font-mono">{log.time}</span>
                      <strong className="text-gray-900">
                        {log.tenThanh} {log.studentName}
                      </strong>
                      <span className="text-[10px] text-gray-500 font-mono">({log.code})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-emerald-200 text-emerald-800 font-bold">
                        {log.le && '✓ Lễ'} {log.giaoLy && '• ✓ Học'}
                      </span>
                      <span className="font-black text-emerald-700">+{log.points}đ</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-100 border-t border-gray-200 flex justify-between items-center text-xs text-gray-600">
          <span>
            Người ghi nhận: <strong>{CURRENT_USER.chucVu} {CURRENT_USER.hoVaTen}</strong>
          </span>
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-xs transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
