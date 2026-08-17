import React, { useState } from "react";
import { UserProfile } from "../types";
import { User, CreditCard, School, X, Check, Sparkles } from "lucide-react";

interface EditStudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSave: (updatedProfile: { name: string; nim: string; institution?: string }) => void;
}

export const EditStudentProfileModal: React.FC<EditStudentProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSave,
}) => {
  const [name, setName] = useState(currentUser.name || "");
  const [nim, setNim] = useState(currentUser.nim || "");
  const [institution, setInstitution] = useState(currentUser.institution || "Universitas Negeri Malang");
  const [error, setError] = useState<string | null>(null);

  // Sync state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setName(currentUser.name || "");
      setNim(currentUser.nim || "");
      setInstitution(currentUser.institution || "Universitas Negeri Malang");
      setError(null);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama mahasiswa tidak boleh kosong.");
      return;
    }
    if (!nim.trim()) {
      setError("NIM mahasiswa tidak boleh kosong.");
      return;
    }

    onSave({
      name: name.trim(),
      nim: nim.trim(),
      institution: institution.trim(),
    });
    onClose();
  };

  return (
    <div
      id="modal-edit-student-profile"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white w-full max-w-md border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-5 py-4 text-white border-b-4 border-slate-900 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-white text-blue-600 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-sm uppercase tracking-wider">
                Identitas Mahasiswa
              </h2>
              <p className="text-[11px] text-blue-100 font-medium">
                Atur Nama & NIM untuk interaksi forum diskusi
              </p>
            </div>
          </div>
          <button
            id="btn-close-edit-student-modal"
            onClick={onClose}
            className="p-1.5 bg-white text-slate-950 border-2 border-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border-2 border-rose-600 text-rose-800 text-xs font-bold flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1">
              Nama Lengkap Mahasiswa <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <input
                id="input-student-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Fina Zulfa / Ahmad Fauzi"
                className="w-full pl-9 pr-3 py-2 text-xs font-bold text-slate-900 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:outline-hidden transition-colors"
                autoFocus
              />
              <User className="w-4 h-4 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1">
              NIM (Nomor Induk Mahasiswa) <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <input
                id="input-student-nim"
                type="text"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                placeholder="Contoh: 232103817978"
                className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold text-slate-900 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:outline-hidden transition-colors"
              />
              <CreditCard className="w-4 h-4 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1">
              Institusi / Universitas
            </label>
            <div className="relative">
              <input
                id="input-student-institution"
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Contoh: Universitas Negeri Malang"
                className="w-full pl-9 pr-3 py-2 text-xs font-bold text-slate-900 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:outline-hidden transition-colors"
              />
              <School className="w-4 h-4 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="p-3 bg-blue-50 border-2 border-blue-200 text-[11px] text-blue-900 leading-relaxed">
            <span className="font-bold">Info:</span> Nama dan NIM ini akan otomatis tertera saat Anda membuat postingan baru, memberikan tanggapan diskusi, dan pada laporan riwayat perkuliahan.
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2.5 pt-2 border-t-2 border-slate-200">
            <button
              type="button"
              id="btn-cancel-edit-student"
              onClick={onClose}
              className="px-4 py-2 border-2 border-slate-900 text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              id="btn-save-student-profile"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white border-2 border-slate-900 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Identitas</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
