"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

const url = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";
const convex = url ? new ConvexReactClient(url) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: "#f5f5ff" }}>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-sm text-center">
          <p className="text-lg font-bold text-slate-900 mb-2">Backend not configured</p>
          <p className="text-sm text-slate-500 mb-4">
            Run <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">npx convex dev</code> in
            your terminal to set up the backend, then restart the dev server.
          </p>
          <p className="text-xs text-slate-400">After setup, refresh this page.</p>
        </div>
      </div>
    );
  }
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
