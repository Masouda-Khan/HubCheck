"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
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

function RecentInspections({ locationId, locationName }: { locationId: string; locationName: string }) {
  const inspections = useQuery(api.inspections.getByLocation, { locationId: locationId as any });
  if (!inspections?.length) return null;
  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold text-slate-700 mb-3">Recent · {locationName}</h2>
      <div className="flex flex-col gap-2">
        {inspections.map((insp: any) => (
          <div key={insp._id} className="bg-white rounded-xl border border-slate-200/70 p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <StarRating value={insp.rating} readonly size="sm" />
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3 w-3 text-slate-400" />
                <span className="text-xs text-slate-400">{insp.date} · {insp.inspectorName}</span>
              </div>
            </div>
            {insp.notes && <p className="text-xs text-slate-600">{insp.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InspectPage() {
  const { session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (session && session.role !== "admin") router.replace("/");
  }, [session, router]);

  const locations = useQuery(api.locations.list);
  const addInspection = useMutation(api.inspections.add);

  const [locationId, setLocationId] = useState("");
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [inspectorName, setInspectorName] = useState(session?.name ?? "");
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    return () => { photoPreviews.forEach(URL.revokeObjectURL); };
  }, [photoPreviews]);

  if (session?.role !== "admin") return null;

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(e.target.files ?? [])
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, MAX_PHOTOS - photoPreviews.length);
    if (!incoming.length) return;
    setPhotoPreviews((prev) => [...prev, ...incoming.map((f) => URL.createObjectURL(f))]);
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

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    await addInspection({
      locationId: locationId as any,
      rating,
      notes: notes.trim() || undefined,
      date: today,
      inspectorName: inspectorName.trim(),
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setLocationId("");
      setRating(0);
      setNotes("");
      setPhotoPreviews([]);
    }, 2000);
  }

  const selectedLocation = locations?.find((l: any) => l._id === locationId);

  return (
    <div className="p-5 max-w-xl mx-auto">
      <div className="flex items-center gap-2 mb-5">
        <ClipboardCheck className="h-5 w-5" style={{ color: "#7c3aed" }} />
        <h1 className="text-xl font-bold" style={{ color: "#1e1b3a" }}>Weekly Inspection</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label>Location</Label>
          <select
            value={locationId}
            onChange={(e) => { setLocationId(e.target.value); setErrors((p) => ({ ...p, location: "" })); }}
            className={cn("border rounded-xl px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2",
              errors.location ? "border-rose-300 ring-rose-100" : "border-slate-200 focus:ring-purple-200")}
          >
            <option value="">Select a location…</option>
            {locations?.map((l: any) => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>
          {errors.location && <p className="text-xs text-rose-500">{errors.location}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label>
            Cleanliness Rating
            {rating > 0 && <span className="ml-2 text-sm font-normal text-slate-500">{rating}/5 — {RATING_LABELS[rating]}</span>}
          </Label>
          <StarRating value={rating} onChange={(v) => { setRating(v); setErrors((p) => ({ ...p, rating: "" })); }} />
          {errors.rating && <p className="text-xs text-rose-500">{errors.rating}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Your Name</Label>
          <Input value={inspectorName} onChange={(e) => { setInspectorName(e.target.value); setErrors((p) => ({ ...p, inspector: "" })); }} placeholder="e.g. Admin" className={errors.inspector ? "border-rose-300" : ""} />
          {errors.inspector && <p className="text-xs text-rose-500">{errors.inspector}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Notes <span className="text-slate-400 font-normal">(optional)</span></Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any specific observations…" rows={3} className="resize-none" />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Photos <span className="text-slate-400 font-normal">(optional · max {MAX_PHOTOS})</span></Label>
          {photoPreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {photoPreviews.map((url, i) => (
                <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-0.5 transition-colors" aria-label="Remove photo">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {photoPreviews.length < MAX_PHOTOS && (
            <>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoSelect} />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-colors">
                <Camera className="h-4 w-4" />Add Photos ({photoPreviews.length}/{MAX_PHOTOS})
              </button>
            </>
          )}
        </div>

        <Button onClick={handleSubmit} disabled={submitted} className={cn("w-full gap-2 h-11 text-base transition-all", submitted && "bg-emerald-600 hover:bg-emerald-600")}>
          {submitted ? <><CheckCircle2 className="h-4 w-4" /> Inspection Saved</> : "Submit Inspection"}
        </Button>
      </div>

      {locationId && selectedLocation && (
        <RecentInspections locationId={locationId} locationName={selectedLocation.name} />
      )}
    </div>
  );
}
