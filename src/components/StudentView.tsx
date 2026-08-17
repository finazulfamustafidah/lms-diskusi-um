import React, { useState } from "react";
import {
  BookOpen,
  Filter,
  Search,
  Users,
  Sparkles,
  HelpCircle,
  MessageSquare,
  Lightbulb,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";
import { DiscussionSession, DiscussionPost, UserProfile, PostType } from "../types";
import { CreatePostForm } from "./CreatePostForm";
import { DiscussionCard } from "./DiscussionCard";

interface StudentViewProps {
  currentSession: DiscussionSession;
  allSessions: DiscussionSession[];
  postsInCurrentSession: DiscussionPost[];
  myPostsInCurrentSession: DiscussionPost[];
  currentUser: UserProfile;
  onSubmitPost: (data: {
    postType: PostType;
    content: string;
    parentPostId?: string;
    authorName?: string;
    authorNim?: string;
  }) => Promise<void>;
  isSubmitting: boolean;
  onAddReply: (postId: string, content: string) => void;
  onEditPost: (post: DiscussionPost) => void;
  onDeletePost?: (postId: string) => void;
  onOpenTutorEvaluation?: (post: DiscussionPost) => void;
}

export const StudentView: React.FC<StudentViewProps> = ({
  currentSession,
  postsInCurrentSession,
  myPostsInCurrentSession,
  currentUser,
  onSubmitPost,
  isSubmitting,
  onAddReply,
  onEditPost,
  onDeletePost,
  onOpenTutorEvaluation,
}) => {
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = postsInCurrentSession.filter((post) => {
    const matchType = filterType === "all" || post.postType === filterType;
    const matchSearch =
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Active Session Overview Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                {currentSession.courseCode} • {currentSession.courseName}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {currentSession.startDate}
              </span>
              {currentSession.isActive && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Sesi Aktif
                </span>
              )}
            </div>

            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              {currentSession.title}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {currentSession.description}
            </p>
          </div>

          <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col justify-center shrink-0 min-w-[210px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Target Taksonomi Bloom
            </span>
            <span className="text-xs font-bold text-blue-900 mt-0.5">
              {currentSession.targetBloomLevel}
            </span>
            <div className="mt-2 pt-2 border-t border-blue-100/80 flex items-center justify-between text-[11px] text-slate-600">
              <span>Postingan Sesi Ini:</span>
              <strong className="text-blue-700 font-bold">{postsInCurrentSession.length}</strong>
            </div>
          </div>
        </div>

        {/* Learning Outcomes Checklist */}
        {currentSession.learningOutcomes && currentSession.learningOutcomes.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Indikator Capaian Pembelajaran Sesi Ini:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              {currentSession.learningOutcomes.map((lo, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                  <span>{lo}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Discussion Post Form */}
      <CreatePostForm
        currentSession={currentSession}
        allPostsInSession={postsInCurrentSession}
        currentUser={currentUser}
        onSubmitPost={onSubmitPost}
        isSubmitting={isSubmitting}
      />

      {/* Discussion Feed Header & Filters */}
      <div className="space-y-4">
        <div className="bg-white p-5 border-2 border-slate-900 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>FORUM DISKUSI KELOMPOK (SESI INI)</span>
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-500">
                Akses Terbuka Umum
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Semua pertanyaan, reply mandiri, dan tanggapan dari seluruh mahasiswa dapat diakses di sini. Klik "Balas Diskusi" untuk merespons.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Post Type */}
            <div className="relative">
              <select
                id="filter-post-type-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 text-xs font-bold bg-white border-2 border-slate-300 text-slate-900 focus:border-blue-600 focus:outline-hidden uppercase"
              >
                <option value="all">SEMUA JENIS POSTINGAN</option>
                <option value="Ajukan Pertanyaan">PERTANYAAN</option>
                <option value="Reply Mandiri (komentar bebas)">REPLY MANDIRI</option>
                <option value="Reply Diskusi (balas postingan lain)">REPLY DISKUSI</option>
                <option value="Refleksi Materi (sudah/belum paham)">REFLEKSI MATERI</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <input
                type="text"
                placeholder="Cari nama, NIM, atau teks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs font-medium bg-white border-2 border-slate-300 focus:border-blue-600 focus:outline-hidden"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Discussion Posts Feed (2 Columns Grid Layout with ample spacing) */}
        {filteredPosts.length === 0 ? (
          <div className="p-12 bg-white border-2 border-slate-900 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Belum ada postingan diskusi pada filter ini.
            </p>
            <p className="text-xs text-slate-500 font-medium">
              Jadilah yang pertama mengajukan pertanyaan atau refleksi di atas!
            </p>
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

      {/* Riwayat Saya Section */}
      <div className="pt-6 space-y-4 border-t-2 border-slate-300">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>RIWAYAT SAYA (POSTINGAN SAYA DI SESI INI)</span>
          </h3>
          <span className="text-xs font-black uppercase tracking-wider text-blue-900 bg-blue-100 px-3 py-1 border-2 border-blue-600">
            {myPostsInCurrentSession.length} POSTINGAN SAYA
          </span>
        </div>

        {myPostsInCurrentSession.length === 0 ? (
          <div className="p-8 bg-white border-2 border-slate-300 text-center text-xs font-medium text-slate-600">
            Anda belum membuat postingan di sesi ini. Kirimkan pertanyaan atau refleksi Anda melalui formulir di atas.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {myPostsInCurrentSession.map((post) => (
              <DiscussionCard
                key={`my-${post.id}`}
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
