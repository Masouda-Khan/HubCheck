"use client";

import { useState } from "react";
import { DASHBOARD_DATA } from "@/lib/mock-data";
import { StarRating } from "@/components/star-rating";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LocationWithData } from "@/lib/types";

function getStatus(avg: number | null) {
  if (avg === null) return { border: "border-l-slate-300", pill: "bg-slate-100 text-slate-400", label: "—" };
  if (avg >= 4.0) return { border: "border-l-emerald-400", pill: "bg-emerald-100 text-emerald-700", label: avg.toFixed(1) };
  if (avg >= 2.5) return { border: "border-l-orange-400", pill: "bg-orange-100 text-orange-700", label: avg.toFixed(1) };
  return { border: "border-l-red-400", pill: "bg-red-100 text-red-700", label: avg.toFixed(1) };
}

function LocationCard({ loc }: { loc: LocationWithData }) {
  const status = getStatus(loc.averageRating);

  return (
    <div className={cn("bg-white rounded-2xl border border-slate-200/70 border-l-4 shadow-sm p-4 flex flex-col gap-2.5", status.border)}>
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold text-[#1e1b3a] text-sm leading-snug">{loc.name}</p>
        <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0", status.pill)}>
          {status.label}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {loc.latestRating !== null ? (
          <StarRating value={loc.latestRating} readonly size="sm" />
        ) : (
          <span className="text-xs text-slate-400 italic">No inspections</span>
        )}
        {loc.averageRating !== null && loc.inspectionCount > 1 && (
          <span className="text-xs text-slate-400">{loc.averageRating.toFixed(1)} avg</span>
        )}
      </div>

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

  const withRatings = data.filter((l) => l.averageRating !== null);
  const overallAvg =
    withRatings.length > 0
      ? (withRatings.reduce((s, l) => s + l.averageRating!, 0) / withRatings.length).toFixed(1)
      : null;

  return (
    <div className="p-5 max-w-5xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold" style={{ color: "#1e1b3a" }}>Innovation Hub</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {data.length} locations
          {overallAvg && (
            <> · <span style={{ color: "#2563eb" }}>{overallAvg}★</span> avg</>
          )}
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
