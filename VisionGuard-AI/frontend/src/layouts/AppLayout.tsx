import {
  Activity,
  Bell,
  Camera,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Video,
  X,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";

import { useAuth } from "../auth/AuthContext";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Live Monitoring",
    href: "/live-camera",
    icon: Video,
  },
  {
    label: "Cameras",
    href: "/cameras",
    icon: Camera,
  },
  {
    label: "Events",
    href: "/events",
    icon: Activity,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-950 text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/10 bg-surface-900 lg:flex lg:flex-col">
        {/* Brand */}
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-500 text-surface-950 shadow-lg shadow-accent-500/20">
            <ShieldCheck aria-hidden="true" size={23} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold uppercase tracking-wide text-white">
              VisionGuard AI
            </p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
              Security Intelligence
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-5">
          <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            Operations
          </p>

          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                [
                  "group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-accent-500 text-white shadow-lg shadow-accent-500/20"
                    : "text-slate-400 hover:bg-white/[0.05] hover:text-white",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    aria-hidden="true"
                    size={18}
                    className={
                      isActive
                        ? "text-white"
                        : "text-slate-500 transition-colors group-hover:text-slate-300"
                    }
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* System Status */}
        <div className="mx-3 mb-3 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.04] p-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>

            <span className="text-xs font-medium text-emerald-300">
              System Operational
            </span>
          </div>

          <p className="mt-1 pl-[18px] text-[10px] text-slate-500">
            AI services connected
          </p>
        </div>

        {/* User */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent-500/30 bg-accent-500/10 text-accent-400">
              <span className="text-sm font-semibold">
                {(user?.email?.[0] ?? "A").toUpperCase()}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">
                Administrator
              </p>
              <p className="truncate text-[10px] text-slate-500">
                {user?.email ?? "Admin"}
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
              aria-label="Sign out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Close navigation"
            onClick={() => setMobileMenuOpen(false)}
          />

          <aside className="relative flex h-full w-72 flex-col border-r border-white/10 bg-surface-900 shadow-2xl">
            <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500 text-surface-950">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-white">
                    VisionGuard AI
                  </p>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">
                    Security Intelligence
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                aria-label="Close navigation"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="space-y-1 px-3 py-5">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition",
                      isActive
                        ? "bg-accent-500 text-white"
                        : "text-slate-400 hover:bg-white/5 hover:text-white",
                    ].join(" ")
                  }
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Application */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-white/10 bg-surface-950/90 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/5 hover:text-white lg:hidden"
                aria-label="Open navigation"
              >
                <Menu size={19} />
              </button>

              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                  Operations Console
                </p>

                <h1 className="text-base font-semibold text-white sm:text-lg">
                  Real-time Security Monitoring
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* System status */}
              <div className="hidden items-center gap-2 rounded-lg border border-emerald-400/10 bg-emerald-400/[0.05] px-3 py-2 sm:flex">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-medium text-emerald-300">
                  System Online
                </span>
              </div>

              {/* Notifications */}
              <button
                type="button"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/5 hover:text-white"
                aria-label="View notifications"
              >
                <Bell size={18} />

                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-400" />
              </button>

              {/* User */}
              <div className="hidden max-w-[180px] rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 md:block">
                <p className="truncate text-xs font-medium text-white">
                  {user?.email ?? "Administrator"}
                </p>
                <p className="text-[10px] text-slate-500">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
