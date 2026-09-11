"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleBadge from "@/components/RoleBadge";
import { EVENT, getAttendanceSummary, getCheckinsForDay } from "@/lib/db";
import type { Attendee, CheckIn } from "@/lib/types";
import { DownloadIcon, SearchIcon, UsersIcon } from "@/components/icons";

const DAYS = [1, 2, 3] as const;

function AttendanceInner() {
  const [day, setDay] = useState<1 | 2 | 3>(1);
  const [rows, setRows] = useState<(CheckIn & { attendee: Attendee })[]>([]);
  const [summary, setSummary] = useState({ expected: EVENT.expectedAttendees, checkedIn: 0, pending: EVENT.expectedAttendees });
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    getCheckinsForDay(day).then((r) => active && setRows(r));
    getAttendanceSummary(day).then((s) => active && setSummary(s));
    return () => {
      active = false;
    };
  }, [day]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const a = r.attendee;
      return (
        `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
        a.organisation.toLowerCase().includes(q) ||
        a.qrCode.toLowerCase().includes(q)
      );
    });
  }, [rows, query]);

  function exportCsv() {
    const header = ["Name", "Organisation", "Role", "QR Code", "Check-in Time", "Venue"];
    const lines = filtered.map((r) =>
      [
        `${r.attendee.firstName} ${r.attendee.lastName}`,
        r.attendee.organisation,
        r.attendee.role,
        r.attendee.qrCode,
        new Date(r.timestamp).toLocaleString(),
        r.venue,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `oak-attendance-day${day}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Attendance</h1>
          <p className="text-sm text-ink-muted mt-0.5">Check-in tracking · {EVENT.dateRange}</p>
        </div>
        <div className="flex rounded-lg border border-line overflow-hidden shrink-0">
          {DAYS.map((d) => (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={clsx(
                "px-3 py-1.5 text-xs font-medium",
                day === d ? "bg-navy text-white" : "bg-white text-ink-muted hover:bg-canvas"
              )}
            >
              Day {d}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-5 rounded-2xl bg-white border border-line shadow-card p-8 flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-full bg-canvas flex items-center justify-center mb-3">
            <UsersIcon className="h-6 w-6 text-ink-faint" />
          </div>
          <p className="text-sm font-semibold text-ink">No check-ins yet</p>
          <p className="text-xs text-ink-faint mt-1 max-w-xs">
            Attendees will appear here once they have been scanned in at the event entrance.
          </p>
          <Link
            href="/checkin/scan"
            className="mt-4 rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-light transition-colors"
          >
            Go to Check-In Scanner
          </Link>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl bg-white border border-line shadow-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <SearchIcon className="h-4 w-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, organisation or code…"
                className="w-full rounded-lg border border-line pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
              />
            </div>
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-semibold text-ink hover:bg-canvas transition-colors shrink-0"
            >
              <DownloadIcon className="h-3.5 w-3.5" />
              Export CSV
            </button>
          </div>

          <div className="divide-y divide-line max-h-[420px] overflow-y-auto">
            {filtered.map((r) => (
              <div key={r.id} className="flex items-center gap-3 py-2.5">
                <div className="h-9 w-9 rounded-full bg-navy/10 text-navy text-xs font-semibold flex items-center justify-center shrink-0">
                  {r.attendee.firstName[0]}
                  {r.attendee.lastName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink truncate">
                    {r.attendee.firstName} {r.attendee.lastName}
                  </p>
                  <p className="text-[11px] text-ink-faint truncate">{r.attendee.organisation}</p>
                </div>
                <RoleBadge role={r.attendee.role} />
                <span className="text-[11px] text-ink-faint w-14 text-right shrink-0">
                  {new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="py-6 text-center text-sm text-ink-faint">No matches for &quot;{query}&quot;</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 rounded-2xl bg-white border border-line shadow-card p-4">
        <p className="text-[11px] uppercase tracking-wide text-ink-faint mb-3">Event Overview</p>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Expected" value={summary.expected} />
          <Stat label="Checked In" value={summary.checkedIn} />
          <Stat label="Pending" value={summary.pending} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-canvas px-3 py-4 text-center">
      <p className="text-2xl font-semibold text-ink">{value}</p>
      <p className="text-[11px] text-ink-faint mt-0.5">{label}</p>
    </div>
  );
}

export default function AttendancePage() {
  return (
    <ProtectedRoute>
      <AttendanceInner />
    </ProtectedRoute>
  );
}
