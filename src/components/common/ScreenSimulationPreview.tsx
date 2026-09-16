import React, { useRef, useState, useEffect } from 'react';
import { Monitor, Share2, AlertTriangle, ShieldCheck, Eye } from 'lucide-react';
import { StudentProfile } from '../../types';
import { useExam } from '../../context/ExamContext';

interface ScreenSimulationPreviewProps {
  student: StudentProfile;
  isInspecting?: boolean;
  className?: string;
  allowRequestRealScreen?: boolean;
}

export const ScreenSimulationPreview: React.FC<ScreenSimulationPreviewProps> = ({
  student,
  isInspecting = false,
  className = '',
  allowRequestRealScreen = false
}) => {
  const { selectedExam, currentQuestionIndex, answers } = useExam();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [realScreenStream, setRealScreenStream] = useState<MediaStream | null>(null);
  const [isSharingRealScreen, setIsSharingRealScreen] = useState(false);

  // If student is Ahmad Fauzi (active user), we can allow triggering real screen capture
  const handleStartRealScreenShare = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { displaySurface: 'browser' }
        });
        setRealScreenStream(stream);
        setIsSharingRealScreen(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        stream.getVideoTracks()[0].onended = () => {
          setIsSharingRealScreen(false);
          setRealScreenStream(null);
        };
      }
    } catch {
      // User cancelled or browser rejected
    }
  };

  useEffect(() => {
    return () => {
      if (realScreenStream) {
        realScreenStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [realScreenStream]);

  // Question context for Ahmad or synthetic peer
  const qIdx = student.id === 'std-001' ? currentQuestionIndex : student.currentQuestionIndex;
  const currentQ = selectedExam.questions[qIdx] || selectedExam.questions[0];

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950 font-sans shadow-lg select-none ${
        isInspecting ? 'w-full h-80' : 'w-full h-44'
      } ${className}`}
    >
      {isSharingRealScreen && realScreenStream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-contain bg-black"
        />
      ) : (
        /* High-fidelity Live Screen Capture Stream of Student CBT Workspace */
        <div className="relative h-full w-full flex flex-col bg-slate-900 text-slate-100 p-2 overflow-hidden">
          {/* Simulated Browser Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1 text-[9px] text-slate-400">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="ml-1 text-[8px] bg-slate-800 px-1 py-0.2 rounded font-mono text-slate-300">
                app.eduexam.cbt/session/{student.nisn}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[8px]">
              <span className="text-emerald-400 flex items-center gap-0.5">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                60 FPS Live
              </span>
              <span>{student.ipAddress}</span>
            </div>
          </div>

          {/* Active Question Preview */}
          <div className="flex-1 flex flex-col justify-between rounded bg-slate-950/70 p-2 border border-slate-800/80">
            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span className="font-semibold text-indigo-400">
                  Soal #{qIdx + 1} ({currentQ?.category})
                </span>
                <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[9px]">
                  Terjawab: {student.answeredCount}/{selectedExam.questions.length}
                </span>
              </div>
              <p className="text-[10px] leading-tight text-slate-200 line-clamp-2">
                {currentQ?.text}
              </p>
            </div>

            {/* Quick Answer Dots / Grid */}
            <div className="mt-1 pt-1 border-t border-slate-800 flex items-center justify-between text-[9px]">
              <div className="flex gap-1">
                {selectedExam.questions.slice(0, 6).map((q, i) => (
                  <span
                    key={q.id}
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[7px] font-bold ${
                      i === qIdx
                        ? 'bg-indigo-600 text-white ring-1 ring-white'
                        : i < student.answeredCount
                        ? 'bg-emerald-600/80 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {i + 1}
                  </span>
                ))}
              </div>

              {/* Watermark against cheating / leaking */}
              <span className="text-[7px] text-slate-600 font-mono">
                {student.nisn} • AntiCheat Guard
              </span>
            </div>
          </div>

          {/* Transparent Watermark Overlay across screen */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rotate-[-15deg] opacity-10">
            <span className="text-lg font-black tracking-widest text-white uppercase">
              {student.name} - {student.nisn}
            </span>
          </div>

          {/* Violation warning ribbon if student has violations */}
          {student.violationCount > 0 && (
            <div className="absolute top-7 right-2 flex items-center gap-1 rounded bg-rose-600/90 px-1.5 py-0.5 text-[8px] font-bold text-white shadow">
              <AlertTriangle className="w-2.5 h-2.5 animate-bounce" />
              <span>{student.violationCount}x PELANGGARAN</span>
            </div>
          )}
        </div>
      )}

      {/* Screen Monitor Action Bar */}
      <div className="absolute bottom-1 right-1 flex items-center gap-1">
        {allowRequestRealScreen && !isSharingRealScreen && (
          <button
            onClick={handleStartRealScreenShare}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[8px] font-medium shadow transition-colors"
            title="Bagikan Layar Asli (Web Screen Capture)"
          >
            <Share2 className="w-2 h-2" />
            <span>Bagikan Layar Asli</span>
          </button>
        )}
        <div className="flex items-center gap-1 rounded bg-black/80 backdrop-blur-xs px-1.5 py-0.5 text-[8px] text-slate-300 font-mono">
          <Monitor className="w-2.5 h-2.5 text-indigo-400" />
          <span>{isSharingRealScreen ? 'DisplayMedia' : 'Live Virtual Feed'}</span>
        </div>
      </div>
    </div>
  );
};
