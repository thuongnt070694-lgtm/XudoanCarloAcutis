'use client';

import React, { useState } from 'react';
import { CloudUpload, RefreshCw, CheckCircle2, AlertTriangle, ExternalLink, X } from 'lucide-react';
import { getStudents, getAttendanceRecords } from '@/lib/storage';

export default function GitSyncButton({ compact = false }: { compact?: boolean }) {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    message: string;
    timestamp?: string;
  } | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleSyncToGithub = async () => {
    setIsSyncing(true);
    setSyncResult(null);

    try {
      // 1. Lấy toàn bộ dữ liệu hiện tại từ bộ nhớ localStorage
      const students = getStudents();
      const attendance = getAttendanceRecords();

      // 2. Gửi yêu cầu đến API backend để thực hiện commit & push
      const response = await fetch('/api/git-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          students,
          attendance,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSyncResult({
          success: true,
          message: data.message,
          timestamp: data.timestamp,
        });
      } else {
        setSyncResult({
          success: false,
          message: data.message || 'Không thể đồng bộ lên GitHub!',
        });
      }
    } catch (err: unknown) {
      setSyncResult({
        success: false,
        message:
          'Lỗi kết nối: ' + (err instanceof Error ? err.message : 'Vui lòng kiểm tra lại mạng.'),
      });
    } finally {
      setIsSyncing(false);
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleSyncToGithub}
        disabled={isSyncing}
        title="Tự động lưu dữ liệu, commit và đẩy (push) lên GitHub để Render tự cập nhật"
        className={`inline-flex items-center gap-2 font-bold transition-all shadow-md active:scale-95 ${
          compact
            ? 'bg-amber-400 hover:bg-amber-300 text-red-950 px-3 py-1 rounded-lg text-xs'
            : 'bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-red-950 px-4 py-2 rounded-xl text-xs sm:text-sm hover:scale-105'
        } ${isSyncing ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isSyncing ? (
          <RefreshCw className="w-4 h-4 animate-spin text-red-900" />
        ) : (
          <CloudUpload className="w-4 h-4 text-red-900" />
        )}
        <span className="whitespace-nowrap">
          {isSyncing ? 'Đang đẩy lên GitHub...' : 'Cập Nhật Lên GitHub'}
        </span>
      </button>

      {/* Modal kết quả đồng bộ */}
      {showModal && syncResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200">
            {/* Header */}
            <div
              className={`px-6 py-4 flex items-center justify-between text-white ${
                syncResult.success
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700'
                  : 'bg-gradient-to-r from-red-600 to-rose-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {syncResult.success ? (
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                )}
                <h3 className="font-black text-base">
                  {syncResult.success ? 'ĐỒNG BỘ GITHUB THÀNH CÔNG' : 'LỖI ĐỒNG BỘ GITHUB'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full hover:bg-white/20 transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700 leading-relaxed font-medium">
                {syncResult.message}
              </p>

              {syncResult.success ? (
                <div className="space-y-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900">
                  <div className="flex items-center gap-2 font-bold">
                    <span>Thời gian đẩy:</span>
                    <span className="font-mono text-emerald-700">{syncResult.timestamp}</span>
                  </div>
                  <p className="leading-relaxed">
                    ✨ <strong>Render đang tự động cập nhật:</strong> Do đã liên kết với GitHub, máy
                    chủ Render sẽ tự động kéo bản cập nhật mới nhất này về và triển khai trực tuyến
                    sau khoảng 1 - 2 phút!
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2">
                    <a
                      href="https://github.com/thuongnt070694-lgtm/XudoanCarloAcutis"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-white border border-emerald-300 text-emerald-800 font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      <span>Xem trên GitHub</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href="https://dashboard.render.com/project/prj-db9jendg1s2s738ujmlg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-800 transition-colors"
                    >
                      <span>Xem tiến trình Render</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-900 space-y-2">
                  <p className="font-bold">Cách khắc phục nhanh bằng dòng lệnh Terminal:</p>
                  <pre className="bg-white p-2.5 rounded-xl border border-red-200 font-mono text-[11px] text-gray-800 overflow-x-auto">
                    git add .{"\n"}
                    git commit -m &quot;update&quot;{"\n"}
                    git push origin main
                  </pre>
                  <p className="text-[11px] text-gray-600">
                    * Lưu ý: Nút Auto Update hoạt động khi bạn đang chạy web ở máy tính cục bộ
                    (Localhost) có cài đặt Git và đã đăng nhập GitHub.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-xs transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
