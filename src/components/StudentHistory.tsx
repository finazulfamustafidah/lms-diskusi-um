import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Award,
  BookOpen,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Users,
  Search,
  Filter,
} from "lucide-react";
import { DiscussionPost, DiscussionSession, UserProfile } from "../types";
import { DiscussionCard } from "./DiscussionCard";

interface StudentHistoryProps {
  allPosts: DiscussionPost[];
  sessions: DiscussionSession[];
  currentUser: UserProfile;
  onAddReply: (postId: string, content: string) => void;
  onEditPost: (post: DiscussionPost) => void;
  onDeletePost?: (postId: string) => void;
  onOpenTutorEvaluation?: (post: DiscussionPost) => void;
  onGoToDiscussion: () => void;
}

export const StudentHistory: React.FC<StudentHistoryProps> = ({
  allPosts,
  sessions,
  currentUser,
  onAddReply,
  onEditPost,
  onDeletePost,
  onOpenTutorEvaluation,
  onGoToDiscussion,
}) => {
  const [filterSession, setFilterSession] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "pending">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filtered posts across all students
  const filteredPosts = allPosts.filter((post) => {
    const matchSession = filterSession === "all" || post.sessionId === filterSession;
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "completed" && post.tutorEvaluation.status === "Selesai") ||
      (filterStatus === "pending" && post.tutorEvaluation.status === "Menunggu");
    const matchSearch =
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorNim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSession && matchStatus && matchSearch;
  });

  const totalPostsCount = allPosts.length;
  const completed = allPosts.filter((p) => p.tutorEvaluation.status === "Selesai");
  const pending = allPosts.filter((p) => p.tutorEvaluation.status === "Menunggu");

  // Distinct students count
  const uniqueStudents = Array.from(new Set(allPosts.map((p) => p.authorNim || p.authorName)));

  const scores = completed
    .map((p) => p.tutorEvaluation.score)
    .filter((s): s is number => typeof s === "number");

  const avgScore =
    scores.length > 0
      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
      : "-";

  return (
    <div className="space-y-6">
      {/* Class & Student Overview Banner */}
      <div className="bg-white p-6 border-2 border-slate-900 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-slate-200">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-blue-600 text-white flex items-center justify-center font-black text-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black uppercase tracking-tight text-slate-950">
                  REKAPITULASI DISKUSI SEMUA MAHASISWA
                </h2>
                <span className="text-xs px-2.5 py-0.5 font-black uppercase bg-blue-100 text-blue-900 border-2 border-blue-600">
                  KELAS TEP-402
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Daftar lengkap seluruh kontribusi diskusi, asistensi scaffolding AI, serta nilai evaluasi resmi dari Dosen/Tutor.
              </p>
            </div>
          </div>

          <button
            onClick={onGoToDiscussion}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center gap-2 cursor-pointer self-start sm:self-auto transition-all"
          >
            <span>BUKA FORUM DISKUSI</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 text-center">
          <div className="p-4 bg-slate-50 border-2 border-slate-300">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
              TOTAL POSTINGAN MAHASISWA
            </span>
            <p className="text-2xl font-black text-slate-950 mt-1 font-mono">
              {totalPostsCount}
            </p>
          </div>

          <div className="p-4 bg-purple-50 border-2 border-purple-400">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-900">
              MAHASISWA BERPARTISIPASI
            </span>
            <p className="text-2xl font-black text-purple-900 mt-1 font-mono">
              {uniqueStudents.length} Mahasiswa
            </p>
          </div>

          <div className="p-4 bg-emerald-50 border-2 border-emerald-400">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900">
              DIVALIDASI DOSEN
            </span>
            <p className="text-2xl font-black text-emerald-800 mt-1 font-mono">
              {completed.length}
            </p>
          </div>

          <div className="p-4 bg-blue-50 border-2 border-blue-400">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-900">
              RATA-RATA NILAI KELAS
            </span>
            <p className="text-2xl font-black text-blue-950 mt-1 font-mono">{avgScore}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 border-2 border-slate-900 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Sesi Filter */}
          <div className="relative min-w-[220px]">
            <select
              value={filterSession}
              onChange={(e) => setFilterSession(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold bg-white border-2 border-slate-300 text-slate-900 focus:border-blue-600 focus:outline-hidden uppercase"
            >
              <option value="all">SEMUA SESI PERKULIAHAN</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.courseName} — {s.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-2 transition-all cursor-pointer ${
                filterStatus === "all"
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
              }`}
            >
              Semua ({allPosts.length})
            </button>
            <button
              onClick={() => setFilterStatus("completed")}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-2 transition-all cursor-pointer ${
                filterStatus === "completed"
                  ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                  : "bg-white text-emerald-800 border-emerald-300 hover:border-emerald-500"
              }`}
            >
              Dinilai ({completed.length})
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-2 transition-all cursor-pointer ${
                filterStatus === "pending"
                  ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                  : "bg-white text-amber-800 border-amber-300 hover:border-amber-500"
              }`}
            >
              Menunggu ({pending.length})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Cari nama mahasiswa / NIM / teks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs font-medium bg-white border-2 border-slate-300 focus:border-blue-600 focus:outline-hidden"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* History Posts List (2-column layout with ample spacing) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-950">
            DAFTAR POSTINGAN SEMUA MAHASISWA ({filteredPosts.length})
          </h3>
          <span className="text-xs font-bold text-slate-500 uppercase">
            URUT BERDASARKAN TERBARU
          </span>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="p-12 bg-white border-2 border-slate-900 text-center space-y-3">
            <p className="text-slate-600 font-bold text-xs uppercase">
              Tidak ada postingan yang sesuai kriteria pencarian.
            </p>
            <button
              onClick={() => {
                setFilterSession("all");
                setFilterStatus("all");
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-black uppercase border border-slate-900 cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {filteredPosts.map((post) => (
              <DiscussionCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                onAddReply={onAddReply}
                onEditPost={onEditPost}
                onDeletePost={onDeletePost}
                onOpenTutorEvaluation={onOpenTutorEvaluation}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

