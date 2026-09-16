import { Exam } from '../types';

export const MOCK_EXAMS: Exam[] = [
  {
    id: 'exam-cbt-01',
    title: 'Penilaian Akhir Semester (PAS) - Sains & Informatika Terpadu',
    subject: 'Sains & Teknologi Komputer',
    grade: 'Kelas XII MIPA',
    token: 'EDUX2026',
    durationMinutes: 45,
    kkm: 75,
    totalPoints: 100,
    rules: {
      maxViolations: 3,
      allowReview: true,
      requireFullscreen: true,
      requireCamera: true,
      requireScreenShare: true,
      blockShortcuts: true,
    },
    questions: [
      {
        id: 1,
        type: 'multiple_choice',
        category: 'Informatika & Logika',
        points: 10,
        text: 'Manakah dari berikut ini yang merupakan protokol komunikasi data terenkripsi yang paling aman digunakan saat mentransmisikan data kredensial formulir di web?',
        options: [
          { id: 'A', text: 'HTTP (HyperText Transfer Protocol) pada port 80' },
          { id: 'B', text: 'FTP (File Transfer Protocol) dengan plain text authentication' },
          { id: 'C', text: 'HTTPS dengan implementasi TLS (Transport Layer Security)' },
          { id: 'D', text: 'Telnet protokol terminal interaktif standar' },
          { id: 'E', text: 'SNMP v1 tanpa enkripsi payload' }
        ],
        correctAnswer: 'C',
        explanation: 'HTTPS memanfaatkan protokol TLS/SSL untuk mengenkripsi seluruh payload data antara klien dan peladen, mencegah serangan Man-in-the-Middle (MitM) dan penyadapan kata sandi.'
      },
      {
        id: 2,
        type: 'complex_multiple',
        category: 'Biologi Seluler',
        points: 15,
        text: 'Pilihlah DUA pernyataan yang BENAR mengenai organel mitokondria dan kloroplas dalam proses metabolisme energi sel eukariotik!',
        options: [
          { id: 'A', text: 'Mitokondria dan kloroplas sama-sama memiliki DNA sirkular sendiri (semi-otonom).' },
          { id: 'B', text: 'Mitokondria hanya ditemukan pada sel tumbuhan dan tidak pada sel hewan.' },
          { id: 'C', text: 'Fosforilasi oksidatif pembentukan ATP utama terjadi pada membran krista mitokondria.' },
          { id: 'D', text: 'Kloroplas menghasilkan glukosa melalui respirasi anaerob tanpa memerlukan foton cahaya.' }
        ],
        correctAnswer: ['A', 'C'],
        explanation: 'Menurut teori endosimbiosis, mitokondria dan kloroplas memiliki materi genetik DNA sirkular dan ribosom sendiri (A). Krista mitokondria melipatgandakan luas permukaan untuk rantai transpor elektron dan sintesis ATP (C).'
      },
      {
        id: 3,
        type: 'multiple_choice',
        category: 'Fisika Terapan',
        points: 10,
        text: 'Sebuah mobil bergerak dengan kecepatan awal 20 m/s kemudian dipercepat beraturan sebesar 2 m/s² selama 5 detik. Berapakah jarak total yang ditempuh mobil selama percepatan tersebut?',
        options: [
          { id: 'A', text: '100 meter' },
          { id: 'B', text: '125 meter' },
          { id: 'C', text: '150 meter' },
          { id: 'D', text: '75 meter' },
          { id: 'E', text: '175 meter' }
        ],
        correctAnswer: 'B',
        explanation: 'Rumus GLBB: s = (v0 * t) + (0.5 * a * t²). s = (20 * 5) + (0.5 * 2 * 25) = 100 + 25 = 125 meter.'
      },
      {
        id: 4,
        type: 'multiple_choice',
        category: 'Keamanan Siber',
        points: 10,
        text: 'Teknik manipulasi psikologis di mana pelaku menyamar sebagai institusi terpercaya untuk memancing korban memasukkan kata sandi atau informasi kartu kredit disebut...',
        options: [
          { id: 'A', text: 'DDoS (Distributed Denial of Service)' },
          { id: 'B', text: 'Phishing' },
          { id: 'C', text: 'SQL Injection' },
          { id: 'D', text: 'Buffer Overflow' },
          { id: 'E', text: 'Ransomware Cryptography' }
        ],
        correctAnswer: 'B',
        explanation: 'Phishing adalah upaya rekayasa sosial (social engineering) penipuan digital melalui email atau situs web palsu untuk mencuri data sensitif pengguna.'
      },
      {
        id: 5,
        type: 'complex_multiple',
        category: 'Matematika & Algoritma',
        points: 15,
        text: 'Pilihlah pernyataan yang TEPAT mengenai kompleksitas algoritma pengurutan (Sorting) berikut!',
        options: [
          { id: 'A', text: 'Merge Sort memiliki kompleksitas waktu kasus terburuk O(n log n).' },
          { id: 'B', text: 'Bubble Sort selalu membutuhkan waktu O(1) untuk array yang belum terurut.' },
          { id: 'C', text: 'Quick Sort pada kasus rata-rata memiliki efisiensi O(n log n).' },
          { id: 'D', text: 'Binary Search dapat langsung dijalankan pada array acak tanpa harus terurut lebih dulu.' }
        ],
        correctAnswer: ['A', 'C'],
        explanation: 'Merge sort membagi data secara divide and conquer dengan kompleksitas konsisten O(n log n). Quick sort rata-rata O(n log n). Bubble sort terburuk adalah O(n²), dan Binary search mutlak mensyaratkan array telah terurut.'
      },
      {
        id: 6,
        type: 'multiple_choice',
        category: 'Kimia & Lingkungan',
        points: 10,
        text: 'Gas rumah kaca yang memiliki konsentrasi emisi antropogenik tertinggi di atmosfer bumi akibat pembakaran bahan bakar fosil adalah...',
        options: [
          { id: 'A', text: 'Metana (CH₄)' },
          { id: 'B', text: 'Karbon Dioksida (CO₂)' },
          { id: 'C', text: 'Nitrogen Oksida (N₂O)' },
          { id: 'D', text: 'Klorofluorokarbon (CFC)' },
          { id: 'E', text: 'Sulfur Heksafluorida (SF₆)' }
        ],
        correctAnswer: 'B',
        explanation: 'Karbon dioksida (CO₂) merupakan gas rumah kaca dengan kontribusi volume terbesar dari aktivitas industri, transportasi, dan pembangkit energi fosil.'
      },
      {
        id: 7,
        type: 'essay_short',
        category: 'Jaringan Komputer',
        points: 20,
        text: 'Jelaskan perbedaan mendasar antara protokol TCP (Transmission Control Protocol) dan UDP (User Datagram Protocol), serta sebutkan masing-masing 1 contoh penggunaannya di dunia nyata!',
        keywords: ['connection-oriented', 'connectionless', 'reliable', 'kecepatan', 'paket', 'streaming', 'dns', 'handshake', 'loss'],
        correctAnswer: 'TCP berorientasi koneksi (connection-oriented, handshake, reliable) menjamin urutan data tanpa kehilangan paket cocok untuk web (HTTP) dan email. Sedangkan UDP bersifat connectionless tanpa jaminan pengiriman paket namun berkecepatan tinggi cocok untuk live video streaming dan game online.',
        explanation: 'Poin utama penilaian otomatis: TCP connection-oriented, handshaking 3-way, jaminan transmisi bebas error (reliable). UDP connectionless, minim overhead, sangat cepat untuk audio/video real-time & gaming.'
      },
      {
        id: 8,
        type: 'multiple_choice',
        category: 'Literasi Digital & Etika',
        points: 10,
        text: 'Undang-Undang Republik Indonesia yang mengatur tentang informasi elektronik serta transaksi elektronik dan perlindungan hak digital adalah...',
        options: [
          { id: 'A', text: 'UU No. 11 Tahun 2008 jo UU No. 19 Tahun 2016 (UU ITE)' },
          { id: 'B', text: 'UU No. 14 Tahun 2005 tentang Guru dan Dosen' },
          { id: 'C', text: 'UU No. 20 Tahun 2003 tentang Sisdiknas' },
          { id: 'D', text: 'UU No. 32 Tahun 2009 tentang PPLH' },
          { id: 'E', text: 'UU No. 36 Tahun 1999 tentang Telekomunikasi' }
        ],
        correctAnswer: 'A',
        explanation: 'UU ITE (Undang-Undang Informasi dan Transaksi Elektronik) adalah regulasi utama di Indonesia terkait kejahatan siber, transaksi elektronik, dan hak cipta digital.'
      }
    ]
  },
  {
    id: 'exam-cbt-02',
    title: 'Simulasi Try Out UTBK SNBT - Penalaran Matematika & Literasi',
    subject: 'Tes Potensi Skolastik (TPS)',
    grade: 'Persiapan Masuk PTN 2026',
    token: 'SNBT2026',
    durationMinutes: 30,
    kkm: 70,
    totalPoints: 100,
    rules: {
      maxViolations: 2,
      allowReview: true,
      requireFullscreen: true,
      requireCamera: true,
      requireScreenShare: true,
      blockShortcuts: true,
    },
    questions: [
      {
        id: 1,
        type: 'multiple_choice',
        category: 'Penalaran Matematika',
        points: 25,
        text: 'Jika f(x) = 2x - 3 dan g(x) = x² + 1, maka nilai dari (g o f)(2) adalah...',
        options: [
          { id: 'A', text: '1' },
          { id: 'B', text: '2' },
          { id: 'C', text: '5' },
          { id: 'D', text: '10' },
          { id: 'E', text: '17' }
        ],
        correctAnswer: 'B',
        explanation: 'f(2) = 2(2) - 3 = 1. Lalu g(f(2)) = g(1) = 1² + 1 = 2.'
      },
      {
        id: 2,
        type: 'multiple_choice',
        category: 'Literasi Bahasa Indonesia',
        points: 25,
        text: 'Penulisan kata baku menurut Kamus Besar Bahasa Indonesia (KBBI) yang benar adalah...',
        options: [
          { id: 'A', text: 'Apotik, Praktek, Kwalitas' },
          { id: 'B', text: 'Apotek, Praktik, Kualitas' },
          { id: 'C', text: 'Apotek, Praktek, Kwalitas' },
          { id: 'D', text: 'Apotik, Praktik, Kualitas' },
          { id: 'E', text: 'Apotik, Praktek, Kwalitet' }
        ],
        correctAnswer: 'B',
        explanation: 'Bentuk baku menurut KBBI adalah Apotek (bukan apotik), Praktik (bukan praktek), dan Kualitas (bukan kwalitas).'
      },
      {
        id: 3,
        type: 'essay_short',
        category: 'Penalaran Kritis',
        points: 50,
        text: 'Sebutkan 3 ciri utama teks argumentasi yang logis dan objektif!',
        keywords: ['data', 'fakta', 'logis', 'argumen', 'bukti', 'objektif', 'kesimpulan'],
        correctAnswer: 'Teks argumentasi memiliki ciri: berlandaskan data dan fakta empiris, penalaran yang logis tanpa emosi subjektif, dan diakhiri dengan kesimpulan yang menegaskan tesis.',
        explanation: 'Kriteria: Adanya fakta valid, susunan silogisme/logika sehat, bahasa lugas dan tidak bias emosional.'
      }
    ]
  }
];
