import React, { useState } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  Monitor, 
  Laptop, 
  Lock, 
  FileText, 
  Clock, 
  Award,
  ArrowRight
} from 'lucide-react';
import { useExam } from '../../context/ExamContext';
import { MOCK_EXAMS } from '../../data/mockExams';
import { CameraCapture } from '../common/CameraCapture';
import { requestBrowserFullscreen } from '../../utils/antiCheat';

export const StudentPortal: React.FC = () => {
  const { 
    selectedExam, 
    setSelectedExam, 
    startExam, 
    studentSessionStatus 
  } = useExam();

  const [tokenInput, setTokenInput] = useState(selectedExam.token);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [agreedToRules, setAgreedToRules] = useState<boolean>(true);

  const handleStartExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!agreedToRules) {
      setErrorMessage('Anda harus menyetujui pakta integritas dan ketentuan anti-cheat!');
      return;
    }

    try {
      await requestBrowserFullscreen();
    } catch {
      // Browser may require user gesture on specific element
    }

    const res = startExam(tokenInput);
    if (!res.success) {
      setErrorMessage(res.message || 'Token ujian tidak valid!');
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Col: Student Profile & Hardware Readiness Check */}
        <div className="lg:col-span-5 space-y-6">
          {/* Identity Card */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
                alt="Ahmad Fauzi"
                className="h-16 w-16 rounded-full border-2 border-indigo-500/20 object-cover shadow-xs"
              />
              <div>
                <span className="inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                  Peserta Ujian Resmi
                </span>
                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  Ahmad Fauzi
                </h2>
                <p className="text-xs text-slate-500">
                  NISN: 0068412901 • Kelas XII MIPA 1
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Sekolah Asal:</span>
                <span className="font-semibold text-slate-800">SMA Negeri 1 Indonesia</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Ruang / Sesi:</span>
                <span className="font-semibold text-slate-800">Laboratorium CBT Komputer 03</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Alamat IP Klien:</span>
                <span className="font-mono text-slate-800">192.168.10.45</span>
              </div>
            </div>
          </div>

          {/* Biometric & Webcam Proctoring Preview */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-600" />
                Uji Validasi Kamera & Biometrik
              </h3>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                Siap Digunakan
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Kamera akan memantau posisi wajah Anda selama ujian berlangsung untuk mencegah kecurangan.
            </p>
            <div className="flex justify-center">
              <CameraCapture studentName="Ahmad Fauzi" className="w-full h-44" />
            </div>
          </div>

          {/* Anti-Cheat System Check Checklist */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Protokol Keamanan Aktif
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Wajib Mode Layar Penuh (Kunci Fullscreen)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Deteksi Perpindahan Tab & Jendela Browser</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Blokir Salin-Tempel (Copy-Paste) & Pintasan F12</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Pemantauan Layar Real-Time oleh Pengawas</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Col: Exam Selection & Token Entry */}
        <div className="lg:col-span-7 space-y-6">
          {/* Exam Details Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                  Naskah Ujian Terpilih
                </span>
                <h1 className="text-xl font-extrabold text-slate-900 mt-1">
                  {selectedExam.title}
                </h1>
              </div>
              <div className="hidden sm:block">
                <span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 inline-block">
                  <FileText className="w-6 h-6" />
                </span>
              </div>
            </div>

            {/* Switch Exam Pills */}
            <div className="mt-4 flex flex-wrap gap-2">
              {MOCK_EXAMS.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => {
                    setSelectedExam(ex);
                    setTokenInput(ex.token);
                    setErrorMessage(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedExam.id === ex.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {ex.subject} ({ex.durationMinutes} mnt)
                </button>
              ))}
            </div>

            {/* Quick Specs Grid */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Durasi</span>
                </div>
                <div className="text-base font-bold text-slate-900">
                  {selectedExam.durationMinutes} Menit
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Jumlah Soal</span>
                </div>
                <div className="text-base font-bold text-slate-900">
                  {selectedExam.questions.length} Butir
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <Award className="w-3.5 h-3.5 text-slate-400" />
                  <span>KKM Lulus</span>
                </div>
                <div className="text-base font-bold text-slate-900">
                  {selectedExam.kkm} Poin
                </div>
              </div>
            </div>

            {/* Token Entry Form */}
            <form onSubmit={handleStartExam} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="exam-token-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Masukkan Token Ujian Resmi
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <KeyRound className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="exam-token-input"
                    type="text"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                    placeholder="Contoh: EDUX2026"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-3 pl-11 pr-24 font-mono text-base font-bold uppercase tracking-widest text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setTokenInput(selectedExam.token)}
                    className="absolute right-2 top-2 bottom-2 px-2.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100 transition-colors"
                  >
                    Salin Token
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500">
                  Token diperoleh dari Pengawas Ruang: <span className="font-mono font-bold text-indigo-600">{selectedExam.token}</span>
                </p>
              </div>

              {/* Integrity Pledge Checkbox */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToRules}
                    onChange={(e) => setAgreedToRules(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-700 leading-relaxed">
                    Saya menyatakan bersedia mengerjakan ujian dengan jujur, mandiri, tanpa bantuan orang lain atau mesin pencari, dan menyetujui pemantauan layar real-time oleh pengawas.
                  </span>
                </label>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3.5 text-xs text-rose-700 border border-rose-200">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                id="btn-start-exam"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 px-6 font-bold text-white shadow-md hover:bg-indigo-700 active:scale-[0.99] transition-all"
              >
                <span>Mulai Kerjakan Ujian Sekarang</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
