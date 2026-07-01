"use client";

import { useState } from "react";
import { DASHBOARD_DATA } from "@/lib/mock-data";
import { StarRating } from "@/components/star-rating";
import { Crown, Users, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LocationWithData } from "@/lib/types";

function scoreColor(score: number | null) {
  if (score === null) return { bar: "bg-slate-300", badge: "bg-slate-100 text-slate-500", label: "No data" };
  if (score >= 80) return { bar: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700", label: "Excellent" };
  if (score >= 50) return { bar: "bg-amber-400", badge: "bg-amber-50 text-amber-700", label: "Needs Attention" };
  return { bar: "bg-red-500", badge: "bg-red-50 text-red-700", label: "Poor" };
}

function LocationCard({ loc }: { loc: LocationWithData }) {
  const colors = scoreColor(loc.score);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col">
      {/* Color bar */}
      <div className={cn("h-1", colors.bar)} />

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Name + status badge */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[#1e1b3a] leading-snug text-sm">{loc.name}</h3>
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0", colors.badge)}>
            {colors.label}
          </span>
        </div>

        {/* Stars — latest inspection */}
        <div>
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mb-1.5">Latest</p>
          {loc.latestRating !== null ? (
            <StarRating value={loc.latestRating} readonly />
          ) : (
            <p className="text-xs text-slate-400 italic">No inspections yet</p>
          )}
        </div>

        {/* Average */}
        {loc.averageRating !== null && (
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold" style={{ color: "#2563eb" }}>
              {loc.averageRating.toFixed(1)}
            </span>
            <span className="text-sm text-slate-400">/ 5</span>
            <span className="text-xs text-slate-400 ml-1">
              avg · {loc.inspectionCount} {loc.inspectionCount === 1 ? "check" : "checks"}
            </span>
          </div>
        )}

        {/* Leaders + members */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
          {loc.leaders.length > 0 && (
            <div className="flex items-start gap-1.5">
              <Crown className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-[#1e1b3a] font-medium leading-snug">
                {loc.leaders.map((l) => l.studentName).join(", ")}
              </span>
            </div>
          )}
          {loc.members.length > 0 && (
            <div className="flex items-start gap-1.5">
              <Users className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-slate-500 leading-snug">
                {loc.members.map((m) => m.studentName).join(", ")}
              </span>
            </div>
          )}
          {loc.leaders.length === 0 && loc.members.length === 0 && (
            <p className="text-xs text-slate-400 italic">No one assigned</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-slate-100 flex items-center gap-1.5 bg-slate-50/80">
        <CalendarDays className="h-3 w-3 text-slate-400" />
        <span className="text-xs text-slate-400">
          {loc.latestInspection
            ? `Inspected ${loc.latestInspection.date}`
            : "Never inspected"}
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data] = useState(DASHBOARD_DATA);

  const withScores = data.filter((l) => l.score !== null);
  const avg = withScores.length
    ? Math.round(withScores.reduce((s, l) => s + l.score!, 0) / withScores.length)
    : null;
  const excellent = data.filter((l) => l.score !== null && l.score >= 80).length;
  const poor = data.filter((l) => l.score !== null && l.score < 50).length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#1e1b3a" }}>Innovation Hub</h1>
        <p className="text-sm text-slate-500 mt-0.5">Workspace cleanliness overview</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Locations", value: data.length, color: "#1e1b3a" },
          { label: "Avg Score", value: avg !== null ? `${avg}/100` : "—", color: "#2563eb" },
          { label: "Excellent", value: excellent, color: "#059669" },
          { label: "Poor", value: poor, color: "#dc2626" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200/60 px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-500 mb-0.5">{label}</p>
            <p className="text-xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((loc) => (
          <LocationCard key={loc.id} loc={loc} />
        ))}
      </div>
    </div>
  );
}
