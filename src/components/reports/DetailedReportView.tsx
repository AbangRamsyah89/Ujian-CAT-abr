import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Download, 
  Printer, 
  TrendingUp, 
  BarChart2, 
  ShieldCheck, 
  User, 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useExam } from '../../context/ExamContext';
import { exportResultsToCSV } from '../../utils/grading';

export const DetailedReportView: React.FC = () => {
  const {
    selectedExam,
    studentResult,
    inspectedStudentResult,
    students,
    resetExamSession,
    setActiveRole
  } = useExam();

  const [activeTab, setActiveTab] = useState<'individual' | 'class_analytics'>('individual');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});

  const result = inspectedStudentResult || studentResult;

  // Trigger celebration confetti if student scored >= KKM
  useEffect(() => {
    if (result && result.isPassed) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [result?.isPassed]);

  if (!result) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <FileText className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Belum Ada Hasil Ujian</h2>
        <p className="mt-2 text-sm text-slate-500">
          Selesaikan ujian terlebih dahulu di Portal Siswa untuk melihat pelaporan nilai mendalam.
        </p>
        <button
          onClick={() => setActiveRole('student')}
          className="mt-6 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"
        >
          Menuju Portal Siswa
        </button>
      </div>
    );
  }

  const toggleQuestionExpand = (qId: number) => {
    setExpandedQuestions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  // Class analytics calculations
  const studentsWithScore = students.filter((s) => s.score !== undefined || s.id === 'std-001');
  const classScores = studentsWithScore.map((s) => (s.id === 'std-001' ? result.gradePercentage : s.score || 0));
  const avgScore = Math.round(classScores.reduce((a, b) => a + b, 0) / (classScores.length || 1));
  const maxScore = Math.max(...classScores, 0);
  const minScore = Math.min(...classScores, 100);
  const passCount = classScores.filter((s) => s >= selectedExam.kkm).length;
  const passRate = Math.round((passCount / (classScores.length || 1)) * 100);

  // Handle Export CSV
  const handleExportCSV = () => {
    const csvData = exportResultsToCSV(students, selectedExam.title);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Rekap_Nilai_${selectedExam.title.substring(0, 20)}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Print
  const handlePrint = () => {
    window.print();
  };

  const filteredQuestions = result.questionResults.filter((q) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'correct') return q.isCorrect;
    if (filterCategory === 'incorrect') return !q.isCorrect && !q.isPartiallyCorrect;
    if (filterCategory === 'partial') return q.isPartiallyCorrect;
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Top Header & Tab Toggle */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
            <span>Pelaporan & Analitik Nilai Ujian</span>
            <span>•</span>
            <span>{selectedExam.grade}</span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
            {selectedExam.title}
          </h1>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('individual')}
              className={`rounded-lg px-3.5 py-1.5 transition-all ${
                activeTab === 'individual'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rapor Siswa
            </button>
            <button
              onClick={() => setActiveTab('class_analytics')}
              className={`rounded-lg px-3.5 py-1.5 transition-all ${
                activeTab === 'class_analytics'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rekap & Analisis Kelas
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak Rapor</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Unduh CSV</span>
          </button>
        </div>
      </div>

      {activeTab === 'individual' ? (
        /* INDIVIDUAL STUDENT REPORT VIEW */
        <div className="space-y-6">
          {/* Main Score Hero Card */}
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-12 items-center">
              {/* Left: Score Badge */}
              <div className="md:col-span-4 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 text-white text-center shadow-md">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">
                  SKOR AKHIR UJIAN
                </span>
                <div className="my-2 flex items-baseline justify-center">
                  <span className="text-6xl font-black tracking-tight">{result.gradePercentage}</span>
                  <span className="text-2xl font-bold text-indigo-200">/100</span>
                </div>
                <div
                  className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${
                    result.isPassed
                      ? 'bg-emerald-400 text-slate-950'
                      : 'bg-rose-400 text-slate-950'
                  }`}
                >
                  {result.isPassed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  <span>{result.isPassed ? 'LULUS (TUNTAS)' : 'REMIDIAL'}</span>
                </div>
                <p className="mt-3 text-[11px] text-indigo-100">
                  Kriteria Ketuntasan Minimal (KKM): {result.kkm} Poin
                </p>
              </div>

              {/* Right: Student Info & Metrics */}
              <div className="md:col-span-8 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{result.studentName}</h2>
                    <p className="text-xs text-slate-500 font-mono">NISN: {result.nisn} • Kelas XII MIPA 1</p>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-slate-400">Waktu Pelaksanaan:</span>
                    <p className="font-semibold text-slate-800">
                      {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
                    </p>
                  </div>
                </div>

                {/* 4 Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <div className="text-[11px] text-slate-500 mb-0.5">Poin Diperoleh</div>
                    <div className="text-lg font-bold text-slate-900">
                      {result.totalScore} <span className="text-xs font-normal text-slate-500">/ {result.maxScore}</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <div className="text-[11px] text-slate-500 mb-0.5">Indeks Integritas</div>
                    <div
                      className={`text-lg font-bold ${
                        result.integrityScore >= 90
                          ? 'text-emerald-600'
                          : result.integrityScore >= 70
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {result.integrityScore}%
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <div className="text-[11px] text-slate-500 mb-0.5">Pelanggaran</div>
                    <div className={`text-lg font-bold ${result.totalViolations > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                      {result.totalViolations} <span className="text-xs font-normal text-slate-500">Insiden</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <div className="text-[11px] text-slate-500 mb-0.5">Waktu Pengerjaan</div>
                    <div className="text-lg font-bold text-slate-900">
                      {result.durationSpentMinutes} <span className="text-xs font-normal text-slate-500">Menit</span>
                    </div>
                  </div>
                </div>

                {/* Integrity Notice */}
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
                  <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span>
                    Indeks integritas dihitung berdasarkan audit anti-cheat real-time selama pengerjaan naskah ujian.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Topic & Competency Mastery Breakdown */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Analisis Penguasaan Kompetensi & Materi
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(result.categoryBreakdown).map(([category, stats]) => (
                <div key={category} className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-800">{category}</span>
                    <span className="font-extrabold text-indigo-600">{stats.percentage}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 mb-2">
                    <div
                      className={`h-full transition-all ${
                        stats.percentage >= 75 ? 'bg-emerald-500' : stats.percentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${stats.percentage}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 flex justify-between">
                    <span>Poin: {stats.earned} / {stats.total}</span>
                    <span className={stats.percentage >= 75 ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                      {stats.percentage >= 75 ? 'Menguasai' : 'Perlu Pendalaman'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Question Breakdown Filter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Rincian Lembar Jawaban & Pembahasan ({result.questionResults.length} Soal)
            </h3>

            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              <button
                onClick={() => setFilterCategory('all')}
                className={`rounded-lg px-2.5 py-1 ${
                  filterCategory === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterCategory('correct')}
                className={`rounded-lg px-2.5 py-1 ${
                  filterCategory === 'correct' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Benar ({result.questionResults.filter((q) => q.isCorrect).length})
              </button>
              <button
                onClick={() => setFilterCategory('partial')}
                className={`rounded-lg px-2.5 py-1 ${
                  filterCategory === 'partial' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Sebagian ({result.questionResults.filter((q) => q.isPartiallyCorrect).length})
              </button>
              <button
                onClick={() => setFilterCategory('incorrect')}
                className={`rounded-lg px-2.5 py-1 ${
                  filterCategory === 'incorrect' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Salah ({result.questionResults.filter((q) => !q.isCorrect && !q.isPartiallyCorrect).length})
              </button>
            </div>
          </div>

          {/* Per-Question Item Accordion Cards */}
          <div className="space-y-4">
            {filteredQuestions.map((item, idx) => {
              const isExpanded = !!expandedQuestions[item.question.id];
              return (
                <div
                  key={item.question.id}
                  className={`rounded-2xl border transition-all ${
                    item.isCorrect
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : item.isPartiallyCorrect
                      ? 'border-amber-200 bg-amber-50/20'
                      : 'border-rose-200 bg-rose-50/20'
                  }`}
                >
                  <div
                    className="p-5 flex items-start justify-between gap-4 cursor-pointer"
                    onClick={() => toggleQuestionExpand(item.question.id)}
                  >
                    <div className="flex items-start gap-3.5">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                          item.isCorrect
                            ? 'bg-emerald-600 text-white'
                            : item.isPartiallyCorrect
                            ? 'bg-amber-500 text-white'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        {item.question.id}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-500">
                            {item.question.category}
                          </span>
                          <span className="text-[10px] rounded bg-slate-200 px-1.5 py-0.2 font-mono text-slate-700">
                            {item.question.type}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800 leading-snug">
                          {item.question.text}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-slate-900">
                          {item.pointsEarned} / {item.maxPoints} Poin
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {item.feedback}
                        </div>
                      </div>
                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Breakdown & Full Key + Explanation */}
                  {isExpanded && (
                    <div className="border-t border-slate-200/80 p-5 bg-white/90 space-y-3 text-xs">
                      {/* Comparison: Student Answer vs Correct Key */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Jawaban Siswa:
                          </span>
                          <p className="mt-1 font-semibold text-slate-800">
                            {Array.isArray(item.studentAnswer)
                              ? item.studentAnswer.join(', ') || '(Kosong)'
                              : item.studentAnswer || '(Kosong)'}
                          </p>
                        </div>

                        <div className="rounded-xl bg-indigo-50/50 p-3 border border-indigo-100">
                          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                            Kunci Jawaban Resmi:
                          </span>
                          <p className="mt-1 font-semibold text-indigo-900">
                            {Array.isArray(item.question.correctAnswer)
                              ? item.question.correctAnswer.join(', ')
                              : item.question.correctAnswer}
                          </p>
                        </div>
                      </div>

                      {/* Explanation */}
                      <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          Pembahasan Ilmiah & Evaluasi Otomatis:
                        </span>
                        <p className="text-slate-600 leading-relaxed">
                          {item.explanation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* CLASS ANALYTICS & LEADERBOARD VIEW */
        <div className="space-y-6">
          {/* Class Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Rata-Rata Kelas</span>
              <div className="mt-1 text-3xl font-extrabold text-indigo-600">{avgScore}</div>
              <p className="text-[11px] text-slate-400 mt-1">Standar KKM: {selectedExam.kkm}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-semibold text-emerald-600">Nilai Tertinggi</span>
              <div className="mt-1 text-3xl font-extrabold text-emerald-600">{maxScore}</div>
              <p className="text-[11px] text-slate-400 mt-1">Cantika Dewi (95)</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Tingkat Ketuntasan</span>
              <div className="mt-1 text-3xl font-extrabold text-slate-900">{passRate}%</div>
              <p className="text-[11px] text-slate-400 mt-1">{passCount} dari {classScores.length} siswa</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Integritas Kelas</span>
              <div className="mt-1 text-3xl font-extrabold text-emerald-600">92%</div>
              <p className="text-[11px] text-slate-400 mt-1">Keamanan anti-cheat optimal</p>
            </div>
          </div>

          {/* Student Leaderboard / Grade Roster Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Daftar Nilai & Integritas Siswa Kelas XII MIPA 1
                </h3>
              </div>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Ekspor Rekap Rapor (.CSV)</span>
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Peringkat</th>
                    <th className="px-4 py-3 font-semibold">Nama Siswa</th>
                    <th className="px-4 py-3 font-semibold">Status Ujian</th>
                    <th className="px-4 py-3 font-semibold">Skor Akhir</th>
                    <th className="px-4 py-3 font-semibold">Ketuntasan</th>
                    <th className="px-4 py-3 font-semibold">Pelanggaran</th>
                    <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students
                    .map((s) => ({
                      ...s,
                      effectiveScore: s.id === 'std-001' ? result.gradePercentage : s.score || 0
                    }))
                    .sort((a, b) => b.effectiveScore - a.effectiveScore)
                    .map((std, rank) => (
                      <tr key={std.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {rank === 0 ? '🥇 #1' : rank === 1 ? '🥈 #2' : rank === 2 ? '🥉 #3' : `#${rank + 1}`}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={std.avatarUrl}
                              alt={std.name}
                              className="h-7 w-7 rounded-full object-cover"
                            />
                            <div>
                              <div className="font-bold text-slate-900">{std.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{std.nisn}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              std.status === 'submitted'
                                ? 'bg-blue-100 text-blue-700'
                                : std.status === 'disqualified'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {std.status === 'submitted' ? 'Selesai' : std.status === 'disqualified' ? 'Diskualifikasi' : 'Mengerjakan'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-extrabold text-slate-900 text-sm">
                          {std.effectiveScore}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              std.effectiveScore >= selectedExam.kkm
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {std.effectiveScore >= selectedExam.kkm ? 'TUNTAS' : 'REMIDIAL'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          <span className={std.violationCount > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                            {std.violationCount} kali
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setActiveTab('individual');
                            }}
                            className="font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            Rincian
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
