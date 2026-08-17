import React, { useState, useEffect } from "react";
import {
  initialSessions,
  initialPosts,
  currentUserStudent,
  currentUserTutor,
} from "./data/initialData";
import {
  DiscussionSession,
  DiscussionPost,
  UserProfile,
  PostType,
} from "./types";
import {
  seedInitialDataIfEmpty,
  subscribeToSessions,
  subscribeToPosts,
  savePostToFirestore,
  updatePostInFirestore,
  deletePostFromFirestore,
  saveSessionToFirestore,
  updateSessionInFirestore,
} from "./lib/firebase";
import { analyzeStudentPost } from "./lib/aiAnalysisService";
import { Navbar } from "./components/Navbar";
import { StudentView } from "./components/StudentView";
import { StudentHistory } from "./components/StudentHistory";
import { TutorPostsManager } from "./components/TutorPostsManager";
import { SessionManager } from "./components/SessionManager";
import { BloomAnalytics } from "./components/BloomAnalytics";
import { TutorEvaluationModal } from "./components/TutorEvaluationModal";
import { EditPostModal } from "./components/EditPostModal";
import { TutorLoginModal } from "./components/TutorLoginModal";
import { EditStudentProfileModal } from "./components/EditStudentProfileModal";
import { Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

export default function App() {
  const [userRole, setUserRole] = useState<"mahasiswa" | "tutor">("mahasiswa");
  
  // Student Profile State (Customizable by student & persistent in browser localStorage)
  const [studentProfile, setStudentProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem("lms_student_profile");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return currentUserStudent;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem("lms_student_profile");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return currentUserStudent;
  });

  const [isTutorAuthenticated, setIsTutorAuthenticated] = useState<boolean>(false);
  const [isTutorLoginModalOpen, setIsTutorLoginModalOpen] = useState<boolean>(false);
  const [isEditStudentProfileModalOpen, setIsEditStudentProfileModalOpen] = useState<boolean>(false);

  const [sessions, setSessions] = useState<DiscussionSession[]>(initialSessions);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("sesi-1");
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [activeTab, setActiveTab] = useState<
    "diskusi" | "riwayat" | "tutor-posts" | "tutor-sessions" | "tutor-analytics"
  >("diskusi");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "info" | "error";
  } | null>(null);

  // Modals state
  const [evaluatingPost, setEvaluatingPost] = useState<DiscussionPost | null>(null);
  const [editingPost, setEditingPost] = useState<DiscussionPost | null>(null);

  // 1. Initial Firestore Seeding & Realtime Listeners
  useEffect(() => {
    // Seed initial data to cloud Firestore if empty
    seedInitialDataIfEmpty();

    // Subscribe to real-time sessions
    const unsubSessions = subscribeToSessions((updatedSessions) => {
      if (updatedSessions.length > 0) {
        setSessions(updatedSessions);
        // Ensure selectedSessionId is valid
        setSelectedSessionId((current) => {
          const exists = updatedSessions.some((s) => s.id === current);
          return exists ? current : updatedSessions[0].id;
        });
      }
    });

    // Subscribe to real-time posts
    const unsubPosts = subscribeToPosts((updatedPosts) => {
      setPosts(updatedPosts);
    });

    return () => {
      unsubSessions();
      unsubPosts();
    };
  }, []);

  const showToast = (text: string, type: "success" | "info" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Switch to Student Portal (Publicly accessible to all students)
  const handleSwitchToStudent = () => {
    setUserRole("mahasiswa");
    setCurrentUser(studentProfile);
    setActiveTab("diskusi");
    showToast("Berada di Portal Mahasiswa (Akses Terbuka)", "info");
  };

  // Save student customized identity
  const handleSaveStudentProfile = (updated: { name: string; nim: string; institution?: string }) => {
    const updatedProfile: UserProfile = {
      ...studentProfile,
      name: updated.name,
      nim: updated.nim,
      institution: updated.institution || studentProfile.institution,
    };
    setStudentProfile(updatedProfile);
    if (userRole === "mahasiswa") {
      setCurrentUser(updatedProfile);
    }
    try {
      localStorage.setItem("lms_student_profile", JSON.stringify(updatedProfile));
    } catch (e) {
      console.error(e);
    }
    showToast(`Identitas mahasiswa berhasil diperbarui: ${updated.name} (${updated.nim})`, "success");
  };

  // Request Tutor Login
  const handleRequestTutorLogin = () => {
    if (isTutorAuthenticated) {
      setUserRole("tutor");
      setCurrentUser(currentUserTutor);
      setActiveTab("tutor-posts");
      showToast("Beralih ke Mode Dosen / Tutor", "info");
    } else {
      setIsTutorLoginModalOpen(true);
    }
  };

  // Tutor Login Success
  const handleTutorLoginSuccess = () => {
    setIsTutorAuthenticated(true);
    setUserRole("tutor");
    setCurrentUser(currentUserTutor);
    setActiveTab("tutor-posts");
    setIsTutorLoginModalOpen(false);
    showToast("Autentikasi Dosen Berhasil! Selamat datang Ibu Fina Zulfa Mustafidah.", "success");
  };

  // Logout from Tutor Mode
  const handleLogoutTutor = () => {
    setIsTutorAuthenticated(false);
    setUserRole("mahasiswa");
    setCurrentUser(studentProfile);
    setActiveTab("diskusi");
    showToast("Telah keluar dari Mode Dosen ke Portal Mahasiswa.", "info");
  };

  // Active current session object
  const currentSession =
    sessions.find((s) => s.id === selectedSessionId) || sessions[0] || initialSessions[0];

  // Posts in selected session (accessible to all students)
  const postsInCurrentSession = posts.filter(
    (p) => p.sessionId === selectedSessionId
  );

  // My posts in current session (for Fina or matched NIM/Email)
  const myPostsInCurrentSession = postsInCurrentSession.filter(
    (p) => p.authorNim === currentUser.nim || p.authorEmail === currentUser.email
  );

  // All my posts
  const allMyPosts = posts.filter(
    (p) => p.authorNim === currentUser.nim || p.authorEmail === currentUser.email
  );

  // Pending evaluations count for tutor
  const pendingCount = posts.filter(
    (p) => p.tutorEvaluation.status === "Menunggu"
  ).length;

  // Handle submitting new discussion post
  const handleSubmitPost = async (data: {
    postType: PostType;
    content: string;
    parentPostId?: string;
    authorName?: string;
    authorNim?: string;
  }) => {
    setIsSubmitting(true);
    const resolvedAuthorName = data.authorName?.trim() || currentUser.name;
    const resolvedAuthorNim = data.authorNim?.trim() || currentUser.nim || "232103817978";

    try {
      // Call AI Scaffolding & Bloom Taxonomy analysis (via serverless API, Gemini, or smart fallback)
      const aiResult = await analyzeStudentPost({
        sessionTitle: `${currentSession.courseName} - ${currentSession.title}`,
        postType: data.postType,
        content: data.content,
        studentName: resolvedAuthorName,
      });

      const now = new Date();
      const timeStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}, ${String(
        now.getHours()
      ).padStart(2, "0")}.${String(now.getMinutes()).padStart(2, "0")}.${String(
        now.getSeconds()
      ).padStart(2, "0")}`;

      const newPost: DiscussionPost = {
        id: `post-${Date.now()}`,
        sessionId: currentSession.id,
        sessionTitle: `${currentSession.courseName} — ${currentSession.title}`,
        authorId: currentUser.id,
        authorName: resolvedAuthorName,
        authorEmail: currentUser.email,
        authorNim: resolvedAuthorNim,
        postType: data.postType,
        content: data.content,
        parentPostId: data.parentPostId || null as any,
        createdAt: timeStr,
        aiScaffolding: {
          text: aiResult.aiResponse,
          bloomLevel: aiResult.bloomLevel,
          bloomCode: aiResult.bloomCode,
          bloomExplanation: aiResult.bloomExplanation,
          generatedAt: timeStr,
        },
        tutorEvaluation: {
          status: "Menunggu",
          finalBloomLevel: aiResult.bloomLevel,
          tutorReinforcement: aiResult.suggestedReinforcement || "",
        },
        replies: [],
      };

      // Optimistic update
      setPosts((prev) => [newPost, ...prev]);
      // Save permanently to Firestore
      await savePostToFirestore(newPost);
      showToast("Postingan berhasil dikirim dan tersimpan di database kelas!", "success");
    } catch (err: any) {
      console.error(err);
      showToast("Gagal menyimpan postingan ke database cloud.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add reply to thread
  const handleAddReply = async (postId: string, replyContent: string) => {
    const now = new Date();
    const timeStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}, ${String(
      now.getHours()
    ).padStart(2, "0")}.${String(now.getMinutes()).padStart(2, "0")}`;

    const newReply = {
      id: `rep-${Date.now()}`,
      postId,
      authorName: currentUser.name,
      authorNim: currentUser.nim,
      authorRole: currentUser.role,
      content: replyContent,
      createdAt: timeStr,
    };

    const targetPost = posts.find((p) => p.id === postId);
    const updatedReplies = targetPost ? [...targetPost.replies, newReply] : [newReply];

    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, replies: updatedReplies } : p
      )
    );

    // Save update to Firestore
    try {
      await updatePostInFirestore(postId, { replies: updatedReplies });
      showToast("Balasan diskusi berhasil dikirim!");
    } catch (e) {
      console.error(e);
      showToast("Balasan terkirim secara lokal.", "info");
    }
  };

  // Save Tutor Evaluation (Only accessible in tutor mode)
  const handleSaveEvaluation = async (
    postId: string,
    evalData: {
      score: number;
      scoreNotes?: string;
      finalBloomLevel: string;
      tutorReinforcement: string;
    }
  ) => {
    const now = new Date();
    const timeStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}, ${String(
      now.getHours()
    ).padStart(2, "0")}.${String(now.getMinutes()).padStart(2, "0")}`;

    const newEvaluation = {
      status: "Selesai" as const,
      score: evalData.score,
      scoreNotes: evalData.scoreNotes,
      finalBloomLevel: evalData.finalBloomLevel,
      tutorReinforcement: evalData.tutorReinforcement,
      tutorName: currentUser.name,
      evaluatedAt: timeStr,
    };

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              tutorEvaluation: newEvaluation,
            }
          : p
      )
    );

    try {
      await updatePostInFirestore(postId, { tutorEvaluation: newEvaluation });
      showToast("Penilaian dan penguatan dosen berhasil disimpan di database!");
    } catch (e) {
      console.error(e);
      showToast("Nilai tersimpan secara lokal.", "info");
    }
  };

  // Edit Post Content
  const handleEditPostContent = async (postId: string, newContent: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, content: newContent } : p))
    );
    try {
      await updatePostInFirestore(postId, { content: newContent });
      showToast("Isi postingan berhasil diperbarui di database!");
    } catch (e) {
      console.error(e);
      showToast("Isi postingan berhasil diperbarui!");
    }
  };

  // Delete Post Handler
  // - Tutor can delete any post
  // - Student can delete only their own post and only if not yet evaluated
  const handleDeletePost = async (postId: string) => {
    const targetPost = posts.find((p) => p.id === postId);
    if (!targetPost) return;

    if (userRole === "mahasiswa") {
      const isAuthor =
        currentUser.nim === targetPost.authorNim ||
        currentUser.email === targetPost.authorEmail;
      const isEvaluated = targetPost.tutorEvaluation.status === "Selesai";

      if (!isAuthor) {
        showToast("Anda hanya dapat menghapus postingan milik Anda sendiri.", "error");
        return;
      }

      if (isEvaluated) {
        showToast(
          "Postingan sudah dinilai dan divalidasi oleh dosen, tidak dapat dihapus.",
          "error"
        );
        return;
      }
    }

    setPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      await deletePostFromFirestore(postId);
      showToast("Postingan berhasil dihapus dari forum diskusi dan database.", "success");
    } catch (e) {
      console.error(e);
      showToast("Postingan dihapus dari tampilan.", "info");
    }
  };

  // Add new session
  const handleAddSession = async (newSessionData: Omit<DiscussionSession, "id">) => {
    const newSession: DiscussionSession = {
      ...newSessionData,
      id: `sesi-${Date.now()}`,
    };
    setSessions((prev) => [newSession, ...prev]);
    setSelectedSessionId(newSession.id);

    try {
      await saveSessionToFirestore(newSession);
      showToast(`Sesi "${newSession.title}" berhasil dibuka dan tersimpan di database!`, "success");
    } catch (e) {
      console.error(e);
      showToast(`Sesi "${newSession.title}" berhasil dibuka!`);
    }
  };

  // Toggle session status
  const handleToggleSessionStatus = async (sessionId: string) => {
    const targetSession = sessions.find((s) => s.id === sessionId);
    if (!targetSession) return;
    const newStatus = !targetSession.isActive;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, isActive: newStatus } : s
      )
    );

    try {
      await updateSessionInFirestore(sessionId, { isActive: newStatus });
      showToast(
        newStatus
          ? `Sesi "${targetSession.title}" berhasil diaktifkan kembali untuk seluruh mahasiswa.`
          : `Sesi "${targetSession.title}" telah ditutup (Arsip) secara real-time.`
      );
    } catch (e) {
      console.error(e);
      showToast("Status keaktifan sesi diperbarui.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-5 py-3.5 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] text-xs font-black uppercase tracking-wider flex items-center gap-3 transition-all transform animate-in slide-in-from-bottom-5 ${
            toastMessage.type === "success"
              ? "bg-emerald-400 text-slate-950"
              : toastMessage.type === "error"
              ? "bg-rose-500 text-white"
              : "bg-blue-600 text-white"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-slate-950" />
          ) : (
            <AlertCircle className="w-5 h-5 text-white" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Top Navbar */}
      <Navbar
        currentUser={currentUser}
        userRole={userRole}
        isTutorAuthenticated={isTutorAuthenticated}
        onRequestTutorLogin={handleRequestTutorLogin}
        onLogoutTutor={handleLogoutTutor}
        onSwitchToStudent={handleSwitchToStudent}
        sessions={sessions}
        selectedSessionId={selectedSessionId}
        onSelectSession={(id) => {
          setSelectedSessionId(id);
          showToast(
            `Beralih ke ${sessions.find((s) => s.id === id)?.title}`,
            "info"
          );
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
        onEditStudentProfile={() => setIsEditStudentProfileModalOpen(true)}
      />

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {userRole === "mahasiswa" ? (
          activeTab === "diskusi" ? (
            <StudentView
              currentSession={currentSession}
              allSessions={sessions}
              postsInCurrentSession={postsInCurrentSession}
              myPostsInCurrentSession={myPostsInCurrentSession}
              currentUser={currentUser}
              onSubmitPost={handleSubmitPost}
              isSubmitting={isSubmitting}
              onAddReply={handleAddReply}
              onEditPost={(post) => setEditingPost(post)}
              onDeletePost={handleDeletePost}
            />
          ) : (
            <StudentHistory
              allPosts={posts}
              sessions={sessions}
              currentUser={currentUser}
              onAddReply={handleAddReply}
              onEditPost={(post) => setEditingPost(post)}
              onDeletePost={handleDeletePost}
              onGoToDiscussion={() => setActiveTab("diskusi")}
            />
          )
        ) : (
          /* Mode Tutor Views (Restricted & Authenticated) */
          <>
            {activeTab === "tutor-posts" && (
              <TutorPostsManager
                posts={posts}
                sessions={sessions}
                selectedSessionId={selectedSessionId}
                onSelectSession={setSelectedSessionId}
                onOpenEvaluation={(post) => setEvaluatingPost(post)}
                onDeletePost={handleDeletePost}
                currentUser={currentUser}
              />
            )}

            {activeTab === "tutor-sessions" && (
              <SessionManager
                sessions={sessions}
                onAddSession={handleAddSession}
                onToggleSessionStatus={handleToggleSessionStatus}
              />
            )}

            {activeTab === "tutor-analytics" && (
              <BloomAnalytics posts={posts} sessions={sessions} />
            )}
          </>
        )}
      </main>

      {/* Tutor Login Password Modal */}
      <TutorLoginModal
        isOpen={isTutorLoginModalOpen}
        onClose={() => setIsTutorLoginModalOpen(false)}
        onSuccess={handleTutorLoginSuccess}
      />

      {/* Tutor Evaluation Modal */}
      {userRole === "tutor" && (
        <TutorEvaluationModal
          post={evaluatingPost}
          isOpen={Boolean(evaluatingPost)}
          onClose={() => setEvaluatingPost(null)}
          onSaveEvaluation={handleSaveEvaluation}
          onEditPostContent={handleEditPostContent}
        />
      )}

      {/* Edit Student Profile Modal */}
      <EditStudentProfileModal
        isOpen={isEditStudentProfileModalOpen}
        onClose={() => setIsEditStudentProfileModalOpen(false)}
        currentUser={currentUser}
        onSave={handleSaveStudentProfile}
      />

      {/* Edit Post Content Modal */}
      <EditPostModal
        post={editingPost}
        isOpen={Boolean(editingPost)}
        onClose={() => setEditingPost(null)}
        onSave={handleEditPostContent}
      />

      {/* Academic Footer */}
      <footer className="bg-white border-t-2 border-slate-900 py-6 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-black uppercase text-slate-950">LMS Belajar Pembelajaran</span>
            <span>•</span>
            <span className="font-bold">Universitas Negeri Malang</span>
          </div>
          <p className="text-slate-600 font-medium text-center sm:text-right">
            Sistem Pembelajaran Kolaboratif Berbasis Taksonomi Bloom & Penguatan Tutor (TEP-402)
          </p>
        </div>
      </footer>
    </div>
  );
}

