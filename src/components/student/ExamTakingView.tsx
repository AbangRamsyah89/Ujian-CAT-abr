import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  CheckCircle2, 
  Send, 
  Maximize2, 
  ShieldAlert, 
  AlertTriangle, 
  Volume2, 
  MessageSquare, 
  Info,
  Check
} from 'lucide-react';
import { useExam } from '../../context/ExamContext';
import { CameraCapture } from '../common/CameraCapture';
import { AntiCheatModal } from './AntiCheatModal';
import { isCurrentlyFullscreen, requestBrowserFullscreen } from '../../utils/antiCheat';

export const ExamTakingView: React.FC = () => {
  const {
    selectedExam,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answers,
    setAnswer,
    toggleFlag,
    timeRemaining,
    violations,
    registerViolation,
    submitExam,
    activeAlert,
    dismissAlert,
    studentSessionStatus
  } = useExam();

  const [antiCheatModalState, setAntiCheatModalState] = useState<{
    isOpen: boolean;
    type: 'tab_switch' | 'fullscreen_exit' | 'limit_reached' | 'proctor_alert';
    message?: string;
  }>({
    isOpen: false,
    type: 'tab_switch'
  });

  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');

  const question = selectedExam.questions[currentQuestionIndex];
  const currentAnswer = answers[question?.id]?.answer;
  const isFlagged = !!answers[question?.id]?.isFlagged;

  // Track time spent per question
  const questionStartTimeRef = useRef<number>(Date.now());
  useEffect(() => {
    questionStartTimeRef.current = Date.now();
  }, [currentQuestionIndex]);

  // Anti-Cheat Event Listeners: Tab switch, Blur, Fullscreen, Shortcuts, Contextmenu
  useEffect(() => {
    if (studentSessionStatus !== 'taking') return;

    // 1. Visibility change (Tab Switch / Window minimize)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        registerViolation('tab_switch', 'Siswa berpindah tab atau meminimalkan browser ujian', 'danger');
        setAntiCheatModalState({
          isOpen: true,
          type: 'tab_switch',
          message: 'Peringatan keras! Anda terdeteksi meninggalkan tab halaman ujian.'
        });
      }
    };

    // 2. Window Blur (Clicking external app / multi-monitor)
    const handleWindowBlur = () => {
      registerViolation('screen_blur', 'Fokus jendela ujian hilang (diduga membuka aplikasi lain)', 'warning');
    };

    // 3. Fullscreen exit detection
    const handleFullscreenChange = () => {
      if (!isCurrentlyFullscreen()) {
        registerViolation('fullscreen_exit', 'Siswa keluar dari mode layar penuh (Fullscreen)', 'warning');
        setAntiCheatModalState({
          isOpen: true,
          type: 'fullscreen_exit',
          message: 'Ujian wajib dikerjakan dalam mode layar penuh (Fullscreen).'
        });
      }
    };

    // 4. Keyboard Shortcuts & Copy-Paste interception
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 or Devtools
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))
      ) {
        e.preventDefault();
        registerViolation('devtools_open', 'Upaya membuka Developer Tools / Inspect Element', 'danger');
        return false;
      }

      // Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+U, Ctrl+P
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (key === 'c' || key === 'v' || key === 'x' || key === 'u' || key === 'p') {
          e.preventDefault();
          registerViolation(
            'copy_paste_attempt',
            `Pintasan terlarang ditekan: Ctrl+${key.toUpperCase()} (Salin/Tempel/Sumber dinonaktifkan)`,
            'warning'
          );
          return false;
        }
      }

      // Alt+Tab
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        registerViolation('forbidden_key', 'Upaya pergantian aplikasi (Alt+Tab)', 'warning');
        return false;
      }
    };

    // 5. Disable Right Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      registerViolation('forbidden_key', 'Klik kanan dinonaktifkan demi keamanan naskah ujian', 'warning');
      return false;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [studentSessionStatus, registerViolation]);

  // Handle Proctor Intercom Alert Modal
  useEffect(() => {
    if (activeAlert) {
      setAntiCheatModalState({
        isOpen: true,
        type: 'proctor_alert',
        message: `[Pesan Langsung Pengawas]: ${activeAlert.message}`
      });
    }
  }, [activeAlert]);

  // Format seconds to HH:MM:SS
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeRemaining <= 300; // < 5 mins

  // Multiple Choice Handler
  const handleSelectOption = (optId: string) => {
    setAnswer(question.id, optId);
  };

  // Complex Multiple Choice Handler (toggle item in array)
  const handleToggleComplexOption = (optId: string) => {
    const currentList = Array.isArray(currentAnswer) ? [...currentAnswer] : [];
    const index = currentList.indexOf(optId);
    if (index > -1) {
      currentList.splice(index, 1);
    } else {
      currentList.push(optId);
    }
    setAnswer(question.id, currentList);
  };

  // Short Essay text handler
  const handleEssayChange = (text: string) => {
    setAnswer(question.id, text);
  };

  const answeredCount = Object.values(answers).filter((a) => {
    if (Array.isArray(a.answer)) return a.answer.length > 0;
    return !!a.answer;
  }).length;

  return (
    <div className="relative min-h-[calc(100vh-65px)] bg-slate-100/70 p-3 sm:p-5 select-none">
      {/* Proctor Live Intercom Banner (if triggered) */}
      {activeAlert && (
        <div className="mb-4 flex items-center justify-between rounded-xl bg-amber-500 p-3 text-white shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 shrink-0" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider">
                {activeAlert.senderName}:
              </span>
              <p className="text-sm font-semibold">{activeAlert.message}</p>
            </div>
          </div>
          <button
            onClick={dismissAlert}
            className="rounded-lg bg-black/20 px-3 py-1 text-xs font-bold hover:bg-black/30 transition-colors"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Top Examination Control Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 font-mono text-base font-bold text-indigo-700">
            {currentQuestionIndex + 1}
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">
              Soal {currentQuestionIndex + 1} dari {selectedExam.questions.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">
                {question?.category}
              </span>
              <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                {question?.points} Poin
              </span>
            </div>
          </div>
        </div>

        {/* Center: Timer Countdown & Security Status */}
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-base font-extrabold shadow-xs transition-colors ${
              isLowTime
                ? 'bg-rose-50 text-rose-600 ring-2 ring-rose-500/30 animate-pulse'
                : 'bg-slate-900 text-white'
            }`}
          >
            <Clock className="h-4 w-4 text-amber-400" />
            <span>{formatTime(timeRemaining)}</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              Anti-Cheat ON
            </span>
            {violations.length > 0 && (
              <span className="flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 font-semibold text-rose-700 border border-rose-200">
                <ShieldAlert className="h-3.5 w-3.5" />
                {violations.length} Peringatan
              </span>
            )}
          </div>
        </div>

        {/* Right: Camera Monitor thumbnail & Finish Button */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <CameraCapture studentName="Ahmad Fauzi" isCompact />
          </div>

          <button
            onClick={() => setShowSubmitConfirmModal(true)}
            id="btn-finish-exam"
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Kumpulkan Ujian</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout: Question Area + Navigation Matrix */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left: Question Card (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="min-h-[460px] flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs">
            <div>
              {/* Question Text */}
              <div className="flex items-start justify-between gap-4">
                <p
                  className={`text-slate-800 font-medium leading-relaxed ${
                    fontSize === 'large' ? 'text-lg' : 'text-base'
                  }`}
                >
                  {question?.text}
                </p>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'normal')}
                    title="Ubah Ukuran Teks"
                    className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    {fontSize === 'normal' ? 'A+' : 'A-'}
                  </button>
                </div>
              </div>

              {/* Multiple Choice Options */}
              {question?.type === 'multiple_choice' && question.options && (
                <div className="mt-6 space-y-3">
                  {question.options.map((opt) => {
                    const isSelected = currentAnswer === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(opt.id)}
                        className={`w-full flex items-start gap-3.5 rounded-xl p-4 text-left transition-all border ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {opt.id}
                        </span>
                        <span className="mt-0.5 text-sm font-medium text-slate-800 leading-normal">
                          {opt.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Complex Multiple Choice Options (Multiple correct) */}
              {question?.type === 'complex_multiple' && question.options && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-1.5 rounded-lg bg-indigo-50/80 px-3 py-1.5 text-xs font-semibold text-indigo-800">
                    <Info className="h-3.5 w-3.5" />
                    <span>Pilihan Ganda Kompleks: Anda dapat memilih lebih dari satu jawaban yang benar.</span>
                  </div>
                  {question.options.map((opt) => {
                    const currentArray = Array.isArray(currentAnswer) ? currentAnswer : [];
                    const isSelected = currentArray.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleToggleComplexOption(opt.id)}
                        className={`w-full flex items-start gap-3.5 rounded-xl p-4 text-left transition-all border ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isSelected ? <Check className="h-4 w-4" /> : opt.id}
                        </span>
                        <span className="mt-0.5 text-sm font-medium text-slate-800 leading-normal">
                          {opt.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Short Essay / Uraian Input with Keyword Detection Hint */}
              {question?.type === 'essay_short' && (
                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Tuliskan Lembar Jawaban Uraian Anda:</span>
                    <span>
                      {typeof currentAnswer === 'string' ? currentAnswer.trim().split(/\s+/).filter(Boolean).length : 0} Kata
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    value={typeof currentAnswer === 'string' ? currentAnswer : ''}
                    onChange={(e) => handleEssayChange(e.target.value)}
                    placeholder="Ketik jawaban penjelasan Anda secara lengkap dan objektif di sini..."
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-400">
                    Sistem penilaian otomatis akan menganalisis konsep dan kata kunci esensial yang Anda tuliskan.
                  </p>
                </div>
              )}
            </div>

            {/* Question Bottom Action Toolbar */}
            <div className="mt-8 border-t border-slate-100 pt-5 flex flex-wrap items-center justify-between gap-3">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                className="flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Sebelumnya</span>
              </button>

              {/* Flag / Ragu-ragu Button */}
              <button
                onClick={() => toggleFlag(question.id)}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                  isFlagged
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <Bookmark className="h-4 w-4" />
                <span>{isFlagged ? 'Ditandai Ragu-Ragu' : 'Tandai Ragu-Ragu'}</span>
              </button>

              <button
                disabled={currentQuestionIndex === selectedExam.questions.length - 1}
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                className="flex items-center gap-1 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-all"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Simulation Testing Sandbox for User/Tester */}
          <div className="rounded-xl border border-indigo-100 bg-white p-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">
                  Uji Coba Keamanan Anti-Cheat (Simulator Pengujian):
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => {
                    registerViolation('tab_switch', 'Uji Coba: Berpindah tab terdeteksi', 'danger');
                    setAntiCheatModalState({
                      isOpen: true,
                      type: 'tab_switch',
                      message: 'Simulasi: Anda berpindah tab ke aplikasi lain.'
                    });
                  }}
                  className="rounded-lg bg-rose-50 px-2.5 py-1 font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
                >
                  ⚡ Tes Deteksi Pindah Tab
                </button>
                <button
                  onClick={() => {
                    registerViolation('copy_paste_attempt', 'Uji Coba: Pintasan Ctrl+C diblokir', 'warning');
                  }}
                  className="rounded-lg bg-amber-50 px-2.5 py-1 font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
                >
                  ⚡ Tes Blokir Ctrl+C
                </button>
                <button
                  onClick={async () => {
                    try {
                      await requestBrowserFullscreen();
                    } catch {}
                  }}
                  className="rounded-lg bg-indigo-50 px-2.5 py-1 font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                >
                  <Maximize2 className="inline h-3 w-3 mr-1" />
                  Kunci Layar Penuh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Question Navigation Matrix & Proctor Feed (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Navigasi Butir Soal
              </h3>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {answeredCount} / {selectedExam.questions.length} Selesai
              </span>
            </div>

            {/* Matrix Grid */}
            <div className="mt-4 grid grid-cols-4 sm:grid-cols-5 gap-2.5">
              {selectedExam.questions.map((q, idx) => {
                const ans = answers[q.id];
                const hasAnswer =
                  ans && (Array.isArray(ans.answer) ? ans.answer.length > 0 : !!ans.answer);
                const isFlag = ans?.isFlagged;
                const isCurrent = idx === currentQuestionIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-11 rounded-xl flex flex-col items-center justify-center font-bold text-xs transition-all relative ${
                      isCurrent
                        ? 'ring-2 ring-indigo-600 ring-offset-2 bg-indigo-600 text-white shadow-sm'
                        : isFlag
                        ? 'bg-amber-500 text-white'
                        : hasAnswer
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    <span className="text-[8px] font-normal uppercase opacity-80">
                      {q.type === 'essay_short' ? 'Esai' : 'PG'}
                    </span>
                    {isFlag && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-300 border border-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 border-t border-slate-100 pt-4 grid grid-cols-3 gap-2 text-[11px] text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-emerald-600 shrink-0" />
                <span>Terjawab</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-amber-500 shrink-0" />
                <span>Ragu-Ragu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-slate-100 border border-slate-300 shrink-0" />
                <span>Belum</span>
              </div>
            </div>
          </div>

          {/* Real-time Security & Integrity Status Widget */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
              <span>Status Integritas Sesi</span>
              <span className="text-emerald-600 font-bold">Terhubung</span>
            </h4>
            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-400">Total Pelanggaran:</span>
                <span className={`font-bold ${violations.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {violations.length} / {selectedExam.rules.maxViolations} Insiden
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-400">Pengawas Ruang:</span>
                <span className="font-semibold text-slate-800">Pak Hendra, M.Pd.</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Pemantauan Layar:</span>
                <span className="font-semibold text-indigo-600 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-ping" />
                  Aktif 60 FPS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Anti-Cheat Violation Modal */}
      <AntiCheatModal
        isOpen={antiCheatModalState.isOpen}
        type={antiCheatModalState.type}
        message={antiCheatModalState.message}
        violationsCount={violations.length}
        maxViolations={selectedExam.rules.maxViolations}
        onDismiss={() => setAntiCheatModalState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Submit Confirmation Modal */}
      {showSubmitConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-indigo-600 mb-4">
              <div className="rounded-xl bg-indigo-50 p-2.5">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Konfirmasi Pengumpulan Ujian
                </h3>
                <p className="text-xs text-slate-500">
                  Naskah akan langsung dinilai oleh sistem otomatis
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 text-xs space-y-2 mb-5">
              <div className="flex justify-between">
                <span className="text-slate-500">Soal Terjawab:</span>
                <span className="font-bold text-emerald-600">{answeredCount} Butir</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Belum Terjawab:</span>
                <span className="font-bold text-rose-600">
                  {selectedExam.questions.length - answeredCount} Butir
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pelanggaran Tercatat:</span>
                <span className="font-bold text-slate-800">{violations.length} Insiden</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirmModal(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Kembali Kerjakan
              </button>
              <button
                onClick={() => {
                  setShowSubmitConfirmModal(false);
                  submitExam();
                }}
                className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs"
              >
                Ya, Kumpulkan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
