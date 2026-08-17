import React from "react";

interface BloomBadgeProps {
  level: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export const BloomBadge: React.FC<BloomBadgeProps> = ({
  level,
  size = "md",
}) => {
  let colorClasses = "bg-blue-50 text-blue-700 border-blue-200";

  if (level.includes("C1") || level.toLowerCase().includes("mengingat")) {
    colorClasses = "bg-slate-100 text-slate-700 border-slate-300";
  } else if (level.includes("C2") || level.toLowerCase().includes("memahami")) {
    colorClasses = "bg-sky-50 text-sky-700 border-sky-200";
  } else if (level.includes("C3") || level.toLowerCase().includes("menerapkan")) {
    colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (level.includes("C4") || level.toLowerCase().includes("menganalisis")) {
    colorClasses = "bg-indigo-50 text-indigo-700 border-indigo-200";
  } else if (level.includes("C5") || level.toLowerCase().includes("mengevaluasi")) {
    colorClasses = "bg-amber-50 text-amber-800 border-amber-300";
  } else if (level.includes("C6") || level.toLowerCase().includes("menciptakan")) {
    colorClasses = "bg-cyan-50 text-cyan-800 border-cyan-300";
  }

  const sizeClasses =
    size === "sm"
      ? "text-xs px-2 py-0.5"
      : size === "lg"
      ? "text-sm px-3 py-1 font-semibold"
      : "text-xs px-2.5 py-1 font-medium";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border font-medium ${colorClasses} ${sizeClasses} whitespace-nowrap`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {level}
    </span>
  );
};
