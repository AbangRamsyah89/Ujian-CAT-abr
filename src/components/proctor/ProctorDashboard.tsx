import React, { useState } from 'react';
import { 
  Activity, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  Search, 
  Filter, 
  Send, 
  X, 
  AlertTriangle, 
  Volume2, 
  Clock, 
  Monitor, 
  Camera, 
  ExternalLink,
  Pause,
  Play,
  UserX,
  FileCheck
} from 'lucide-react';
import { useExam } from '../../context/ExamContext';
import { StudentProfile } from '../../types';
import { StudentLiveMonitorCard } from './StudentLiveMonitorCard';
import { ScreenSimulationPreview } from '../common/ScreenSimulationPreview';
import { CameraCapture } from '../common/CameraCapture';

export const ProctorDashboard: React.FC = () => {
  const {
    students,
    selectedExam,
    sendProctorAlert,
    updateStudentStatusByProctor,
    viewStudentReport
  } = useExam();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'taking' | 'violating' | 'submitted'>('all');
  const [inspectingStudent, setInspectingStudent] = useState<StudentProfile | null>(null);
  
  // Alert sender modal state
  const [alertTargetStudent, setAlertTargetStudent] = useState<StudentProfile | 'all' | null>(null);
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'info' | 'warning' | 'urgent'>('warning');

  // Metrics
  const totalStudents = students.length;
  const takingCount = students.filter((s) => s.status === 'taking').length;
  const submittedCount = students.filter((s) => s.status === 'submitted').length;
  const totalViolations = students.reduce((sum, s) => sum + s.violationCount, 0);

  // Filtered students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery);

    if (!matchesSearch) return false;
    if (statusFilter === 'taking') return s.status === 'taking';
    if (statusFilter === 'violating') return s.violationCount > 0;
    if (statusFilter === 'submitted') return s.status === 'submitted';
    return true;
  });

  const handleSendAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAlertMessage.trim() || !alertTargetStudent) return;

    if (alertTargetStudent === 'all') {
      sendProctorAlert('all', customAlertMessage, alertSeverity);
    } else {
      sendProctorAlert(alertTargetStudent.id, customAlertMessage, alertSeverity);
    }

    setCustomAlertMessage('');
    setAlertTargetStudent(null);
  };

  const presetMessages = [
    'Peringatan: Mohon tatap lurus ke layar Anda!',
    'Dilarang membuka tab lain atau meminimalkan browser.',
    'Waktu pengerjaan tersisa 10 menit, periksa kembali lembar jawaban.',
    'Tolong pastikan kamera dan wajah Anda tetap terlihat jelas.'
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Header Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4 mb-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Total Peserta Ruangan</span>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {totalStudents} <span className="text-xs font-normal text-slate-500">Siswa</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Ruang CBT Lab 03</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 mb-1">
            <span>Sedang Mengerjakan</span>
            <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">
            {takingCount} <span className="text-xs font-normal text-slate-500">Aktif</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Layar live terpantau</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-600 mb-1">
            <span>Pelanggaran Anti-Cheat</span>
            <ShieldAlert className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600">
            {totalViolations} <span className="text-xs font-normal text-slate-500">Insiden</span>
          </div>
          <p className="mt-1 text-[11px] text-rose-500 font-medium">
            {students.filter((s) => s.violationCount > 0).length} siswa terdeteksi
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 mb-1">
            <span>Selesai & Dinilai</span>
            <CheckCircle2 className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600">
            {submittedCount} <span className="text-xs font-normal text-slate-500">Terkumpul</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Skor terotomasi</p>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Broadcast Intercom */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search input */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama atau NISN siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Status Filter buttons */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs font-medium">
            <button
              onClick={() => setStatusFilter('all')}
              className={`rounded-lg px-2.5 py-1 transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-indigo-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({totalStudents})
            </button>
            <button
              onClick={() => setStatusFilter('taking')}
              className={`rounded-lg px-2.5 py-1 transition-all ${
                statusFilter === 'taking'
                  ? 'bg-white text-indigo-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Aktif ({takingCount})
            </button>
            <button
              onClick={() => setStatusFilter('violating')}
              className={`rounded-lg px-2.5 py-1 transition-all ${
                statusFilter === 'violating'
                  ? 'bg-white text-rose-700 font-bold shadow-xs'
                  : 'text-rose-600 hover:text-rose-800'
              }`}
            >
              Pelanggaran ({students.filter((s) => s.violationCount > 0).length})
            </button>
            <button
              onClick={() => setStatusFilter('submitted')}
              className={`rounded-lg px-2.5 py-1 transition-all ${
                statusFilter === 'submitted'
                  ? 'bg-white text-indigo-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Selesai ({submittedCount})
            </button>
          </div>
        </div>

        {/* Broadcast Action Button */}
        <button
          onClick={() => setAlertTargetStudent('all')}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-95 transition-all"
        >
          <Volume2 className="h-4 w-4" />
          <span>Siarkan Pesan ke Semua Siswa</span>
        </button>
      </div>

      {/* Live Screen Monitoring Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Pemantauan Layar Real-Time (Live Proctor Grid)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Klik pada salah satu layar untuk inspeksi interaktif detail
          </span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
            Tidak ada siswa yang sesuai dengan filter pencarian.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredStudents.map((student) => (
              <StudentLiveMonitorCard
                key={student.id}
                student={student}
                totalQuestions={selectedExam.questions.length}
                onInspect={(std) => setInspectingStudent(std)}
                onSendAlert={(std) => setAlertTargetStudent(std)}
                onUpdateStatus={(id, st) => updateStudentStatusByProctor(id, st)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Room Incident Security Audit Log Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="h-5 w-5 text-rose-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Log Audit Insiden Anti-Cheat Ruangan (Real-Time)
              </h3>
              <p className="text-xs text-slate-500">
                Riwayat pelanggaran tercatat otomatis dengan bukti timestamp dan tingkat keparahan
              </p>
            </div>
          </div>
          <span className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">
            {totalViolations} Catatan Insiden
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Waktu</th>
                <th className="px-4 py-3 font-semibold">Nama Siswa</th>
                <th className="px-4 py-3 font-semibold">Tipe Pelanggaran</th>
                <th className="px-4 py-3 font-semibold">Deskripsi Kejadian</th>
                <th className="px-4 py-3 font-semibold">Tingkat</th>
                <th className="px-4 py-3 font-semibold text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.flatMap((s) => s.violations.map((v) => ({ ...v, student: s }))).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Belum ada insiden pelanggaran tercatat di ruangan ini. Sesi ujian aman.
                  </td>
                </tr>
              ) : (
                students
                  .flatMap((s) => s.violations.map((v) => ({ ...v, student: s })))
                  .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
                  .slice(0, 10)
                  .map((incident) => (
                    <tr key={incident.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-mono text-slate-500">
                        {incident.timestamp}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">
                          {incident.student.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {incident.student.nisn}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-700">
                          {incident.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {incident.description}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            incident.severity === 'critical'
                              ? 'bg-rose-100 text-rose-700'
                              : incident.severity === 'danger'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {incident.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setAlertTargetStudent(incident.student)}
                          className="font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          Tegur Siswa
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enlarged Interactive Student Inspection Modal */}
      {inspectingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <img
                  src={inspectingStudent.avatarUrl}
                  alt={inspectingStudent.name}
                  className="h-10 w-10 rounded-full border border-slate-700 object-cover"
                />
                <div>
                  <h3 className="text-base font-bold">{inspectingStudent.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    NISN: {inspectingStudent.nisn} • {inspectingStudent.classRoom} • IP: {inspectingStudent.ipAddress}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingStudent(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Large Live Screen Feed & Camera View */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="relative">
                    <ScreenSimulationPreview
                      student={inspectingStudent}
                      isInspecting
                      allowRequestRealScreen={inspectingStudent.id === 'std-001'}
                    />
                    <div className="absolute top-3 right-3 z-10">
                      <CameraCapture
                        studentName={inspectingStudent.name}
                        className="w-32 h-24 border border-white/50 shadow-lg"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">Perangkat:</span>
                      <span className="font-semibold text-slate-800">
                        {inspectingStudent.deviceInfo}
                      </span>
                    </div>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Live Feed Terkoneksi
                    </span>
                  </div>
                </div>

                {/* Right: Controls & Violation Audit for this student */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Aksi Pengawas Langsung
                    </h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setAlertTargetStudent(inspectingStudent);
                        }}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors"
                      >
                        <Send className="h-4 w-4" />
                        <span>Kirim Peringatan Langsung</span>
                      </button>

                      {inspectingStudent.status !== 'disqualified' ? (
                        <button
                          onClick={() => {
                            updateStudentStatusByProctor(inspectingStudent.id, 'disqualified');
                            setInspectingStudent({ ...inspectingStudent, status: 'disqualified' });
                          }}
                          className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-300 bg-rose-50 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
                        >
                          <UserX className="h-4 w-4" />
                          <span>Diskualifikasi Siswa</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            updateStudentStatusByProctor(inspectingStudent.id, 'taking');
                            setInspectingStudent({ ...inspectingStudent, status: 'taking' });
                          }}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
                        >
                          <Play className="h-4 w-4" />
                          <span>Buka Kunci & Pulihkan Sesi</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setInspectingStudent(null);
                          viewStudentReport(inspectingStudent.id);
                        }}
                        className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <FileCheck className="h-4 w-4" />
                        <span>Lihat Rincian Lembar Jawaban & Nilai</span>
                      </button>
                    </div>
                  </div>

                  {/* Incident History */}
                  <div className="rounded-xl border border-slate-200 p-4 max-h-56 overflow-y-auto">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Riwayat Pelanggaran ({inspectingStudent.violations.length})
                    </h4>
                    {inspectingStudent.violations.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">
                        Tidak ada pelanggaran tercatat. Siswa mematuhi aturan.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {inspectingStudent.violations.map((v) => (
                          <div
                            key={v.id}
                            className="rounded-lg bg-rose-50 p-2 text-xs border border-rose-100"
                          >
                            <div className="flex items-center justify-between text-rose-800 font-bold mb-0.5">
                              <span>{v.type}</span>
                              <span className="font-mono text-[10px] text-rose-600">{v.timestamp}</span>
                            </div>
                            <p className="text-rose-600 text-[11px] leading-tight">
                              {v.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Direct Intercom / Alert Sender Modal */}
      {alertTargetStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                  <Volume2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {alertTargetStudent === 'all'
                      ? 'Siarkan Pesan ke Seluruh Siswa'
                      : `Kirim Peringatan ke: ${(alertTargetStudent as StudentProfile).name}`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pesan akan langsung muncul secara pop-up di layar pengerjaan ujian siswa
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAlertTargetStudent(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSendAlertSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pilih Template Cepat:
                </label>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {presetMessages.map((msg, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setCustomAlertMessage(msg)}
                      className="text-left rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 p-2 text-[11px] text-slate-700 border border-slate-200 transition-colors"
                    >
                      {msg}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Ketik Pesan Kustom Pengawas:
                </label>
                <textarea
                  rows={3}
                  value={customAlertMessage}
                  onChange={(e) => setCustomAlertMessage(e.target.value)}
                  placeholder="Ketik instruksi atau teguran langsung..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setAlertTargetStudent(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs"
                >
                  Kirim Peringatan Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
