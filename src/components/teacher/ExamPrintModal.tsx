import React, { useState } from 'react';
import { Exam } from '../../types';
import { SchoolLogo } from '../common/SchoolLogo';
import { Printer, X, FileText, CheckSquare, Layers, Download } from 'lucide-react';

interface ExamPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam;
}

export const ExamPrintModal: React.FC<ExamPrintModalProps> = ({ isOpen, onClose, exam }) => {
  const [paperSize, setPaperSize] = useState<'a4' | 'f4'>('a4');
  const [includeAnswerKey, setIncludeAnswerKey] = useState(false);
  const [includeLJK, setIncludeLJK] = useState(false);

  if (!isOpen) return null;

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-2 sm:p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[96vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Controls Toolbar (Hidden on actual print) */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 bg-slate-900 px-5 py-3 text-white print:hidden">
          <div className="flex items-center gap-2.5">
            <SchoolLogo size="sm" />
            <div>
              <h2 className="text-sm font-bold">Cetak Naskah Ujian Resmi - SMAN 1 Belitang Hilir</h2>
              <p className="text-[11px] text-slate-400">
                Pilih ukuran kertas A4 / F4 (Folio) lalu tekan Cetak untuk Print atau Simpan sebagai PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Paper Size selector */}
            <div className="flex items-center rounded-lg bg-slate-800 p-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setPaperSize('a4')}
                className={`rounded px-3 py-1 text-xs font-bold transition-all ${
                  paperSize === 'a4'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                A4 (210×297 mm)
              </button>
              <button
                type="button"
                onClick={() => setPaperSize('f4')}
                className={`rounded px-3 py-1 text-xs font-bold transition-all ${
                  paperSize === 'f4'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                F4 / Folio (215×330 mm)
              </button>
            </div>

            {/* Print Options */}
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer pl-2">
              <input
                type="checkbox"
                checked={includeAnswerKey}
                onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                className="h-3.5 w-3.5 rounded text-indigo-500"
              />
              <span>+ Kunci Jawaban Guru</span>
            </label>

            <button
              onClick={handleTriggerPrint}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Sekarang (Print / PDF)</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div
          id="printable-exam-document"
          className={`flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-8 print:p-0 print:bg-white ${
            paperSize === 'f4' ? 'print-size-f4' : 'print-size-a4'
          }`}
        >
          {/* Paper Sheet container */}
          <div className="mx-auto max-w-[210mm] bg-white p-8 shadow-md print:max-w-none print:p-0 print:shadow-none font-serif text-slate-900 leading-relaxed text-sm">
            {/* KOP SURAT RESMI */}
            <div className="flex items-center border-b-[3px] border-slate-900 pb-3 mb-1">
              <div className="w-24 shrink-0 flex justify-center">
                <SchoolLogo size="xl" />
              </div>
              <div className="flex-1 text-center pr-12">
                <h3 className="text-xs font-bold tracking-widest uppercase">
                  Pemerintah Provinsi Kalimantan Barat
                </h3>
                <h3 className="text-xs font-bold tracking-widest uppercase">
                  Dinas Pendidikan dan Kebudayaan
                </h3>
                <h1 className="text-lg font-black tracking-wide text-slate-900 uppercase">
                  SMA NEGERI 1 BELITANG HILIR
                </h1>
                <p className="text-[11px] font-sans text-slate-600 leading-tight">
                  Alamat: Jl. Merdeka No. 01, Kec. Belitang Hilir, Kab. Sekadau, Prov. Kalimantan Barat 79586
                </p>
                <p className="text-[10px] font-sans text-slate-600">
                  NPSN: 30105315 • Akreditasi: B • Website: sman1belitanghilir.sch.id
                </p>
              </div>
            </div>
            {/* Double Rule beneath Kop */}
            <div className="border-b border-slate-900 mb-4" />

            {/* Exam Title */}
            <div className="text-center my-3">
              <h2 className="text-base font-extrabold uppercase tracking-wide underline decoration-1 underline-offset-4">
                {exam.title.toUpperCase()}
              </h2>
              <p className="text-xs font-sans font-semibold text-slate-600 mt-0.5">
                Tahun Ajaran 2025/2026 • Kurikulum Merdeka
              </p>
            </div>

            {/* Exam Metadata Grid */}
            <div className="my-4 rounded border border-slate-800 p-3 font-sans text-xs">
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                <div className="flex">
                  <span className="w-32 font-bold">Mata Pelajaran</span>
                  <span className="mr-2">:</span>
                  <span className="font-semibold">{exam.subject}</span>
                </div>
                <div className="flex">
                  <span className="w-32 font-bold">Hari / Tanggal</span>
                  <span className="mr-2">:</span>
                  <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex">
                  <span className="w-32 font-bold">Kelas / Rombel</span>
                  <span className="mr-2">:</span>
                  <span>{exam.grade}</span>
                </div>
                <div className="flex">
                  <span className="w-32 font-bold">Alokasi Waktu</span>
                  <span className="mr-2">:</span>
                  <span>{exam.durationMinutes} Menit</span>
                </div>
                <div className="flex">
                  <span className="w-32 font-bold">Guru Pengampu</span>
                  <span className="mr-2">:</span>
                  <span className="font-semibold">{exam.teacherName}</span>
                </div>
                <div className="flex">
                  <span className="w-32 font-bold">Standar KKM</span>
                  <span className="mr-2">:</span>
                  <span>{exam.kkm} Poin (Total: {exam.totalPoints} Poin)</span>
                </div>
              </div>
            </div>

            {/* Petunjuk Umum */}
            <div className="my-3 rounded bg-slate-50 border border-slate-200 p-2.5 text-[11px] font-sans text-slate-700">
              <span className="font-bold block mb-1">PETUNJUK UMUM:</span>
              <ol className="list-decimal list-inside space-y-0.5 pl-1">
                <li>Berdoalah sebelum mengerjakan soal sesuai keyakinan masing-masing.</li>
                <li>Periksa kelengkapan butir soal sebelum Anda mulai menjawab.</li>
                <li>Pilihlah salah satu jawaban yang paling tepat (A, B, C, D, atau E) untuk pilihan ganda.</li>
                <li>Jawablah secara jujur dan dilarang bekerjasama atau menggunakan perangkat tidak berizin.</li>
              </ol>
            </div>

            {/* LIST OF QUESTIONS */}
            <div className="mt-6 space-y-5">
              {exam.questions.map((q, idx) => (
                <div key={q.id} className="page-break-inside-avoid">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-sm min-w-[20px]">{idx + 1}.</span>
                    <div className="flex-1">
                      <p className="text-sm font-serif leading-relaxed text-slate-900 font-medium">
                        {q.text}
                      </p>

                      {/* Options (A, B, C, D, E) */}
                      {q.options && q.options.length > 0 && (
                        <div className="mt-2.5 space-y-1.5 pl-2 font-sans text-xs">
                          {q.options.map((opt) => (
                            <div key={opt.id} className="flex items-start gap-2">
                              <span className="font-bold min-w-[18px]">{opt.id}.</span>
                              <span className="text-slate-800">{opt.text}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Essay answer line area if essay */}
                      {q.type === 'essay_short' && (
                        <div className="mt-3 border border-dashed border-slate-300 rounded p-2 text-slate-400 text-xs italic font-sans">
                          (Tuliskan uraian jawaban pada lembar jawaban yang telah disediakan)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Lembar Pengesahan Guru Pengampu */}
            <div className="mt-12 flex justify-between font-sans text-xs pt-8 border-t border-slate-300 page-break-inside-avoid">
              <div className="text-center">
                <p>Mengetahui,</p>
                <p>Kepala SMAN 1 Belitang Hilir</p>
                <div className="h-16" />
                <p className="font-bold underline">Drs. H. Mulyadi, M.Pd.</p>
                <p className="text-[10px] text-slate-500">NIP. 19680312 199303 1 004</p>
              </div>

              <div className="text-center">
                <p>Belitang Hilir, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p>Guru Mata Pelajaran,</p>
                <div className="h-16" />
                <p className="font-bold underline">{exam.teacherName}</p>
                <p className="text-[10px] text-slate-500">{exam.teacherNip ? `NIP. ${exam.teacherNip}` : 'Guru Pengampu'}</p>
              </div>
            </div>

            {/* OPTIONAL: Kunci Jawaban Guru */}
            {includeAnswerKey && (
              <div className="mt-12 pt-8 border-t-2 border-dashed border-slate-400 page-break-before-always font-sans text-xs">
                <div className="flex items-center gap-2 mb-3">
                  <SchoolLogo size="sm" />
                  <h3 className="font-bold text-sm uppercase text-slate-900">
                    KUNCI JAWABAN & RUBRIK PENILAIAN (ARSIP GURU PENGAMPU)
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {exam.questions.map((q, idx) => (
                    <div key={q.id} className="border border-slate-200 rounded p-2 bg-slate-50">
                      <div className="font-bold text-indigo-900">
                        Soal No. {idx + 1} ({q.points} Poin)
                      </div>
                      <div className="mt-1">
                        <strong>Kunci: </strong>
                        <span className="font-bold text-emerald-700">
                          {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}
                        </span>
                      </div>
                      {q.explanation && (
                        <p className="text-[11px] text-slate-600 mt-1 italic">
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
