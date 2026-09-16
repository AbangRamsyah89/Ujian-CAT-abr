import { Exam, Question, StudentAnswer, StudentProfile } from '../types';

export interface QuestionGradingResult {
  question: Question;
  studentAnswer: string | string[];
  isCorrect: boolean;
  isPartiallyCorrect?: boolean;
  pointsEarned: number;
  maxPoints: number;
  explanation: string;
  feedback?: string;
  timeSpentSeconds: number;
}

export interface DetailedExamResult {
  examId: string;
  examTitle: string;
  studentName: string;
  nisn: string;
  totalScore: number;
  maxScore: number;
  gradePercentage: number;
  isPassed: boolean;
  kkm: number;
  integrityScore: number; // 0 - 100%
  totalViolations: number;
  durationSpentMinutes: number;
  questionResults: QuestionGradingResult[];
  categoryBreakdown: Record<string, { earned: number; total: number; percentage: number }>;
}

export function gradeExamSession(
  exam: Exam,
  answers: Record<number, StudentAnswer>,
  violationsCount: number,
  studentName: string = 'Ahmad Fauzi',
  nisn: string = '0068412901',
  elapsedMinutes: number = 32
): DetailedExamResult {
  const questionResults: QuestionGradingResult[] = [];
  let totalScore = 0;
  let maxScore = 0;
  const categoryStats: Record<string, { earned: number; total: number }> = {};

  for (const q of exam.questions) {
    maxScore += q.points;
    if (!categoryStats[q.category]) {
      categoryStats[q.category] = { earned: 0, total: 0 };
    }
    categoryStats[q.category].total += q.points;

    const studentAns = answers[q.id]?.answer;
    const timeSpent = answers[q.id]?.timeSpentSeconds || 30;
    let isCorrect = false;
    let isPartiallyCorrect = false;
    let earned = 0;
    let feedback = '';

    if (!studentAns || (Array.isArray(studentAns) && studentAns.length === 0)) {
      isCorrect = false;
      earned = 0;
      feedback = 'Tidak dijawab';
    } else if (q.type === 'multiple_choice') {
      if (typeof studentAns === 'string' && studentAns === q.correctAnswer) {
        isCorrect = true;
        earned = q.points;
        feedback = 'Jawaban Tepat (100%)';
      } else {
        feedback = `Jawaban kurang tepat. Pilihan Anda: ${studentAns}`;
      }
    } else if (q.type === 'complex_multiple') {
      const correctArr = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
      const studentArr = Array.isArray(studentAns) ? studentAns : [studentAns];

      const matches = studentArr.filter((ans) => correctArr.includes(ans)).length;
      const incorrectMatches = studentArr.filter((ans) => !correctArr.includes(ans)).length;

      if (matches === correctArr.length && incorrectMatches === 0) {
        isCorrect = true;
        earned = q.points;
        feedback = 'Semua opsi yang dipilih benar sempurna';
      } else if (matches > 0 && incorrectMatches === 0) {
        isPartiallyCorrect = true;
        earned = Math.round((matches / correctArr.length) * q.points);
        feedback = `Sebagian benar (${matches} dari ${correctArr.length} opsi)`;
      } else if (matches > 0 && incorrectMatches > 0) {
        isPartiallyCorrect = true;
        earned = Math.max(0, Math.round(((matches - 0.5 * incorrectMatches) / correctArr.length) * q.points));
        feedback = `Sebagian benar dengan pilihan yang keliru`;
      } else {
        feedback = 'Pilihan tidak sesuai kunci jawaban';
      }
    } else if (q.type === 'essay_short') {
      const textAns = typeof studentAns === 'string' ? studentAns.toLowerCase() : '';
      const keywords = q.keywords || [];
      if (keywords.length > 0 && textAns.length > 5) {
        const matchedKeywords = keywords.filter((kw) => textAns.includes(kw.toLowerCase()));
        const ratio = matchedKeywords.length / Math.min(keywords.length, 4);
        
        if (ratio >= 0.75) {
          isCorrect = true;
          earned = q.points;
          feedback = `Jawaban komprehensif memuat kata kunci esensial (${matchedKeywords.length} kata kunci terdeteksi).`;
        } else if (ratio >= 0.4) {
          isPartiallyCorrect = true;
          earned = Math.round(q.points * 0.7);
          feedback = `Penjelasan cukup baik, memuat kata kunci: ${matchedKeywords.join(', ')}.`;
        } else if (matchedKeywords.length > 0) {
          isPartiallyCorrect = true;
          earned = Math.round(q.points * 0.4);
          feedback = `Penjelasan singkat hanya memuat sebagian kata kunci (${matchedKeywords.join(', ')}).`;
        } else {
          isCorrect = false;
          earned = Math.round(q.points * 0.1);
          feedback = 'Jawaban telah diisi namun belum memenuhi kata kunci rubrik penilaian.';
        }
      } else {
        feedback = 'Uraian jawaban terlalu singkat atau kosong';
      }
    }

    totalScore += earned;
    categoryStats[q.category].earned += earned;

    questionResults.push({
      question: q,
      studentAnswer: studentAns || '-',
      isCorrect,
      isPartiallyCorrect,
      pointsEarned: earned,
      maxPoints: q.points,
      explanation: q.explanation,
      feedback,
      timeSpentSeconds: timeSpent
    });
  }

  const gradePercentage = Math.round((totalScore / (maxScore || 1)) * 100);
  const isPassed = gradePercentage >= exam.kkm;

  // Calculate integrity score (100 - (violations * 15))
  const integrityScore = Math.max(0, 100 - violationsCount * 15);

  const categoryBreakdown: Record<string, { earned: number; total: number; percentage: number }> = {};
  for (const cat of Object.keys(categoryStats)) {
    const item = categoryStats[cat];
    categoryBreakdown[cat] = {
      earned: item.earned,
      total: item.total,
      percentage: Math.round((item.earned / (item.total || 1)) * 100)
    };
  }

  return {
    examId: exam.id,
    examTitle: exam.title,
    studentName,
    nisn,
    totalScore,
    maxScore,
    gradePercentage,
    isPassed,
    kkm: exam.kkm,
    integrityScore,
    totalViolations: violationsCount,
    durationSpentMinutes: elapsedMinutes,
    questionResults,
    categoryBreakdown
  };
}

export function exportResultsToCSV(students: StudentProfile[], examTitle: string): string {
  const headers = ['No', 'NISN', 'Nama Siswa', 'Kelas', 'Status', 'Skor Akhir', 'Persentase (%)', 'Status Kelulusan', 'Jumlah Pelanggaran', 'Perangkat'];
  const rows = students.map((s, idx) => [
    idx + 1,
    `'${s.nisn}`,
    `"${s.name.replace(/"/g, '""')}"`,
    s.classRoom,
    s.status === 'submitted' ? 'Selesai' : s.status === 'disqualified' ? 'Diskualifikasi' : 'Sedang Ujian',
    s.score ?? '-',
    s.gradePercentage !== undefined ? `${s.gradePercentage}%` : '-',
    s.gradePercentage !== undefined ? (s.gradePercentage >= 75 ? 'LULUS (TUNTAS)' : 'REMIDIAL') : '-',
    s.violationCount,
    `"${s.deviceInfo}"`
  ]);

  const csvContent = [
    `Rekap Hasil Ujian: ${examTitle}`,
    `Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`,
    '',
    headers.join(','),
    ...rows.map((r) => r.join(','))
  ].join('\n');

  return csvContent;
}
