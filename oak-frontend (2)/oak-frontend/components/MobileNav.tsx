"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { MenuIcon } from "@/components/icons";
import Logo from "@/components/Logo";

const PUBLIC_NAV = [
  { href: "/register", label: "Register" },
  { href: "/programme", label: "Programme" },
  { href: "/partners", label: "Partners" },
];

const ADMIN_NAV = [
  { href: "/checkin/scan", label: "Check In" },
  { href: "/programme", label: "Programme" },
  { href: "/partners", label: "Partners" },
  { href: "/attendance", label: "Attendance" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isAdminArea = pathname.startsWith("/checkin") || pathname.startsWith("/attendance");
  const nav = isAdminArea ? ADMIN_NAV : PUBLIC_NAV;

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="md:hidden sticky top-0 z-30 bg-white border-b border-line">
      <div className="flex items-center justify-between px-4 h-14">
        <Logo size="sm" />
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Open menu"
          className="p-2 rounded-lg text-ink-muted hover:bg-canvas"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </div>
      {open && (
        <nav className="px-4 pb-3 flex flex-col gap-1 border-t border-line pt-2">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "rounded-lg px-3 py-2.5 text-sm font-medium",
                  active ? "bg-navy text-white" : "text-ink-muted hover:bg-canvas"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
