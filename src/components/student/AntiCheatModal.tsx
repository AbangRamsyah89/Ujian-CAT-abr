import React, { useState, useEffect } from 'react';
import { AlertOctagon, ShieldAlert, Maximize2, AlertTriangle } from 'lucide-react';
import { requestBrowserFullscreen } from '../../utils/antiCheat';

interface AntiCheatModalProps {
  isOpen: boolean;
  type: 'tab_switch' | 'fullscreen_exit' | 'limit_reached' | 'proctor_alert';
  message?: string;
  violationsCount: number;
  maxViolations: number;
  onDismiss: () => void;
}

export const AntiCheatModal: React.FC<AntiCheatModalProps> = ({
  isOpen,
  type,
  message,
  violationsCount,
  maxViolations,
  onDismiss
}) => {
  const [countdown, setCountdown] = useState<number>(10);

  useEffect(() => {
    if (!isOpen) return;
    setCountdown(10);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const isLimitReached = violationsCount >= maxViolations;

  const handleReturnToExam = async () => {
    try {
      await requestBrowserFullscreen();
    } catch {
      // ignore
    }
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10">
        {/* Header alert strip */}
        <div className={`p-6 text-white ${isLimitReached ? 'bg-rose-600' : 'bg-amber-600'}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              {isLimitReached ? (
                <AlertOctagon className="h-7 w-7 text-white animate-bounce" />
              ) : (
                <ShieldAlert className="h-7 w-7 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                {isLimitReached
                  ? 'UJIAN DIBEKUKAN / DISKUALIFIKASI'
                  : 'PERINGATAN KEAMANAN ANTI-CHEAT'}
              </h2>
              <p className="text-xs text-white/90">
                Sistem Pemantauan Integritas Ujian Real-Time
              </p>
            </div>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 mb-5">
            <p className="text-sm font-semibold text-slate-800 mb-1">
              Insiden Terdeteksi:
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              {message ||
                (type === 'tab_switch'
                  ? 'Anda terdeteksi berpindah tab, meminimalkan jendela, atau membuka aplikasi lain di luar browser ujian.'
                  : type === 'fullscreen_exit'
                  ? 'Anda keluar dari mode layar penuh (Fullscreen). Ujian wajib dikerjakan dalam mode layar penuh.'
                  : 'Aktivitas mencurigakan terdeteksi oleh sistem pengawas.')}
            </p>
          </div>

          {/* Violation Counter pill */}
          <div className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3 border border-amber-200 text-amber-900 mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <span className="text-xs font-semibold">
                Akumulasi Pelanggaran:
              </span>
            </div>
            <div className="text-sm font-bold">
              <span className={violationsCount >= maxViolations ? 'text-rose-600' : 'text-amber-700'}>
                {violationsCount}
              </span>{' '}
              / {maxViolations} Toleransi
            </div>
          </div>

          <p className="text-xs text-slate-500 mb-6">
            Catatan: Setiap upaya berpindah tab, menggunakan pintasan terlarang, atau
            membuka jendela lain direkam secara otomatis dan dilaporkan secara real-time ke panel pengawas ujian.
          </p>

          {/* Action button */}
          {!isLimitReached ? (
            <button
              onClick={handleReturnToExam}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 px-4 font-semibold text-white shadow-md hover:bg-indigo-700 active:scale-[0.99] transition-all"
            >
              <Maximize2 className="h-4 w-4" />
              <span>Masuk Kembali ke Layar Penuh & Lanjutkan</span>
            </button>
          ) : (
            <div className="text-center p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 font-semibold text-sm">
              Batas toleransi pelanggaran telah habis. Silakan hubungi pengawas ruang ujian untuk membuka kunci sesi Anda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
