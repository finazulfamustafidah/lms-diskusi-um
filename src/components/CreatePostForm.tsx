import React, { useState } from "react";
import {
  Send,
  HelpCircle,
  MessageSquare,
  Repeat,
  Lightbulb,
  Sparkles,
  Loader2,
  Info,
  User,
  Hash,
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
  const [authorName, setAuthorName] = useState(currentUser.name || "Fina Zulfa");
  const [authorNim, setAuthorNim] = useState(currentUser.nim || "232103817978");
  const [postType, setPostType] = useState<PostType>("Ajukan Pertanyaan");
  const [content, setContent] = useState("");
  const [parentPostId, setParentPostId] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");

  // Keep synced with currentUser updates
  React.useEffect(() => {
    if (currentUser.name) setAuthorName(currentUser.name);
    if (currentUser.nim) setAuthorNim(currentUser.nim);
  }, [currentUser.name, currentUser.nim]);

  const isSessionClosed = !currentSession.isActive;

  const postTypesList: { type: PostType; label: string; icon: any; desc: string }[] = [
    {
      type: "Ajukan Pertanyaan",
      label: "Ajukan Pertanyaan",
      icon: HelpCircle,
      desc: "Tanyakan konsep materi yang memerlukan klarifikasi atau contoh konkret",
    },
    {
      type: "Reply Mandiri (komentar bebas)",
      label: "Reply Mandiri (komentar bebas)",
      icon: MessageSquare,
      desc: "Tuliskan opini, ulasan mandiri, atau elaborasi konsep pembelajaran",
    },
    {
      type: "Reply Diskusi (balas postingan lain)",
      label: "Reply Diskusi (balas postingan lain)",
      icon: Repeat,
      desc: "Tanggapi argumen atau pertanyaan rekan mahasiswa dalam forum",
    },
    {
      type: "Refleksi Materi (sudah/belum paham)",
      label: "Refleksi Materi (sudah/belum paham)",
      icon: Lightbulb,
      desc: "Evaluasi metakognitif mengenai hal yang sudah atau belum Anda pahami",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSessionClosed) {
      setErrorMsg("Sesi diskusi ini telah ditutup oleh Dosen/Tutor. Anda tidak dapat membuat postingan baru.");
      return;
    }
    if (!authorName.trim()) {
      setErrorMsg("Harap isi Nama Mahasiswa.");
      return;
    }
    if (!authorNim.trim()) {
      setErrorMsg("Harap isi NIM Mahasiswa.");
      return;
    }
    if (!content.trim()) {
      setErrorMsg("Harap tuliskan isi pertanyaan atau tanggapan Anda terlebih dahulu di kotak teks di atas.");
      const textarea = document.getElementById("post-content-textarea");
      if (textarea) textarea.focus();
      return;
    }
    if (postType === "Reply Diskusi (balas postingan lain)" && !parentPostId && allPostsInSession.length > 0) {
      setErrorMsg("Pilih postingan rekan yang ingin Anda balas pada menu pilihan.");
      return;
    }

    setErrorMsg("");
    try {
      await onSubmitPost({
        postType,
        content: content.trim(),
        parentPostId: postType === "Reply Diskusi (balas postingan lain)" ? parentPostId : undefined,
        authorName: authorName.trim(),
        authorNim: authorNim.trim(),
      });
      setContent("");
      setParentPostId("");
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal mengirim postingan. Coba lagi.");
    }
  };

  // Quick sample prompts to assist user testing
  const samplePrompts: { label: string; type: PostType; text: string }[] = [
    {
      label: "Contoh Pertanyaan Teori Kognitif",
      type: "Ajukan Pertanyaan",
      text: "Bagaimana cara guru membedakan proses asimilasi dan akomodasi Piaget ketika siswa mengalami miskonsepsi dalam pelajaran IPA?",
    },
    {
      label: "Contoh Refleksi Beban Kognitif",
      type: "Refleksi Materi (sudah/belum paham)",
      text: "Saya sudah memahami definisi short-term memory, tetapi masih belum yakin bagaimana merancang media visual agar tidak membebani kapasitas kognitif siswa.",
    },
    {
      label: "Contoh Ulasan Komparatif",
      type: "Reply Mandiri (komentar bebas)",
      text: "Kelebihan utama teori Bruner adalah penekanan pada Discovery Learning yang melatih kemandirian berpikir kritis pembelajar sejak tahap enaktif hingga simbolik.",
    },
  ];

  if (isSessionClosed) {
    return (
      <div className="bg-white border-2 border-slate-900 shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b-2 border-slate-900 bg-slate-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-rose-600 flex items-center justify-center text-white font-bold border border-slate-900">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-white">
                SESI DISKUSI DITUTUP ({currentSession.title})
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Status perkuliahan untuk sesi ini telah diarsipkan atau ditutup oleh Dosen/Tutor.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-rose-500 text-white text-xs font-black uppercase tracking-wider border border-rose-700">
            DITUTUP
          </span>
        </div>

        <div className="p-6 bg-amber-50/70 border-b-2 border-slate-300 flex items-start gap-4">
          <AlertOctagon className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-950">
              Pemberitahuan Penutupan Forum Sesi
            </h3>
            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              Sesi diskusi ini telah ditutup oleh Dosen Pengampu. Mahasiswa tidak dapat menambahkan pertanyaan, tanggapan, atau reply baru pada sesi ini. Namun, seluruh riwayat diskusi, tanggapan rekan, hasil scaffolding AI, serta nilai dan evaluasi dosen tetap dapat ditinjau di bawah ini.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-slate-900 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b-2 border-slate-900 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 flex items-center justify-center text-white font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">BUAT POSTINGAN DISKUSI</h2>
            <p className="text-xs text-slate-300 font-medium">
              Posting pertanyaan, tanggapan, atau refleksi. AI akan memberikan asistensi awal sebelum ditinjau tutor.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Identitas Mahasiswa (Nama & NIM) */}
        <div className="p-4 bg-slate-50 border-2 border-slate-300 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-slate-900">
              IDENTITAS MAHASISWA PENULIS (UNTUK TRACKING & PENILAIAN DOSEN)
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Dapat diubah sesuai data mahasiswa
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">
                NAMA LENGKAP MAHASISWA
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Nama Lengkap Mahasiswa..."
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-bold text-slate-900 bg-white border-2 border-slate-300 focus:border-blue-600 focus:outline-hidden"
                  required
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">
                NIM (NOMOR INDUK MAHASISWA)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={authorNim}
                  onChange={(e) => setAuthorNim(e.target.value)}
                  placeholder="Contoh: 232103817978"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-bold font-mono text-slate-900 bg-white border-2 border-slate-300 focus:border-blue-600 focus:outline-hidden"
                  required
                />
                <Hash className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>
        </div>

        {/* Jenis Postingan Selector */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-900 mb-1.5">
            JENIS POSTINGAN
          </label>
          <div className="relative">
            <select
              id="jenis-postingan-select"
              value={postType}
              onChange={(e) => {
                setPostType(e.target.value as PostType);
                setErrorMsg("");
              }}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 bg-white border-2 border-slate-300 focus:border-blue-600 focus:outline-hidden transition-all uppercase"
            >
              {postTypesList.map((pt) => (
                <option key={pt.type} value={pt.type}>
                  {pt.label}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-1.5 text-xs text-slate-600 font-medium">
            {postTypesList.find((p) => p.type === postType)?.desc}
          </p>
        </div>

        {/* Optional parent post selector for reply mode */}
        {postType === "Reply Diskusi (balas postingan lain)" && (
          <div className="p-3.5 bg-blue-50/60 border-2 border-blue-300 space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
              PILIH POSTINGAN YANG INGIN DIBALAS
            </label>
            <select
              id="parent-post-select"
              value={parentPostId}
              onChange={(e) => {
                setParentPostId(e.target.value);
                setErrorMsg("");
              }}
              className="w-full px-3 py-2 text-xs text-slate-900 bg-white border-2 border-slate-300 focus:border-blue-600 focus:outline-hidden font-medium"
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

        {/* Content Textarea */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-slate-900">
              {postType === "Ajukan Pertanyaan"
                ? "PERTANYAAN ANDA"
                : postType === "Refleksi Materi (sudah/belum paham)"
                ? "URAIAN REFLEKSI METAKOGNITIF"
                : "ISI KOMENTAR / TANGGAPAN"}
            </label>
            <span className="text-xs text-slate-500 font-mono font-bold">
              {content.length} KARAKTER
            </span>
          </div>

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
                ? "Tulis pertanyaan Anda di sini... (Contoh: Apa perbedaan skema asimilasi dan akomodasi Piaget?)"
                : postType === "Refleksi Materi (sudah/belum paham)"
                ? "Tuliskan apa yang sudah Anda pahami dan bagian mana yang masih membutuhkan penguatan..."
                : "Tuliskan pemikiran, argumen, atau tanggapan Anda di sini..."
            }
            className={`w-full p-3.5 text-xs sm:text-sm text-slate-900 bg-white border-2 ${
              errorMsg ? "border-rose-600 bg-rose-50/20" : "border-slate-300"
            } focus:border-blue-600 focus:outline-hidden transition-all placeholder:text-slate-400 font-medium`}
          />

          {errorMsg && (
            <div className="mt-2 p-2.5 bg-rose-50 border-2 border-rose-400 text-xs text-rose-800 flex items-center gap-2 font-bold animate-in fade-in">
              <Info className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Quick Sample Prompts to speed up testing */}
        <div className="pt-1 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-600 font-black uppercase tracking-wider">Inspirasi Cepat:</span>
          {samplePrompts.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setPostType(s.type);
                setContent(s.text);
                setErrorMsg("");
              }}
              className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 border border-slate-300 transition-colors cursor-pointer"
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Footer & Submit Button */}
        <div className="pt-3 border-t-2 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-700 font-bold uppercase tracking-wider">
            <span className="w-2.5 h-2.5 bg-blue-600"></span>
            <span>Target Bloom: <strong className="text-slate-950 font-black">{currentSession.targetBloomLevel}</strong></span>
          </div>

          <button
            type="submit"
            id="btn-kirim-post"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>MENGANALISIS & MENGIRIM...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>KIRIM POSTINGAN</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

