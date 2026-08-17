import React, { useState } from "react";
import {
  MessageSquare,
  Bot,
  BrainCircuit,
  Award,
  CheckCircle2,
  Clock,
  CornerDownRight,
  Send,
  User,
  ShieldCheck,
  Edit3,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { DiscussionPost, UserProfile } from "../types";
import { BloomBadge } from "./BloomBadge";

interface DiscussionCardProps {
  post: DiscussionPost;
  currentUser: UserProfile;
  onAddReply: (postId: string, content: string) => void;
  onOpenTutorEvaluation?: (post: DiscussionPost) => void;
  onEditPost?: (post: DiscussionPost) => void;
  onDeletePost?: (postId: string) => void;
}

export const DiscussionCard: React.FC<DiscussionCardProps> = ({
  post,
  currentUser,
  onAddReply,
  onOpenTutorEvaluation,
  onEditPost,
  onDeletePost,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) {
      setReplyError("Tuliskan balasan Anda terlebih dahulu.");
      return;
    }
    setReplyError("");
    onAddReply(post.id, replyText.trim());
    setReplyText("");
    setShowReplyForm(false);
  };

  const isEvaluated = post.tutorEvaluation.status === "Selesai";
  const isAuthor = currentUser.nim === post.authorNim || currentUser.email === post.authorEmail;
  const isTutor = currentUser.role === "tutor";

  // Deletion logic:
  // - Tutor can delete ANY post
  // - Student can delete ONLY their own post AND ONLY if not evaluated yet
  const canDelete = isTutor || (isAuthor && !isEvaluated);

  const handleConfirmDelete = () => {
    if (onDeletePost) {
      onDeletePost(post.id);
    }
    setShowDeleteConfirm(false);
  };

  return (
    <article
      id={`post-card-${post.id}`}
      className="bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all overflow-hidden"
    >
      {/* Header Info */}
      <div className="p-5 pb-4 bg-white border-b-2 border-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              {post.authorName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-tight">
                  {post.authorName}
                </h3>
                {post.authorNim && (
                  <span className="text-xs text-slate-700 font-mono font-bold bg-slate-100 px-2 py-0.5 border border-slate-300">
                    NIM: {post.authorNim}
                  </span>
                )}
                {isAuthor && !isTutor && (
                  <span className="text-[10px] bg-blue-600 text-white font-black uppercase px-2 py-0.5 tracking-wider">
                    POSTINGAN ANDA
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-1 font-medium">
                <span className="font-bold text-slate-900">{post.sessionTitle}</span>
                <span>•</span>
                <span className="font-mono text-slate-500">{post.createdAt}</span>
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            {/* Post Type Badge */}
            <span className="px-2.5 py-1 text-xs font-black uppercase tracking-wider bg-blue-50 text-blue-900 border-2 border-blue-600">
              {post.postType}
            </span>

            {/* Bloom Badge from AI or Final */}
            <BloomBadge
              level={post.tutorEvaluation.finalBloomLevel || post.aiScaffolding.bloomLevel}
              size="sm"
            />

            {/* Tutor Status Badge */}
            {isEvaluated ? (
              <span className="px-2.5 py-1 text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-900 border-2 border-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>DIVALIDASI TUTOR</span>
                {post.tutorEvaluation.score !== undefined && (
                  <strong className="ml-1 bg-emerald-600 text-white px-1.5 py-0.2 font-mono">
                    {post.tutorEvaluation.score}
                  </strong>
                )}
              </span>
            ) : (
              <span className="px-2.5 py-1 text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-900 border-2 border-amber-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>MENUNGGU TUTOR</span>
              </span>
            )}
          </div>
        </div>

        {/* Post Text Content */}
        <div className="mt-4 text-slate-950 text-sm leading-relaxed font-medium bg-slate-50 p-4 border-2 border-slate-300">
          <p className="whitespace-pre-wrap">{post.content}</p>
        </div>
      </div>

      {/* AI Preliminary Scaffolding (Jawaban Sementara) */}
      <div className="p-5 bg-blue-50/60 border-b-2 border-slate-900 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-blue-950 text-xs font-black uppercase tracking-widest">
            <Bot className="w-4 h-4 text-blue-600" />
            <span>JAWABAN SEMENTARA (AI SCAFFOLDING)</span>
          </div>
          <span className="text-[11px] text-blue-900 font-bold uppercase tracking-wider bg-white px-2.5 py-0.5 border border-blue-300">
            PEDAGOGICAL SCAFFOLDING
          </span>
        </div>

        <p className="text-xs text-slate-800 leading-relaxed font-medium">
          {post.aiScaffolding.text}
        </p>

        {/* AI Bloom Analysis Subcard */}
        <div className="p-3.5 bg-white border-2 border-blue-300 space-y-1">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-black text-slate-950 uppercase tracking-wider">
              ANALISIS KOGNITIF AI:
            </span>
            <span className="text-xs font-bold text-blue-700 uppercase">
              {post.aiScaffolding.bloomLevel}
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-normal font-medium">
            {post.aiScaffolding.bloomExplanation}
          </p>
        </div>
      </div>

      {/* Tutor Official Feedback / Reinforcement Section */}
      {isEvaluated && (
        <div className="p-5 bg-emerald-50/50 border-b-2 border-slate-900 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-emerald-950 text-xs font-black uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>PENGUATAN & VALIDASI TUTOR RESMI</span>
            </div>
            <div className="flex items-center gap-2">
              {post.tutorEvaluation.score !== undefined && (
                <span className="text-xs font-black bg-emerald-100 text-emerald-900 px-2.5 py-0.5 border-2 border-emerald-500 font-mono">
                  NILAI: {post.tutorEvaluation.score}/100
                </span>
              )}
              <span className="text-xs text-slate-600 font-medium">
                Oleh: <strong className="text-slate-900 font-bold">{post.tutorEvaluation.tutorName || "Tutor Pembina"}</strong>
              </span>
            </div>
          </div>

          {post.tutorEvaluation.tutorReinforcement && (
            <div className="p-4 bg-white border-2 border-emerald-300 text-xs text-slate-900 leading-relaxed font-medium">
              <p className="font-black text-slate-950 uppercase tracking-wider mb-1">CATATAN PENGUATAN TUTOR:</p>
              <p className="whitespace-pre-wrap">{post.tutorEvaluation.tutorReinforcement}</p>
              {post.tutorEvaluation.scoreNotes && (
                <p className="mt-2.5 pt-2 border-t border-slate-200 text-xs text-slate-600 italic">
                  Catatan Nilai: {post.tutorEvaluation.scoreNotes}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Warning Box */}
      {showDeleteConfirm && (
        <div className="p-4 bg-rose-50 border-b-2 border-rose-500 text-xs text-rose-950 space-y-2.5 animate-in fade-in">
          <div className="flex items-center gap-2 font-black uppercase tracking-wider text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Konfirmasi Hapus Postingan</span>
          </div>
          <p className="font-medium text-slate-800">
            {isTutor
              ? "Sebagai Dosen/Tutor, Anda memiliki wewenang untuk menghapus postingan ini secara permanen dari forum diskusi kelas."
              : "Apakah Anda yakin ingin menghapus postingan ini? Postingan belum dinilai oleh dosen dan dapat dihapus."}
          </p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Ya, Hapus Postingan</span>
            </button>
          </div>
        </div>
      )}

      {/* Action Footer & Replies */}
      <div className="p-4 bg-slate-100 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            <button
              onClick={() => {
                setShowReplyForm(!showReplyForm);
                setReplyError("");
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-slate-800 hover:text-blue-700 bg-white hover:bg-blue-50 border-2 border-slate-300 hover:border-blue-600 transition-all cursor-pointer shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>BALAS DISKUSI ({post.replies.length})</span>
            </button>

            {isTutor && onOpenTutorEvaluation && (
              <button
                onClick={() => onOpenTutorEvaluation(post)}
                className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 hover:bg-amber-600 hover:text-white border-2 border-slate-900 transition-all cursor-pointer shadow-xs"
              >
                <Award className="w-3.5 h-3.5" />
                <span>{isEvaluated ? "KOREKSI PENILAIAN" : "EVALUASI POSTINGAN"}</span>
              </button>
            )}

            {onEditPost && (isTutor || isAuthor) && (
              <button
                onClick={() => onEditPost(post)}
                className="flex items-center space-x-1 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-200 border-2 border-slate-300 transition-all cursor-pointer"
                title="Edit isi postingan"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>EDIT</span>
              </button>
            )}

            {/* Hapus Postingan Button */}
            {canDelete && onDeletePost && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center space-x-1 px-3 py-2 text-xs font-bold uppercase tracking-wider text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border-2 border-rose-300 hover:border-slate-900 transition-all cursor-pointer shadow-xs"
                title={isTutor ? "Hapus postingan mahasiswa (Mode Dosen)" : "Hapus postingan yang belum dinilai"}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>HAPUS</span>
              </button>
            )}

            {/* Indicator if student cannot delete because post is already evaluated */}
            {!isTutor && isAuthor && isEvaluated && (
              <span
                className="text-[11px] font-bold text-slate-500 px-2 py-1 bg-slate-200/80 border border-slate-300 rounded-xs"
                title="Postingan sudah dinilai dan divalidasi oleh dosen sehingga tidak dapat dihapus."
              >
                Terkunci (Sudah Dinilai)
              </span>
            )}
          </div>

          <span className="text-[11px] font-mono font-bold text-slate-500">
            ID: {post.id}
          </span>
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <form onSubmit={handleSendReply} className="mt-2 pt-3 border-t-2 border-slate-300">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1 space-y-2">
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={(e) => {
                    setReplyText(e.target.value);
                    if (replyError) setReplyError("");
                  }}
                  placeholder={`Tulis tanggapan atau balasan diskusi untuk ${post.authorName}...`}
                  className={`w-full p-3 text-xs sm:text-sm text-slate-900 bg-white border-2 ${
                    replyError ? "border-rose-600" : "border-slate-300"
                  } focus:border-blue-600 focus:outline-hidden font-medium`}
                />
                {replyError && (
                  <p className="text-xs text-rose-600 font-bold">{replyError}</p>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyError("");
                    }}
                    className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 bg-white border border-slate-300 cursor-pointer"
                  >
                    BATAL
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>KIRIM BALASAN</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Replies List */}
        {post.replies.length > 0 && (
          <div className="mt-2 pt-3 border-t-2 border-slate-300 space-y-2.5">
            <span className="text-xs font-black uppercase tracking-widest text-slate-700 block">
              TANGGAPAN REKAN MAHASISWA ({post.replies.length})
            </span>
            {post.replies.map((reply) => (
              <div
                key={reply.id}
                className="flex items-start space-x-3 p-3 bg-white border-2 border-slate-300 text-xs shadow-xs"
              >
                <CornerDownRight className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-950 flex items-center gap-1.5">
                      {reply.authorName}
                      {reply.authorRole === "tutor" && (
                        <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 border border-amber-400 font-bold uppercase tracking-wider">
                          TUTOR
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {reply.createdAt}
                    </span>
                  </div>
                  <p className="mt-1.5 text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                    {reply.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};
