import React, { useState } from "react";
import {
  Plus,
  BookOpen,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Sparkles,
} from "lucide-react";
import { DiscussionSession } from "../types";

interface SessionManagerProps {
  sessions: DiscussionSession[];
  onAddSession: (session: Omit<DiscussionSession, "id">) => void;
  onToggleSessionStatus: (id: string) => void;
}

export const SessionManager: React.FC<SessionManagerProps> = ({
  sessions,
  onAddSession,
  onToggleSessionStatus,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [courseCode, setCourseCode] = useState("TEP-402");
  const [courseName, setCourseName] = useState("Belajar Pembelajaran");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [targetBloomLevel, setTargetBloomLevel] = useState("C2 - C4 (Memahami s.d. Menganalisis)");
  const [learningOutcomes, setLearningOutcomes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !topic.trim()) return;

    onAddSession({
      courseCode,
      courseName,
      title: title.trim(),
      topic: topic.trim(),
      description: description.trim() || "Diskusi kolaboratif konsep pembelajaran.",
      targetBloomLevel,
      startDate: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      isActive: true,
      learningOutcomes: learningOutcomes
        ? learningOutcomes.split("\n").filter((l) => l.trim().length > 0)
        : ["Mampu menganalisis konsep dan mengaplikasikannya di kelas."],
    });

    setTitle("");
    setTopic("");
    setDescription("");
    setLearningOutcomes("");
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Kelola Sesi Diskusi Perkuliahan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur topik pembahasan, target capaian Taksonomi Bloom, dan status keaktifan forum diskusi.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          id="btn-tambah-sesi"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "Tutup Form" : "Tambah Sesi Baru"}</span>
        </button>
      </div>

      {/* Add Session Form Modal/Card */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl border border-blue-200 shadow-md space-y-4 animate-in fade-in"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-blue-900 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Formulir Pembukaan Sesi Diskusi Baru</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Judul Sesi Diskusi
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Sesi Diskusi 4 - Teori Behaviorisme Watson"
                className="w-full px-3.5 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Topik / Materi Fokus
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Contoh: Classical Conditioning dan Operant Conditioning"
                className="w-full px-3.5 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deskripsi Pengantar Diskusi
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan gambaran umum materi dan instruksi partisipasi mahasiswa..."
              className="w-full p-3 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Capaian Bloom Kognitif
              </label>
              <select
                value={targetBloomLevel}
                onChange={(e) => setTargetBloomLevel(e.target.value)}
                className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="C1 - C2 (Mengingat s.d. Memahami)">C1 - C2 (Mengingat s.d. Memahami)</option>
                <option value="C2 - C4 (Memahami s.d. Menganalisis)">C2 - C4 (Memahami s.d. Menganalisis)</option>
                <option value="C3 - C5 (Menerapkan s.d. Mengevaluasi)">C3 - C5 (Menerapkan s.d. Mengevaluasi)</option>
                <option value="C4 - C6 (Menganalisis s.d. Menciptakan)">C4 - C6 (Menganalisis s.d. Menciptakan)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Indikator Capaian (Satu per baris)
              </label>
              <textarea
                rows={2}
                value={learningOutcomes}
                onChange={(e) => setLearningOutcomes(e.target.value)}
                placeholder="Mampu mendefinisikan konsep conditioning&#10;Mampu merancang contoh penguatan positif di kelas"
                className="w-full p-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
            >
              Buka Sesi Diskusi
            </button>
          </div>
        </form>
      )}

      {/* List of Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`p-5 rounded-xl border transition-all ${
              session.isActive
                ? "bg-white border-blue-200 shadow-xs"
                : "bg-slate-50 border-slate-200 opacity-80"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {session.courseCode} • {session.courseName}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-2">
                  {session.title}
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Topik: {session.topic}
                </p>
              </div>

              <button
                onClick={() => onToggleSessionStatus(session.id)}
                className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                  session.isActive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
                title="Klik untuk mengubah status sesi"
              >
                {session.isActive ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aktif</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Arsip / Ditutup</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
              {session.description}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Mulai: {session.startDate}
              </span>
              <span className="font-semibold text-blue-700">
                Target: {session.targetBloomLevel}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
