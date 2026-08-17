import React from "react";

interface UmlogoProps {
  className?: string;
}

export const Umlogo: React.FC<UmlogoProps> = ({ className = "" }) => {
  return (
    <div
      className={`inline-flex items-center justify-center bg-white px-3 py-1.5 border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] select-none shrink-0 transition-transform hover:-translate-y-0.5 ${className}`}
      title="Universitas Negeri Malang - Excellence in Learning Innovation"
    >
      <img
        src="https://brand.um.ac.id/wp-content/uploads/2025/04/Artboarggggggggggd-1-100.jpg"
        alt="Universitas Negeri Malang - Excellence in Learning Innovation"
        className="h-12 sm:h-14 md:h-15 w-auto max-w-[220px] sm:max-w-[260px] object-contain shrink-0"
        loading="eager"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
