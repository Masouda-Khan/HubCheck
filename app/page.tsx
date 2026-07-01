"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { LOCATIONS } from "@/lib/mock-data";
import { StarRating } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Crown, Flag, AlertTriangle, HandHelping, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LocationWithData, Flag as FlagType } from "@/lib/types";

function getStatus(avg: number | null) {
  if (avg === null) return { border: "border-l-slate-300", pill: "bg-slate-100 text-slate-400" };
  if (avg >= 4.0) return { border: "border-l-emerald-400", pill: "bg-emerald-100 text-emerald-700" };
  if (avg >= 2.5) return { border: "border-l-orange-400", pill: "bg-orange-100 text-orange-700" };
  return { border: "border-l-red-400", pill: "bg-red-100 text-red-700" };
}

const PRIORITY_STYLES = {
  safety: { label: "Safety", bg: "bg-red-100 text-red-700" },
  high: { label: "High", bg: "bg-amber-100 text-amber-700" },
  low: { label: "Low", bg: "bg-slate-100 text-slate-600" },
};

// ─── Flag Dialog ────────────────────────────────────────────────
function FlagDialog({
  locationId,
  locationName,
  open,
  onClose,
}: {
  locationId: string;
  locationName: string;
  open: boolean;
  onClose: () => void;
}) {
  const { addFlag } = useStore();
  const [reason, setReason] = useState("");
  const [priority, setPriority] = useState<FlagType["priority"]>("high");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function submit() {
    if (!reason.trim() || !name.trim()) { setError("Please fill in all fields"); return; }
    addFlag({
      id: `flag-${Date.now()}`,
      locationId,
      reason: reason.trim(),
      priority,
      flaggedBy: name.trim(),
      createdAt: new Date().toISOString().split("T")[0],
      resolved: false,
      volunteers: [],
    });
    setReason(""); setName(""); setError("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Flag · {locationName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="flag-name">Your Name</Label>
            <Input id="flag-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jordan" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="flag-reason">Reason</Label>
            <Textarea id="flag-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Describe the issue…" rows={3} className="resize-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Priority</Label>
            <div className="flex gap-2">
              {(["low", "high", "safety"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors capitalize",
                    priority === p
                      ? p === "safety" ? "bg-red-500 text-white border-red-500"
                        : p === "high" ? "bg-amber-400 text-white border-amber-400"
                        : "bg-slate-700 text-white border-slate-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  )}
                >
                  {p === "safety" ? "🚨 Safety" : p === "high" ? "⚠️ High" : "Low"}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={submit}>Submit Flag</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Volunteer Dialog ────────────────────────────────────────────
function VolunteerDialog({
  flag,
  locationName,
  open,
  onClose,
}: {
  flag: FlagType;
  locationName: string;
  open: boolean;
  onClose: () => void;
}) {
  const { volunteerForFlag } = useStore();
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);

  function submit() {
    if (!name.trim()) return;
    volunteerForFlag(flag.id, name.trim());
    setDone(true);
    setTimeout(() => { setDone(false); setName(""); onClose(); }, 1500);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Volunteer to Help</DialogTitle>
        </DialogHeader>
        {done ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            <p className="text-sm font-medium text-slate-700">Thanks for helping!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pt-1">
            <p className="text-sm text-slate-600">
              <span className="font-medium">{locationName}</span> — {flag.reason}
            </p>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vol-name">Your Name</Label>
              <Input id="vol-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Marco" onKeyDown={(e) => e.key === "Enter" && submit()} autoFocus />
            </div>
            <Button onClick={submit} disabled={!name.trim()}>I can help</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Help Needed Section ─────────────────────────────────────────
function HelpNeeded() {
  const { flags, resolveFlag, locationData } = useStore();
  const [volunteerFlag, setVolunteerFlag] = useState<FlagType | null>(null);

  const activeFlags = [...flags.filter((f) => !f.resolved)].sort((a, b) =>
    a.priority === "safety" ? -1 : b.priority === "safety" ? 1 : 0
  );

  if (!activeFlags.length) return null;

  return (
    <div className="mb-5 bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-100 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <span className="text-sm font-semibold text-amber-800">Help Needed · {activeFlags.length}</span>
      </div>
      <div className="divide-y divide-slate-100">
        {activeFlags.map((flag) => {
          const loc = locationData.find((l) => l.id === flag.locationId);
          const style = PRIORITY_STYLES[flag.priority];
          return (
            <div key={flag.id} className="px-4 py-3 flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0", style.bg)}>
                  {style.label}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1e1b3a]">{loc?.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{flag.reason}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Flagged by {flag.flaggedBy}</p>
                  {flag.volunteers.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {flag.volunteers.map((v) => (
                        <span key={v} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                          ✓ {v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setVolunteerFlag(flag)}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#7c3aed] hover:text-[#4c1d95] transition-colors py-1"
                >
                  <HandHelping className="h-3.5 w-3.5" />
                  I can help
                </button>
                <button
                  onClick={() => resolveFlag(flag.id)}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-emerald-600 transition-colors py-1 ml-auto"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Resolve
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {volunteerFlag && (
        <VolunteerDialog
          flag={volunteerFlag}
          locationName={locationData.find((l) => l.id === volunteerFlag.locationId)?.name ?? ""}
          open={true}
          onClose={() => setVolunteerFlag(null)}
        />
      )}
    </div>
  );
}

// ─── Location Card ───────────────────────────────────────────────
function LocationCard({ loc }: { loc: LocationWithData }) {
  const [flagOpen, setFlagOpen] = useState(false);
  const status = getStatus(loc.averageRating);

  return (
    <>
      <div className={cn("bg-white rounded-2xl border border-slate-200/70 border-l-4 shadow-sm flex flex-col", status.border)}>
        <div className="p-4 flex flex-col gap-2.5 flex-1">
          {/* Row 1: name + avg pill */}
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-[#1e1b3a] text-sm leading-snug">{loc.name}</p>
            {loc.averageRating !== null && (
              <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0", status.pill)}>
                {loc.averageRating.toFixed(1)} avg
              </span>
            )}
          </div>

          {/* Row 2: stars */}
          <div className="flex items-center gap-2">
            {loc.latestRating !== null
              ? <StarRating value={loc.latestRating} readonly size="sm" />
              : <span className="text-xs text-slate-400 italic">No inspections</span>
            }
            {loc.averageRating !== null && loc.inspectionCount > 1 && (
              <span className="text-xs text-slate-400">{loc.averageRating.toFixed(1)} avg</span>
            )}
          </div>

          {/* Row 3: leader */}
          {loc.leaders.length > 0 ? (
            <div className="flex items-center gap-1.5">
              <Crown className="h-3 w-3 flex-shrink-0 text-yellow-500" />
              <span className="text-xs text-slate-600 truncate">{loc.leaders.map((l) => l.studentName).join(", ")}</span>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No leader assigned</p>
          )}
        </div>

        {/* Card footer action */}
        <div className="px-4 py-2 border-t border-slate-100">
          <button
            onClick={() => setFlagOpen(true)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
          >
            <Flag className="h-3 w-3" />
            Flag issue
          </button>
        </div>
      </div>

      <FlagDialog
        locationId={loc.id}
        locationName={loc.name}
        open={flagOpen}
        onClose={() => setFlagOpen(false)}
      />
    </>
  );
}

// ─── Page ────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { locationData, inspections } = useStore();

  const withRatings = locationData.filter((l) => l.averageRating !== null);
  const overallAvg =
    withRatings.length > 0
      ? (withRatings.reduce((s, l) => s + l.averageRating!, 0) / withRatings.length).toFixed(1)
      : null;

  const today = new Date().toISOString().split("T")[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
  const overdueCount = locationData.filter(
    (l) => !inspections.some((i) => i.locationId === l.id && i.date >= sevenDaysAgo)
  ).length;

  return (
    <div className="p-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold" style={{ color: "#1e1b3a" }}>Innovation Hub</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {locationData.length} locations
          {overallAvg && <> · <span style={{ color: "#2563eb" }}>{overallAvg}★</span> avg</>}
        </p>
      </div>

      {/* Reminder banner */}
      {overdueCount > 0 && (
        <div className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
          <span>⏰</span>
          <span>
            <span className="font-semibold">{overdueCount} location{overdueCount > 1 ? "s" : ""}</span> haven't been inspected this week
          </span>
        </div>
      )}

      {/* Help Needed */}
      <HelpNeeded />

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {locationData.map((loc) => (
          <LocationCard key={loc.id} loc={loc} />
        ))}
      </div>
    </div>
  );
}
