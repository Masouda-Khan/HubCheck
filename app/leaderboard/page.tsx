"use client";

import { DASHBOARD_DATA } from "@/lib/mock-data";
import { Trophy, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const MEDALS = ["🥇", "🥈", "🥉"];
const PODIUM_ORDER = [1, 0, 2]; // left=2nd, center=1st, right=3rd
const STEP_HEIGHTS = ["h-5", "h-9", "h-3"];
const STEP_COLORS = ["bg-slate-200", "bg-amber-200", "bg-orange-200"];
const CARD_RINGS = ["ring-1 ring-slate-300", "ring-2 ring-amber-300", "ring-1 ring-orange-300"];

function avgColor(avg: number | null) {
  if (avg === null) return "text-slate-400";
  if (avg >= 4.0) return "text-emerald-600";
  if (avg >= 2.5) return "text-orange-600";
  return "text-red-600";
}

export default function LeaderboardPage() {
  const ranked = [...DASHBOARD_DATA]
    .filter((l) => l.averageRating !== null)
    .sort((a, b) => b.averageRating! - a.averageRating!)
    .concat(DASHBOARD_DATA.filter((l) => l.averageRating === null));

  return (
    <div className="p-5 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="h-5 w-5" style={{ color: "#7c3aed" }} />
        <h1 className="text-xl font-bold" style={{ color: "#1e1b3a" }}>Leaderboard</h1>
      </div>

      {/* Podium — top 3 */}
      {ranked.length >= 3 && (
        <div className="flex items-end gap-2 mb-6">
          {PODIUM_ORDER.map((rankIdx, i) => {
            const loc = ranked[rankIdx];
            return (
              <div key={loc.id} className="flex-1 flex flex-col items-center">
                <div className={cn("w-full bg-white rounded-xl p-2.5 text-center mb-1.5 shadow-sm", CARD_RINGS[i])}>
                  <div className="text-xl mb-0.5">{MEDALS[rankIdx]}</div>
                  <p className="text-xs font-semibold text-[#1e1b3a] leading-snug line-clamp-2">
                    {loc.name}
                  </p>
                  {loc.averageRating !== null && (
                    <p className={cn("text-xs font-bold mt-0.5", avgColor(loc.averageRating))}>
                      {loc.averageRating.toFixed(1)}★
                    </p>
                  )}
                </div>
                <div className={cn("w-full rounded-t-md", STEP_HEIGHTS[i], STEP_COLORS[i])} />
              </div>
            );
          })}
        </div>
      )}

      {/* Full rankings */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        {ranked.map((loc, idx) => (
          <div
            key={loc.id}
            className={cn("flex items-center gap-3 px-4 py-3.5", idx !== 0 && "border-t border-slate-100")}
          >
            <span className="w-7 text-center flex-shrink-0 text-sm font-bold text-slate-400">
              {idx < 3 ? MEDALS[idx] : idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1e1b3a] truncate">{loc.name}</p>
              {loc.leaders.length > 0 && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Crown className="h-3 w-3 text-amber-500 flex-shrink-0" />
                  <span className="text-xs text-slate-500 truncate">
                    {loc.leaders.map((l) => l.studentName).join(", ")}
                  </span>
                </div>
              )}
            </div>
            {loc.averageRating !== null && (
              <span className={cn("text-sm font-bold flex-shrink-0", avgColor(loc.averageRating))}>
                {loc.averageRating.toFixed(1)}★
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
