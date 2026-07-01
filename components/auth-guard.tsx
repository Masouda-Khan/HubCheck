"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!session && pathname !== "/login") {
      router.replace("/login");
    }
  }, [session, loading, pathname, router]);

  if (loading) return null;
  if (!session && pathname !== "/login") return null;
  return <>{children}</>;
}
