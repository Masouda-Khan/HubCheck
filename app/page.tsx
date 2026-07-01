"use client";

import { useState } from "react";
import { DASHBOARD_DATA } from "@/lib/mock-data";
import { StarRating } from "@/components/star-rating";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LocationWithData } from "@/lib/types";

function scorePill(score: number | null) {
  if (score === null) return { bg: "bg-slate-100", text: "text-slate-400", label: "—" };
  if (score >= 80) return { bg: "bg-emerald-100", text: "text-emerald-700", label: String(score) };
  if (score >= 50) return { bg: "bg-amber-100", text: "text-amber-700", label: String(score) };
  return { bg: "bg-red-100", text: "text-red-700", label: String(score) };
}

function borderColor(score: number | null) {
  if (score === null) return "border-l-slate-300";
  if (score >= 80) return "border-l-emerald-400";
  if (score >= 50) return "border-l-amber-400";
  return "border-l-red-400";
}

function LocationCard({ loc }: { loc: LocationWithData }) {
  const pill = scorePill(loc.score);

  return (
    <div className={cn("bg-white rounded-2xl border border-slate-200/70 border-l-4 shadow-sm p-4 flex flex-col gap-2.5", borderColor(loc.score))}>
      {/* Row 1: name + score */}
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold text-[#1e1b3a] text-sm leading-snug">{loc.name}</p>
        <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 tabular-nums", pill.bg, pill.text)}>
          {pill.label}
        </span>
      </div>

      {/* Row 2: stars + avg */}
      <div className="flex items-center gap-2">
        {loc.latestRating !== null ? (
          <StarRating value={loc.latestRating} readonly size="sm" />
        ) : (
          <span className="text-xs text-slate-400 italic">No inspections</span>
        )}
        {loc.averageRating !== null && (
          <span className="text-xs text-slate-400">{loc.averageRating.toFixed(1)} avg</span>
        )}
      </div>

      {/* Row 3: leader */}
      {loc.leaders.length > 0 ? (
        <div className="flex items-center gap-1.5">
          <Crown className="h-3 w-3 text-amber-500 flex-shrink-0" />
          <span className="text-xs text-slate-600 truncate">
            {loc.leaders.map((l) => l.studentName).join(", ")}
          </span>
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">No leader assigned</p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [data] = useState(DASHBOARD_DATA);

  const withScores = data.filter((l) => l.averageRating !== null);
  const avgStar =
    withScores.length > 0
      ? (withScores.reduce((s, l) => s + (l.averageRating ?? 0), 0) / withScores.length).toFixed(1)
      : null;

  return (
    <div className="p-5 max-w-5xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold" style={{ color: "#1e1b3a" }}>Innovation Hub</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {data.length} locations
          {avgStar && <> · <span style={{ color: "#2563eb" }}>{avgStar}★</span> avg</>}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.map((loc) => (
          <LocationCard key={loc.id} loc={loc} />
        ))}
      </div>
    </div>
  );
}
