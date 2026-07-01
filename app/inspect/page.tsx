"use client";

import { useState } from "react";
import { LOCATIONS, INSPECTIONS } from "@/lib/mock-data";
import type { Inspection } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/star-rating";
import { ClipboardCheck, CheckCircle2, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const RATING_LABELS: Record<number, string> = {
  1: "Very Poor",
  2: "Poor",
  3: "Okay",
  4: "Good",
  5: "Excellent",
};

export default function InspectPage() {
  const [inspections, setInspections] = useState<Inspection[]>(INSPECTIONS);
  const [locationId, setLocationId] = useState("");
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [inspectorName, setInspectorName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  function validate() {
    const e: Record<string, string> = {};
    if (!locationId) e.location = "Select a location";
    if (!rating) e.rating = "Rating is required";
    if (!inspectorName.trim()) e.inspector = "Your name is required";
    if (inspectorName.trim().length > 100) e.inspector = "Name is too long";
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    const newInspection: Inspection = {
      id: `insp-${Date.now()}`,
      locationId,
      rating,
      notes: notes.trim() || undefined,
      date: today,
      inspectorName: inspectorName.trim(),
    };
    setInspections((prev) => [newInspection, ...prev]);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setLocationId("");
      setRating(0);
      setNotes("");
      // keep inspector name for quick re-use
    }, 2000);
  }

  const selectedLocation = LOCATIONS.find((l) => l.id === locationId);
  const locationInspections = inspections
    .filter((i) => i.locationId === locationId)
    .slice(0, 5);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <ClipboardCheck className="h-5 w-5 text-blue-600" />
        <h1 className="text-2xl font-bold text-slate-900">Weekly Inspection</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-5">
        {/* Location */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="location">Location</Label>
          <select
            id="location"
            value={locationId}
            onChange={(e) => { setLocationId(e.target.value); setErrors((p) => ({ ...p, location: "" })); }}
            className={cn(
              "border rounded-lg px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500",
              errors.location ? "border-red-400" : "border-slate-200"
            )}
          >
            <option value="">Select a location…</option>
            {LOCATIONS.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          {errors.location && <p className="text-xs text-red-600">{errors.location}</p>}
        </div>

        {/* Rating */}
        <div className="flex flex-col gap-2">
          <Label>
            Cleanliness Rating
            {rating > 0 && (
              <span className="ml-2 text-sm font-normal text-slate-500">
                {rating}/5 — {RATING_LABELS[rating]}
              </span>
            )}
          </Label>
          <StarRating
            value={rating}
            onChange={(v) => { setRating(v); setErrors((p) => ({ ...p, rating: "" })); }}
          />
          {errors.rating && <p className="text-xs text-red-600">{errors.rating}</p>}
        </div>

        {/* Inspector */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="inspector">Your Name</Label>
          <Input
            id="inspector"
            value={inspectorName}
            onChange={(e) => { setInspectorName(e.target.value); setErrors((p) => ({ ...p, inspector: "" })); }}
            placeholder="e.g. Admin"
            className={errors.inspector ? "border-red-400" : ""}
          />
          {errors.inspector && <p className="text-xs text-red-600">{errors.inspector}</p>}
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notes">Notes <span className="text-slate-400 font-normal">(optional)</span></Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any specific observations…"
            rows={3}
            className="resize-none"
          />
        </div>

        <Button
          onClick={handleSubmit}
          className={cn(
            "w-full gap-2 transition-all",
            submitted && "bg-emerald-600 hover:bg-emerald-600"
          )}
          disabled={submitted}
        >
          {submitted ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Inspection Saved
            </>
          ) : (
            "Submit Inspection"
          )}
        </Button>
      </div>

      {/* Recent inspections for selected location */}
      {selectedLocation && locationInspections.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">
            Recent · {selectedLocation.name}
          </h2>
          <div className="flex flex-col gap-2">
            {locationInspections.map((insp) => (
              <div
                key={insp.id}
                className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-start gap-3"
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-lg font-bold text-slate-900">{insp.rating}</span>
                  <span className="text-xs text-slate-400">/ 5</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <CalendarDays className="h-3 w-3 text-slate-400" />
                    <span className="text-xs text-slate-500">{insp.date}</span>
                    <span className="text-xs text-slate-400">· {insp.inspectorName}</span>
                  </div>
                  {insp.notes && (
                    <p className="text-xs text-slate-600 mt-1">{insp.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
