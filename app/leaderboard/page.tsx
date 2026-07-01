"use client";

import { DASHBOARD_DATA } from "@/lib/mock-data";
import { ScoreBadge } from "@/components/score-badge";
import { Trophy, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const ranked = [...DASHBOARD_DATA]
    .filter((l) => l.score !== null)
    .sort((a, b) => b.score! - a.score!)
    .concat(DASHBOARD_DATA.filter((l) => l.score === null));

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="h-5 w-5 text-blue-600" />
        <h1 className="text-2xl font-bold text-slate-900">Leaderboard</h1>
      </div>

      {/* Podium — top 3 */}
      {ranked.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[ranked[1], ranked[0], ranked[2]].map((loc, podiumIdx) => {
            const realRank = podiumIdx === 0 ? 2 : podiumIdx === 1 ? 1 : 3;
            const heights = ["h-20", "h-28", "h-16"];
            const bg =
              realRank === 1
                ? "bg-amber-50 border-amber-300"
                : realRank === 2
                ? "bg-slate-50 border-slate-300"
                : "bg-orange-50 border-orange-200";
            return (
              <div
                key={loc.id}
                className={cn(
                  "rounded-2xl border flex flex-col items-center justify-end pb-4 px-2 text-center",
                  heights[podiumIdx],
                  bg
                )}
              >
                <span className="text-2xl mb-1">{MEDALS[realRank - 1]}</span>
                <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2">
                  {loc.name}
                </p>
                {loc.score !== null && (
                  <p className="text-xs text-slate-500 mt-0.5">{loc.score}/100</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Full rankings */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {ranked.map((loc, idx) => (
          <div
            key={loc.id}
            className={cn(
              "flex items-center gap-4 px-5 py-3.5",
              idx !== 0 && "border-t border-slate-100",
              idx < 3 && "bg-slate-50/50"
            )}
          >
            <span className="w-6 text-center text-sm font-bold text-slate-400 flex-shrink-0">
              {idx < 3 ? MEDALS[idx] : idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{loc.name}</p>
              {loc.leaders.length > 0 && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Crown className="h-3 w-3 text-amber-500" />
                  <span className="text-xs text-slate-500 truncate">
                    {loc.leaders.map((l) => l.studentName).join(", ")}
                  </span>
                </div>
              )}
            </div>
            <ScoreBadge score={loc.score} />
          </div>
        ))}
      </div>
    </div>
  );
}
