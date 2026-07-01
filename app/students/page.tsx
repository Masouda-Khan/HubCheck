"use client";

import { useEffect } from "react";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, UserX, UserCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentsPage() {
  const { session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (session && session.role !== "admin") router.replace("/");
  }, [session, router]);

  const students = useQuery(api.students.list);
  const addStudent = useMutation(api.students.add);
  const updateStudent = useMutation(api.students.update);
  const setActive = useMutation(api.students.setActive);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [nameInput, setNameInput] = useState("");
  const [error, setError] = useState("");

  if (session?.role !== "admin") return null;

  function openAdd() {
    setEditing(null); setNameInput(""); setError(""); setDialogOpen(true);
  }

  function openEdit(s: any) {
    setEditing(s); setNameInput(s.name); setError(""); setDialogOpen(true);
  }

  async function handleSave() {
    const trimmed = nameInput.trim();
    if (!trimmed) { setError("Name is required"); return; }
    if (trimmed.length > 100) { setError("Name is too long"); return; }
    if (editing) {
      await updateStudent({ id: editing._id, name: trimmed });
    } else {
      await addStudent({ name: trimmed });
    }
    setDialogOpen(false);
  }

  const active = (students ?? []).filter((s: any) => s.isActive);
  const inactive = (students ?? []).filter((s: any) => !s.isActive);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Users className="h-5 w-5 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">Students</h1>
          </div>
          <p className="text-sm text-slate-500">{active.length} active · {inactive.length} inactive</p>
        </div>
        <Button onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" />Add Student</Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {students === undefined && (
          <div className="p-8 flex items-center justify-center">
            <div className="h-6 w-32 bg-slate-100 rounded animate-pulse" />
          </div>
        )}
        {students?.length === 0 && (
          <p className="text-center text-slate-400 py-12 text-sm">No students yet</p>
        )}
        {students?.map((student: any, idx: number) => (
          <div key={student._id} className={cn("flex items-center gap-4 px-5 py-3.5", idx !== 0 && "border-t border-slate-100", !student.isActive && "opacity-50")}>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700 flex-shrink-0">
              {student.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{student.name}</p>
              {student.assignment ? (
                <p className="text-xs text-slate-500 truncate">
                  {student.assignment.isLeader ? "Leader · " : ""}{student.assignment.locationName ?? "Unknown location"}
                </p>
              ) : (
                <p className="text-xs text-slate-400">Unassigned</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className={cn("text-xs", student.isActive ? "border-emerald-300 text-emerald-700 bg-emerald-50" : "border-slate-300 text-slate-500")}>
                {student.isActive ? "Active" : "Inactive"}
              </Badge>
              <button onClick={() => openEdit(student)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors" aria-label="Edit">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setActive({ id: student._id, isActive: !student.isActive })} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors" aria-label={student.isActive ? "Deactivate" : "Reactivate"}>
                {student.isActive ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>{editing ? "Edit Student" : "Add Student"}</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={nameInput} onChange={(e) => { setNameInput(e.target.value); setError(""); }} placeholder="e.g. Jordan Chen" onKeyDown={(e) => e.key === "Enter" && handleSave()} autoFocus />
              {error && <p className="text-xs text-rose-500">{error}</p>}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editing ? "Save" : "Add"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
