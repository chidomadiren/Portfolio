"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleBadge from "@/components/RoleBadge";
import { getPublicAttendeeList } from "@/lib/db";
import type { PublicAttendee } from "@/lib/types";

const READER_ID = "qr-reader-region";
const DAYS = [1, 2, 3] as const;

function ScanPageInner() {
  const router = useRouter();
  const [day, setDay] = useState<1 | 2 | 3>(1);
  const [attendees, setAttendees] = useState<PublicAttendee[]>([]);
  const [manualCode, setManualCode] = useState("");
  const [cameraStatus, setCameraStatus] = useState<"idle" | "starting" | "running" | "error">("idle");
  const [cameraError, setCameraError] = useState("");
  const [recentCheckins, setRecentCheckins] = useState<(PublicAttendee & { checkedInAt: string })[]>([]);
  const scannerRef = useRef<any>(null);
  const navigatingRef = useRef(false);

  useEffect(() => {
    getPublicAttendeeList().then(setAttendees);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      setCameraStatus("starting");
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;
        const instance = new Html5Qrcode(READER_ID, { verbose: false });
        scannerRef.current = instance;
        await instance.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText: string) => {
            if (navigatingRef.current) return;
            navigatingRef.current = true;
            goToResult(decodedText);
          },
          () => {
            /* per-frame scan failure — ignore, expected while searching */
          }
        );
        if (!cancelled) setCameraStatus("running");
      } catch (err: any) {
        if (!cancelled) {
          setCameraStatus("error");
          setCameraError(
            err?.message?.includes("Permission")
              ? "Camera permission denied. Allow camera access or use manual entry below."
              : "Couldn't start the camera. Use manual entry or the simulate list below."
          );
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      const instance = scannerRef.current;
      if (instance) {
        instance
          .stop()
          .then(() => instance.clear())
          .catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goToResult(code: string) {
    const normalized = code.trim();
    if (!normalized) return;
    setRecentCheckins((current) => {
      const match = attendees.find((a) => a.qrCode.toUpperCase() === normalized.toUpperCase());
      if (!match) return current;
      const next = [
        { ...match, checkedInAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
        ...current.filter((item) => item.id !== match.id),
      ].slice(0, 5);
      return next;
    });
    router.push(`/checkin/result?code=${encodeURIComponent(normalized)}&day=${day}`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Event Check-In</h1>
          <p className="text-sm text-ink-muted mt-0.5">Scan an attendee QR code to check them in</p>
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

      <div className="mt-4 rounded-2xl bg-navy-dark overflow-hidden relative aspect-square max-h-[380px]">
        <div id={READER_ID} className="w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full" />
        {cameraStatus !== "running" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center pointer-events-none">
            <div className="h-40 w-40 border-2 border-white/30 rounded-2xl" />
            <p className="text-white/60 text-xs mt-4">
              {cameraStatus === "starting" && "Starting camera…"}
              {cameraStatus === "error" && cameraError}
              {cameraStatus === "idle" && "Position QR code within the frame"}
            </p>
          </div>
        )}
      </div>
      <p className="text-center text-[11px] text-ink-faint mt-2">
        Hold camera steady · auto-scans in 1–2 seconds
      </p>

      <div className="mt-4 rounded-2xl bg-white border border-line shadow-card p-4">
        <p className="text-[11px] uppercase tracking-wide text-ink-faint mb-3">Manual Code Entry</p>
        <div className="flex gap-2">
          <input
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="OAK-2026-XXXX-XXXX"
            className="flex-1 rounded-lg border border-line px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
          />
          <button
            onClick={() => manualCode.trim() && goToResult(manualCode.trim())}
            className="rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-light transition-colors"
          >
            Check
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-white border border-line shadow-card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] uppercase tracking-wide text-ink-faint">Checked In</p>
          <span className="text-[11px] text-ink-faint">Recent</span>
        </div>

        {recentCheckins.length === 0 ? (
          <p className="text-sm text-ink-faint py-2">No attendees scanned in yet.</p>
        ) : (
          <div className="space-y-2">
            {recentCheckins.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5">
                <div className="h-9 w-9 rounded-full bg-navy/10 text-navy text-xs font-semibold flex items-center justify-center shrink-0">
                  {a.firstName[0]}
                  {a.lastName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink truncate">
                    {a.firstName} {a.lastName}
                  </p>
                  <p className="text-[11px] text-ink-faint truncate">{a.organisation}</p>
                </div>
                <div className="text-right shrink-0">
                  <RoleBadge role={a.role} />
                  <p className="mt-1 text-[10px] text-ink-faint">{a.checkedInAt}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ScanPage() {
  return (
    <ProtectedRoute>
      <ScanPageInner />
    </ProtectedRoute>
  );
}
