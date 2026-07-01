"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, ChevronDown, Crown, UserMinus, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

function LocationRow({ loc, students }: { loc: any; students: any[] }) {
  const getByLocation = useQuery(api.assignments.getByLocation, { locationId: loc._id });
  const setForLocation = useMutation(api.assignments.setForLocation);
  const updateLocation = useMutation(api.locations.update);
  const removeLocation = useMutation(api.locations.remove);

  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [nameInput, setNameInput] = useState(loc.name);
  const [nameError, setNameError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [isLeaderToggle, setIsLeaderToggle] = useState(false);

  const assignments = getByLocation ?? [];
  const leaders = assignments.filter((a: any) => a.isLeader);
  const activeStudents = students.filter((s: any) => s.isActive);
  const assigned = new Set(assignments.map((a: any) => a.studentId));
  const unassigned = activeStudents.filter((s: any) => !assigned.has(s._id));

  async function handleSave() {
    const trimmed = nameInput.trim();
    if (!trimmed) { setNameError("Name is required"); return; }
    await updateLocation({ id: loc._id, name: trimmed });
    setEditOpen(false);
  }

  async function addAssignment() {
    if (!selectedStudent) return;
    const next = [...assignments.map((a: any) => ({ studentId: a.studentId, isLeader: a.isLeader })), { studentId: selectedStudent, isLeader: isLeaderToggle }];
    await setForLocation({ locationId: loc._id, assignments: next });
    setSelectedStudent(""); setIsLeaderToggle(false);
  }

  async function removeAssignment(studentId: string) {
    const next = assignments.filter((a: any) => a.studentId !== studentId).map((a: any) => ({ studentId: a.studentId, isLeader: a.isLeader }));
    await setForLocation({ locationId: loc._id, assignments: next });
  }

  async function toggleLeader(studentId: string) {
    const next = assignments.map((a: any) => ({ studentId: a.studentId, isLeader: a.studentId === studentId ? !a.isLeader : a.isLeader }));
    await setForLocation({ locationId: loc._id, assignments: next });
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center px-4 py-3.5 gap-3">
        <button className="flex-1 flex items-center gap-3 text-left min-w-0" onClick={() => setExpanded((v) => !v)}>
          <ChevronDown className={cn("h-4 w-4 text-slate-400 flex-shrink-0 transition-transform", expanded && "rotate-180")} />
          <span className="font-medium text-slate-900 truncate">{loc.name}</span>
        </button>
        <div className="flex items-center gap-2 flex-shrink-0">
          {leaders.length > 0 && <span className="text-xs text-slate-500 hidden sm:block">{leaders.map((l: any) => l.studentName).join(", ")}</span>}
          {assignments.length > 0 && <Badge variant="outline" className="text-xs">{assignments.length} assigned</Badge>}
          <button onClick={() => { setNameInput(loc.name); setEditOpen(true); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors" aria-label="Edit">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => removeLocation({ id: loc._id })} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors" aria-label="Remove">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 px-4 py-4 flex flex-col gap-4">
          {assignments.length > 0 ? (
            <div className="flex flex-col gap-2">
              {[...leaders, ...assignments.filter((a: any) => !a.isLeader)].map((a: any) => (
                <div key={a.studentId} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
                  <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">{a.studentName.charAt(0)}</div>
                  <span className="flex-1 text-sm text-slate-800">{a.studentName}</span>
                  <button onClick={() => toggleLeader(a.studentId)} className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors", a.isLeader ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}>
                    <Crown className="h-3 w-3" />{a.isLeader ? "Leader" : "Member"}
                  </button>
                  <button onClick={() => removeAssignment(a.studentId)} className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors" aria-label="Remove">
                    <UserMinus className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-400 italic">No one assigned yet</p>}

          {unassigned.length > 0 && (
            <div className="flex gap-2 items-end border-t border-slate-100 pt-3">
              <div className="flex-1 flex flex-col gap-1">
                <Label className="text-xs text-slate-500">Add student</Label>
                <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select student…</option>
                  {unassigned.map((s: any) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-1.5 text-xs text-slate-600 pb-2 cursor-pointer select-none">
                <input type="checkbox" checked={isLeaderToggle} onChange={(e) => setIsLeaderToggle(e.target.checked)} className="accent-amber-500" />
                Leader
              </label>
              <Button size="sm" onClick={addAssignment} disabled={!selectedStudent}><Plus className="h-3.5 w-3.5" /></Button>
            </div>
          )}
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Edit Location</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-1.5">
              <Label>Location Name</Label>
              <Input value={nameInput} onChange={(e) => { setNameInput(e.target.value); setNameError(""); }} onKeyDown={(e) => e.key === "Enter" && handleSave()} autoFocus />
              {nameError && <p className="text-xs text-rose-500">{nameError}</p>}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function LocationsPage() {
  const { session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (session && session.role !== "admin") router.replace("/");
  }, [session, router]);

  const locations = useQuery(api.locations.list);
  const students = useQuery(api.students.list);
  const addLocation = useMutation(api.locations.add);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameError, setNameError] = useState("");

  if (session?.role !== "admin") return null;

  async function handleAdd() {
    const trimmed = nameInput.trim();
    if (!trimmed) { setNameError("Name is required"); return; }
    await addLocation({ name: trimmed });
    setNameInput(""); setDialogOpen(false);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">Locations</h1>
          </div>
          <p className="text-sm text-slate-500">{locations?.length ?? 0} locations</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Add Location</Button>
      </div>

      <div className="flex flex-col gap-3">
        {locations === undefined && (
          <div className="h-16 animate-pulse bg-white rounded-2xl border border-slate-200" />
        )}
        {locations?.map((loc: any) => (
          <LocationRow key={loc._id} loc={loc} students={students ?? []} />
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Add Location</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-1.5">
              <Label>Location Name</Label>
              <Input value={nameInput} onChange={(e) => { setNameInput(e.target.value); setNameError(""); }} placeholder="e.g. Workshop" onKeyDown={(e) => e.key === "Enter" && handleAdd()} autoFocus />
              {nameError && <p className="text-xs text-rose-500">{nameError}</p>}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Add</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
