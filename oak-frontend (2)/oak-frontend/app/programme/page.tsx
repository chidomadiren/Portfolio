"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import {
  addSessionNote,
  getKeyTakeaways,
  getPhotos,
  getResources,
  getSessionNotes,
  getSessions,
} from "@/lib/db";
import type { Session, SessionNote, SessionType, Resource } from "@/lib/types";
import { DownloadIcon, FileIcon } from "@/components/icons";

const DAYS: { day: 1 | 2 | 3; label: string; date: string }[] = [
  { day: 1, label: "Day 1", date: "9 Nov" },
  { day: 2, label: "Day 2", date: "10 Nov" },
  { day: 3, label: "Day 3", date: "11 Nov" },
];

const TYPE_STYLES: Record<SessionType, { dot: string; bg: string; text: string }> = {
  Plenary: { dot: "bg-navy", bg: "bg-navy/5", text: "text-navy" },
  Breakout: { dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700" },
  Workshop: { dot: "bg-purple-500", bg: "bg-purple-50", text: "text-purple-700" },
  Social: { dot: "bg-orange-500", bg: "bg-orange-50", text: "text-orange-700" },
};

export default function ProgrammePage() {
  const [day, setDay] = useState<1 | 2 | 3>(1);
  const [view, setView] = useState<"schedule" | "docs">("schedule");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [photos, setPhotos] = useState<{ id: string; day: 1 | 2 | 3 }[]>([]);
  const [takeaways, setTakeaways] = useState<string[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [addingNote, setAddingNote] = useState(false);
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    getSessions(day).then(setSessions);
    getSessionNotes(day).then(setNotes);
    getPhotos(day).then(setPhotos);
  }, [day]);

  useEffect(() => {
    getKeyTakeaways().then(setTakeaways);
    getResources().then(setResources);
  }, []);

  const featured = sessions.find((s) => s.featured);
  const regularSessions = sessions.filter((s) => !s.featured);

  async function submitNote() {
    if (!noteText.trim()) return;
    const created = await addSessionNote({
      day,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      authorName: "Coordination Team",
      authorOrg: "OAK Foundation",
      text: noteText.trim(),
    });
    setNotes((n) => [created, ...n]);
    setNoteText("");
    setAddingNote(false);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-xl font-semibold text-ink">Programme</h1>
      <p className="text-sm text-ink-muted mt-0.5">OAK Partner Convening 2026</p>

      <div className="mt-4 inline-flex rounded-lg border border-line bg-white overflow-hidden">
        <button
          onClick={() => setView("schedule")}
          className={clsx(
            "px-4 py-1.5 text-xs font-semibold",
            view === "schedule" ? "bg-navy text-white" : "text-ink-muted hover:bg-canvas"
          )}
        >
          Schedule
        </button>
        <button
          onClick={() => setView("docs")}
          className={clsx(
            "px-4 py-1.5 text-xs font-semibold",
            view === "docs" ? "bg-navy text-white" : "text-ink-muted hover:bg-canvas"
          )}
        >
          Docs
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        {DAYS.map((d) => (
          <button
            key={d.day}
            onClick={() => setDay(d.day)}
            className={clsx(
              "flex-1 rounded-xl border px-3 py-2.5 text-left transition-colors",
              day === d.day ? "bg-navy border-navy text-white" : "bg-white border-line text-ink hover:bg-canvas"
            )}
          >
            <p className={clsx("text-[10px] uppercase tracking-wide", day === d.day ? "text-white/70" : "text-ink-faint")}>
              {d.date}
            </p>
            <p className="text-sm font-semibold">{d.label}</p>
          </button>
        ))}
      </div>

      {view === "schedule" ? (
        <div className="mt-5">
          {featured && (
            <div className="rounded-2xl bg-gradient-to-br from-navy to-navy-dark text-white px-5 py-5">
              <p className="text-[10px] uppercase tracking-wide text-white/60">★ Featured · {featured.start}–{featured.end}</p>
              <h2 className="text-lg font-semibold mt-1">{featured.title}</h2>
              {featured.speaker && (
                <p className="text-sm text-white/70 mt-1">
                  {featured.speaker} · {featured.speakerOrg}
                </p>
              )}
              <p className="text-xs text-white/60 mt-1">{featured.location}</p>
            </div>
          )}

          <div className="flex items-center gap-4 mt-4 mb-2 text-[11px] text-ink-faint">
            {(Object.keys(TYPE_STYLES) as SessionType[]).map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <span className={clsx("h-1.5 w-1.5 rounded-full", TYPE_STYLES[t].dot)} />
                {t}
              </span>
            ))}
          </div>

          <div className="space-y-2.5">
            {regularSessions.length === 0 && !featured && (
              <p className="text-sm text-ink-faint py-8 text-center">No sessions scheduled for this day yet.</p>
            )}
            {regularSessions.map((s) => {
              const style = TYPE_STYLES[s.type];
              return (
                <div key={s.id} className="rounded-xl bg-white border border-line shadow-card p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] text-ink-faint">
                        {s.start}–{s.end}
                      </p>
                      <p className="text-sm font-medium text-ink mt-0.5">{s.title}</p>
                      {s.speaker && (
                        <p className="text-xs text-ink-faint mt-0.5">
                          {s.speaker} · {s.speakerOrg}
                        </p>
                      )}
                      <p className="text-xs text-ink-faint mt-0.5">{s.location}</p>
                    </div>
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium shrink-0",
                        style.bg,
                        style.text
                      )}
                    >
                      <span className={clsx("h-1.5 w-1.5 rounded-full", style.dot)} />
                      {s.type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-ink">Session Notes</p>
              <button
                onClick={() => setAddingNote((v) => !v)}
                className="rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-light transition-colors"
              >
                + Add Note
              </button>
            </div>

            {addingNote && (
              <div className="mb-3 rounded-xl border border-line bg-white p-3">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={3}
                  placeholder="Add a note about this session…"
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => setAddingNote(false)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-canvas"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitNote}
                    className="rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-light"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2.5">
              {notes.length === 0 && (
                <p className="text-sm text-ink-faint py-4 text-center">No notes for this day yet.</p>
              )}
              {notes.map((n) => (
                <div key={n.id} className="rounded-xl bg-white border border-line shadow-card p-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-navy/10 text-navy text-[11px] font-semibold flex items-center justify-center shrink-0">
                      {n.authorName
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink truncate">{n.authorName}</p>
                      <p className="text-[11px] text-ink-faint truncate">{n.authorOrg}</p>
                    </div>
                    <span className="text-[11px] text-ink-faint shrink-0">
                      Day {n.day} · {n.time}
                    </span>
                  </div>
                  <p className="text-sm text-ink-muted mt-2 leading-relaxed">{n.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-ink">Photo Gallery</p>
              <span className="text-xs text-ink-faint">{photos.length} photos</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {photos.map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={p.id}
                  src={`https://picsum.photos/seed/${p.id}/400/300`}
                  alt={`Day ${p.day} event photo`}
                  className="rounded-lg object-cover w-full h-32 bg-canvas"
                  loading="lazy"
                />
              ))}
              {photos.length === 0 && (
                <p className="col-span-2 text-sm text-ink-faint py-4 text-center">No photos uploaded for this day yet.</p>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink mb-3">Key Takeaways</p>
            <div className="rounded-xl bg-white border border-line shadow-card p-4">
              <ol className="space-y-2.5">
                {takeaways.map((t, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-ink-muted">
                    <span className="h-5 w-5 rounded-full bg-navy text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    {t}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink mb-3">Resources</p>
            <div className="rounded-xl bg-white border border-line shadow-card divide-y divide-line">
              {resources.map((r) => (
                <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="h-9 w-9 rounded-lg bg-canvas flex items-center justify-center shrink-0 text-ink-faint">
                    <FileIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink truncate">{r.name}</p>
                    <p className="text-[11px] text-ink-faint">
                      {r.fileType} · {r.size} · {r.day}
                    </p>
                  </div>
                  <button
                    title="Connect Supabase Storage to enable downloads"
                    className="text-ink-faint hover:text-navy transition-colors shrink-0"
                  >
                    <DownloadIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
