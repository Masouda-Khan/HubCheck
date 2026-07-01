"use client";

import { useState } from "react";
import { LOCATIONS, CHECKLIST_TEMPLATES } from "@/lib/mock-data";
import type { ChecklistRun } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckSquare, Square, CheckCircle2, ListTodo, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChecklistsPage() {
  const [locationId, setLocationId] = useState("");
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [yourName, setYourName] = useState("");
  const [runs, setRuns] = useState<ChecklistRun[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const items = locationId ? (CHECKLIST_TEMPLATES[locationId] ?? []) : [];
  const selectedLocation = LOCATIONS.find((l) => l.id === locationId);
  const allChecked = items.length > 0 && checked.size === items.length;
  const today = new Date().toISOString().split("T")[0];

  function toggleItem(item: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(item) ? next.delete(item) : next.add(item);
      return next;
    });
  }

  function handleSubmit() {
    if (!locationId || !yourName.trim() || checked.size === 0) return;
    const run: ChecklistRun = {
      id: `run-${Date.now()}`,
      locationId,
      date: today,
      completedBy: yourName.trim(),
      checkedItems: [...checked],
      totalItems: items.length,
    };
    setRuns((prev) => [run, ...prev]);
    setChecked(new Set());
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  }

  const recentRuns = runs.filter((r) => r.locationId === locationId);

  return (
    <div className="p-5 max-w-xl mx-auto">
      <div className="flex items-center gap-2 mb-5">
        <ListTodo className="h-5 w-5" style={{ color: "#7c3aed" }} />
        <h1 className="text-xl font-bold" style={{ color: "#1e1b3a" }}>Cleaning Checklist</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5 flex flex-col gap-5">
        {/* Location */}
        <div className="flex flex-col gap-1.5">
          <Label>Location</Label>
          <select
            value={locationId}
            onChange={(e) => { setLocationId(e.target.value); setChecked(new Set()); }}
            className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-200"
          >
            <option value="">Select a location…</option>
            {LOCATIONS.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cl-name">Your Name</Label>
          <Input id="cl-name" value={yourName} onChange={(e) => setYourName(e.target.value)} placeholder="e.g. Emma" />
        </div>

        {/* Checklist items */}
        {items.length > 0 && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between mb-1">
              <Label>Tasks</Label>
              <span className="text-xs text-slate-400">{checked.size}/{items.length} done</span>
            </div>
            {items.map((item) => {
              const isDone = checked.has(item);
              return (
                <button
                  key={item}
                  onClick={() => toggleItem(item)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors",
                    isDone ? "bg-emerald-50" : "hover:bg-slate-50"
                  )}
                >
                  {isDone
                    ? <CheckSquare className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    : <Square className="h-4 w-4 text-slate-300 flex-shrink-0" />
                  }
                  <span className={cn("text-sm", isDone ? "line-through text-slate-400" : "text-[#1e1b3a]")}>
                    {item}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {locationId && items.length === 0 && (
          <p className="text-sm text-slate-400 italic text-center py-4">No checklist items for this location yet</p>
        )}

        {items.length > 0 && (
          <Button
            onClick={handleSubmit}
            disabled={checked.size === 0 || !yourName.trim() || submitted}
            className={cn("w-full h-11 gap-2 transition-all", submitted && "bg-emerald-600 hover:bg-emerald-600")}
          >
            {submitted
              ? <><CheckCircle2 className="h-4 w-4" /> Checklist Submitted</>
              : allChecked ? "Submit Complete Checklist ✓" : `Submit (${checked.size}/${items.length} tasks)`
            }
          </Button>
        )}
      </div>

      {/* Recent runs */}
      {recentRuns.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Recent · {selectedLocation?.name}</h2>
          <div className="flex flex-col gap-2">
            {recentRuns.map((run) => (
              <div key={run.id} className="bg-white rounded-xl border border-slate-200/70 px-4 py-3 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1e1b3a]">{run.completedBy}</p>
                  <p className="text-xs text-slate-400">{run.checkedItems.length}/{run.totalItems} tasks · {run.date}</p>
                </div>
                {run.checkedItems.length === run.totalItems && (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Full ✓</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
