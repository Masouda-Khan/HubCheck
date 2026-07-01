"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Users, MapPin, ClipboardCheck, Trophy, Menu, X, ListTodo, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const ALL_NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/students", label: "Students", icon: Users, adminOnly: true },
  { href: "/locations", label: "Locations", icon: MapPin, adminOnly: true },
  { href: "/inspect", label: "Inspect", icon: ClipboardCheck, adminOnly: true },
  { href: "/checklists", label: "Checklists", icon: ListTodo, adminOnly: false },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy, adminOnly: false },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!session || pathname === "/login") return null;

  const navItems = ALL_NAV_ITEMS.filter((item) => !item.adminOnly || session.role === "admin");

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <>
      {/* Sidebar — desktop */}
      <aside
        className="hidden md:flex flex-col w-56 min-h-screen fixed top-0 left-0 z-20"
        style={{ background: "linear-gradient(180deg, #1e3a8a 0%, #4c1d95 100%)" }}
      >
        <div className="px-5 py-6 border-b border-white/10">
          <span className="text-lg font-bold text-white tracking-tight">HubCheck</span>
          <p className="text-xs text-white/50 mt-0.5">Innovation Hub</p>
        </div>

        <nav className="flex flex-col gap-1 p-3 flex-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="px-3 pb-2">
            <p className="text-xs text-white/50 truncate">{session.name}</p>
            <p className="text-xs text-white/30 capitalize">{session.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-white/50 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Top bar — mobile */}
      <header
        className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 h-14 shadow-md"
        style={{ background: "linear-gradient(90deg, #1e3a8a 0%, #4c1d95 100%)" }}
      >
        <span className="text-base font-bold text-white tracking-tight">HubCheck</span>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="p-2 rounded-lg text-white hover:bg-white/15 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <nav
          className="md:hidden fixed top-14 left-0 right-0 z-20 border-b border-white/10 px-3 pb-3 pt-2"
          style={{ background: "#4c1d95" }}
        >
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-white/15 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium text-white/50 hover:bg-white/10 hover:text-white transition-colors mt-1 border-t border-white/10 pt-3"
          >
            <LogOut className="h-4 w-4" />
            Sign out · {session.name}
          </button>
        </nav>
      )}
    </>
  );
}
