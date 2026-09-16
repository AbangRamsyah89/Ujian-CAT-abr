import React, { useState, useRef, useEffect } from 'react';
import { 
  PlusCircle, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  HelpCircle, 
  Save, 
  Sparkles, 
  BookOpen, 
  ShieldCheck, 
  Clock, 
  Key, 
  Award, 
  Play, 
  Check, 
  FilePlus, 
  Shuffle, 
  Layers,
  ChevronRight,
  AlertCircle,
  School,
  UserCheck,
  User,
  Download,
  Upload,
  Filter,
  Printer,
  Users
} from 'lucide-react';
import { useExam } from '../../context/ExamContext';
import { Exam, Question, QuestionType } from '../../types';
import { SchoolLogo } from '../common/SchoolLogo';
import { TeacherManagementModal } from './TeacherManagementModal';
import { ExamPrintModal } from './ExamPrintModal';
import { CreateExamModal } from './CreateExamModal';

export const TEACHER_ROSTER = [
  'Abang Ramsyah, S.Pd.',
  'Dra. Siti Aminah, M.Pd.',
  'Budi Santoso, S.Si.',
  'Sri Wahyuni, S.Pd.',
  'Rahmat Hidayat, M.Kom.',
  'Nurul Hasanah, S.Pd.'
];

export const ExamBuilderView: React.FC = () => {
  const { 
    exams, 
    saveExam, 
    deleteExam, 
    loadExamIntoStudentPortal 
  } = useExam();

  // Active Teacher Profile (who is currently creating/editing exams)
  const [currentTeacherName, setCurrentTeacherName] = useState<string>(() => {
    return localStorage.getItem('sman1_belitang_hilir_active_teacher') || 'Abang Ramsyah, S.Pd.';
  });
  const [teacherFilter, setTeacherFilter] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('sman1_belitang_hilir_active_teacher', currentTeacherName);
    } catch {
      // ignore
    }
  }, [currentTeacherName]);

  // Selected Exam being edited
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const currentExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  // Tab view: 'questions' (Manage questions) or 'settings' (Exam metadata settings)
  const [activeTab, setActiveTab] = useState<'questions' | 'settings'>('questions');
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isCreateExamModalOpen, setIsCreateExamModalOpen] = useState<boolean>(false);

  // New Question Form state
  const [isAddingQuestion, setIsAddingQuestion] = useState<boolean>(false);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);

  const [questionType, setQuestionType] = useState<QuestionType>('multiple_choice');
  const [questionText, setQuestionText] = useState<string>('');
  const [questionCategory, setQuestionCategory] = useState<string>('Umum');
  const [questionPoints, setQuestionPoints] = useState<number>(10);
  const [explanation, setExplanation] = useState<string>('');
  
  // Multiple Choice options - Default to 5 options (A, B, C, D, E) for SMA standard
  const [options, setOptions] = useState<Array<{ id: string; text: string }>>([
    { id: 'A', text: '' },
    { id: 'B', text: '' },
    { id: 'C', text: '' },
    { id: 'D', text: '' },
    { id: 'E', text: '' }
  ]);
  const [singleCorrectAnswer, setSingleCorrectAnswer] = useState<string>('A');
  const [complexCorrectAnswers, setComplexCorrectAnswers] = useState<string[]>(['A', 'B']);

  // Add another option dynamically (e.g. E, F...)
  const handleAddOption = () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    if (options.length >= letters.length) {
      showNotification('Maksimal 7 pilihan opsi jawaban!', 'error');
      return;
    }
    const nextId = letters[options.length];
    setOptions([...options, { id: nextId, text: '' }]);
  };

  // Remove option dynamically
  const handleRemoveOption = (idToRemove: string) => {
    if (options.length <= 2) {
      showNotification('Pilihan ganda minimal harus memiliki 2 opsi jawaban!', 'error');
      return;
    }
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const filtered = options.filter((o) => o.id !== idToRemove);
    const reindexed = filtered.map((opt, idx) => ({
      id: letters[idx],
      text: opt.text
    }));
    setOptions(reindexed);
    if (singleCorrectAnswer === idToRemove) {
      setSingleCorrectAnswer('A');
    }
    setComplexCorrectAnswers(complexCorrectAnswers.filter((id) => id !== idToRemove));
  };

  // Quick preset options count
  const handleSetPresetOptions = (count: number) => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const newOpts = Array.from({ length: count }, (_, i) => {
      const letter = letters[i];
      const existing = options.find((o) => o.id === letter);
      return { id: letter, text: existing ? existing.text : '' };
    });
    setOptions(newOpts);
    if (!newOpts.some((o) => o.id === singleCorrectAnswer)) {
      setSingleCorrectAnswer('A');
    }
  };

  // Essay keywords & answer
  const [essayKeywordsInput, setEssayKeywordsInput] = useState<string>('');
  const [essayModelAnswer, setEssayModelAnswer] = useState<string>('');

  // Notification message
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Generate random exam token
  const generateRandomToken = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let token = '';
    for (let i = 0; i < 8; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  };

  // Create new exam package - opens dedicated modal for teachers
  const handleCreateNewExam = () => {
    setIsCreateExamModalOpen(true);
  };

  const handleExamCreated = (newExam: Exam) => {
    saveExam(newExam);
    setSelectedExamId(newExam.id);
    setActiveTab('questions');
    resetQuestionForm();
    setIsAddingQuestion(true);
    showNotification(`Paket ujian "${newExam.title}" berhasil dibuat untuk ${newExam.teacherName}! Silakan buat butir soal nomor 1.`);
  };

  // Export exam to JSON
  const handleExportExamJSON = (examToExport: Exam) => {
    const safeSubject = examToExport.subject.replace(/[^a-zA-Z0-9]/g, '_');
    const safeTeacher = (examToExport.teacherName || 'Guru').replace(/[^a-zA-Z0-9]/g, '_');
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(examToExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Soal_CBT_${safeSubject}_${safeTeacher}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification('Naskah soal berhasil diekspor ke format JSON!');
  };

  // Import exam from JSON file
  const handleImportExamJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.title && Array.isArray(parsed.questions)) {
          const importedExam: Exam = {
            ...parsed,
            id: `exam-imported-${Date.now()}`,
            token: parsed.token || generateRandomToken(),
            schoolName: parsed.schoolName || 'SMAN 1 Belitang Hilir',
            teacherName: parsed.teacherName || currentTeacherName
          };
          saveExam(importedExam);
          setSelectedExamId(importedExam.id);
          showNotification(`Berhasil mengimpor naskah soal "${importedExam.title}" (Guru: ${importedExam.teacherName})!`);
        } else {
          showNotification('Format berkas JSON tidak sesuai struktur naskah ujian CBT!', 'error');
        }
      } catch {
        showNotification('Gagal membaca berkas JSON naskah!', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Update Exam metadata settings
  const handleUpdateExamSettings = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const updated: Exam = {
      ...currentExam,
      title: (formData.get('title') as string) || currentExam.title,
      subject: (formData.get('subject') as string) || currentExam.subject,
      grade: (formData.get('grade') as string) || currentExam.grade,
      schoolName: (formData.get('schoolName') as string) || 'SMAN 1 Belitang Hilir',
      teacherName: (formData.get('teacherName') as string) || currentTeacherName,
      teacherNip: (formData.get('teacherNip') as string) || '',
      token: ((formData.get('token') as string) || currentExam.token).toUpperCase().trim(),
      durationMinutes: Number(formData.get('durationMinutes')) || 30,
      kkm: Number(formData.get('kkm')) || 75,
      rules: {
        ...currentExam.rules,
        maxViolations: Number(formData.get('maxViolations')) || 3,
        requireFullscreen: formData.get('requireFullscreen') === 'on',
        requireCamera: formData.get('requireCamera') === 'on',
        blockShortcuts: formData.get('blockShortcuts') === 'on'
      }
    };

    saveExam(updated);
    showNotification('Pengaturan paket ujian & data guru berhasil diperbarui!');
  };

  // Reset question form
  const resetQuestionForm = () => {
    setQuestionText('');
    setQuestionCategory(currentExam?.subject || 'Umum');
    setQuestionPoints(10);
    setExplanation('');
    setOptions([
      { id: 'A', text: '' },
      { id: 'B', text: '' },
      { id: 'C', text: '' },
      { id: 'D', text: '' },
      { id: 'E', text: '' }
    ]);
    setSingleCorrectAnswer('A');
    setComplexCorrectAnswers(['A']);
    setEssayKeywordsInput('');
    setEssayModelAnswer('');
    setIsAddingQuestion(false);
    setEditingQuestionId(null);
  };

  // Open form for editing existing question
  const handleStartEditQuestion = (q: Question) => {
    setEditingQuestionId(q.id);
    setQuestionType(q.type);
    setQuestionText(q.text);
    setQuestionCategory(q.category);
    setQuestionPoints(q.points);
    setExplanation(q.explanation);

    if (q.options) {
      if (q.type === 'multiple_choice' && q.options.length === 4) {
        setOptions([
          ...q.options,
          { id: 'E', text: '' }
        ]);
      } else {
        setOptions(q.options);
      }
    }

    if (q.type === 'multiple_choice') {
      setSingleCorrectAnswer(typeof q.correctAnswer === 'string' ? q.correctAnswer : 'A');
    } else if (q.type === 'complex_multiple') {
      setComplexCorrectAnswers(Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer]);
    } else if (q.type === 'essay_short') {
      setEssayKeywordsInput(q.keywords?.join(', ') || '');
      setEssayModelAnswer(typeof q.correctAnswer === 'string' ? q.correctAnswer : '');
    }

    setIsAddingQuestion(true);
  };

  // Save new or edited question
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      showNotification('Teks soal tidak boleh kosong!', 'error');
      return;
    }

    let calculatedCorrectAnswer: string | string[] = singleCorrectAnswer;
    let extractedKeywords: string[] | undefined = undefined;

    if (questionType === 'multiple_choice') {
      const correctOpt = options.find((o) => o.id === singleCorrectAnswer);
      if (!correctOpt || !correctOpt.text.trim()) {
        showNotification(`Opsi kunci jawaban (${singleCorrectAnswer}) belum diisi teks!`, 'error');
        return;
      }
      calculatedCorrectAnswer = singleCorrectAnswer;
    } else if (questionType === 'complex_multiple') {
      if (complexCorrectAnswers.length === 0) {
        showNotification('Pilih minimal satu kunci jawaban yang benar untuk pilihan ganda kompleks!', 'error');
        return;
      }
      calculatedCorrectAnswer = complexCorrectAnswers;
    } else if (questionType === 'essay_short') {
      calculatedCorrectAnswer = essayModelAnswer || 'Kriteria jawaban sesuai rubrik kata kunci.';
      extractedKeywords = essayKeywordsInput
        .split(',')
        .map((k) => k.trim().toLowerCase())
        .filter((k) => k.length > 0);
    }

    const questionObj: Question = {
      id: editingQuestionId || (currentExam.questions.length > 0 ? Math.max(...currentExam.questions.map((q) => q.id)) + 1 : 1),
      type: questionType,
      category: questionCategory.trim() || 'Umum',
      points: Number(questionPoints) || 10,
      text: questionText.trim(),
      options: questionType !== 'essay_short' ? options.filter((o) => o.text.trim().length > 0) : undefined,
      correctAnswer: calculatedCorrectAnswer,
      keywords: extractedKeywords,
      explanation: explanation.trim() || 'Pembahasan telah diverifikasi oleh pembuat soal.'
    };

    let updatedQuestions: Question[];
    if (editingQuestionId) {
      updatedQuestions = currentExam.questions.map((q) => (q.id === editingQuestionId ? questionObj : q));
    } else {
      updatedQuestions = [...currentExam.questions, questionObj];
    }

    const totalPts = updatedQuestions.reduce((acc, q) => acc + q.points, 0);
    const updatedExam: Exam = {
      ...currentExam,
      questions: updatedQuestions,
      totalPoints: totalPts
    };

    saveExam(updatedExam);
    showNotification(editingQuestionId ? 'Butir soal berhasil diperbarui!' : 'Butir soal baru berhasil ditambahkan!');
    resetQuestionForm();
  };

  // Delete question
  const handleDeleteQuestion = (qId: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus butir soal ini?')) {
      const updatedQuestions = currentExam.questions.filter((q) => q.id !== qId);
      const totalPts = updatedQuestions.reduce((acc, q) => acc + q.points, 0);
      const updatedExam: Exam = {
        ...currentExam,
        questions: updatedQuestions,
        totalPoints: totalPts
      };
      saveExam(updatedExam);
      showNotification('Butir soal berhasil dihapus.');
    }
  };

  // Add quick sample questions
  const handleAddSampleQuestion = () => {
    const nextId = currentExam.questions.length > 0 ? Math.max(...currentExam.questions.map((q) => q.id)) + 1 : 1;
    const sampleQ: Question = {
      id: nextId,
      type: 'multiple_choice',
      category: 'Informatika & Logika',
      points: 10,
      text: `Contoh Soal Baru #${nextId}: Manakah di bawah ini yang merupakan struktur data bertipe LIFO (Last In First Out)?`,
      options: [
        { id: 'A', text: 'Queue (Antrean)' },
        { id: 'B', text: 'Stack (Tumpukan)' },
        { id: 'C', text: 'Array (Larik)' },
        { id: 'D', text: 'Linked List (Senarai Berantai)' },
        { id: 'E', text: 'Binary Search Tree (Pohon Biner)' }
      ],
      correctAnswer: 'B',
      explanation: 'Stack menerapkan prinsip LIFO di mana elemen yang terakhir masuk akan menjadi elemen yang pertama keluar.'
    };

    const updatedQuestions = [...currentExam.questions, sampleQ];
    saveExam({
      ...currentExam,
      questions: updatedQuestions,
      totalPoints: updatedQuestions.reduce((acc, q) => acc + q.points, 0)
    });
    showNotification(`Soal contoh #${nextId} berhasil ditambahkan ke naskah!`);
  };

  const totalExamPoints = currentExam.questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Notification Toast */}
      {feedbackMessage && (
        <div
          className={`fixed top-16 right-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold text-white shadow-xl animate-in slide-in-from-top-2 ${
            feedbackMessage.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3.5">
          <SchoolLogo size="lg" withUpload={true} />
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
              <span className="flex items-center gap-1 font-extrabold">
                SMAN 1 Belitang Hilir
              </span>
              <span>•</span>
              <span>Bank Soal Terpadu & Kolaborasi Multi-Guru</span>
            </div>
            <h1 className="mt-0.5 text-2xl font-extrabold text-slate-900">
              Manajemen Naskah & Butir Soal CBT
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Semua guru SMAN 1 Belitang Hilir dapat membuat, mengedit, mengarsipkan, dan mencetak naskah ujian masing-masing.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Hidden file input for JSON import */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportExamJSON}
            accept=".json"
            className="hidden"
          />

          {/* Print A4/F4 button */}
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 shadow-xs transition-colors"
            title="Cetak naskah soal lengkap dengan Kop SMAN 1 Belitang Hilir (A4 / F4)"
          >
            <Printer className="h-3.5 w-3.5 text-emerald-700" />
            <span>Cetak Naskah (A4 / F4)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
            title="Impor naskah soal dari guru lain (format .json)"
          >
            <Upload className="h-3.5 w-3.5 text-indigo-600" />
            <span>Impor Naskah</span>
          </button>

          <button
            onClick={() => handleExportExamJSON(currentExam)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
            title="Unduh naskah ujian saat ini sebagai file .json untuk dibagikan ke guru lain"
          >
            <Download className="h-3.5 w-3.5 text-slate-600" />
            <span>Ekspor Naskah</span>
          </button>

          <button
            onClick={handleCreateNewExam}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs transition-colors"
          >
            <FilePlus className="h-4 w-4" />
            <span>+ Buat Naskah Baru</span>
          </button>

          <button
            onClick={() => loadExamIntoStudentPortal(currentExam.id)}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
            title="Langsung buka portal siswa dengan token naskah ini"
          >
            <Play className="h-4 w-4" />
            <span>Uji Coba Kerjakan</span>
          </button>
        </div>
      </div>

      {/* Active Teacher Identity Bar */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-indigo-50 via-slate-50 to-white border border-indigo-100 p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-xs">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                Profil Guru Pembuat Soal Aktif:
              </span>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <input
                  type="text"
                  value={currentTeacherName}
                  onChange={(e) => setCurrentTeacherName(e.target.value)}
                  placeholder="Ketik Nama Anda beserta Gelar..."
                  className="rounded-lg border border-indigo-200 bg-white px-3 py-1 text-xs font-bold text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none w-56 sm:w-64"
                />
                <button
                  type="button"
                  onClick={() => setIsTeacherModalOpen(true)}
                  className="flex items-center gap-1 rounded-lg border border-indigo-200 bg-white px-2.5 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-50 shadow-2xs transition-colors"
                  title="Kelola nama guru, NIP, gelar, dan daftar pengampu sekolah"
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Kelola Data Guru...</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filter Exams by Teacher */}
          <div className="flex items-center gap-2 text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-semibold text-slate-500">Filter Naskah:</span>
            <div className="flex items-center rounded-xl bg-white border border-slate-200 p-1 shadow-2xs">
              <button
                onClick={() => setTeacherFilter('all')}
                className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                  teacherFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Guru ({exams.length})
              </button>
              <button
                onClick={() => setTeacherFilter(currentTeacherName.split(',')[0].trim())}
                className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                  teacherFilter !== 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Naskah Saya
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Exam Selector Strip */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Daftar Paket Ujian:</span>
        {exams
          .filter((ex) => {
            if (teacherFilter === 'all') return true;
            return (ex.teacherName || '').toLowerCase().includes(teacherFilter.toLowerCase());
          })
          .map((ex) => (
          <button
            key={ex.id}
            onClick={() => {
              setSelectedExamId(ex.id);
              resetQuestionForm();
            }}
            className={`flex flex-col items-start gap-1 rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all text-left ${
              selectedExamId === ex.id
                ? 'bg-slate-900 text-white shadow-xs ring-2 ring-indigo-500/30'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
              <span>{ex.title.length > 25 ? ex.title.substring(0, 25) + '...' : ex.title}</span>
              <span className="rounded bg-black/20 px-1.5 py-0.2 font-mono text-[10px]">
                {ex.questions.length} Soal
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-normal">
              Guru: <span className="font-medium text-slate-300">{ex.teacherName || 'SMAN 1 Belitang Hilir'}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Sub Tabs: Butir Soal vs Pengaturan Ujian */}
      <div className="mb-6 flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-bold transition-all ${
              activeTab === 'questions'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Daftar Butir Soal ({currentExam.questions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-bold transition-all ${
              activeTab === 'settings'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Informasi & Keamanan Ujian</span>
          </button>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-slate-500">
            <span>Token:</span>
            <code className="rounded bg-indigo-50 px-2 py-0.5 font-mono font-bold text-indigo-700">
              {currentExam.token}
            </code>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <span>Total Poin:</span>
            <span className="font-bold text-slate-800">{totalExamPoints} Pts</span>
          </div>
        </div>
      </div>

      {/* TAB 1: QUESTIONS MANAGEMENT */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          {/* Current Exam & Teacher Identity Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <span className="text-slate-400">Satuan Pendidikan:</span>{' '}
                <span className="font-bold text-slate-800">{currentExam.schoolName || 'SMAN 1 Belitang Hilir'}</span>
              </div>
              <span className="text-slate-300">•</span>
              <div>
                <span className="text-slate-400">Guru Pembuat Soal:</span>{' '}
                <span className="font-bold text-indigo-700">{currentExam.teacherName || currentTeacherName}</span>
                {currentExam.teacherNip && <span className="text-slate-400 font-mono text-[11px]"> (NIP: {currentExam.teacherNip})</span>}
              </div>
              <span className="text-slate-300">•</span>
              <div>
                <span className="text-slate-400">Mapel:</span>{' '}
                <span className="font-semibold text-slate-700">{currentExam.subject} ({currentExam.grade})</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('settings')}
                className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px] underline"
              >
                Ubah Info Guru & Ujian
              </button>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                Butir Soal Aktif:
              </span>
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                {currentExam.questions.length} Soal
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddSampleQuestion}
                className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span>+ Soal Cepat Contoh</span>
              </button>
              <button
                onClick={() => {
                  resetQuestionForm();
                  setIsAddingQuestion(true);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs transition-colors"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Tambah Soal Baru</span>
              </button>
            </div>
          </div>

          {/* Form Modal / Drawer: Add or Edit Question */}
          {isAddingQuestion && (
            <div className="rounded-2xl border-2 border-indigo-200 bg-white p-6 shadow-lg animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                    <Edit3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {editingQuestionId ? `Edit Butir Soal #${editingQuestionId}` : 'Buat Butir Soal Baru'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Pilih format soal dan atur sistem kunci jawaban penilaian otomatis
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetQuestionForm}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  Batal
                </button>
              </div>

              <form onSubmit={handleSaveQuestion} className="space-y-5">
                {/* Question Type Switcher */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    1. Pilih Jenis Tipe Soal:
                  </label>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => setQuestionType('multiple_choice')}
                      className={`flex flex-col items-start rounded-xl p-3.5 text-left border transition-all ${
                        questionType === 'multiple_choice'
                          ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-900">
                        🔘 Pilihan Ganda (Single Choice)
                      </span>
                      <span className="text-[11px] text-slate-500 mt-1">
                        Satu jawaban benar (Opsi A, B, C, D, E)
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setQuestionType('complex_multiple')}
                      className={`flex flex-col items-start rounded-xl p-3.5 text-left border transition-all ${
                        questionType === 'complex_multiple'
                          ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-900">
                        ☑️ Pilihan Ganda Kompleks
                      </span>
                      <span className="text-[11px] text-slate-500 mt-1">
                        Lebih dari satu jawaban benar (Asesmen Kompetensi)
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setQuestionType('essay_short')}
                      className={`flex flex-col items-start rounded-xl p-3.5 text-left border transition-all ${
                        questionType === 'essay_short'
                          ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-900">
                        📝 Esai & Uraian Otomatis
                      </span>
                      <span className="text-[11px] text-slate-500 mt-1">
                        Penilaian otomatis berbasis kata kunci konsep
                      </span>
                    </button>
                  </div>
                </div>

                {/* Metadata: Category & Points */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Kategori / Topik Materi:
                    </label>
                    <input
                      type="text"
                      value={questionCategory}
                      onChange={(e) => setQuestionCategory(e.target.value)}
                      placeholder="Contoh: Logika Algoritma, Genetika, GLBB"
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Bobot Poin Soal:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={questionPoints}
                      onChange={(e) => setQuestionPoints(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                {/* Question Text */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    2. Teks Narasi / Pertanyaan Soal:
                  </label>
                  <textarea
                    rows={4}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Tuliskan pertanyaan soal secara jelas..."
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 leading-relaxed focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                {/* Answer Keys Configuration depending on Question Type */}
                {questionType === 'multiple_choice' && (
                  <div className="space-y-3 rounded-xl bg-slate-50 p-4 border border-slate-200">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-800">
                          3. Masukkan Pilihan Jawaban & Tentukan Kunci Jawaban:
                        </label>
                        <p className="text-[11px] text-slate-500">
                          Klik lingkaran pada opsi yang menjadi kunci jawaban benar (A, B, C, D, atau E).
                        </p>
                      </div>

                      {/* Presets & Add Option */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSetPresetOptions(5)}
                          className={`rounded-lg px-2 py-1 text-[10px] font-bold transition-all ${
                            options.length === 5
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                          title="Terapkan standar SMA (5 Pilihan: A, B, C, D, E)"
                        >
                          Standar SMA (A–E)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetPresetOptions(4)}
                          className={`rounded-lg px-2 py-1 text-[10px] font-bold transition-all ${
                            options.length === 4
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                          title="Terapkan 4 pilihan (A, B, C, D)"
                        >
                          4 Opsi (A–D)
                        </button>
                        <button
                          type="button"
                          onClick={handleAddOption}
                          className="flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
                        >
                          <PlusCircle className="h-3 w-3" />
                          <span>+ Tambah Opsi</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      {options.map((opt, idx) => (
                        <div key={opt.id} className="flex items-center gap-2">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="single_correct"
                              value={opt.id}
                              checked={singleCorrectAnswer === opt.id}
                              onChange={() => setSingleCorrectAnswer(opt.id)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span
                              className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                                singleCorrectAnswer === opt.id
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                              }`}
                              title={singleCorrectAnswer === opt.id ? 'Kunci Jawaban Benar' : 'Klik untuk jadikan kunci'}
                            >
                              {opt.id}
                            </span>
                          </label>
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => {
                              const updated = [...options];
                              updated[idx].text = e.target.value;
                              setOptions(updated);
                            }}
                            placeholder={`Teks pilihan opsi ${opt.id}...`}
                            className="flex-1 rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                            required
                          />
                          {options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(opt.id)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title={`Hapus Opsi ${opt.id}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {questionType === 'complex_multiple' && (
                  <div className="space-y-3 rounded-xl bg-slate-50 p-4 border border-slate-200">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-800">
                          3. Masukkan Pilihan & Centang Semua Kunci Jawaban yang Benar:
                        </label>
                        <p className="text-[11px] text-slate-500">
                          Centang kotak pada semua pilihan yang bernilai benar.
                        </p>
                      </div>

                      {/* Presets & Add Option */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSetPresetOptions(5)}
                          className={`rounded-lg px-2 py-1 text-[10px] font-bold transition-all ${
                            options.length === 5
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Standar SMA (A–E)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetPresetOptions(4)}
                          className={`rounded-lg px-2 py-1 text-[10px] font-bold transition-all ${
                            options.length === 4
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          4 Opsi (A–D)
                        </button>
                        <button
                          type="button"
                          onClick={handleAddOption}
                          className="flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
                        >
                          <PlusCircle className="h-3 w-3" />
                          <span>+ Tambah Opsi</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      {options.map((opt, idx) => {
                        const isChecked = complexCorrectAnswers.includes(opt.id);
                        return (
                          <div key={opt.id} className="flex items-center gap-2">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setComplexCorrectAnswers(complexCorrectAnswers.filter((id) => id !== opt.id));
                                  } else {
                                    setComplexCorrectAnswers([...complexCorrectAnswers, opt.id]);
                                  }
                                }}
                                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                              />
                              <span
                                className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                                  isChecked
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                }`}
                              >
                                {opt.id}
                              </span>
                            </label>
                            <input
                              type="text"
                              value={opt.text}
                              onChange={(e) => {
                                const updated = [...options];
                                updated[idx].text = e.target.value;
                                setOptions(updated);
                              }}
                              placeholder={`Teks pilihan opsi ${opt.id}...`}
                              className="flex-1 rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                              required
                            />
                            {options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(opt.id)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                title={`Hapus Opsi ${opt.id}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {questionType === 'essay_short' && (
                  <div className="space-y-4 rounded-xl bg-indigo-50/50 p-4 border border-indigo-100">
                    <div>
                      <label className="block text-xs font-bold text-indigo-900 mb-1">
                        3. Kata Kunci Esensial Penilaian Otomatis (Pisahkan dengan tanda koma):
                      </label>
                      <input
                        type="text"
                        value={essayKeywordsInput}
                        onChange={(e) => setEssayKeywordsInput(e.target.value)}
                        placeholder="Contoh: handshaking, reliable, connection-oriented, paket, streaming"
                        className="w-full rounded-lg border border-indigo-200 bg-white p-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                        required
                      />
                      <p className="mt-1 text-[11px] text-indigo-600">
                        Mesin akan memeriksa ada/tidaknya kata kunci konsep di atas pada jawaban siswa secara otomatis untuk memberikan poin proporsional.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-indigo-900 mb-1">
                        Contoh Jawaban Model / Kunci Uraian:
                      </label>
                      <textarea
                        rows={2}
                        value={essayModelAnswer}
                        onChange={(e) => setEssayModelAnswer(e.target.value)}
                        placeholder="Tuliskan uraian model jawaban lengkap..."
                        className="w-full rounded-lg border border-indigo-200 bg-white p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Explanation / Pembahasan Ilmiah */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    4. Pembahasan Soal & Penjelasan Ilmiah (Akan ditampilkan di lembar rapor nilai):
                  </label>
                  <textarea
                    rows={3}
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Tuliskan penjelasan alasan mengapa jawaban tersebut benar..."
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 leading-relaxed focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={resetQuestionForm}
                    className="rounded-xl border border-slate-200 py-2.5 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 px-5 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs"
                  >
                    <Save className="h-4 w-4" />
                    <span>{editingQuestionId ? 'Simpan Perubahan Soal' : 'Tambahkan Soal ke Naskah'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of Existing Questions in the Exam */}
          {currentExam.questions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Belum Ada Butir Soal</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Naskah ujian ini belum memiliki butir soal. Klik tombol "Tambah Soal Baru" di atas untuk mulai membuat soal.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentExam.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-indigo-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-xs text-slate-700">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                            {q.category}
                          </span>
                          <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-600 uppercase">
                            {q.type}
                          </span>
                          <span className="font-semibold text-xs text-slate-500">
                            • {q.points} Poin
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800 leading-snug">
                          {q.text}
                        </p>

                        {/* Options preview for multiple choice */}
                        {q.options && (
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {q.options.map((opt) => {
                              const isCorrect = Array.isArray(q.correctAnswer)
                                ? q.correctAnswer.includes(opt.id)
                                : q.correctAnswer === opt.id;

                              return (
                                <div
                                  key={opt.id}
                                  className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ${
                                    isCorrect
                                      ? 'bg-emerald-50 text-emerald-800 font-bold ring-1 ring-emerald-300'
                                      : 'bg-slate-50 text-slate-600'
                                  }`}
                                >
                                  <span
                                    className={`w-4 h-4 rounded text-[10px] flex items-center justify-center font-bold ${
                                      isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200'
                                    }`}
                                  >
                                    {opt.id}
                                  </span>
                                  <span className="truncate">{opt.text}</span>
                                  {isCorrect && <Check className="w-3 h-3 text-emerald-600 ml-auto" />}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Keywords preview for essay */}
                        {q.type === 'essay_short' && q.keywords && (
                          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap text-xs">
                            <span className="text-[11px] font-semibold text-slate-400">Kata Kunci Auto-Grading:</span>
                            {q.keywords.map((kw, kIdx) => (
                              <span
                                key={kIdx}
                                className="rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-700"
                              >
                                #{kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleStartEditQuestion(q)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                        title="Edit Butir Soal"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Hapus Butir Soal"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EXAM SETTINGS & SECURITY RULES */}
      {activeTab === 'settings' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <form onSubmit={handleUpdateExamSettings} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">
                Pengaturan Informasi & Keamanan Naskah
              </h3>
              <p className="text-xs text-slate-500">
                Atur judul, durasi, KKM, token akses ujian, dan aturan pengawasan anti-cheat
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Asal Satuan Pendidikan (Sekolah):
                </label>
                <input
                  type="text"
                  name="schoolName"
                  defaultValue={currentExam.schoolName || 'SMAN 1 Belitang Hilir'}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 bg-slate-50 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Guru Pembuat Soal / Pengampu:
                </label>
                <input
                  type="text"
                  name="teacherName"
                  list="teachers-list-suggestion"
                  defaultValue={currentExam.teacherName || currentTeacherName}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none font-semibold"
                  required
                />
                <datalist id="teachers-list-suggestion">
                  {TEACHER_ROSTER.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  NIP / NUPTK Guru (Opsional):
                </label>
                <input
                  type="text"
                  name="teacherNip"
                  defaultValue={currentExam.teacherNip || ''}
                  placeholder="Contoh: 19890412 201402 1 003"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kelas / Jenjang Sasaran:
                </label>
                <input
                  type="text"
                  name="grade"
                  defaultValue={currentExam.grade}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Lengkap Ujian:
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={currentExam.title}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mata Pelajaran:
                </label>
                <input
                  type="text"
                  name="subject"
                  defaultValue={currentExam.subject}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Token Ujian (Kode Masuk Siswa):
                </label>
                <input
                  type="text"
                  name="token"
                  defaultValue={currentExam.token}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-mono text-xs font-bold uppercase tracking-widest text-indigo-700 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Durasi Pengerjaan (Menit):
                </label>
                <input
                  type="number"
                  name="durationMinutes"
                  defaultValue={currentExam.durationMinutes}
                  min={5}
                  max={240}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kriteria Ketuntasan Minimal (KKM):
                </label>
                <input
                  type="number"
                  name="kkm"
                  defaultValue={currentExam.kkm}
                  min={0}
                  max={100}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Batas Toleransi Pelanggaran Anti-Cheat:
                </label>
                <input
                  type="number"
                  name="maxViolations"
                  defaultValue={currentExam.rules.maxViolations}
                  min={1}
                  max={10}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Anti-Cheat Switches */}
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Fitur Keamanan Anti-Cheat yang Diberlakukan:
              </span>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="requireFullscreen"
                  defaultChecked={currentExam.rules.requireFullscreen}
                  className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-800 font-medium">
                  Wajib Mode Layar Penuh (Kunci Fullscreen)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="requireCamera"
                  defaultChecked={currentExam.rules.requireCamera}
                  className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-800 font-medium">
                  Wajib Kamera & Pemantauan Biometrik Wajah
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="blockShortcuts"
                  defaultChecked={currentExam.rules.blockShortcuts}
                  className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-800 font-medium">
                  Blokir Pintasan Terlarang (Ctrl+C, Ctrl+V, F12, DevTools, Klik Kanan)
                </span>
              </label>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {exams.length > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Yakin ingin menghapus naskah "${currentExam.title}"?`)) {
                      deleteExam(currentExam.id);
                      showNotification('Naskah ujian telah dihapus.');
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-800"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Hapus Naskah Ujian Ini</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Simpan Pengaturan Ujian</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Kelola Guru SMAN 1 Belitang Hilir */}
      <TeacherManagementModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        activeTeacherName={currentTeacherName}
        onSelectActiveTeacher={(name, nip) => {
          setCurrentTeacherName(name);
          if (currentExam) {
            saveExam({
              ...currentExam,
              teacherName: name,
              teacherNip: nip || currentExam.teacherNip
            });
          }
          showNotification(`Guru aktif diubah: ${name}`);
        }}
      />

      {/* Modal Cetak Naskah Ujian (A4 / F4) */}
      <ExamPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        exam={currentExam}
      />

      {/* Modal Buat Paket Ujian Baru untuk Guru */}
      <CreateExamModal
        isOpen={isCreateExamModalOpen}
        onClose={() => setIsCreateExamModalOpen(false)}
        activeTeacherName={currentTeacherName}
        onExamCreated={handleExamCreated}
      />
    </div>
  );
};
