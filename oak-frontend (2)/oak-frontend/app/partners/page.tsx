"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { getPartners } from "@/lib/db";
import type { Partner } from "@/lib/types";
import { ArrowUpRightIcon, ChevronRightIcon, SearchIcon } from "@/components/icons";

const REGIONS = [
  "All Regions",
  "Global",
  "Sub-Saharan Africa",
  "Northern Europe",
  "Middle East & North Africa",
] as const;

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("All Regions");

  useEffect(() => {
    getPartners().then(setPartners);
  }, []);

  const subPartners = partners.filter((p) => p.isSubPartner);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return partners.filter((p) => {
      const matchesRegion = region === "All Regions" || p.region === region;
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q);
      return matchesRegion && matchesQuery;
    });
  }, [partners, query, region]);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-xl font-semibold text-ink">Partner Directory</h1>
      <p className="text-sm text-ink-muted mt-0.5">{partners.length} partner organisations</p>

      <div className="mt-4 relative">
        <SearchIcon className="h-4 w-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search organisations, focus areas…"
          className="w-full rounded-lg border border-line bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
        />
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {REGIONS.map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            className={clsx(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors",
              region === r ? "bg-navy border-navy text-white" : "bg-white border-line text-ink-muted hover:bg-canvas"
            )}
          >
            {r}
          </button>
        ))}
      </div>

      {subPartners.length > 0 && (
        <div className="mt-5">
          <p className="text-[11px] uppercase tracking-wide text-ink-faint mb-2">Sub-Partners</p>
          <div className="grid grid-cols-3 gap-2">
            {subPartners.map((p) => (
              <Link
                key={p.id}
                href={`/partners/${p.id}`}
                className="rounded-xl border border-line bg-white p-3 text-center hover:bg-canvas transition-colors"
              >
                <div className="mx-auto h-9 w-9 rounded-lg bg-navy text-white text-xs font-semibold flex items-center justify-center mb-1.5">
                  {p.code}
                </div>
                <p className="text-[11px] font-medium text-ink truncate">{p.code}</p>
                <p className="text-[10px] text-ink-faint truncate">{p.region}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5">
        <p className="text-[11px] uppercase tracking-wide text-ink-faint mb-2">All Partners</p>
        <div className="space-y-2.5">
          {filtered.map((p) => (
            <Link
              key={p.id}
              href={`/partners/${p.id}`}
              className="flex items-center gap-3 rounded-xl bg-white border border-line shadow-card p-3.5 hover:bg-canvas transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-navy text-white text-xs font-semibold flex items-center justify-center shrink-0">
                {p.code}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink truncate">{p.name}</p>
                <p className="text-[11px] text-ink-faint">{p.region}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {p.tags.map((t) => (
                    <span key={t} className="text-[10px] rounded-full bg-canvas px-2 py-0.5 text-ink-muted">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1 mt-1.5 text-[11px] text-ink-faint">
                  <span>Partner since {p.partnerSince}</span>
                  <span>·</span>
                  <a
                    href={p.website}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-0.5 text-navy hover:underline"
                  >
                    {p.website.replace(/^https?:\/\//, "")}
                    <ArrowUpRightIcon className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-ink-faint shrink-0" />
            </Link>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-ink-faint py-8 text-center">No partners match your search.</p>
          )}
        </div>
      </div>
    </div>
  );
}
