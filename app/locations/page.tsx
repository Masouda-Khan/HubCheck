"use client";

import { useState } from "react";
import { LOCATIONS, STUDENTS, ASSIGNMENTS } from "@/lib/mock-data";
import type { Location, Student, Assignment } from "@/lib/types";
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
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  Crown,
  UserMinus,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AssignmentRow extends Assignment {
  studentName: string;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>(LOCATIONS);
  const [assignments, setAssignments] = useState<AssignmentRow[]>(ASSIGNMENTS);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [nameError, setNameError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [isLeaderToggle, setIsLeaderToggle] = useState(false);

  const activeStudents = STUDENTS.filter((s) => s.isActive);

  function openAdd() {
    setEditing(null);
    setNameInput("");
    setNameError("");
    setDialogOpen(true);
  }

  function openEdit(loc: Location) {
    setEditing(loc);
    setNameInput(loc.name);
    setNameError("");
    setDialogOpen(true);
  }

  function handleSave() {
    const trimmed = nameInput.trim();
    if (!trimmed) { setNameError("Name is required"); return; }
    if (trimmed.length > 100) { setNameError("Name is too long"); return; }

    if (editing) {
      setLocations((prev) =>
        prev.map((l) => (l.id === editing.id ? { ...l, name: trimmed } : l))
      );
    } else {
      setLocations((prev) => [
        ...prev,
        { id: `loc-${Date.now()}`, name: trimmed, isActive: true },
      ]);
    }
    setDialogOpen(false);
  }

  function removeLocation(id: string) {
    setLocations((prev) => prev.filter((l) => l.id !== id));
    setAssignments((prev) => prev.filter((a) => a.locationId !== id));
    if (expanded === id) setExpanded(null);
  }

  function addAssignment(locationId: string) {
    if (!selectedStudent) return;
    const student = activeStudents.find((s) => s.id === selectedStudent);
    if (!student) return;
    const alreadyAssigned = assignments.some(
      (a) => a.locationId === locationId && a.studentId === selectedStudent
    );
    if (alreadyAssigned) return;
    setAssignments((prev) => [
      ...prev,
      { locationId, studentId: student.id, isLeader: isLeaderToggle, studentName: student.name },
    ]);
    setSelectedStudent("");
    setIsLeaderToggle(false);
  }

  function removeAssignment(locationId: string, studentId: string) {
    setAssignments((prev) =>
      prev.filter((a) => !(a.locationId === locationId && a.studentId === studentId))
    );
  }

  function toggleLeader(locationId: string, studentId: string) {
    setAssignments((prev) =>
      prev.map((a) =>
        a.locationId === locationId && a.studentId === studentId
          ? { ...a, isLeader: !a.isLeader }
          : a
      )
    );
  }

  function getLocationAssignments(locationId: string) {
    return assignments.filter((a) => a.locationId === locationId);
  }

  function getUnassignedStudents(locationId: string): Student[] {
    const assigned = new Set(
      assignments.filter((a) => a.locationId === locationId).map((a) => a.studentId)
    );
    return activeStudents.filter((s) => !assigned.has(s.id));
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">Locations</h1>
          </div>
          <p className="text-sm text-slate-500">{locations.length} locations</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Location
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {locations.map((loc) => {
          const locAssignments = getLocationAssignments(loc.id);
          const leaders = locAssignments.filter((a) => a.isLeader);
          const members = locAssignments.filter((a) => !a.isLeader);
          const isOpen = expanded === loc.id;
          const unassigned = getUnassignedStudents(loc.id);

          return (
            <div
              key={loc.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="flex items-center px-4 py-3.5 gap-3">
                <button
                  className="flex-1 flex items-center gap-3 text-left min-w-0"
                  onClick={() => setExpanded(isOpen ? null : loc.id)}
                >
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-slate-400 flex-shrink-0 transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                  <span className="font-medium text-slate-900 truncate">{loc.name}</span>
                </button>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {leaders.length > 0 && (
                    <span className="text-xs text-slate-500 hidden sm:block">
                      {leaders.map((l) => l.studentName).join(", ")}
                    </span>
                  )}
                  {locAssignments.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {locAssignments.length} assigned
                    </Badge>
                  )}
                  <button
                    onClick={() => openEdit(loc)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                    aria-label="Edit location"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => removeLocation(loc.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                    aria-label="Remove location"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-slate-100 px-4 py-4 flex flex-col gap-4">
                  {/* Current assignments */}
                  {locAssignments.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {[...leaders, ...members].map((a) => (
                        <div
                          key={a.studentId}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50"
                        >
                          <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
                            {a.studentName.charAt(0)}
                          </div>
                          <span className="flex-1 text-sm text-slate-800">{a.studentName}</span>
                          <button
                            onClick={() => toggleLeader(loc.id, a.studentId)}
                            className={cn(
                              "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors",
                              a.isLeader
                                ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                            )}
                            aria-label={a.isLeader ? "Remove leader" : "Make leader"}
                          >
                            <Crown className="h-3 w-3" />
                            {a.isLeader ? "Leader" : "Member"}
                          </button>
                          <button
                            onClick={() => removeAssignment(loc.id, a.studentId)}
                            className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                            aria-label="Remove"
                          >
                            <UserMinus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No one assigned yet</p>
                  )}

                  {/* Add student */}
                  {unassigned.length > 0 && (
                    <div className="flex gap-2 items-end border-t border-slate-100 pt-3">
                      <div className="flex-1 flex flex-col gap-1">
                        <Label className="text-xs text-slate-500">Add student</Label>
                        <select
                          value={selectedStudent}
                          onChange={(e) => setSelectedStudent(e.target.value)}
                          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select student…</option>
                          {unassigned.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <label className="flex items-center gap-1.5 text-xs text-slate-600 pb-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isLeaderToggle}
                          onChange={(e) => setIsLeaderToggle(e.target.checked)}
                          className="accent-amber-500"
                        />
                        Leader
                      </label>
                      <Button
                        size="sm"
                        onClick={() => addAssignment(loc.id)}
                        disabled={!selectedStudent}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Location" : "Add Location"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="locname">Location Name</Label>
              <Input
                id="locname"
                value={nameInput}
                onChange={(e) => { setNameInput(e.target.value); setNameError(""); }}
                placeholder="e.g. Workshop"
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                autoFocus
              />
              {nameError && <p className="text-xs text-red-600">{nameError}</p>}
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
