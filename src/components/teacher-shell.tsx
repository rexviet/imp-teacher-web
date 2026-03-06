"use client";

import { useAuth } from "@/providers/AuthProvider";
import {
  Bell,
  CheckCircle2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings2,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode } from "react";

interface TeacherShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

function navClass(active: boolean) {
  return active
    ? "flex items-center gap-3 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white"
    : "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900";
}

export function TeacherShell({ title, subtitle, children }: TeacherShellProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const router = useRouter();

  const consoleLinks = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
  ];

  const accountLinks = [
    { href: "/wallet", label: "My Wallet", icon: Wallet },
    { href: "/settings", label: "Settings", icon: Settings2 },
  ];

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="px-5 py-5">
          <div className="flex items-center gap-2 text-teal-700">
            <GraduationCap className="h-5 w-5" />
            <p className="text-sm font-semibold tracking-tight">IELTS Master</p>
          </div>
        </div>

        <nav className="flex-1 px-4">
          <p className="mb-3 px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Examiner Console
          </p>
          <div className="space-y-1.5">
            {consoleLinks.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link key={link.href} href={link.href} className={navClass(isActive)}>
                  <link.icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
          <p className="mb-3 mt-8 px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Account
          </p>
          <div className="space-y-1.5">
            {accountLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={navClass(pathname === link.href)}
              >
                <link.icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        <div className="mt-auto border-t border-slate-100 p-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white">
                {user?.displayName?.slice(0, 2).toUpperCase() || "TC"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {user?.displayName || user?.email || "Teacher"}
                </p>
                <p className="truncate text-xs text-slate-500">Senior Examiner</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="p-6 lg:ml-64 lg:p-8">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="relative rounded-full p-2 text-slate-400 transition hover:text-slate-600"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border border-white bg-rose-500" />
            </button>
            <div className="hidden h-8 w-px bg-slate-200 sm:block" />
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 sm:flex">
              <CheckCircle2 className="h-4 w-4 text-teal-600" />
              <span className="text-xs font-semibold text-slate-700">
                Verified Examiner
              </span>
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
