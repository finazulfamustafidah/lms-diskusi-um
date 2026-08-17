export type UserRole = "mahasiswa" | "tutor";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  nim?: string;
  role: UserRole;
  avatar?: string;
  institution?: string;
}

export interface DiscussionSession {
  id: string;
  courseCode: string;
  courseName: string;
  title: string;
  topic: string;
  description: string;
  targetBloomLevel: string;
  startDate: string;
  isActive: boolean;
  learningOutcomes: string[];
}

export type PostType =
  | "Ajukan Pertanyaan"
  | "Reply Mandiri (komentar bebas)"
  | "Reply Diskusi (balas postingan lain)"
  | "Refleksi Materi (sudah/belum paham)";

export type BloomLevelKey =
  | "Mengingat (C1)"
  | "Memahami (C2)"
  | "Menerapkan (C3)"
  | "Menganalisis (C4)"
  | "Mengevaluasi (C5)"
  | "Menciptakan (C6)";

export interface AiScaffolding {
  text: string;
  bloomLevel: string;
  bloomCode: string;
  bloomExplanation: string;
  generatedAt: string;
}

export interface TutorEvaluation {
  status: "Menunggu" | "Selesai";
  score?: number;
  scoreNotes?: string;
  finalBloomLevel?: string;
  tutorReinforcement?: string; // Penguatan dari Tutor
  tutorName?: string;
  evaluatedAt?: string;
}

export interface DiscussionReply {
  id: string;
  postId: string;
  authorName: string;
  authorNim?: string;
  authorRole: UserRole;
  content: string;
  createdAt: string;
}

export interface DiscussionPost {
  id: string;
  sessionId: string;
  sessionTitle: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorNim: string;
  postType: PostType;
  content: string;
  parentPostId?: string;
  createdAt: string;
  aiScaffolding: AiScaffolding;
  tutorEvaluation: TutorEvaluation;
  replies: DiscussionReply[];
  isBookmarked?: boolean;
}
