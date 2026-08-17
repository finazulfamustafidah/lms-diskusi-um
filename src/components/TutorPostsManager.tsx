import React, { useState } from "react";
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Award,
  Layers,
  Sparkles,
  ArrowUpDown,
  BookOpen,
  UserCheck,
  ChevronRight,
  TrendingUp,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { DiscussionPost, DiscussionSession, UserProfile } from "../types";
import { BloomBadge } from "./BloomBadge";

interface TutorPostsManagerProps {
  posts: DiscussionPost[];
  sessions: DiscussionSession[];
  selectedSessionId: string;
  onSelectSession: (id: string) => void;
  onOpenEvaluation: (post: DiscussionPost) => void;
  onDeletePost?: (postId: string) => void;
  currentUser: UserProfile;
}

export const TutorPostsManager: React.FC<TutorPostsManagerProps> = ({
  posts,
  sessions,
  selectedSessionId,
  onSelectSession,
  onOpenEvaluation,
  onDeletePost,
}) => {
  const [filterSession, setFilterSession] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  // Filtered posts
  const filteredPosts = posts.filter((post) => {
    const matchSession =
      filterSession === "all" || post.sessionId === filterSession;
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "pending" && post.tutorEvaluation.status === "Menunggu") ||
      (filterStatus === "completed" && post.tutorEvaluation.status === "Selesai");
    const matchSearch =
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorNim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());

    return matchSession && matchStatus && matchSearch;
  });

  // Calculate statistics
  const totalPosts = posts.length;
  const completedPosts = posts.filter((p) => p.tutorEvaluation.status === "Selesai");
  const pendingPosts = posts.filter((p) => p.tutorEvaluation.status === "Menunggu");
  const scoresArray = completedPosts
    .map((p) => p.tutorEvaluation.score)
    .filter((s): s is number => typeof s === "number");
  const avgScore =
    scoresArray.length > 0
      ? (scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length).toFixed(1)
      : "-";

  const handleConfirmDelete = (postId: string) => {
    if (onDeletePost) {
      onDeletePost(postId);
    }
    setDeletingPostId(null);
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal for Tutor */}
      {deletingPostId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600 font-black uppercase text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Hapus Postingan Mahasiswa (Wewenang Dosen)</span>
            </div>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              Apakah Anda yakin ingin menghapus postingan ini secara permanen dari basis data diskusi kelas? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeletingPostId(null)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleConfirmDelete(deletingPostId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Postingan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Postingan</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalPosts}</div>
          <p className="text-[11px] text-slate-500 mt-1">Dari semua sesi aktif</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Menunggu Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-700">{pendingPosts.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Memerlukan penguatan tutor</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Sudah Dinilai</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{completedPosts.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Tervalidasi & berbobot</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Rata-Rata Nilai</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-800">{avgScore}</div>
          <p className="text-[11px] text-slate-500 mt-1">Skala 0 s.d. 100</p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Sesi Filter */}
          <div className="relative min-w-[220px]">
            <select
              id="filter-session-dropdown"
              value={filterSession}
              onChange={(e) => setFilterSession(e.target.value)}
              className="w-full pl-3 pr-8 py-2 text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
            >
              <option value="all">-- Semua Sesi Diskusi --</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.courseName} — {s.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                filterStatus === "all"
                  ? "bg-white text-blue-700 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Semua ({posts.length})
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                filterStatus === "pending"
                  ? "bg-white text-amber-700 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Menunggu ({pendingPosts.length})
            </button>
            <button
              onClick={() => setFilterStatus("completed")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                filterStatus === "completed"
                  ? "bg-white text-emerald-700 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Dinilai ({completedPosts.length})
            </button>
          </div>
        </div>

        {/* Search & View Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Cari nama mahasiswa / NIM / kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode("table")}
              className={`px-2.5 py-1 text-xs font-semibold rounded cursor-pointer ${
                viewMode === "table" ? "bg-white text-blue-700 shadow-2xs font-bold" : "text-slate-600"
              }`}
            >
              Tabel
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`px-2.5 py-1 text-xs font-semibold rounded cursor-pointer ${
                viewMode === "cards" ? "bg-white text-blue-700 shadow-2xs font-bold" : "text-slate-600"
              }`}
            >
              Kartu
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Nama Mahasiswa</th>
                  <th className="px-4 py-3">NIM</th>
                  <th className="px-4 py-3">Jenis Postingan</th>
                  <th className="px-4 py-3">Nilai</th>
                  <th className="px-4 py-3">Level Bloom</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPosts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      Tidak ada postingan yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map((post) => {
                    const isDone = post.tutorEvaluation.status === "Selesai";
                    return (
                      <tr
                        key={post.id}
                        className="hover:bg-blue-50/40 transition-colors"
                      >
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900">
                            {post.authorName}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                            {post.authorEmail}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-600">
                          {post.authorNim}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-700">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px]">
                            {post.postType}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-bold">
                          {post.tutorEvaluation.score !== undefined ? (
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {post.tutorEvaluation.score}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <BloomBadge
                            level={
                              post.tutorEvaluation.finalBloomLevel ||
                              post.aiScaffolding.bloomLevel
                            }
                            size="sm"
                          />
                        </td>
                        <td className="px-4 py-3.5">
                          {isDone ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Selesai
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              <Clock className="w-3 h-3" />
                              Menunggu
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => onOpenEvaluation(post)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>{isDone ? "Koreksi" : "Evaluasi"}</span>
                            </button>
                            {onDeletePost && (
                              <button
                                onClick={() => setDeletingPostId(post.id)}
                                className="p-1.5 text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Postingan Mahasiswa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View (2-column layout) */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="p-5 bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b-2 border-slate-200">
                  <div>
                    <h3 className="font-black text-slate-950 uppercase tracking-tight text-sm">
                      {post.authorName}
                    </h3>
                    <p className="text-xs text-slate-700 font-mono font-bold mt-0.5">
                      NIM: <span className="bg-slate-100 px-1.5 py-0.5 border border-slate-300">{post.authorNim}</span> • {post.createdAt}
                    </p>
                  </div>
                  <BloomBadge
                    level={
                      post.tutorEvaluation.finalBloomLevel ||
                      post.aiScaffolding.bloomLevel
                    }
                    size="sm"
                  />
                </div>

                <p className="text-xs text-slate-900 leading-relaxed font-medium bg-slate-50 p-3 border-2 border-slate-300">
                  {post.content}
                </p>

                <div className="text-xs text-blue-950 bg-blue-50/80 p-2.5 border-2 border-blue-300 flex items-center justify-between font-bold">
                  <span>AI: {post.aiScaffolding.bloomLevel}</span>
                  {post.tutorEvaluation.score !== undefined && (
                    <span className="bg-emerald-600 text-white px-2 py-0.5 font-mono text-xs">
                      Nilai: {post.tutorEvaluation.score}/100
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t-2 border-slate-200 flex items-center justify-between gap-2">
                <span className="text-xs font-bold">
                  {post.tutorEvaluation.status === "Selesai" ? (
                    <span className="text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Sudah Divalidasi
                    </span>
                  ) : (
                    <span className="text-amber-800 flex items-center gap-1">
                      <Clock className="w-4 h-4 text-amber-600" /> Menunggu Penilaian
                    </span>
                  )}
                </span>

                <div className="flex items-center gap-2">
                  {onDeletePost && (
                    <button
                      onClick={() => setDeletingPostId(post.id)}
                      className="p-2 text-rose-600 hover:text-white hover:bg-rose-600 border-2 border-rose-300 hover:border-slate-900 transition-all cursor-pointer shadow-xs"
                      title="Hapus Postingan Mahasiswa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onOpenEvaluation(post)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                  >
                    {post.tutorEvaluation.status === "Selesai" ? "KOREKSI NILAI" : "EVALUASI & BERI NILAI"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
