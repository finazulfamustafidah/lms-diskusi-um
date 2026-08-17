import { DiscussionSession, DiscussionPost, UserProfile } from "../types";

export const currentUserStudent: UserProfile = {
  id: "std-fina",
  name: "Fina Zulfa",
  email: "fina.zulfa.2321038@students.um.ac.id",
  nim: "232103817978",
  role: "mahasiswa",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  institution: "Universitas Negeri Malang",
};

export const currentUserTutor: UserProfile = {
  id: "tut-fina",
  name: "Fina Zulfa Mustafidah",
  email: "fina.zulfa@um.ac.id",
  nim: "nim 232103817978",
  role: "tutor",
  avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  institution: "Departemen Teknologi Pendidikan - UM",
};

export const initialSessions: DiscussionSession[] = [
  {
    id: "sesi-1",
    courseCode: "TEP-402",
    courseName: "Belajar Pembelajaran",
    title: "Sesi Diskusi 1 - Kognitivisme",
    topic: "Teori Pemrosesan Informasi, Jean Piaget, dan Jerome Bruner",
    description:
      "Menganalisis bagaimana skema kognitif manusia memproses, menyimpan, dan mengambil kembali informasi dalam konteks pembelajaran di era digital.",
    targetBloomLevel: "C2 - C4 (Memahami s.d. Menganalisis)",
    startDate: "16 Agustus 2026",
    isActive: true,
    learningOutcomes: [
      "Mampu mengidentifikasi karakteristik utama teori kognitivisme",
      "Membedakan skema asimilasi dan akomodasi Piaget",
      "Menerapkan prinsip scaffolding Bruner pada perencanaan pembelajaran",
    ],
  },
  {
    id: "sesi-2",
    courseCode: "TEP-402",
    courseName: "Belajar Pembelajaran",
    title: "Sesi Diskusi 2 - Konstruktivisme Sosial & Vygotsky",
    topic: "Zone of Proximal Development (ZPD) dan Peer Scaffolding",
    description:
      "Mendiskusikan peran interaksi sosial dan media kolaboratif dalam membangun pemahaman bersama.",
    targetBloomLevel: "C3 - C5 (Menerapkan s.d. Mengevaluasi)",
    startDate: "23 Agustus 2026",
    isActive: true,
    learningOutcomes: [
      "Menguraikan konsep ZPD dalam lingkungan digital",
      "Menyusun strategi diskusi kelompok efektif berbasis konstruktivisme",
    ],
  },
  {
    id: "sesi-3",
    courseCode: "TEP-402",
    courseName: "Belajar Pembelajaran",
    title: "Sesi Diskusi 3 - Pendekatan Humanistik & Self-Regulated Learning",
    topic: "Hierarki Kebutuhan Maslow dan Motivasi Intrinsik",
    description:
      "Mengeksplorasi kondisi psikologis pembelajar dan kemandirian belajar di era kecerdasan artifisial.",
    targetBloomLevel: "C4 - C6 (Menganalisis s.d. Menciptakan)",
    startDate: "30 Agustus 2026",
    isActive: false,
    learningOutcomes: [
      "Menganalisis faktor penghambat motivasi intrinsik",
      "Merancang iklim kelas yang humanis dan suportif",
    ],
  },
];

export const initialPosts: DiscussionPost[] = [];

