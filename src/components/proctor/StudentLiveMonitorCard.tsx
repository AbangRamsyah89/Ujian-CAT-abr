import React from 'react';
import { 
  Monitor, 
  Camera, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare, 
  Eye, 
  ShieldAlert, 
  PauseCircle, 
  XCircle,
  Clock
} from 'lucide-react';
import { StudentProfile } from '../../types';
import { ScreenSimulationPreview } from '../common/ScreenSimulationPreview';
import { CameraCapture } from '../common/CameraCapture';

interface StudentLiveMonitorCardProps {
  student: StudentProfile;
  totalQuestions: number;
  onInspect: (student: StudentProfile) => void;
  onSendAlert: (student: StudentProfile) => void;
  onUpdateStatus: (studentId: string, status: StudentProfile['status']) => void;
}

export const StudentLiveMonitorCard: React.FC<StudentLiveMonitorCardProps> = ({
  student,
  totalQuestions,
  onInspect,
  onSendAlert,
  onUpdateStatus
}) => {
  const isViolating = student.violationCount > 0;
  const isDisqualified = student.status === 'disqualified';
  const isSubmitted = student.status === 'submitted';
  const isPaused = student.status === 'paused';

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 ${
        isDisqualified
          ? 'border-rose-300 bg-rose-50/40 shadow-xs'
          : isViolating
          ? 'border-amber-300 bg-amber-50/30 shadow-xs'
          : 'border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md'
      }`}
    >
      {/* Card Header: Student Info & Status */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-100 bg-white/80">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src={student.avatarUrl}
              alt={student.name}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-100"
            />
            <span
              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${
                isDisqualified
                  ? 'bg-rose-600'
                  : isSubmitted
                  ? 'bg-blue-600'
                  : student.status === 'taking'
                  ? 'bg-emerald-500 animate-pulse'
                  : 'bg-slate-400'
              }`}
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
              {student.name}
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              NISN: {student.nisn}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {isDisqualified ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
              <XCircle className="h-3 w-3" /> Diskualifikasi
            </span>
          ) : isSubmitted ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
              <CheckCircle2 className="h-3 w-3" /> Selesai
            </span>
          ) : isPaused ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
              <PauseCircle className="h-3 w-3" /> Dijeda
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              Mengerjakan
            </span>
          )}
        </div>
      </div>

      {/* Screen Monitor & Camera Feed Split View */}
      <div className="p-3 relative">
        <div className="relative cursor-pointer" onClick={() => onInspect(student)}>
          <ScreenSimulationPreview
            student={student}
            className="w-full h-36"
            allowRequestRealScreen={student.id === 'std-001'}
          />

          {/* Picture-in-picture webcam badge on top right */}
          <div className="absolute top-2 right-2 z-10">
            <CameraCapture
              studentName={student.name}
              isCompact
              className="w-20 h-14 border border-white/40 shadow-md"
            />
          </div>

          {/* Hover overlay hint */}
          <div className="absolute inset-0 bg-indigo-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl text-white text-xs font-semibold gap-1.5 backdrop-blur-xs">
            <Eye className="w-4 h-4" />
            <span>Perbesar Layar Siswa</span>
          </div>
        </div>

        {/* Live Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-500 font-medium">
              Progress: <b className="text-slate-800">{student.answeredCount}</b> / {totalQuestions} Soal
            </span>
            <span className="font-semibold text-indigo-600">
              {Math.round((student.answeredCount / totalQuestions) * 100)}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${(student.answeredCount / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Violation Warning Tag */}
        {student.violationCount > 0 && (
          <div className="mt-2.5 flex items-center justify-between rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] text-rose-700 border border-rose-200">
            <span className="flex items-center gap-1 font-semibold">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              {student.violationCount}x Pelanggaran
            </span>
            <span className="text-[10px] text-rose-500 truncate max-w-[120px]">
              {student.violations[0]?.description || 'Perpindahan fokus'}
            </span>
          </div>
        )}

        {/* Action Toolbar */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5 text-xs">
          <button
            onClick={() => onSendAlert(student)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-semibold transition-colors"
            title="Kirim pesan peringatan langsung ke layar siswa"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Peringatkan</span>
          </button>

          <button
            onClick={() => onInspect(student)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Pantau</span>
          </button>

          {!isDisqualified && (
            <button
              onClick={() =>
                onUpdateStatus(
                  student.id,
                  student.status === 'paused' ? 'taking' : 'paused'
                )
              }
              className={`p-1.5 rounded-lg font-semibold transition-colors ${
                student.status === 'paused'
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-700'
              }`}
              title={student.status === 'paused' ? 'Lanjutkan Ujian' : 'Jeda Ujian Sementara'}
            >
              <PauseCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
