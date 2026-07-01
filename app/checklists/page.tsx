"use client";

import { useState } from "react";
import { LOCATIONS } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import type { ChecklistRun } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckSquare, Square, CheckCircle2, ListTodo, Pencil, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChecklistsPage() {
  const { checklistTemplates, setChecklistItems } = useStore();

  const [locationId, setLocationId] = useState("");
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [yourName, setYourName] = useState("");
  const [runs, setRuns] = useState<ChecklistRun[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // Edit mode state
  const [editing, setEditing] = useState(false);
  const [draftItems, setDraftItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");

  const items = locationId ? (checklistTemplates[locationId] ?? []) : [];
  const selectedLocation = LOCATIONS.find((l) => l.id === locationId);
  const today = new Date().toISOString().split("T")[0];

  function handleLocationChange(id: string) {
    setLocationId(id);
    setChecked(new Set());
    setEditing(false);
  }

  function toggleItem(item: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(item) ? next.delete(item) : next.add(item);
      return next;
    });
  }

  function handleSubmit() {
    if (!locationId || !yourName.trim() || checked.size === 0) return;
    setRuns((prev) => [
      {
        id: `run-${Date.now()}`,
        locationId,
        date: today,
        completedBy: yourName.trim(),
        checkedItems: [...checked],
        totalItems: items.length,
      },
      ...prev,
    ]);
    setChecked(new Set());
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  }

  // Edit mode handlers
  function startEditing() {
    setDraftItems([...items]);
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setNewItem("");
  }

  function saveEditing() {
    const clean = draftItems.map((s) => s.trim()).filter(Boolean);
    setChecklistItems(locationId, clean);
    setChecked(new Set());
    setEditing(false);
    setNewItem("");
  }

  function addDraftItem() {
    const trimmed = newItem.trim();
    if (!trimmed || trimmed.length > 120) return;
    setDraftItems((prev) => [...prev, trimmed]);
    setNewItem("");
  }

  function removeDraftItem(idx: number) {
    setDraftItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateDraftItem(idx: number, val: string) {
    setDraftItems((prev) => prev.map((item, i) => (i === idx ? val : item)));
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
            onChange={(e) => handleLocationChange(e.target.value)}
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

        {/* Checklist — view mode */}
        {!editing && locationId && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between mb-1">
              <Label>Tasks {items.length > 0 && <span className="font-normal text-slate-400">({checked.size}/{items.length})</span>}</Label>
              <button
                onClick={startEditing}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-purple-600 transition-colors"
              >
                <Pencil className="h-3 w-3" />
                Edit checklist
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <p className="text-sm text-slate-400">No tasks yet for this location.</p>
                <button onClick={startEditing} className="text-sm text-purple-600 hover:text-purple-800 font-medium">
                  + Add tasks
                </button>
              </div>
            ) : (
              items.map((item) => {
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
              })
            )}
          </div>
        )}

        {/* Checklist — edit mode */}
        {editing && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label>Edit Tasks</Label>
              <button onClick={cancelEditing} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              {draftItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateDraftItem(idx, e.target.value)}
                    className="flex-1 text-sm"
                  />
                  <button
                    onClick={() => removeDraftItem(idx)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new item */}
            <div className="flex gap-2">
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Add a task…"
                onKeyDown={(e) => e.key === "Enter" && addDraftItem()}
                className="flex-1 text-sm"
              />
              <Button size="sm" onClick={addDraftItem} disabled={!newItem.trim()} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={cancelEditing}>Cancel</Button>
              <Button className="flex-1" onClick={saveEditing}>Save Checklist</Button>
            </div>
          </div>
        )}

        {/* Submit */}
        {!editing && items.length > 0 && (
          <Button
            onClick={handleSubmit}
            disabled={checked.size === 0 || !yourName.trim() || submitted}
            className={cn("w-full h-11 gap-2 transition-all", submitted && "bg-emerald-600 hover:bg-emerald-600")}
          >
            {submitted
              ? <><CheckCircle2 className="h-4 w-4" /> Checklist Submitted</>
              : checked.size === items.length
                ? "Submit Complete Checklist ✓"
                : `Submit (${checked.size}/${items.length} tasks)`
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
