"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type Path = "admin" | "student" | null;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const locations = useQuery(api.locations.list);

  const [path, setPath] = useState<Path>(null);
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [name, setName] = useState("");
  const [locationId, setLocationId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdminLogin() {
    if (!pin.trim()) { setError("Enter the admin PIN"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        login({ role: "admin", name: "Admin" });
        router.push("/");
      } else {
        setError("Incorrect PIN");
      }
    } catch {
      setError("Network error, try again");
    } finally {
      setLoading(false);
    }
  }

  function handleStudentLogin() {
    if (!name.trim()) { setError("Enter your name"); return; }
    if (!locationId) { setError("Select your location"); return; }
    const loc = locations?.find((l: any) => l._id === locationId);
    login({
      role: "student",
      name: name.trim(),
      locationId,
      locationName: loc?.name,
    });
    router.push("/");
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #4c1d95 100%)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">HubCheck</h1>
          <p className="text-white/60 text-sm mt-1">Innovation Hub · Cleaning Tracker</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          {!path ? (
            <>
              <p className="text-sm text-slate-500 text-center mb-5">Who are you?</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setPath("admin")}
                  className="w-full py-3.5 rounded-xl font-semibold text-white transition-all active:scale-95"
                  style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #4c1d95 100%)" }}
                >
                  Admin / Mentor
                </button>
                <button
                  onClick={() => setPath("student")}
                  className="w-full py-3.5 rounded-xl font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
                >
                  Student
                </button>
              </div>
            </>
          ) : path === "admin" ? (
            <>
              <button onClick={() => { setPath(null); setError(""); setPin(""); }} className="text-xs text-slate-400 hover:text-slate-600 mb-4 transition-colors">
                ← Back
              </button>
              <h2 className="text-lg font-bold text-slate-900 mb-4">Admin Login</h2>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="pin">Admin PIN</Label>
                  <div className="relative">
                    <Input
                      id="pin"
                      type={showPin ? "text" : "password"}
                      value={pin}
                      onChange={(e) => { setPin(e.target.value); setError(""); }}
                      placeholder="Enter PIN"
                      onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                      autoFocus
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-xs text-rose-500">{error}</p>}
                <Button onClick={handleAdminLogin} disabled={loading} className="h-11">
                  {loading ? "Checking…" : "Login as Admin"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <button onClick={() => { setPath(null); setError(""); setName(""); setLocationId(""); }} className="text-xs text-slate-400 hover:text-slate-600 mb-4 transition-colors">
                ← Back
              </button>
              <h2 className="text-lg font-bold text-slate-900 mb-4">Student Login</h2>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="stu-name">Your Name</Label>
                  <Input
                    id="stu-name"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(""); }}
                    placeholder="e.g. Emma Williams"
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Your Location</Label>
                  <select
                    value={locationId}
                    onChange={(e) => { setLocationId(e.target.value); setError(""); }}
                    className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  >
                    <option value="">Select your location…</option>
                    {locations?.map((l: any) => (
                      <option key={l._id} value={l._id}>{l.name}</option>
                    ))}
                  </select>
                </div>
                {error && <p className="text-xs text-rose-500">{error}</p>}
                <Button onClick={handleStudentLogin} className="h-11">
                  Enter as Student
                </Button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-white/30 text-xs mt-6">Innovation Hub · HubCheck</p>
      </div>
    </div>
  );
}
