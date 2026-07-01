import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number | null;
  size?: "sm" | "lg";
}

export function ScoreBadge({ score, size = "sm" }: ScoreBadgeProps) {
  if (score === null) {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
        No data
      </span>
    );
  }

  const { bg, text, label, dot } =
    score >= 80
      ? { bg: "bg-emerald-50", text: "text-emerald-800", label: "Excellent", dot: "bg-emerald-500" }
      : score >= 50
      ? { bg: "bg-amber-50", text: "text-amber-800", label: "Needs Attention", dot: "bg-amber-400" }
      : { bg: "bg-red-50", text: "text-red-800", label: "Poor", dot: "bg-red-500" };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold",
        bg,
        text,
        size === "lg" ? "px-4 py-1.5 text-base" : "px-2.5 py-0.5 text-xs"
      )}
    >
      <span className={cn("rounded-full flex-shrink-0", dot, size === "lg" ? "h-2.5 w-2.5" : "h-1.5 w-1.5")} />
      {score}/100 · {label}
    </span>
  );
}
