import React, { useState } from "react";
import { X, Edit3, CheckCircle2, AlertCircle } from "lucide-react";
import { DiscussionPost } from "../types";

interface EditPostModalProps {
  post: DiscussionPost | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (postId: string, newContent: string) => void;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({
  post,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !post) return null;

  const [content, setContent] = useState(post.content);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrorMsg("Isi postingan tidak boleh kosong.");
      return;
    }
    setErrorMsg("");
    onSave(post.id, content.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white border-2 border-slate-900 shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-5 py-4 bg-slate-950 text-white flex items-center justify-between border-b-2 border-slate-900">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-blue-600 flex items-center justify-center text-white font-bold">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white">EDIT ISI POSTINGAN</h3>
              <p className="text-xs text-slate-400 font-medium">{post.authorName} • {post.sessionTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-900 mb-1.5">
              ISI POSTINGAN ({post.postType})
            </label>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              className={`w-full p-3.5 text-xs sm:text-sm text-slate-900 bg-white border-2 ${
                errorMsg ? "border-rose-600" : "border-slate-300"
              } focus:border-blue-600 focus:outline-hidden font-medium`}
              required
            />
            {errorMsg && (
              <p className="mt-1.5 text-xs text-rose-600 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorMsg}</span>
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t-2 border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 bg-white border-2 border-slate-300 cursor-pointer"
            >
              BATAL
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>SIMPAN PERUBAHAN</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
