import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Exam, 
  Question, 
  StudentAnswer, 
  StudentProfile, 
  StudentExamStatus, 
  ViolationRecord, 
  ProctorAlertMessage 
} from '../types';
import { MOCK_EXAMS } from '../data/mockExams';
import { INITIAL_STUDENTS } from '../data/mockStudents';
import { createViolationRecord, AntiCheatSoundAlert } from '../utils/antiCheat';
import { gradeExamSession, DetailedExamResult } from '../utils/grading';

interface ExamContextType {
  activeRole: 'student' | 'proctor' | 'report' | 'builder';
  setActiveRole: (role: 'student' | 'proctor' | 'report' | 'builder') => void;
  
  // Exams
  exams: Exam[];
  saveExam: (exam: Exam) => void;
  deleteExam: (examId: string) => void;
  loadExamIntoStudentPortal: (examId: string) => void;

  // Selected Exam
  selectedExam: Exam;
  setSelectedExam: (exam: Exam) => void;
  
  // Student Session
  studentSessionStatus: StudentExamStatus;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (idx: number) => void;
  answers: Record<number, StudentAnswer>;
  setAnswer: (questionId: number, answer: string | string[]) => void;
  toggleFlag: (questionId: number) => void;
  timeRemaining: number;
  violations: ViolationRecord[];
  registerViolation: (type: ViolationRecord['type'], description: string, severity?: 'warning' | 'danger' | 'critical') => void;
  startExam: (token: string) => { success: boolean; message?: string };
  submitExam: () => void;
  resetExamSession: () => void;
  
  // Security toggles
  isFullscreen: boolean;
  setIsFullscreen: (val: boolean) => void;
  cameraActive: boolean;
  setCameraActive: (val: boolean) => void;
  screenStreamActive: boolean;
  setScreenStreamActive: (val: boolean) => void;
  
  // Proctor & Intercom
  activeAlert: ProctorAlertMessage | null;
  dismissAlert: () => void;
  students: StudentProfile[];
  selectedStudentForInspection: StudentProfile | null;
  setSelectedStudentForInspection: (std: StudentProfile | null) => void;
  sendProctorAlert: (studentId: string, message: string, severity?: 'info' | 'warning' | 'urgent') => void;
  updateStudentStatusByProctor: (studentId: string, newStatus: StudentExamStatus) => void;
  
  // Grading & Report
  studentResult: DetailedExamResult | null;
  inspectedStudentResult: DetailedExamResult | null;
  viewStudentReport: (studentId: string) => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

const STORAGE_KEY = 'sman1_belitang_hilir_cbt_exams_v3';

// Ensures all multiple choice questions strictly have options A, B, C, D, E
function normalizeExamQuestions(examList: Exam[]): Exam[] {
  return examList.map((exam) => ({
    ...exam,
    schoolName: exam.schoolName || 'SMAN 1 Belitang Hilir',
    teacherName: exam.teacherName || 'Abang Ramsyah, S.Pd.',
    questions: exam.questions.map((q) => {
      if (q.type === 'multiple_choice' && Array.isArray(q.options)) {
        const hasE = q.options.some((o) => o.id === 'E');
        if (!hasE) {
          // If only 4 options (A, B, C, D), append option E
          return {
            ...q,
            options: [
              ...q.options,
              { id: 'E', text: 'Semua jawaban di atas tidak tepat' }
            ]
          };
        }
      }
      return q;
    })
  }));
}

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<'student' | 'proctor' | 'report' | 'builder'>('student');
  const [exams, setExams] = useState<Exam[]>(() => {
    try {
      // 1. Try modern storage key
      const savedV3 = localStorage.getItem(STORAGE_KEY);
      if (savedV3) {
        const parsed = JSON.parse(savedV3);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return normalizeExamQuestions(parsed);
        }
      }

      // 2. Try legacy storage key and upgrade it
      const legacySaved = localStorage.getItem('sman1_belitang_hilir_cbt_exams');
      if (legacySaved) {
        const parsedLegacy = JSON.parse(legacySaved);
        if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
          const upgraded = normalizeExamQuestions(parsedLegacy);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(upgraded));
          return upgraded;
        }
      }
    } catch (e) {
      console.warn('Could not load saved exams from storage', e);
    }
    return normalizeExamQuestions(MOCK_EXAMS);
  });

  const [selectedExam, setSelectedExam] = useState<Exam>(() => {
    try {
      const savedV3 = localStorage.getItem(STORAGE_KEY);
      if (savedV3) {
        const parsed = JSON.parse(savedV3);
        if (Array.isArray(parsed) && parsed.length > 0) return normalizeExamQuestions(parsed)[0];
      }
    } catch (e) {
      // fallback
    }
    return normalizeExamQuestions(MOCK_EXAMS)[0];
  });

  // Persist exams whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(exams));
      // Keep legacy key synced for safety
      localStorage.setItem('sman1_belitang_hilir_cbt_exams', JSON.stringify(exams));
    } catch (e) {
      console.warn('Could not save exams to storage', e);
    }
  }, [exams]);
  
  // Student State
  const [studentSessionStatus, setStudentSessionStatus] = useState<StudentExamStatus>('idle');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, StudentAnswer>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(MOCK_EXAMS[0].durationMinutes * 60);
  const [violations, setViolations] = useState<ViolationRecord[]>([]);
  
  // Hardware status
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(true);
  const [screenStreamActive, setScreenStreamActive] = useState<boolean>(true);
  
  // Proctor alerts
  const [activeAlert, setActiveAlert] = useState<ProctorAlertMessage | null>(null);
  const [students, setStudents] = useState<StudentProfile[]>(INITIAL_STUDENTS);
  const [selectedStudentForInspection, setSelectedStudentForInspection] = useState<StudentProfile | null>(null);
  const [inspectedStudentResult, setInspectedStudentResult] = useState<DetailedExamResult | null>(null);

  // Sync active student (std-001) into students roster
  useEffect(() => {
    setStudents((prev) => {
      return prev.map((s) => {
        if (s.id === 'std-001') {
          const answerList = Object.values(answers) as StudentAnswer[];
          const answeredCount = answerList.filter((a) => {
            if (Array.isArray(a.answer)) return a.answer.length > 0;
            return !!a.answer;
          }).length;
          const flaggedCount = answerList.filter((a) => a.isFlagged).length;

          return {
            ...s,
            status: studentSessionStatus,
            currentQuestionIndex,
            answeredCount,
            flaggedCount,
            violationCount: violations.length,
            violations,
            lastHeartbeat: studentSessionStatus === 'taking' ? 'Live Sekarang' : s.lastHeartbeat,
            screenStreamActive,
            cameraActive
          };
        }
        return s;
      });
    });
  }, [studentSessionStatus, currentQuestionIndex, answers, violations, screenStreamActive, cameraActive]);

  // Exam Countdown Timer
  useEffect(() => {
    if (studentSessionStatus !== 'taking') return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [studentSessionStatus]);

  // Periodic heartbeat simulation for peer students in Proctor View
  useEffect(() => {
    const peerSimInterval = setInterval(() => {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === 'std-001' || s.status === 'submitted' || s.status === 'disqualified') {
            return s;
          }
          // Random slight updates to make proctor monitor realistic
          const randomChance = Math.random();
          if (randomChance > 0.65 && s.answeredCount < selectedExam.questions.length) {
            const nextAnswered = Math.min(selectedExam.questions.length, s.answeredCount + 1);
            return {
              ...s,
              answeredCount: nextAnswered,
              currentQuestionIndex: Math.min(selectedExam.questions.length - 1, nextAnswered),
              lastHeartbeat: 'Baru saja'
            };
          }
          return s;
        })
      );
    }, 8000);

    return () => clearInterval(peerSimInterval);
  }, [selectedExam.questions.length]);

  const setAnswer = useCallback((questionId: number, answer: string | string[]) => {
    setAnswers((prev) => {
      const existing = prev[questionId] || {
        questionId,
        answer: '',
        isFlagged: false,
        timeSpentSeconds: 0
      };
      return {
        ...prev,
        [questionId]: {
          ...existing,
          answer,
          answeredAt: new Date().toLocaleTimeString('id-ID')
        }
      };
    });
  }, []);

  const toggleFlag = useCallback((questionId: number) => {
    setAnswers((prev) => {
      const existing = prev[questionId] || {
        questionId,
        answer: '',
        isFlagged: false,
        timeSpentSeconds: 0
      };
      return {
        ...prev,
        [questionId]: {
          ...existing,
          isFlagged: !existing.isFlagged
        }
      };
    });
  }, []);

  const registerViolation = useCallback((type: ViolationRecord['type'], description: string, severity: 'warning' | 'danger' | 'critical' = 'warning') => {
    const record = createViolationRecord(type, description, severity);
    AntiCheatSoundAlert.playWarningBeep(severity === 'critical' || severity === 'danger');

    setViolations((prev) => {
      const updated = [record, ...prev];
      // Check maximum violation limit
      if (updated.length >= selectedExam.rules.maxViolations) {
        setStudentSessionStatus('disqualified');
      }
      return updated;
    });
  }, [selectedExam.rules.maxViolations]);

  const startExam = useCallback((token: string) => {
    if (token.trim().toUpperCase() !== selectedExam.token) {
      return {
        success: false,
        message: `Token tidak valid! Masukkan token: "${selectedExam.token}"`
      };
    }
    setStudentSessionStatus('taking');
    setTimeRemaining(selectedExam.durationMinutes * 60);
    setViolations([]);
    setAnswers({});
    setCurrentQuestionIndex(0);
    return { success: true };
  }, [selectedExam]);

  const submitExam = useCallback(() => {
    setStudentSessionStatus('submitted');
    setActiveRole('report');
  }, []);

  const resetExamSession = useCallback(() => {
    setStudentSessionStatus('idle');
    setAnswers({});
    setViolations([]);
    setCurrentQuestionIndex(0);
    setTimeRemaining(selectedExam.durationMinutes * 60);
    setActiveAlert(null);
  }, [selectedExam]);

  const dismissAlert = useCallback(() => {
    setActiveAlert(null);
  }, []);

  const sendProctorAlert = useCallback((studentId: string, message: string, severity: 'info' | 'warning' | 'urgent' = 'warning') => {
    const alert: ProctorAlertMessage = {
      id: `alert-${Date.now()}`,
      studentId,
      senderName: 'Pengawas Ruang CBT (Pak Hendra, M.Pd.)',
      message,
      timestamp: new Date().toLocaleTimeString('id-ID'),
      severity,
      acknowledged: false
    };

    if (studentId === 'std-001' || studentId === 'all') {
      setActiveAlert(alert);
      AntiCheatSoundAlert.playWarningBeep(true);
    }

    // Add note in student's violation or alert log
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId || studentId === 'all') {
          return {
            ...s,
            violationCount: s.violationCount + 1,
            violations: [
              createViolationRecord('tab_switch', `[Pesan Pengawas]: ${message}`, severity === 'urgent' ? 'critical' : 'warning'),
              ...s.violations
            ]
          };
        }
        return s;
      })
    );
  }, []);

  const updateStudentStatusByProctor = useCallback((studentId: string, newStatus: StudentExamStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status: newStatus } : s))
    );
    if (studentId === 'std-001') {
      setStudentSessionStatus(newStatus);
    }
  }, []);

  // Compute live student result
  const studentResult = useMemo(() => {
    if (studentSessionStatus !== 'submitted' && studentSessionStatus !== 'disqualified') {
      // preview calculation
      return gradeExamSession(selectedExam, answers, violations.length, 'Ahmad Fauzi (Siswa Anda)', '0068412901');
    }
    const elapsedMinutes = Math.max(1, Math.round((selectedExam.durationMinutes * 60 - timeRemaining) / 60));
    return gradeExamSession(selectedExam, answers, violations.length, 'Ahmad Fauzi (Siswa Anda)', '0068412901', elapsedMinutes);
  }, [selectedExam, answers, violations.length, studentSessionStatus, timeRemaining]);

  const viewStudentReport = useCallback((studentId: string) => {
    const targetStudent = students.find((s) => s.id === studentId);
    if (!targetStudent) return;

    if (targetStudent.id === 'std-001') {
      setInspectedStudentResult(studentResult);
    } else {
      // Generate synthetic realistic report for peer student
      const syntheticAnswers: Record<number, StudentAnswer> = {};
      selectedExam.questions.forEach((q, idx) => {
        const isRight = targetStudent.score ? idx < Math.floor((targetStudent.score / 100) * selectedExam.questions.length) : Math.random() > 0.3;
        syntheticAnswers[q.id] = {
          questionId: q.id,
          answer: isRight ? q.correctAnswer : 'A',
          isFlagged: false,
          timeSpentSeconds: 45
        };
      });
      const rep = gradeExamSession(
        selectedExam,
        syntheticAnswers,
        targetStudent.violationCount,
        targetStudent.name,
        targetStudent.nisn,
        35
      );
      setInspectedStudentResult(rep);
    }
    setActiveRole('report');
  }, [students, studentResult, selectedExam]);

  const saveExam = useCallback((exam: Exam) => {
    setExams((prev) => {
      const idx = prev.findIndex((e) => e.id === exam.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = exam;
        return updated;
      }
      return [exam, ...prev];
    });

    if (selectedExam.id === exam.id) {
      setSelectedExam(exam);
    }
  }, [selectedExam.id]);

  const deleteExam = useCallback((examId: string) => {
    setExams((prev) => prev.filter((e) => e.id !== examId));
    if (selectedExam.id === examId && exams.length > 1) {
      const remaining = exams.find((e) => e.id !== examId) || exams[0];
      setSelectedExam(remaining);
    }
  }, [selectedExam.id, exams]);

  const loadExamIntoStudentPortal = useCallback((examId: string) => {
    const target = exams.find((e) => e.id === examId);
    if (target) {
      setSelectedExam(target);
      resetExamSession();
      setActiveRole('student');
    }
  }, [exams, resetExamSession]);

  return (
    <ExamContext.Provider
      value={{
        activeRole,
        setActiveRole,
        exams,
        saveExam,
        deleteExam,
        loadExamIntoStudentPortal,
        selectedExam,
        setSelectedExam,
        studentSessionStatus,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        answers,
        setAnswer,
        toggleFlag,
        timeRemaining,
        violations,
        registerViolation,
        startExam,
        submitExam,
        resetExamSession,
        isFullscreen,
        setIsFullscreen,
        cameraActive,
        setCameraActive,
        screenStreamActive,
        setScreenStreamActive,
        activeAlert,
        dismissAlert,
        students,
        selectedStudentForInspection,
        setSelectedStudentForInspection,
        sendProctorAlert,
        updateStudentStatusByProctor,
        studentResult,
        inspectedStudentResult,
        viewStudentReport
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = (): ExamContextType => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
};
