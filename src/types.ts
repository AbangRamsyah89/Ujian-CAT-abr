export type QuestionType = 'multiple_choice' | 'complex_multiple' | 'essay_short';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  type: QuestionType;
  category: string;
  points: number;
  text: string;
  image?: string;
  codeSnippet?: string;
  options?: QuestionOption[];
  // For multiple_choice: single option id (e.g. 'B')
  // For complex_multiple: array of option ids (e.g. ['A', 'C'])
  correctAnswer: string | string[];
  // For essay_short: keywords for auto-grading
  keywords?: string[];
  explanation: string;
}

export interface Teacher {
  id: string;
  name: string;
  nip?: string;
  subject?: string;
  email?: string;
  phone?: string;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  grade: string;
  schoolName?: string;
  teacherName: string;
  teacherNip?: string;
  token: string;
  durationMinutes: number;
  kkm: number; // Kriteria Ketuntasan Minimal (e.g., 75)
  totalPoints: number;
  questions: Question[];
  rules: {
    maxViolations: number;
    allowReview: boolean;
    requireFullscreen: boolean;
    requireCamera: boolean;
    requireScreenShare: boolean;
    blockShortcuts: boolean;
  };
}

export type ViolationType = 
  | 'tab_switch' 
  | 'fullscreen_exit' 
  | 'devtools_open' 
  | 'copy_paste_attempt' 
  | 'forbidden_key' 
  | 'screen_blur'
  | 'suspicious_face';

export interface ViolationRecord {
  id: string;
  timestamp: string;
  type: ViolationType;
  description: string;
  severity: 'warning' | 'danger' | 'critical';
  snapshotUrl?: string;
}

export interface StudentAnswer {
  questionId: number;
  answer: string | string[];
  isFlagged: boolean; // ragu-ragu
  timeSpentSeconds: number;
  answeredAt?: string;
}

export type StudentExamStatus = 'idle' | 'taking' | 'paused' | 'submitted' | 'disqualified';

export interface StudentProfile {
  id: string;
  nisn: string;
  name: string;
  classRoom: string;
  avatarUrl: string;
  status: StudentExamStatus;
  currentQuestionIndex: number;
  answeredCount: number;
  flaggedCount: number;
  violationCount: number;
  violations: ViolationRecord[];
  score?: number;
  gradePercentage?: number;
  submittedAt?: string;
  lastHeartbeat: string;
  screenStreamActive: boolean;
  cameraActive: boolean;
  deviceInfo: string;
  ipAddress: string;
}

export interface ProctorAlertMessage {
  id: string;
  studentId: string;
  senderName: string;
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'urgent';
  acknowledged: boolean;
}

export interface ExamSessionState {
  exam: Exam;
  currentQuestionIndex: number;
  answers: Record<number, StudentAnswer>;
  timeRemainingSeconds: number;
  status: StudentExamStatus;
  isFullscreen: boolean;
  isCameraActive: boolean;
  isScreenShareActive: boolean;
  violations: ViolationRecord[];
  activeAlert?: ProctorAlertMessage;
  startedAt: string;
  submittedAt?: string;
  finalScore?: number;
}
