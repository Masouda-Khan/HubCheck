"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy, Crown, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";

const MEDALS = ["🥇", "🥈", "🥉"];
const PODIUM_ORDER = [1, 0, 2];
const STEP_HEIGHTS = ["h-5", "h-9", "h-3"];
const STEP_COLORS = ["bg-slate-200", "bg-amber-200", "bg-orange-200"];
const CARD_RINGS = ["ring-1 ring-slate-300", "ring-2 ring-amber-300", "ring-1 ring-orange-300"];

function avgColor(avg: number | null) {
  if (avg === null) return "text-slate-400";
  if (avg >= 4.0) return "text-emerald-500";
  if (avg >= 2.5) return "text-amber-500";
  return "text-rose-400";
}

function ShoutoutDialog({ open, onClose, locations }: { open: boolean; onClose: () => void; locations: any[] }) {
  const { session } = useAuth();
  const addShoutout = useMutation(api.shoutouts.add);
  const [locationId, setLocationId] = useState("");
  const [message, setMessage] = useState("");
  const [givenBy, setGivenBy] = useState(session?.name ?? "");

  async function submit() {
    if (!locationId || !message.trim() || !givenBy.trim()) return;
    await addShoutout({ locationId: locationId as any, message: message.trim(), givenBy: givenBy.trim() });
    setLocationId(""); setMessage("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Give a Shoutout 🎉</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4 pt-1">
          <div className="flex flex-col gap-1.5">
            <Label>Location</Label>
            <select value={locationId} onChange={(e) => setLocationId(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-200">
              <option value="">Select a location…</option>
              {locations.map((l: any) => <option key={l._id} value={l._id}>{l.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Your Name</Label>
            <Input value={givenBy} onChange={(e) => setGivenBy(e.target.value)} placeholder="e.g. Admin" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Message</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Great job keeping the area clean this week!" rows={3} className="resize-none" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={submit} disabled={!locationId || !message.trim() || !givenBy.trim()}>Send 🎉</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function LeaderboardPage() {
  const locationData = useQuery(api.dashboard.getData);
  const shoutouts = useQuery(api.shoutouts.list);
  const [shoutoutOpen, setShoutoutOpen] = useState(false);

  const locs = locationData ?? [];
  const ranked = [...locs]
    .filter((l: any) => l.averageRating !== null)
    .sort((a: any, b: any) => b.averageRating - a.averageRating)
    .concat(locs.filter((l: any) => l.averageRating === null));

  function locationName(id: string) {
    return locs.find((l: any) => l._id === id)?.name ?? id;
  }

  return (
    <div className="p-5 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="h-5 w-5" style={{ color: "#7c3aed" }} />
        <h1 className="text-xl font-bold" style={{ color: "#1e1b3a" }}>Leaderboard</h1>
      </div>

      {locationData === undefined ? (
        <div className="h-48 animate-pulse bg-white/60 rounded-2xl border border-slate-200/70 mb-6" />
      ) : ranked.length >= 3 ? (
        <div className="flex items-end gap-2 mb-6">
          {PODIUM_ORDER.map((rankIdx, i) => {
            const loc = ranked[rankIdx];
            if (!loc) return null;
            return (
              <div key={loc._id} className="flex-1 flex flex-col items-center">
                <div className={cn("w-full bg-white rounded-xl p-2.5 text-center mb-1.5 shadow-sm", CARD_RINGS[i])}>
                  <div className="text-xl mb-0.5">{MEDALS[rankIdx]}</div>
                  <p className="text-xs font-semibold text-[#1e1b3a] leading-snug line-clamp-2">{loc.name}</p>
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
      ) : null}

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden mb-5">
        {ranked.map((loc: any, idx: number) => (
          <div key={loc._id} className={cn("flex items-center gap-3 px-4 py-3.5", idx !== 0 && "border-t border-slate-100")}>
            <span className="w-7 text-center flex-shrink-0 text-sm font-bold text-slate-400">
              {idx < 3 ? MEDALS[idx] : idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1e1b3a] truncate">{loc.name}</p>
              {loc.leaders.length > 0 && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Crown className="h-3 w-3 flex-shrink-0" style={{ color: "#7c3aed" }} />
                  <span className="text-xs text-slate-500 truncate">{loc.leaders.map((l: any) => l.studentName).join(", ")}</span>
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

      {shoutouts && shoutouts.length > 0 && (
        <div className="mb-4 flex flex-col gap-2">
          <p className="text-sm font-semibold text-slate-700">Shoutouts 🎉</p>
          {shoutouts.slice(0, 5).map((s: any) => (
            <div key={s._id} className="bg-white rounded-xl border border-slate-200/70 px-4 py-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold" style={{ color: "#7c3aed" }}>{locationName(s.locationId)}</span>
                <span className="text-xs text-slate-400">{s.givenBy}</span>
              </div>
              <p className="text-sm text-slate-700">{s.message}</p>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => setShoutoutOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-500 hover:border-purple-300 hover:text-purple-600 transition-colors">
        <PartyPopper className="h-4 w-4" />Give a Shoutout
      </button>

      <ShoutoutDialog open={shoutoutOpen} onClose={() => setShoutoutOpen(false)} locations={locs} />
    </div>
  );
}
