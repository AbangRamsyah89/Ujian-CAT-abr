import React, { useState, useEffect } from 'react';
import { Teacher } from '../../types';
import { UserCheck, Plus, Edit2, Trash2, X, Check, School, Shield } from 'lucide-react';
import { SchoolLogo } from '../common/SchoolLogo';

interface TeacherManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTeacherName: string;
  onSelectActiveTeacher: (teacherName: string, nip?: string) => void;
}

const DEFAULT_TEACHERS: Teacher[] = [
  {
    id: 't-1',
    name: 'Abang Ramsyah, S.Pd.',
    nip: '19890412 201402 1 003',
    subject: 'Informatika & TIK',
    email: 'abangramsyah89@gmail.com',
  },
  {
    id: 't-2',
    name: 'Dra. Siti Aminah, M.Pd.',
    nip: '19780516 200501 2 008',
    subject: 'Bahasa Indonesia & Literasi',
  },
  {
    id: 't-3',
    name: 'Budi Santoso, S.Kom., M.T.',
    nip: '19840210 200903 1 007',
    subject: 'Matematika & Algoritma',
  },
  {
    id: 't-4',
    name: 'Hj. Nurul Hidayati, S.Si.',
    nip: '19811124 200604 2 015',
    subject: 'Biologi & IPA Terpadu',
  },
  {
    id: 't-5',
    name: 'Ahmad Fauzi, S.Pd., M.Pd.',
    nip: '19850618 201001 1 012',
    subject: 'Fisika Terapan',
  },
  {
    id: 't-6',
    name: 'Dewi Sartika, S.Si., M.Sc.',
    nip: '19900315 201503 2 004',
    subject: 'Kimia & Lingkungan Hidup',
  },
];

export const TeacherManagementModal: React.FC<TeacherManagementModalProps> = ({
  isOpen,
  onClose,
  activeTeacherName,
  onSelectActiveTeacher,
}) => {
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    try {
      const saved = localStorage.getItem('sman1_teacher_roster_full');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_TEACHERS;
  });

  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formNip, setFormNip] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formEmail, setFormEmail] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('sman1_teacher_roster_full', JSON.stringify(teachers));
    } catch {
      // storage error
    }
  }, [teachers]);

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setEditingTeacher(null);
    setFormName('');
    setFormNip('');
    setFormSubject('');
    setFormEmail('');
    setIsAddingNew(true);
  };

  const handleStartEdit = (t: Teacher) => {
    setIsAddingNew(false);
    setEditingTeacher(t);
    setFormName(t.name);
    setFormNip(t.nip || '');
    setFormSubject(t.subject || '');
    setFormEmail(t.email || '');
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingTeacher) {
      // Update
      const updated = teachers.map((t) =>
        t.id === editingTeacher.id
          ? {
              ...t,
              name: formName.trim(),
              nip: formNip.trim() || undefined,
              subject: formSubject.trim() || undefined,
              email: formEmail.trim() || undefined,
            }
          : t
      );
      setTeachers(updated);
      if (activeTeacherName === editingTeacher.name) {
        onSelectActiveTeacher(formName.trim(), formNip.trim());
      }
      setEditingTeacher(null);
    } else {
      // Add new
      const newTeacher: Teacher = {
        id: `t-${Date.now()}`,
        name: formName.trim(),
        nip: formNip.trim() || undefined,
        subject: formSubject.trim() || undefined,
        email: formEmail.trim() || undefined,
      };
      setTeachers([...teachers, newTeacher]);
      setIsAddingNew(false);
    }
  };

  const handleDeleteTeacher = (id: string, name: string) => {
    if (teachers.length <= 1) {
      alert('Minimal harus ada satu guru terdaftar di sistem!');
      return;
    }
    if (confirm(`Hapus guru "${name}" dari daftar sekolah?`)) {
      const filtered = teachers.filter((t) => t.id !== id);
      setTeachers(filtered);
      if (activeTeacherName === name && filtered[0]) {
        onSelectActiveTeacher(filtered[0].name, filtered[0].nip);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <SchoolLogo size="sm" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Kelola Data Guru SMAN 1 Belitang Hilir
              </h2>
              <p className="text-xs text-slate-500">
                Ubah nama guru, gelar, NIP, serta mata pelajaran pengampu naskah CBT
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Active Teacher Banner */}
          <div className="flex items-center justify-between rounded-xl bg-indigo-50 border border-indigo-100 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  Guru Pembuat Soal yang Sedang Aktif:
                </span>
                <div className="text-sm font-extrabold text-slate-900">{activeTeacherName}</div>
              </div>
            </div>
            <button
              onClick={handleStartAdd}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Tambah Guru Baru</span>
            </button>
          </div>

          {/* Form Add / Edit */}
          {(isAddingNew || editingTeacher) && (
            <form
              onSubmit={handleSaveTeacher}
              className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-4 animate-in slide-in-from-top-2"
            >
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                  {editingTeacher ? 'Edit Data Guru' : 'Tambah Guru Baru SMAN 1 Belitang Hilir'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingTeacher(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
                >
                  Batal
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap & Gelar Akademik *:
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Abang Ramsyah, S.Pd."
                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIP / NUPTK (Opsional):
                  </label>
                  <input
                    type="text"
                    value={formNip}
                    onChange={(e) => setFormNip(e.target.value)}
                    placeholder="Contoh: 19890412 201402 1 003"
                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mata Pelajaran Pengampu:
                  </label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="Contoh: Informatika / Fisika"
                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors"
                >
                  <Check className="h-4 w-4" />
                  <span>Simpan Perubahan Guru</span>
                </button>
              </div>
            </form>
          )}

          {/* Teacher List Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700">
              Daftar Dewan Guru Terdaftar ({teachers.length} Guru)
            </div>
            <div className="divide-y divide-slate-100">
              {teachers.map((t) => {
                const isActive = activeTeacherName === t.name;
                return (
                  <div
                    key={t.id}
                    className={`flex flex-wrap items-center justify-between gap-3 p-3.5 transition-colors ${
                      isActive ? 'bg-indigo-50/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{t.name}</span>
                        {isActive && (
                          <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">
                            Aktif
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-slate-500">
                        {t.nip && <span>NIP: <strong className="text-slate-700">{t.nip}</strong></span>}
                        {t.subject && (
                          <>
                            <span>•</span>
                            <span className="text-indigo-600 font-semibold">{t.subject}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!isActive && (
                        <button
                          onClick={() => onSelectActiveTeacher(t.name, t.nip)}
                          className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
                          title="Jadikan profil aktif pembuat soal"
                        >
                          Pilih
                        </button>
                      )}
                      <button
                        onClick={() => handleStartEdit(t)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                        title="Ubah data guru ini"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTeacher(t.id, t.name)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Hapus guru ini"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 flex justify-between items-center text-xs text-slate-500">
          <span>Tersimpan otomatis di penyimpanan lokal browser</span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 font-bold text-white hover:bg-slate-800 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
