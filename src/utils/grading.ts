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

export function exportResultsToExcel(
  students: StudentProfile[],
  examTitle: string,
  schoolName: string = 'SMAN 1 Belitang Hilir',
  teacherName: string = 'Abang Ramsyah, S.Pd.'
): string {
  const dateStr = new Date().toLocaleDateString('id-ID', { dateStyle: 'full' });

  // Generate Excel XML SpreadsheetML format
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="TitleHeader">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="14" ss:Bold="1" ss:Color="#1e1b4b"/>
  </Style>
  <Style ss:ID="SubHeader">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#475569"/>
  </Style>
  <Style ss:ID="MetaLabel">
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#334155"/>
  </Style>
  <Style ss:ID="MetaValue">
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0f172a"/>
  </Style>
  <Style ss:ID="ColHeader">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#ffffff"/>
   <Interior ss:Color="#312e81" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="DataCell">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
   </Borders>
  </Style>
  <Style ss:ID="DataCellCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
   </Borders>
  </Style>
  <Style ss:ID="PassedCell">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#065f46"/>
   <Interior ss:Color="#d1fae5" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="FailedCell">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#991b1b"/>
   <Interior ss:Color="#fee2e2" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Rekap Nilai Siswa">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="30"/>
   <Column ss:Width="100"/>
   <Column ss:Width="180"/>
   <Column ss:Width="80"/>
   <Column ss:Width="80"/>
   <Column ss:Width="70"/>
   <Column ss:Width="90"/>
   <Column ss:Width="120"/>
   <Column ss:Width="80"/>
   <Column ss:Width="140"/>
   
   <Row ss:Height="25">
    <Cell ss:MergeAcross="9" ss:StyleID="TitleHeader"><Data ss:Type="String">REKAPITULASI HASIL PENILAIAN SUMATIF CBT</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:MergeAcross="9" ss:StyleID="SubHeader"><Data ss:Type="String">${schoolName.toUpperCase()} • TAHUN AJARAN 2025/2026</Data></Cell>
   </Row>
   <Row><Cell/></Row>
   <Row>
    <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Naskah Ujian</Data></Cell>
    <Cell ss:MergeAcross="3" ss:StyleID="MetaValue"><Data ss:Type="String">: ${examTitle}</Data></Cell>
    <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Tanggal Ekspor</Data></Cell>
    <Cell ss:MergeAcross="3" ss:StyleID="MetaValue"><Data ss:Type="String">: ${dateStr}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Guru Pengampu</Data></Cell>
    <Cell ss:MergeAcross="3" ss:StyleID="MetaValue"><Data ss:Type="String">: ${teacherName}</Data></Cell>
    <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Total Peserta</Data></Cell>
    <Cell ss:MergeAcross="3" ss:StyleID="MetaValue"><Data ss:Type="String">: ${students.length} Siswa</Data></Cell>
   </Row>
   <Row><Cell/></Row>

   <!-- Column Headers -->
   <Row ss:Height="24">
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">No</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">NISN</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Nama Lengkap Siswa</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Kelas</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Status</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Nilai</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Persentase</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Hasil KKM</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Pelanggaran</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Perangkat Akses</Data></Cell>
   </Row>`;

  students.forEach((s, idx) => {
    const isPassed = s.gradePercentage !== undefined ? s.gradePercentage >= 75 : false;
    const statusText = s.status === 'submitted' ? 'Selesai' : s.status === 'disqualified' ? 'Diskualifikasi' : 'Sedang Ujian';
    const passText = s.gradePercentage !== undefined ? (isPassed ? 'TUNTAS' : 'REMEDIAL') : '-';
    const statusStyle = isPassed ? 'PassedCell' : (s.gradePercentage !== undefined ? 'FailedCell' : 'DataCellCenter');

    xml += `
   <Row ss:Height="18">
    <Cell ss:StyleID="DataCellCenter"><Data ss:Type="Number">${idx + 1}</Data></Cell>
    <Cell ss:StyleID="DataCellCenter"><Data ss:Type="String">${s.nisn}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${s.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Data></Cell>
    <Cell ss:StyleID="DataCellCenter"><Data ss:Type="String">${s.classRoom}</Data></Cell>
    <Cell ss:StyleID="DataCellCenter"><Data ss:Type="String">${statusText}</Data></Cell>
    <Cell ss:StyleID="DataCellCenter"><Data ss:Type="${s.score !== undefined ? 'Number' : 'String'}">${s.score !== undefined ? s.score : '-'}</Data></Cell>
    <Cell ss:StyleID="DataCellCenter"><Data ss:Type="String">${s.gradePercentage !== undefined ? `${s.gradePercentage}%` : '-'}</Data></Cell>
    <Cell ss:StyleID="${statusStyle}"><Data ss:Type="String">${passText}</Data></Cell>
    <Cell ss:StyleID="DataCellCenter"><Data ss:Type="Number">${s.violationCount}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${(s.deviceInfo || 'Browser').replace(/&/g, '&amp;')}</Data></Cell>
   </Row>`;
  });

  xml += `
  </Table>
 </Worksheet>
</Workbook>`;

  return xml;
}

export function exportResultsToCSV(
  students: StudentProfile[],
  examTitle: string,
  schoolName: string = 'SMAN 1 Belitang Hilir'
): string {
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
    `\uFEFF`, // UTF-8 BOM for Microsoft Excel
    `Rekap Hasil Ujian: ${examTitle}`,
    `Sekolah: ${schoolName}`,
    `Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`,
    '',
    headers.join(';'),
    ...rows.map((r) => r.join(';'))
  ].join('\n');

  return csvContent;
}
