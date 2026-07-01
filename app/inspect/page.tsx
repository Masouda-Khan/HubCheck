"use client";

import { useState, useRef, useEffect } from "react";
import { LOCATIONS } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import type { Inspection } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/star-rating";
import { ClipboardCheck, CheckCircle2, CalendarDays, Camera, X } from "lucide-react";
import { cn } from "@/lib/utils";

const RATING_LABELS: Record<number, string> = {
  1: "Very Poor", 2: "Poor", 3: "Okay", 4: "Good", 5: "Excellent",
};

const MAX_PHOTOS = 5;

export default function InspectPage() {
  const { inspections, addInspection } = useStore();
  const [locationId, setLocationId] = useState("");
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [inspectorName, setInspectorName] = useState("");
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    return () => { photoPreviews.forEach(URL.revokeObjectURL); };
  }, [photoPreviews]);

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(e.target.files ?? [])
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, MAX_PHOTOS - photoPreviews.length);
    if (!incoming.length) return;
    const newPreviews = incoming.map((f) => URL.createObjectURL(f));
    setPhotoPreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = "";
  }

  function removePhoto(idx: number) {
    setPhotoPreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  }

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
      photoUrls: photoPreviews.length ? [...photoPreviews] : undefined,
    };
    addInspection(newInspection);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setLocationId("");
      setRating(0);
      setNotes("");
      setPhotoPreviews([]);
    }, 2000);
  }

  const selectedLocation = LOCATIONS.find((l) => l.id === locationId);
  const locationInspections = inspections.filter((i) => i.locationId === locationId).slice(0, 5);

  return (
    <div className="p-5 max-w-xl mx-auto">
      <div className="flex items-center gap-2 mb-5">
        <ClipboardCheck className="h-5 w-5" style={{ color: "#7c3aed" }} />
        <h1 className="text-xl font-bold" style={{ color: "#1e1b3a" }}>Weekly Inspection</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5 flex flex-col gap-5">
        {/* Location */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="location">Location</Label>
          <select
            id="location"
            value={locationId}
            onChange={(e) => { setLocationId(e.target.value); setErrors((p) => ({ ...p, location: "" })); }}
            className={cn(
              "border rounded-xl px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2",
              errors.location ? "border-red-400 ring-red-200" : "border-slate-200 focus:ring-purple-200"
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

        {/* Photos */}
        <div className="flex flex-col gap-2">
          <Label>Photos <span className="text-slate-400 font-normal">(optional · max {MAX_PHOTOS})</span></Label>

          {photoPreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {photoPreviews.map((url, i) => (
                <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-0.5 transition-colors"
                    aria-label="Remove photo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {photoPreviews.length < MAX_PHOTOS && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoSelect}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-colors active:scale-95"
              >
                <Camera className="h-4 w-4" />
                Add Photos ({photoPreviews.length}/{MAX_PHOTOS})
              </button>
            </>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitted}
          className={cn(
            "w-full gap-2 h-11 text-base transition-all",
            submitted && "bg-emerald-600 hover:bg-emerald-600"
          )}
        >
          {submitted ? (
            <><CheckCircle2 className="h-4 w-4" /> Inspection Saved</>
          ) : (
            "Submit Inspection"
          )}
        </Button>
      </div>

      {/* Recent inspections */}
      {selectedLocation && locationInspections.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">
            Recent · {selectedLocation.name}
          </h2>
          <div className="flex flex-col gap-2">
            {locationInspections.map((insp) => (
              <div key={insp.id} className="bg-white rounded-xl border border-slate-200/70 p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <StarRating value={insp.rating} readonly size="sm" />
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-3 w-3 text-slate-400" />
                    <span className="text-xs text-slate-400">{insp.date} · {insp.inspectorName}</span>
                  </div>
                </div>
                {insp.notes && <p className="text-xs text-slate-600">{insp.notes}</p>}
                {insp.photoUrls && insp.photoUrls.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {insp.photoUrls.map((url, i) => (
                      <div key={i} className="h-14 w-14 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
