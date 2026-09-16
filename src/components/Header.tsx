import React from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Activity, 
  BarChart3, 
  Clock, 
  AlertTriangle, 
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { useExam } from '../context/ExamContext';
import { MOCK_EXAMS } from '../data/mockExams';

export const Header: React.FC = () => {
  const {
    activeRole,
    setActiveRole,
    selectedExam,
    setSelectedExam,
    studentSessionStatus,
    violations,
    students,
    resetExamSession
  } = useExam();

  const totalViolationsInRoom = students.reduce((acc, s) => acc + s.violationCount, 0);
  const activeStudentsCount = students.filter((s) => s.status === 'taking').length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand & Security Status */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900">
                EduExam
              </span>
              <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 ring-1 ring-indigo-700/10">
                CBT v2.4
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Anti-Cheat Active
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-xs">
              {selectedExam.title}
            </p>
          </div>
        </div>

        {/* Navigation / Role Switcher Tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            id="role-tab-student"
            onClick={() => setActiveRole('student')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              activeRole === 'student'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>Portal Siswa</span>
            {studentSessionStatus === 'taking' && (
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </button>

          <button
            id="role-tab-proctor"
            onClick={() => setActiveRole('proctor')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              activeRole === 'proctor'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="h-4 w-4 text-emerald-600" />
            <span>Pengawas Layar</span>
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700">
              {activeStudentsCount}
            </span>
          </button>

          <button
            id="role-tab-report"
            onClick={() => setActiveRole('report')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              activeRole === 'report'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="h-4 w-4 text-indigo-600" />
            <span>Laporan Nilai</span>
          </button>
        </div>

        {/* Right Info & Quick Action */}
        <div className="hidden lg:flex items-center gap-4 text-xs">
          {totalViolationsInRoom > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1 text-rose-700 ring-1 ring-rose-200">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
              <span className="font-semibold">{totalViolationsInRoom} Pelanggaran</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Token:</span>
            <code className="rounded bg-slate-100 px-2 py-0.5 font-mono font-bold text-indigo-600">
              {selectedExam.token}
            </code>
          </div>

          <button
            onClick={resetExamSession}
            title="Reset Sesi Ujian Simulasi"
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
