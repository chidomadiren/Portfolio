"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { EVENT, getAttendeeById } from "@/lib/db";
import type { Attendee } from "@/lib/types";
import { CheckCircleIcon, DownloadIcon } from "@/components/icons";

export default function PassPage({ params }: { params: { id: string } }) {
  const [attendee, setAttendee] = useState<Attendee | null | undefined>(undefined);
  const qrWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getAttendeeById(params.id).then(setAttendee);
  }, [params.id]);

  function downloadQr() {
    const canvas = qrWrapRef.current?.querySelector("canvas");
    if (!canvas || !attendee) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${attendee.qrCode}.png`;
    a.click();
  }

  if (attendee === undefined) {
    return <div className="max-w-2xl mx-auto py-16 text-center text-ink-muted text-sm">Loading your pass…</div>;
  }

  if (attendee === null) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <p className="text-ink font-medium">We couldn&apos;t find that registration.</p>
        <Link href="/register" className="text-navy text-sm underline underline-offset-2 mt-2 inline-block">
          Register again
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-2xl bg-gradient-to-br from-navy to-navy-dark text-white px-6 py-7">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center">
            <CheckCircleIcon className="h-5 w-5" />
          </div>
          <p className="text-[11px] uppercase tracking-wide text-white/70">Registration Complete</p>
        </div>
        <h1 className="font-display text-2xl font-semibold">You&apos;re Registered, {attendee.firstName}!</h1>
        <p className="text-sm text-white/70 mt-1">{attendee.organisation}</p>
      </div>

      <div className="mt-4 rounded-2xl bg-white border border-line shadow-card p-6 flex flex-col items-center">
        <p className="text-[11px] uppercase tracking-wide text-ink-faint mb-4">Your Entry Pass</p>
        <div ref={qrWrapRef} className="rounded-xl border border-line p-4 bg-white">
          <QRCodeCanvas value={attendee.qrCode} size={180} level="M" />
        </div>
        <p className="mt-3 text-sm font-mono tracking-wide text-ink">{attendee.qrCode}</p>
        <p className="text-xs text-ink-faint mt-1">Present at event entrance for check-in</p>
      </div>

      <div className="mt-4 rounded-2xl bg-white border border-line shadow-card p-5">
        <p className="text-[11px] uppercase tracking-wide text-ink-faint mb-3">Registration Details</p>
        <dl className="text-sm divide-y divide-line">
          <Row label="Name" value={`${attendee.firstName} ${attendee.lastName}`} />
          <Row label="Organisation" value={attendee.organisation} />
          <Row label="Role" value={attendee.role} />
          <Row label="Email" value={attendee.email} />
          <Row label="Event Dates" value={EVENT.dateRange} />
          <Row label="Location" value={EVENT.location} />
        </dl>
      </div>

      <button
        onClick={downloadQr}
        className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-navy py-3 text-sm font-semibold text-white hover:bg-navy-light transition-colors"
      >
        <DownloadIcon className="h-4 w-4" />
        Download QR Code
      </button>

      <Link
        href="/register"
        className="mt-4 block text-center text-sm text-ink-muted hover:text-navy underline underline-offset-2"
      >
        Register another attendee
      </Link>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="text-ink font-medium">{value}</dd>
    </div>
  );
}
