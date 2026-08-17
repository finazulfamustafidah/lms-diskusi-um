import React, { useState } from "react";
import { Lock, KeyRound, Eye, EyeOff, ShieldAlert, CheckCircle2, X } from "lucide-react";

interface TutorLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TutorLoginModal: React.FC<TutorLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg("Harap masukkan password dosen terlebih dahulu.");
      return;
    }

    // Check password (case-insensitive for convenience)
    if (password.trim().toUpperCase() === "DOSEN2026") {
      setErrorMsg("");
      setPassword("");
      onSuccess();
      onClose();
    } else {
      setErrorMsg("Password salah! Harap masukkan password resmi dosen yang valid.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        id="tutor-login-modal"
        className="bg-white border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between border-b-2 border-slate-900">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-amber-500 text-slate-950 flex items-center justify-center font-black border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-white">
                PORTAL DOSEN / TUTOR
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Autentikasi Hak Akses Evaluasi & Penilaian
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 bg-amber-50 border-2 border-amber-300 text-xs text-amber-950 space-y-1">
            <div className="font-black uppercase tracking-wider flex items-center gap-1.5 text-amber-900">
              <KeyRound className="w-4 h-4" />
              <span>Akses Khusus Dosen & Pengajar</span>
            </div>
            <p className="font-medium text-slate-700 leading-relaxed">
              Silakan masukkan kata sandi resmi dosen/tutor untuk mengakses menu evaluasi, pembobotan nilai, validasi Taksonomi Bloom, dan manajemen sesi.
            </p>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-900 mb-1.5">
              KATA SANDI / PASSWORD DOSEN
            </label>
            <div className="relative">
              <input
                id="tutor-password-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder="Masukkan kata sandi dosen..."
                className={`w-full pl-3.5 pr-10 py-2.5 text-sm font-bold text-slate-900 bg-white border-2 ${
                  errorMsg ? "border-rose-600 bg-rose-50/20" : "border-slate-300"
                } focus:border-blue-600 focus:outline-hidden font-mono`}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {errorMsg && (
              <div className="mt-2 p-2.5 bg-rose-50 border-2 border-rose-400 text-xs text-rose-800 flex items-center gap-2 font-bold animate-in fade-in">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t-2 border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-950 bg-white border-2 border-slate-300 hover:border-slate-400 cursor-pointer"
            >
              BATAL
            </button>

            <button
              type="submit"
              id="btn-submit-tutor-login"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center gap-2 cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>MASUK MODE DOSEN</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
