"use client";

import { useState } from "react";
import { STUDENTS, ASSIGNMENTS } from "@/lib/mock-data";
import type { Student } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, UserX, UserCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(STUDENTS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [error, setError] = useState("");

  const assignments = ASSIGNMENTS;

  function openAdd() {
    setEditing(null);
    setNameInput("");
    setError("");
    setDialogOpen(true);
  }

  function openEdit(s: Student) {
    setEditing(s);
    setNameInput(s.name);
    setError("");
    setDialogOpen(true);
  }

  function handleSave() {
    const trimmed = nameInput.trim();
    if (!trimmed) { setError("Name is required"); return; }
    if (trimmed.length > 100) { setError("Name is too long"); return; }

    if (editing) {
      setStudents((prev) =>
        prev.map((s) => (s.id === editing.id ? { ...s, name: trimmed } : s))
      );
    } else {
      const newStudent: Student = {
        id: `stu-${Date.now()}`,
        name: trimmed,
        isActive: true,
      };
      setStudents((prev) => [...prev, newStudent]);
    }
    setDialogOpen(false);
  }

  function toggleActive(id: string) {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  }

  function getAssignment(studentId: string) {
    return assignments.find((a) => a.studentId === studentId);
  }

  const active = students.filter((s) => s.isActive);
  const inactive = students.filter((s) => !s.isActive);

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
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Student
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {students.length === 0 && (
          <p className="text-center text-slate-400 py-12 text-sm">No students yet</p>
        )}
        {students.map((student, idx) => {
          const assignment = getAssignment(student.id);
          return (
            <div
              key={student.id}
              className={cn(
                "flex items-center gap-4 px-5 py-3.5",
                idx !== 0 && "border-t border-slate-100",
                !student.isActive && "opacity-50"
              )}
            >
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700 flex-shrink-0">
                {student.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{student.name}</p>
                {assignment ? (
                  <p className="text-xs text-slate-500 truncate">
                    {assignment.isLeader ? "Leader · " : ""}
                    {/* location name lookup omitted — will use real data post-MVP */}
                    {assignment.locationId.replace("loc-", "Location ")}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">Unassigned</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    student.isActive
                      ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                      : "border-slate-300 text-slate-500"
                  )}
                >
                  {student.isActive ? "Active" : "Inactive"}
                </Badge>
                <button
                  onClick={() => openEdit(student)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => toggleActive(student.id)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label={student.isActive ? "Deactivate" : "Reactivate"}
                >
                  {student.isActive ? (
                    <UserX className="h-3.5 w-3.5" />
                  ) : (
                    <UserCheck className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Student" : "Add Student"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={nameInput}
                onChange={(e) => { setNameInput(e.target.value); setError(""); }}
                placeholder="e.g. Jordan Chen"
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                autoFocus
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editing ? "Save" : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
