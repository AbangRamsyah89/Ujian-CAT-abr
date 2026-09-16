import React, { useState, useEffect } from 'react';
import { 
  X, 
  FilePlus, 
  BookOpen, 
  Clock, 
  Key, 
  ShieldCheck, 
  User, 
  Check, 
  Sparkles,
  Shuffle
} from 'lucide-react';
import { Exam } from '../../types';

interface CreateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTeacherName: string;
  onExamCreated: (newExam: Exam) => void;
}

const SUBJECT_SUGGESTIONS = [
  'Informatika',
  'Matematika',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Fisika',
  'Kimia',
  'Biologi',
  'Ekonomi',
  'Sosiologi',
  'Geografi',
  'Sejarah',
  'Pendidikan Pancasila / PPKn',
  'PJOK',
  'Seni Budaya',
  'Pendidikan Agama Islam'
];

const GRADE_SUGGESTIONS = [
  'Kelas X (Fase E)',
  'Kelas XI MIPA',
  'Kelas XI IPS',
  'Kelas XII MIPA',
  'Kelas XII IPS'
];

export const CreateExamModal: React.FC<CreateExamModalProps> = ({
  isOpen,
  onClose,
  activeTeacherName,
  onExamCreated
}) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Informatika');
  const [grade, setGrade] = useState('Kelas XII MIPA');
  const [teacherName, setTeacherName] = useState(activeTeacherName);
  const [teacherNip, setTeacherNip] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [kkm, setKkm] = useState(75);
  const [token, setToken] = useState('');
  const [requireFullscreen, setRequireFullscreen] = useState(true);
  const [requireCamera, setRequireCamera] = useState(true);
  const [blockShortcuts, setBlockShortcuts] = useState(true);

  // Generate random token helper
  const generateToken = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let res = '';
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  useEffect(() => {
    if (isOpen) {
      setTeacherName(activeTeacherName || 'Abang Ramsyah, S.Pd.');
      setToken(generateToken());
      if (!title) {
        setTitle(`Asesmen Sumatif ${subject} - ${grade}`);
      }
    }
  }, [isOpen, activeTeacherName]);

  const handleSubjectChange = (newSubject: string) => {
    setSubject(newSubject);
    setTitle(`Asesmen Sumatif ${newSubject} - ${grade}`);
  };

  const handleGradeChange = (newGrade: string) => {
    setGrade(newGrade);
    setTitle(`Asesmen Sumatif ${subject} - ${newGrade}`);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newExam: Exam = {
      id: `exam-${Date.now()}`,
      title: title.trim(),
      subject: subject.trim(),
      grade: grade.trim(),
      schoolName: 'SMAN 1 Belitang Hilir',
      teacherName: teacherName.trim() || activeTeacherName,
      teacherNip: teacherNip.trim(),
      token: (token || generateToken()).toUpperCase().trim(),
      durationMinutes: Number(durationMinutes) || 45,
      kkm: Number(kkm) || 75,
      totalPoints: 0,
      rules: {
        maxViolations: 3,
        allowReview: true,
        requireFullscreen,
        requireCamera,
        requireScreenShare: false,
        blockShortcuts
      },
      questions: []
    };

    onExamCreated(newExam);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
              <FilePlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Buat Paket Ujian Baru
              </h2>
              <p className="text-xs text-slate-500">
                SMAN 1 Belitang Hilir • Portal Khusus Guru Pembuat Soal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Identitas Guru Pembuat */}
          <div className="rounded-2xl bg-indigo-50/50 border border-indigo-100 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 uppercase tracking-wider">
              <User className="h-4 w-4 text-indigo-600" />
              <span>Identitas Guru Pembuat Soal</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nama Guru & Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="Contoh: Abang Ramsyah, S.Pd."
                  className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  NIP Guru (Opsional)
                </label>
                <input
                  type="text"
                  value={teacherNip}
                  onChange={(e) => setTeacherNip(e.target.value)}
                  placeholder="Contoh: 19890412 201402 1 003"
                  className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Mata Pelajaran & Kelas */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Mata Pelajaran <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ketik nama mata pelajaran..."
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {SUBJECT_SUGGESTIONS.slice(0, 7).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSubjectChange(s)}
                    className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold transition-all ${
                      subject === s
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Tingkat / Rombel Kelas <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="Contoh: Kelas XII MIPA, Kelas X-1"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {GRADE_SUGGESTIONS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleGradeChange(g)}
                    className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold transition-all ${
                      grade === g
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Judul Naskah Ujian <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Penilaian Akhir Semester (PAS) Ganjil"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Parameter Ujian: Waktu, KKM, Token */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Durasi Pengerjaan
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={5}
                  max={240}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 py-2 pl-3 pr-12 text-xs font-semibold text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">Menit</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nilai KKM (Tuntas)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={kkm}
                onChange={(e) => setKkm(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs font-semibold text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Token Akses Siswa
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-indigo-300 bg-indigo-50/40 py-2 px-3 text-xs font-mono font-bold text-indigo-700 focus:border-indigo-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setToken(generateToken())}
                  title="Acak Token Baru"
                  className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
                >
                  <Shuffle className="h-4 w-4 text-indigo-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Keamanan Ujian */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Protokol Keamanan CBT (Anti-Cheat)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireFullscreen}
                  onChange={(e) => setRequireFullscreen(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Wajib Fullscreen</span>
              </label>
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={blockShortcuts}
                  onChange={(e) => setBlockShortcuts(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Blokir Copy-Paste & F12</span>
              </label>
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireCamera}
                  onChange={(e) => setRequireCamera(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Kamera Pengawas Siswa</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all"
            >
              <FilePlus className="h-4 w-4" />
              <span>Simpan & Mulai Buat Soal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
