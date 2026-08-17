import React from "react";
import {
  GraduationCap,
  BookOpen,
  UserCheck,
  Sparkles,
  ChevronDown,
  Layers,
  CheckCircle2,
  Lock,
  LogOut,
  ShieldAlert,
  Users,
  Pencil,
  User,
} from "lucide-react";
import { UserProfile, DiscussionSession } from "../types";
import { Umlogo } from "./Umlogo";

interface NavbarProps {
  currentUser: UserProfile;
  userRole: "mahasiswa" | "tutor";
  isTutorAuthenticated: boolean;
  onRequestTutorLogin: () => void;
  onLogoutTutor: () => void;
  onSwitchToStudent: () => void;
  sessions: DiscussionSession[];
  selectedSessionId: string;
  onSelectSession: (id: string) => void;
  activeTab: "diskusi" | "riwayat" | "tutor-posts" | "tutor-sessions" | "tutor-analytics";
  setActiveTab: (tab: any) => void;
  pendingCount?: number;
  onEditStudentProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  userRole,
  isTutorAuthenticated,
  onRequestTutorLogin,
  onLogoutTutor,
  onSwitchToStudent,
  sessions,
  selectedSessionId,
  onSelectSession,
  activeTab,
  setActiveTab,
  pendingCount = 0,
  onEditStudentProfile,
}) => {
  const currentSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-slate-900 shadow-md">
      {/* Top Academic & Portal Status Bar */}
      <div className="bg-slate-950 text-white text-xs py-2 px-4 sm:px-6 border-b-2 border-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5 flex-wrap">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-black uppercase tracking-wider text-slate-100">
              LMS UNIVERSITAS NEGERI MALANG
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            {userRole === "mahasiswa" ? (
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-900/80 text-blue-200 border border-blue-600 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-3 h-3 text-blue-400" />
                  PORTAL MAHASISWA (AKSES TERBUKA)
                </span>
                <button
                  onClick={onRequestTutorLogin}
                  className="px-2.5 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1 border border-amber-600 cursor-pointer transition-all"
                >
                  <Lock className="w-3 h-3" />
                  <span>Masuk Mode Dosen (Password)</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1 border border-amber-600">
                  <ShieldAlert className="w-3 h-3 text-slate-950" />
                  PORTAL DOSEN / TUTOR (TERAUTENTIKASI)
                </span>
                <button
                  onClick={onLogoutTutor}
                  className="px-2.5 py-0.5 bg-rose-700 hover:bg-rose-600 text-white font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 border border-rose-800 cursor-pointer transition-all"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Keluar Mode Dosen</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Logo and App Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 bg-blue-600 text-white flex items-center justify-center font-black border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-slate-950 uppercase tracking-tight">
                    {userRole === "tutor" ? "PORTAL DOSEN & EVALUASI" : "FORUM DISKUSI MAHASISWA"}
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 border-2 border-blue-600">
                    AI Scaffolding + Evaluasi
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  {userRole === "tutor"
                    ? "Kelola penilaian kognitif, validasi Taksonomi Bloom, dan penguatan konsep materi"
                    : "Ruang diskusi terbuka seluruh mahasiswa berbasis Asistensi AI & Pembinaan Tutor"}
                </p>
              </div>
            </div>

            {/* Mobile Switcher */}
            <div className="lg:hidden">
              {userRole === "mahasiswa" ? (
                <button
                  onClick={onRequestTutorLogin}
                  className="px-3 py-1.5 text-xs font-black uppercase tracking-wider bg-amber-500 text-slate-950 border-2 border-slate-900 shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Mode Dosen</span>
                </button>
              ) : (
                <button
                  onClick={onLogoutTutor}
                  className="px-3 py-1.5 text-xs font-black uppercase tracking-wider bg-rose-600 text-white border-2 border-slate-900 shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              )}
            </div>
          </div>

          {/* Session Selector & Role Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Session Selector */}
            <div className="relative flex-1 sm:flex-initial min-w-[260px] sm:min-w-[310px]">
              <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-0.5">
                SESI PERKULIAHAN AKTIF
              </label>
              <div className="relative">
                <select
                  id="session-quick-select"
                  value={selectedSessionId}
                  onChange={(e) => onSelectSession(e.target.value)}
                  className="w-full pl-8 pr-8 py-2 text-xs font-bold text-slate-900 bg-white hover:bg-slate-50 border-2 border-slate-900 focus:outline-hidden transition-colors cursor-pointer appearance-none truncate shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                >
                  {sessions.map((ses) => (
                    <option key={ses.id} value={ses.id}>
                      {ses.courseName} — {ses.title} {ses.isActive ? "(Aktif)" : "(Arsip)"}
                    </option>
                  ))}
                </select>
                <BookOpen className="w-4 h-4 text-blue-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-3.5 h-3.5 text-slate-700 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Desktop Portal Switcher Tabs */}
            <div className="hidden lg:flex items-center p-1 bg-slate-100 border-2 border-slate-900">
              <button
                id="btn-mode-mahasiswa"
                onClick={onSwitchToStudent}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  userRole === "mahasiswa"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-700 hover:text-slate-950"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Portal Mahasiswa</span>
              </button>

              <button
                id="btn-mode-tutor"
                onClick={() => {
                  if (isTutorAuthenticated) {
                    setActiveTab("tutor-posts");
                  } else {
                    onRequestTutorLogin();
                  }
                }}
                className={`relative flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  userRole === "tutor"
                    ? "bg-amber-500 text-slate-950 shadow-xs"
                    : "text-slate-700 hover:text-slate-950"
                }`}
              >
                {isTutorAuthenticated ? (
                  <UserCheck className="w-3.5 h-3.5" />
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
                <span>Portal Dosen</span>
                {pendingCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-rose-600 text-white text-[10px] font-black font-mono">
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>

            {/* User Profile Card */}
            <div className="flex items-center gap-3 pl-3 border-l-2 border-slate-300">
              {userRole === "mahasiswa" ? (
                <button
                  type="button"
                  id="btn-edit-student-profile-navbar"
                  onClick={onEditStudentProfile}
                  title="Klik untuk mengubah Nama & NIM Anda"
                  className="flex items-center gap-2.5 text-left group p-1 hover:bg-blue-50 border-2 border-transparent hover:border-blue-500 transition-all cursor-pointer"
                >
                  <div className="w-9 h-9 bg-slate-900 group-hover:bg-blue-600 text-white flex items-center justify-center font-black text-xs border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-colors">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-950 leading-tight uppercase group-hover:text-blue-700">
                        {currentUser.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 font-black uppercase tracking-wider bg-blue-100 text-blue-950 border border-blue-500 flex items-center gap-1">
                        <span>MAHASISWA</span>
                        <Pencil className="w-2.5 h-2.5 text-blue-700" />
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 group-hover:text-blue-900">
                      <span className="text-xs font-mono font-bold block truncate max-w-[180px]">
                        {currentUser.nim || currentUser.email}
                      </span>
                      <span className="text-[10px] text-blue-600 font-bold underline decoration-dotted hidden md:inline">
                        (Ubah)
                      </span>
                    </div>
                  </div>
                </button>
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-slate-900 text-white flex items-center justify-center font-black text-xs border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="text-left hidden xl:block">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-950 leading-tight uppercase">
                        {currentUser.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 font-black uppercase tracking-wider bg-amber-100 text-amber-950 border border-amber-500">
                        DOSEN / TUTOR
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-600 block truncate max-w-[190px]">
                      {currentUser.nim || currentUser.email}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Official UM Logo on the top-right */}
            <div className="hidden sm:flex items-center pl-2 border-l-2 border-slate-300">
              <Umlogo />
            </div>
          </div>
        </div>

        {/* Tab Navigation Sub-bar */}
        <div className="mt-3 pt-2.5 border-t-2 border-slate-200 flex items-center justify-between text-xs">
          {userRole === "mahasiswa" ? (
            <div className="flex items-center space-x-2">
              <button
                id="tab-mhs-diskusi"
                onClick={() => setActiveTab("diskusi")}
                className={`px-3.5 py-1.5 font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "diskusi"
                    ? "bg-slate-950 text-white border-2 border-slate-950"
                    : "text-slate-700 hover:text-slate-950 hover:bg-slate-100 border-2 border-transparent"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>FORUM DISKUSI UMUM</span>
              </button>
              <button
                id="tab-mhs-riwayat"
                onClick={() => setActiveTab("riwayat")}
                className={`px-3.5 py-1.5 font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "riwayat"
                    ? "bg-slate-950 text-white border-2 border-slate-950"
                    : "text-slate-700 hover:text-slate-950 hover:bg-slate-100 border-2 border-transparent"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>RIWAYAT & REKAP SEMUA MAHASISWA</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 flex-wrap">
              <button
                id="tab-tutor-posts"
                onClick={() => setActiveTab("tutor-posts")}
                className={`px-3.5 py-1.5 font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "tutor-posts"
                    ? "bg-slate-950 text-white border-2 border-slate-950"
                    : "text-slate-700 hover:text-slate-950 hover:bg-slate-100 border-2 border-transparent"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>POSTINGAN MAHASISWA ({pendingCount} MENUNGGU)</span>
              </button>
              <button
                id="tab-tutor-sessions"
                onClick={() => setActiveTab("tutor-sessions")}
                className={`px-3.5 py-1.5 font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "tutor-sessions"
                    ? "bg-slate-950 text-white border-2 border-slate-950"
                    : "text-slate-700 hover:text-slate-950 hover:bg-slate-100 border-2 border-transparent"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>KELOLA SESI KULIAH</span>
              </button>
              <button
                id="tab-tutor-analytics"
                onClick={() => setActiveTab("tutor-analytics")}
                className={`px-3.5 py-1.5 font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "tutor-analytics"
                    ? "bg-slate-950 text-white border-2 border-slate-950"
                    : "text-slate-700 hover:text-slate-950 hover:bg-slate-100 border-2 border-transparent"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>DISTRIBUSI TAKSONOMI BLOOM</span>
              </button>
            </div>
          )}

          <div className="hidden sm:flex items-center text-slate-700 text-xs font-bold gap-1.5">
            <span className="uppercase">Target Bloom:</span>
            <span className="font-black text-blue-900 bg-blue-100 px-2 py-0.5 border border-blue-400">
              {currentSession.targetBloomLevel}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

