import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  Bot,
  BrainCircuit,
  Award,
  Sparkles,
  CheckCircle2,
  Edit3,
  HelpCircle,
} from "lucide-react";
import { DiscussionPost, BloomLevelKey } from "../types";
import { BloomBadge } from "./BloomBadge";

interface TutorEvaluationModalProps {
  post: DiscussionPost | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveEvaluation: (
    postId: string,
    data: {
      score: number;
      scoreNotes?: string;
      finalBloomLevel: string;
      tutorReinforcement: string;
    }
  ) => void;
  onEditPostContent: (postId: string, newContent: string) => void;
}

export const TutorEvaluationModal: React.FC<TutorEvaluationModalProps> = ({
  post,
  isOpen,
  onClose,
  onSaveEvaluation,
  onEditPostContent,
}) => {
  if (!isOpen || !post) return null;

  const [score, setScore] = useState<number>(post.tutorEvaluation.score ?? 85);
  const [scoreNotes, setScoreNotes] = useState<string>(
    post.tutorEvaluation.scoreNotes ?? ""
  );
  const [finalBloomLevel, setFinalBloomLevel] = useState<string>(
    post.tutorEvaluation.finalBloomLevel || post.aiScaffolding.bloomLevel || "Memahami (C2)"
  );
  const [tutorReinforcement, setTutorReinforcement] = useState<string>(
    post.tutorEvaluation.tutorReinforcement ||
      post.aiScaffolding.text ||
      ""
  );

  const [isEditingContent, setIsEditingContent] = useState(false);
  const [postContent, setPostContent] = useState(post.content);

  const bloomOptions: BloomLevelKey[] = [
    "Mengingat (C1)",
    "Memahami (C2)",
    "Menerapkan (C3)",
    "Menganalisis (C4)",
    "Mengevaluasi (C5)",
    "Menciptakan (C6)",
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditingContent) {
      onEditPostContent(post.id, postContent);
    }
    onSaveEvaluation(post.id, {
      score: Number(score) || 0,
      scoreNotes: scoreNotes.trim(),
      finalBloomLevel,
      tutorReinforcement: tutorReinforcement.trim(),
    });
    onClose();
  };

  const handleApplyPresetScore = (val: number) => {
    setScore(val);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div
        id="tutor-evaluation-modal"
        className="bg-white border-2 border-slate-900 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between border-b-2 border-slate-900">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 flex items-center justify-center text-white font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-tight">PENILAIAN & PENGUATAN TUTOR</h2>
              <p className="text-xs text-slate-400 font-medium">
                Verifikasi respons AI dan tetapkan nilai kognitif mahasiswa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          {/* Mahasiswa Info Bar */}
          <div className="p-4 bg-slate-50 border-2 border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-black text-slate-950 text-sm uppercase tracking-tight">
                  {post.authorName}
                </span>
                <span className="text-xs text-slate-600 font-mono font-bold bg-white px-2 py-0.5 border border-slate-300">
                  NIM: {post.authorNim}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                {post.authorEmail} • <span className="font-bold text-slate-900">{post.sessionTitle}</span> • {post.createdAt}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-black uppercase tracking-wider bg-blue-50 text-blue-800 border-2 border-blue-600">
                {post.postType}
              </span>
              <BloomBadge level={post.aiScaffolding.bloomLevel} size="sm" />
            </div>
          </div>

          {/* Isi Postingan Mahasiswa */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-widest text-slate-700">
                ISI POSTINGAN MAHASISWA
              </label>
              <button
                type="button"
                onClick={() => setIsEditingContent(!isEditingContent)}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-bold uppercase tracking-wider cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditingContent ? "TUTUP EDIT POSTINGAN" : "EDIT ISI POSTINGAN"}
              </button>
            </div>

            {isEditingContent ? (
              <textarea
                rows={3}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full p-3 text-xs sm:text-sm bg-white border-2 border-blue-600 focus:outline-hidden font-medium"
              />
            ) : (
              <div className="p-4 bg-blue-50/40 border-2 border-blue-200 text-slate-900 leading-relaxed font-medium">
                {post.content}
              </div>
            )}
          </div>

          {/* Jawaban Sementara (AI) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-blue-900 uppercase tracking-widest">
              <Bot className="w-4 h-4 text-blue-600" />
              <span>JAWABAN SEMENTARA (AI SCAFFOLDING)</span>
            </div>
            <div className="p-4 bg-slate-50 border-2 border-slate-300 text-xs text-slate-800 leading-relaxed font-medium">
              {post.aiScaffolding.text}
            </div>
          </div>

          {/* Analisis AI (Taksonomi Bloom) */}
          <div className="p-4 bg-purple-50/60 border-2 border-purple-300 space-y-2">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-purple-700" />
              <span className="text-xs font-black text-purple-950 uppercase tracking-widest">
                ANALISIS AI (TAKSONOMI BLOOM)
              </span>
              <BloomBadge level={post.aiScaffolding.bloomLevel} size="sm" />
            </div>
            <p className="text-xs text-slate-800 leading-relaxed">
              <strong className="font-bold text-slate-950">Level Terdeteksi: {post.aiScaffolding.bloomLevel}</strong> —{" "}
              {post.aiScaffolding.bloomExplanation}
            </p>
          </div>

          {/* Form Evaluasi Tutor */}
          <form id="form-tutor-eval" onSubmit={handleSave} className="space-y-4 pt-2">
            {/* TULIS / KOREKSI PENGUATAN */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-black text-slate-950 uppercase tracking-widest">
                  TULIS / KOREKSI PENGUATAN TUTOR
                </label>
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                  Ulasan resmi untuk mahasiswa
                </span>
              </div>
              <textarea
                id="tutor-reinforcement-input"
                rows={4}
                value={tutorReinforcement}
                onChange={(e) => setTutorReinforcement(e.target.value)}
                placeholder="Tuliskan ulasan penguatan konsep, klarifikasi kesalahan berpikir, atau tambahan referensi..."
                className="w-full p-3.5 text-xs sm:text-sm text-slate-900 bg-white border-2 border-slate-300 focus:border-blue-600 focus:outline-hidden font-medium"
              />
            </div>

            {/* Nilai Final & Catatan Nilai */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-slate-950 uppercase tracking-widest">
                    NILAI FINAL (0-100)
                  </label>
                  <div className="flex gap-1">
                    {[75, 85, 90, 95, 100].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleApplyPresetScore(num)}
                        className={`px-2 py-0.5 text-[10px] font-black uppercase cursor-pointer border ${
                          score === num
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  id="final-score-input"
                  type="number"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm font-black text-slate-900 bg-white border-2 border-slate-300 focus:border-blue-600 focus:outline-hidden font-mono"
                  placeholder="Contoh: 90"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-950 uppercase tracking-widest mb-1.5">
                  CATATAN NILAI (OPSIONAL)
                </label>
                <input
                  id="score-notes-input"
                  type="text"
                  value={scoreNotes}
                  onChange={(e) => setScoreNotes(e.target.value)}
                  placeholder="Contoh: Analisis komprehensif dan kritis"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 bg-white border-2 border-slate-300 focus:border-blue-600 focus:outline-hidden font-medium"
                />
              </div>
            </div>

            {/* Level Kognitif Bloom (Final) */}
            <div>
              <label className="block text-xs font-black text-slate-950 uppercase tracking-widest mb-1.5">
                LEVEL KOGNITIF BLOOM (FINAL TUTOR)
              </label>
              <select
                id="final-bloom-select"
                value={finalBloomLevel}
                onChange={(e) => setFinalBloomLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 bg-white border-2 border-slate-300 focus:border-blue-600 focus:outline-hidden uppercase"
              >
                {bloomOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-100 border-t-2 border-slate-900 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 bg-white border-2 border-slate-300 hover:border-slate-400 transition-colors cursor-pointer"
          >
            BATAL
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setIsEditingContent(true);
              }}
              className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 hover:bg-blue-100 border-2 border-blue-600 transition-colors cursor-pointer"
            >
              EDIT ISI POSTINGAN
            </button>

            <button
              type="button"
              onClick={handleSave}
              id="btn-confirm-save-eval"
              className="px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>KONFIRMASI & SIMPAN</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
