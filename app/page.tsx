"use client";

import { useState } from "react";
import { DASHBOARD_DATA } from "@/lib/mock-data";
import { ScoreBadge } from "@/components/score-badge";
import { Crown, Users, CalendarDays, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LocationWithData } from "@/lib/types";

function LocationCard({ loc }: { loc: LocationWithData }) {
  const borderColor =
    loc.score === null
      ? "border-slate-200"
      : loc.score >= 80
      ? "border-emerald-200"
      : loc.score >= 50
      ? "border-amber-200"
      : "border-red-200";

  const accentBg =
    loc.score === null
      ? "bg-slate-50"
      : loc.score >= 80
      ? "bg-emerald-50"
      : loc.score >= 50
      ? "bg-amber-50"
      : "bg-red-50";

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col",
        borderColor
      )}
    >
      <div className={cn("px-4 pt-4 pb-3", accentBg)}>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900 text-sm leading-snug">{loc.name}</h3>
          <ScoreBadge score={loc.score} />
        </div>
      </div>
      <div className="px-4 py-3 flex flex-col gap-2 flex-1">
        {loc.leaders.length > 0 && (
          <div className="flex items-start gap-2">
            <Crown className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-slate-700">
              {loc.leaders.map((l) => l.studentName).join(", ")}
            </span>
          </div>
        )}
        {loc.members.length > 0 && (
          <div className="flex items-start gap-2">
            <Users className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-slate-500">
              {loc.members.map((m) => m.studentName).join(", ")}
            </span>
          </div>
        )}
        {loc.leaders.length === 0 && loc.members.length === 0 && (
          <p className="text-xs text-slate-400 italic">No one assigned</p>
        )}
      </div>
      <div className="px-4 py-2.5 border-t border-slate-100 flex items-center gap-1.5">
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

  const total = data.length;
  const excellent = data.filter((l) => l.score !== null && l.score >= 80).length;
  const poor = data.filter((l) => l.score !== null && l.score < 50).length;
  const avg =
    data.filter((l) => l.score !== null).length > 0
      ? Math.round(
          data
            .filter((l) => l.score !== null)
            .reduce((s, l) => s + l.score!, 0) /
            data.filter((l) => l.score !== null).length
        )
      : null;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="h-5 w-5 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-900">Innovation Hub</h1>
        </div>
        <p className="text-sm text-slate-500">Workspace cleanliness overview</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Locations", value: total, color: "text-slate-900" },
          { label: "Avg Score", value: avg !== null ? `${avg}/100` : "—", color: "text-blue-700" },
          { label: "Excellent", value: excellent, color: "text-emerald-700" },
          { label: "Poor", value: poor, color: "text-red-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-500 mb-0.5">{label}</p>
            <p className={cn("text-xl font-bold", color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Location cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((loc) => (
          <LocationCard key={loc.id} loc={loc} />
        ))}
      </div>
    </div>
  );
}
