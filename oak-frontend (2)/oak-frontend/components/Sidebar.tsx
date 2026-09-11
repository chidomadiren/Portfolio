"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { EVENT } from "@/lib/db";
import { getSession, signOut } from "@/lib/auth";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import {
  UserPlusIcon,
  ScanIcon,
  CalendarIcon,
  GlobeIcon,
  GridIcon,
  GlobePinIcon,
  LogOutIcon,
} from "@/components/icons";

const PUBLIC_NAV = [
  { href: "/register", label: "Register", icon: UserPlusIcon },
  { href: "/programme", label: "Programme", icon: CalendarIcon },
  { href: "/partners", label: "Partners", icon: GlobeIcon },
  { href: "/checkin/scan", label: "Check In", icon: ScanIcon },
  { href: "/attendance", label: "Attendance", icon: GridIcon },
];

const ADMIN_NAV = [
  { href: "/checkin/scan", label: "Check In", icon: ScanIcon },
  { href: "/programme", label: "Programme", icon: CalendarIcon },
  { href: "/partners", label: "Partners", icon: GlobeIcon },
  { href: "/attendance", label: "Attendance", icon: GridIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [session, setSession] = useState<ReturnType<typeof getSession>>(null);
  const isAdminArea = pathname.startsWith("/checkin") || pathname.startsWith("/attendance");
  const isAdminSession = Boolean(session);
  const nav = isAdminArea || isAdminSession ? ADMIN_NAV : PUBLIC_NAV;

  useEffect(() => {
    setSession(getSession());
  }, [pathname]);

  return (
    <aside className="hidden md:flex md:w-64 shrink-0 flex-col border-r border-line bg-white h-screen sticky top-0">
      <div className="px-5 pt-6 pb-5">
        <Logo />
        <p className="mt-3 text-[11px] uppercase tracking-wide text-ink-faint">
          Partner Convening 2026
        </p>
      </div>

      <nav className="px-3 flex flex-col gap-1">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-navy text-white"
                  : "text-ink-muted hover:bg-canvas hover:text-ink"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-3 pb-5">
        {isAdminArea && session && (
          <button
            onClick={() => {
              signOut();
              window.location.href = "/admin/login";
            }}
            className="mb-2 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-muted hover:bg-canvas hover:text-ink transition-colors"
          >
            <LogOutIcon className="h-4 w-4" />
            Sign out
            <span className="ml-auto text-[11px] text-ink-faint truncate max-w-[80px]">
              {session.email}
            </span>
          </button>
        )}
        <div className="flex items-center gap-2 rounded-xl border border-line px-3 py-2.5">
          <GlobePinIcon className="h-4 w-4 text-ink-faint shrink-0" />
          <div className="leading-tight">
            <p className="text-xs font-medium text-ink">{EVENT.city}</p>
            <p className="text-[11px] text-ink-faint">{EVENT.dateRange}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
