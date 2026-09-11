"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleBadge from "@/components/RoleBadge";
import { checkInByQr, EVENT, getSessions, type CheckInResult } from "@/lib/db";
import type { Session } from "@/lib/types";
import { AlertTriangleIcon, CheckCircleIcon, PhoneIcon, XCircleIcon } from "@/components/icons";

const REASONS = [
  "QR code belongs to a different event",
  "Registration was not completed",
  "Code has been altered or corrupted",
  "Attendee registered under a different email",
];

function ResultInner() {
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get("code") ?? "";
  const day = (Number(params.get("day")) || 1) as 1 | 2 | 3;

  const [result, setResult] = useState<CheckInResult | null>(null);
  const [nextSession, setNextSession] = useState<Session | null>(null);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!code) return;
    checkInByQr(code, day).then((r) => {
      setResult(r);
      setCheckedAt(new Date());
    });
    getSessions(day).then((sessions) => {
      setNextSession(sessions.find((s) => s.featured) ?? sessions[0] ?? null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, day]);

  if (!code) {
    router.replace("/checkin/scan");
    return null;
  }

  if (!result) {
    return <div className="max-w-2xl mx-auto py-16 text-center text-sm text-ink-muted">Checking code…</div>;
  }

  if (!result.ok) {
    const alreadyIn = result.reason === "already_checked_in";
    return (
      <div className="max-w-2xl mx-auto">
        <div className={`rounded-2xl px-6 py-6 text-white ${alreadyIn ? "bg-warn" : "bg-danger"} relative overflow-hidden`}>
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
          <div className="flex items-center gap-2 mb-2">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <XCircleIcon className="h-5 w-5" />
            </div>
            <p className="text-[11px] uppercase tracking-wide text-white/80">
              {alreadyIn ? "Already Checked In" : "Check-In Failed"}
            </p>
          </div>
          <h1 className="font-display text-2xl font-semibold">
            {alreadyIn ? "Already Checked In Today" : "QR Not Recognised"}
          </h1>
          <p className="text-sm text-white/80 mt-1">
            {alreadyIn
              ? `${result.attendee?.firstName} ${result.attendee?.lastName} was already checked in for Day ${day}.`
              : "Code is invalid or unregistered"}
          </p>
        </div>

        {!alreadyIn && (
          <div className="mt-4 rounded-2xl bg-white border border-line shadow-card p-5">
            <p className="flex items-center gap-2 text-sm font-medium text-ink mb-3">
              <AlertTriangleIcon className="h-4 w-4 text-danger" />
              Possible reasons
            </p>
            <ul className="space-y-2">
              {REASONS.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-ink-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-danger mt-1.5 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 space-y-2">
          <Link
            href="/checkin/scan"
            className="block w-full text-center rounded-xl bg-navy py-3 text-sm font-semibold text-white hover:bg-navy-light transition-colors"
          >
            Try Again
          </Link>
          <button className="w-full flex items-center justify-center gap-2 rounded-xl border border-line bg-white py-3 text-sm font-semibold text-ink hover:bg-canvas transition-colors">
            <PhoneIcon className="h-4 w-4" />
            Contact Coordination Team
          </button>
        </div>
      </div>
    );
  }

  const attendee = result.attendee!;
  const initials = `${attendee.firstName[0]}${attendee.lastName[0]}`;
  const checkedInCount = result.totalCheckedInToday ?? 0;
  const pct = Math.min(100, Math.round((checkedInCount / EVENT.expectedAttendees) * 100));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-2xl bg-success px-6 py-6 text-white relative overflow-hidden">
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
        <div className="flex items-center gap-2 mb-1">
          <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <CheckCircleIcon className="h-5 w-5" />
          </div>
          <h1 className="font-display text-xl font-semibold">Checked In Successfully</h1>
        </div>
        <p className="text-sm text-white/80">
          {checkedAt?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · Day {day} ·{" "}
          {EVENT.dateRange}
        </p>
      </div>

      <div className="mt-4 rounded-2xl bg-white border border-line shadow-card p-5">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-navy/10 text-navy text-sm font-semibold flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink truncate">
              {attendee.firstName} {attendee.lastName}
            </p>
            <p className="text-xs text-ink-faint truncate">{attendee.organisation}</p>
          </div>
          <div className="ml-auto">
            <RoleBadge role={attendee.role} />
          </div>
        </div>

        {nextSession && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-canvas px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-wide text-ink-faint">Next Session</p>
              <p className="text-sm font-medium text-ink mt-0.5 truncate">{nextSession.title}</p>
            </div>
            <div className="rounded-xl bg-canvas px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-wide text-ink-faint">Venue</p>
              <p className="text-sm font-medium text-ink mt-0.5 truncate">{nextSession.location}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-2xl bg-white border border-line shadow-card p-5">
        <p className="text-[11px] uppercase tracking-wide text-ink-faint mb-2">Live Event Status</p>
        {nextSession && (
          <p className="text-sm font-medium text-ink flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success" />
            {nextSession.title} starting at {nextSession.start}
          </p>
        )}
        <p className="text-xs text-ink-faint mt-1">
          {checkedInCount} of {EVENT.expectedAttendees} attendees checked in
          {nextSession ? ` · ${nextSession.location}` : ""}
        </p>
        <div className="mt-2 h-2 rounded-full bg-canvas overflow-hidden">
          <div className="h-full bg-navy rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <Link
        href="/checkin/scan"
        className="mt-4 block w-full text-center rounded-xl bg-navy py-3 text-sm font-semibold text-white hover:bg-navy-light transition-colors"
      >
        Scan Next Attendee
      </Link>
    </div>
  );
}

export default function ResultPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="py-16 text-center text-sm text-ink-muted">Loading…</div>}>
        <ResultInner />
      </Suspense>
    </ProtectedRoute>
  );
}
