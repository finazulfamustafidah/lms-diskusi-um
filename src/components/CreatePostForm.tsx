import React, { useState } from "react";
import {
  Send,
  Loader2,
  Info,
  Lock,
  AlertOctagon,
} from "lucide-react";
import { PostType, DiscussionSession, DiscussionPost, UserProfile } from "../types";

interface CreatePostFormProps {
  currentSession: DiscussionSession;
  allPostsInSession: DiscussionPost[];
  currentUser: UserProfile;
  onSubmitPost: (data: {
    postType: PostType;
    content: string;
    parentPostId?: string;
    authorName?: string;
    authorNim?: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export const CreatePostForm: React.FC<CreatePostFormProps> = ({
  currentSession,
  allPostsInSession,
  currentUser,
  onSubmitPost,
  isSubmitting,
}) => {
  const [postType, setPostType] = useState<PostType>("Refleksi Materi (sudah/belum paham)");
  const [content, setContent] = useState("");
  const [pahamContent, setPahamContent] = useState("");
  const [belumPahamContent, setBelumPahamContent] = useState("");
  const [parentPostId, setParentPostId] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");

  const isSessionClosed = !currentSession.isActive;

  const postTypesList: { type: PostType; label: string; desc: string }[] = [
    {
      type: "Refleksi Materi (sudah/belum paham)",
      label: "Refleksi Materi (sudah/belum paham)",
      desc: "Evaluasi metakognitif mengenai pemahaman materi yang sudah dan belum Anda kuasai",
    },
    {
      type: "Ajukan Pertanyaan",
      label: "Ajukan Pertanyaan",
      desc: "Tanyakan konsep materi yang memerlukan klarifikasi atau contoh konkret",
    },
    {
      type: "Reply Mandiri (komentar bebas)",
      label: "Reply Mandiri (komentar bebas)",
      desc: "Tuliskan opini, ulasan mandiri, atau elaborasi konsep pembelajaran",
    },
    {
      type: "Reply Diskusi (balas postingan lain)",
      label: "Reply Diskusi (balas postingan lain)",
      desc: "Tanggapi argumen atau pertanyaan rekan mahasiswa dalam forum",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSessionClosed) {
      setErrorMsg("Sesi diskusi ini telah ditutup oleh Dosen/Tutor.");
      return;
    }

    let finalContent = "";
    if (postType === "Refleksi Materi (sudah/belum paham)") {
      if (!pahamContent.trim() && !belumPahamContent.trim()) {
        setErrorMsg("Harap isi apa yang sudah kamu pahami atau apa yang belum kamu pahami.");
        return;
      }
      const parts: string[] = [];
      if (pahamContent.trim()) {
        parts.push(`Apa yang sudah dipahami:\n${pahamContent.trim()}`);
      }
      if (belumPahamContent.trim()) {
        parts.push(`Apa yang belum dipahami:\n${belumPahamContent.trim()}`);
      }
      finalContent = parts.join("\n\n");
    } else {
      if (!content.trim()) {
        setErrorMsg("Harap tuliskan isi postingan Anda terlebih dahulu.");
        return;
      }
      finalContent = content.trim();
    }

    if (postType === "Reply Diskusi (balas postingan lain)" && !parentPostId && allPostsInSession.length > 0) {
      setErrorMsg("Pilih postingan rekan yang ingin Anda balas pada menu pilihan.");
      return;
    }

    setErrorMsg("");
    try {
      await onSubmitPost({
        postType,
        content: finalContent,
        parentPostId: postType === "Reply Diskusi (balas postingan lain)" ? parentPostId : undefined,
        authorName: currentUser.name || "Mahasiswa",
        authorNim: currentUser.nim || "232103817978",
      });
      setContent("");
      setPahamContent("");
      setBelumPahamContent("");
      setParentPostId("");
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal mengirim postingan. Coba lagi.");
    }
  };

  if (isSessionClosed) {
    return (
      <div className="bg-white border-2 border-slate-900 rounded-xl p-6 shadow-sm overflow-hidden">
        <div className="flex items-center space-x-3 text-rose-600">
          <Lock className="w-5 h-5" />
          <h2 className="text-base font-bold text-slate-900">
            Sesi Diskusi Ditutup ({currentSession.title})
          </h2>
        </div>
        <p className="text-xs text-slate-600 mt-2">
          Status perkuliahan untuk sesi ini telah diarsipkan atau ditutup oleh Dosen/Tutor. Anda tetap dapat membaca riwayat diskusi di bawah ini.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-7">
      {/* Title */}
      <h2 className="text-lg font-bold text-slate-900 mb-5">Buat Postingan</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Jenis Postingan Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Jenis Postingan
          </label>
          <div className="relative">
            <select
              id="jenis-postingan-select"
              value={postType}
              onChange={(e) => {
                setPostType(e.target.value as PostType);
                setErrorMsg("");
              }}
              className="w-full px-3.5 py-2.5 text-sm font-medium text-slate-900 bg-white border-2 border-slate-900 rounded-lg focus:outline-hidden transition-all"
            >
              {postTypesList.map((pt) => (
                <option key={pt.type} value={pt.type}>
                  {pt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Jika Jenis Postingan: Refleksi Materi (sudah/belum paham) -> Tampilkan 2 Textarea sesuai Gambar 1 */}
        {postType === "Refleksi Materi (sudah/belum paham)" ? (
          <>
            {/* Field 1: Apa yang sudah kamu pahami? */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Apa yang sudah kamu pahami?
              </label>
              <textarea
                id="input-paham-content"
                rows={3}
                value={pahamContent}
                onChange={(e) => {
                  setPahamContent(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder="Tulis pemahamanmu..."
                className="w-full p-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Field 2: Apa yang belum kamu pahami? */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Apa yang belum kamu pahami?
              </label>
              <textarea
                id="input-belum-paham-content"
                rows={3}
                value={belumPahamContent}
                onChange={(e) => {
                  setBelumPahamContent(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder="Tulis bagian yang masih membingungkan..."
                className="w-full p-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden transition-all placeholder:text-slate-400"
              />
            </div>
          </>
        ) : (
          /* Jenis Postingan Lainnya (Pertanyaan, Reply Mandiri, Reply Diskusi) */
          <>
            {postType === "Reply Diskusi (balas postingan lain)" && (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Pilih Postingan yang Ingin Dibalas
                </label>
                <select
                  id="parent-post-select"
                  value={parentPostId}
                  onChange={(e) => {
                    setParentPostId(e.target.value);
                    setErrorMsg("");
                  }}
                  className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-md focus:border-indigo-600 focus:outline-hidden"
                >
                  <option value="">-- Pilih postingan rekan di sesi ini --</option>
                  {allPostsInSession.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.authorName} - NIM: {p.authorNim}] {p.content.substring(0, 65)}...
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {postType === "Ajukan Pertanyaan"
                  ? "Pertanyaan Anda"
                  : "Isi Komentar / Tanggapan"}
              </label>
              <textarea
                id="post-content-textarea"
                rows={4}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder={
                  postType === "Ajukan Pertanyaan"
                    ? "Tulis pertanyaanmu di sini..."
                    : "Tuliskan pemikiran atau tanggapanmu..."
                }
                className="w-full p-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden transition-all placeholder:text-slate-400"
              />
            </div>
          </>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-xs text-rose-800 flex items-center gap-2 font-medium">
            <Info className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            id="btn-kirim-post"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg shadow-sm transition-all cursor-pointer inline-flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mengirim...</span>
              </>
            ) : (
              <span>Kirim</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
