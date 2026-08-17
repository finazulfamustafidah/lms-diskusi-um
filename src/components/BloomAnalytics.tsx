import React from "react";
import {
  BrainCircuit,
  BarChart3,
  Download,
  Award,
  Users,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { DiscussionPost, DiscussionSession } from "../types";
import { BloomBadge } from "./BloomBadge";

interface BloomAnalyticsProps {
  posts: DiscussionPost[];
  sessions: DiscussionSession[];
}

export const BloomAnalytics: React.FC<BloomAnalyticsProps> = ({
  posts,
  sessions,
}) => {
  // Bloom Levels Distribution
  const bloomCounts: Record<string, number> = {
    C1: 0,
    C2: 0,
    C3: 0,
    C4: 0,
    C5: 0,
    C6: 0,
  };

  const bloomLabels: Record<string, string> = {
    C1: "Mengingat (C1)",
    C2: "Memahami (C2)",
    C3: "Menerapkan (C3)",
    C4: "Menganalisis (C4)",
    C5: "Mengevaluasi (C5)",
    C6: "Menciptakan (C6)",
  };

  posts.forEach((post) => {
    const levelStr =
      post.tutorEvaluation.finalBloomLevel || post.aiScaffolding.bloomLevel;
    if (levelStr.includes("C1")) bloomCounts.C1++;
    else if (levelStr.includes("C2")) bloomCounts.C2++;
    else if (levelStr.includes("C3")) bloomCounts.C3++;
    else if (levelStr.includes("C4")) bloomCounts.C4++;
    else if (levelStr.includes("C5")) bloomCounts.C5++;
    else if (levelStr.includes("C6")) bloomCounts.C6++;
  });

  const total = posts.length || 1;
  const maxCount = Math.max(...Object.values(bloomCounts), 1);

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Nama Mahasiswa",
      "NIM",
      "Sesi Diskusi",
      "Jenis Postingan",
      "Level Bloom",
      "Nilai Final",
      "Status",
      "Tanggal",
    ];

    const rows = posts.map((p) => [
      `"${p.id}"`,
      `"${p.authorName}"`,
      `"${p.authorNim}"`,
      `"${p.sessionTitle}"`,
      `"${p.postType}"`,
      `"${p.tutorEvaluation.finalBloomLevel || p.aiScaffolding.bloomLevel}"`,
      `"${p.tutorEvaluation.score ?? "-"}"`,
      `"${p.tutorEvaluation.status}"`,
      `"${p.createdAt}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Nilai_LMS_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Export */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Analisis Kognitif Taksonomi Bloom
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              AI + Validasi Dosen
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Sebaran tingkat kedalaman berpikir mahasiswa pada sesi diskusi yang berlangsung.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Ekspor Rekapitulasi (.CSV)</span>
        </button>
      </div>

      {/* Distribution Bars */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-blue-600" />
          <span>Distribusi Level Kognitif Kelas</span>
        </h3>

        <div className="space-y-3 pt-2">
          {(["C1", "C2", "C3", "C4", "C5", "C6"] as const).map((code) => {
            const count = bloomCounts[code];
            const percent = Math.round((count / total) * 100);
            const barWidth = Math.round((count / maxCount) * 100);

            return (
              <div key={code} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 w-8">{code}</span>
                    <span className="text-slate-600 font-medium">{bloomLabels[code]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-900">{count} postingan</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      ({percent}%)
                    </span>
                  </div>
                </div>

                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${barWidth}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      code === "C1"
                        ? "bg-slate-400"
                        : code === "C2"
                        ? "bg-sky-500"
                        : code === "C3"
                        ? "bg-emerald-500"
                        : code === "C4"
                        ? "bg-blue-600"
                        : code === "C5"
                        ? "bg-amber-500"
                        : "bg-cyan-500"
                    }`}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Recap Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Daftar Kontribusi & Nilai Kognitif
          </h3>
          <span className="text-xs text-slate-500">
            Total <strong>{posts.length}</strong> Kontribusi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-semibold">
              <tr>
                <th className="px-4 py-2.5">Mahasiswa</th>
                <th className="px-4 py-2.5">NIM</th>
                <th className="px-4 py-2.5">Topik Sesi</th>
                <th className="px-4 py-2.5">Level Bloom</th>
                <th className="px-4 py-2.5">Nilai</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-bold text-slate-900">
                    {p.authorName}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-600">
                    {p.authorNim}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 truncate max-w-[180px]">
                    {p.sessionTitle}
                  </td>
                  <td className="px-4 py-2.5">
                    <BloomBadge
                      level={
                        p.tutorEvaluation.finalBloomLevel ||
                        p.aiScaffolding.bloomLevel
                      }
                      size="sm"
                    />
                  </td>
                  <td className="px-4 py-2.5 font-bold text-blue-900">
                    {p.tutorEvaluation.score !== undefined ? (
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                        {p.tutorEvaluation.score}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        p.tutorEvaluation.status === "Selesai"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {p.tutorEvaluation.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
