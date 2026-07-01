"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckSquare, Square, CheckCircle2, ListTodo, Pencil, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Sub-component: only mounts when locationId is set so useQuery always runs
function ChecklistBody({
  locationId,
  locationName,
  yourName,
  canEdit,
}: {
  locationId: string;
  locationName: string;
  yourName: string;
  canEdit: boolean;
}) {
  const items = useQuery(api.checklistTemplates.getByLocation, { locationId: locationId as any });
  const recentRuns = useQuery(api.checklistRuns.getByLocation, { locationId: locationId as any });
  const setForLocation = useMutation(api.checklistTemplates.setForLocation);
  const addRun = useMutation(api.checklistRuns.add);

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftItems, setDraftItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");

  const today = new Date().toISOString().split("T")[0];

  function toggleItem(item: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(item) ? next.delete(item) : next.add(item);
      return next;
    });
  }

  async function handleSubmit() {
    if (!yourName.trim() || checked.size === 0 || !items) return;
    await addRun({
      locationId: locationId as any,
      date: today,
      completedBy: yourName.trim(),
      checkedItems: [...checked],
      totalItems: items.length,
    });
    setChecked(new Set());
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  }

  function startEditing() {
    setDraftItems([...(items ?? [])]);
    setEditing(true);
  }

  async function saveEditing() {
    const clean = draftItems.map((s) => s.trim()).filter(Boolean);
    await setForLocation({ locationId: locationId as any, items: clean });
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

  return (
    <>
      {/* Checklist — view mode */}
      {!editing && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between mb-1">
            <Label>
              Tasks{" "}
              {(items?.length ?? 0) > 0 && (
                <span className="font-normal text-slate-400">({checked.size}/{items?.length})</span>
              )}
            </Label>
            {canEdit && (
              <button onClick={startEditing} className="flex items-center gap-1 text-xs text-slate-400 hover:text-purple-600 transition-colors">
                <Pencil className="h-3 w-3" />Edit checklist
              </button>
            )}
          </div>

          {items === undefined ? (
            <div className="h-24 animate-pulse bg-slate-50 rounded-xl" />
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <p className="text-sm text-slate-400">No tasks yet for this location.</p>
              {canEdit && (
                <button onClick={startEditing} className="text-sm text-purple-600 hover:text-purple-800 font-medium">+ Add tasks</button>
              )}
            </div>
          ) : (
            items.map((item: string) => {
              const isDone = checked.has(item);
              return (
                <button key={item} onClick={() => toggleItem(item)} className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors",
                  isDone ? "bg-emerald-50" : "hover:bg-slate-50"
                )}>
                  {isDone ? <CheckSquare className="h-4 w-4 text-emerald-500 flex-shrink-0" /> : <Square className="h-4 w-4 text-slate-300 flex-shrink-0" />}
                  <span className={cn("text-sm", isDone ? "line-through text-slate-400" : "text-[#1e1b3a]")}>{item}</span>
                </button>
              );
            })
          )}
        </div>
      )}

      {/* Edit mode */}
      {editing && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Label>Edit Tasks</Label>
            <button onClick={() => { setEditing(false); setNewItem(""); }} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {draftItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input value={item} onChange={(e) => setDraftItems((prev) => prev.map((it, i) => i === idx ? e.target.value : it))} className="flex-1 text-sm" />
                <button onClick={() => setDraftItems((prev) => prev.filter((_, i) => i !== idx))} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors flex-shrink-0" aria-label="Remove">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Add a task…" onKeyDown={(e) => e.key === "Enter" && addDraftItem()} className="flex-1 text-sm" />
            <Button size="sm" onClick={addDraftItem} disabled={!newItem.trim()} variant="outline"><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => { setEditing(false); setNewItem(""); }}>Cancel</Button>
            <Button className="flex-1" onClick={saveEditing}>Save Checklist</Button>
          </div>
        </div>
      )}

      {/* Submit */}
      {!editing && (items?.length ?? 0) > 0 && (
        <Button onClick={handleSubmit} disabled={checked.size === 0 || !yourName.trim() || submitted} className={cn("w-full h-11 gap-2 transition-all", submitted && "bg-emerald-600 hover:bg-emerald-600")}>
          {submitted
            ? <><CheckCircle2 className="h-4 w-4" /> Submitted</>
            : checked.size === (items?.length ?? 0)
              ? "Submit Complete Checklist ✓"
              : `Submit (${checked.size}/${items?.length ?? 0} tasks)`
          }
        </Button>
      )}

      {/* Recent runs */}
      {recentRuns && recentRuns.length > 0 && (
        <div className="mt-2 pt-4 border-t border-slate-100 flex flex-col gap-2">
          <p className="text-sm font-semibold text-slate-700 mb-1">Recent · {locationName}</p>
          {recentRuns.map((run: any) => (
            <div key={run._id} className="bg-slate-50 rounded-xl px-4 py-3 flex items-center gap-3">
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
      )}
    </>
  );
}

export default function ChecklistsPage() {
  const { session } = useAuth();
  const locations = useQuery(api.locations.list);

  const [locationId, setLocationId] = useState(
    session?.role === "student" && session.locationId ? session.locationId : ""
  );
  const [yourName, setYourName] = useState(session?.name ?? "");

  const selectedLocation = locations?.find((l: any) => l._id === locationId);

  const canEdit =
    session?.role === "admin" ||
    (session?.role === "student" && session.locationId === locationId);

  return (
    <div className="p-5 max-w-xl mx-auto">
      <div className="flex items-center gap-2 mb-5">
        <ListTodo className="h-5 w-5" style={{ color: "#7c3aed" }} />
        <h1 className="text-xl font-bold" style={{ color: "#1e1b3a" }}>Cleaning Checklist</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label>Location</Label>
          <select
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-200"
          >
            <option value="">Select a location…</option>
            {locations?.map((l: any) => (
              <option key={l._id} value={l._id}>{l.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Your Name</Label>
          <Input value={yourName} onChange={(e) => setYourName(e.target.value)} placeholder="e.g. Emma" />
        </div>

        {locationId && selectedLocation ? (
          <ChecklistBody
            key={locationId}
            locationId={locationId}
            locationName={selectedLocation.name}
            yourName={yourName}
            canEdit={canEdit}
          />
        ) : locationId ? (
          <div className="h-24 animate-pulse bg-slate-50 rounded-xl" />
        ) : null}
      </div>
    </div>
  );
}
