"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPartnerById } from "@/lib/db";
import type { Partner } from "@/lib/types";
import { ArrowUpRightIcon, MailIcon } from "@/components/icons";

export default function PartnerDetailPage({ params }: { params: { id: string } }) {
  const [partner, setPartner] = useState<Partner | null | undefined>(undefined);

  useEffect(() => {
    getPartnerById(params.id).then(setPartner);
  }, [params.id]);

  if (partner === undefined) {
    return <div className="max-w-2xl mx-auto py-16 text-center text-sm text-ink-muted">Loading…</div>;
  }

  if (partner === null) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <p className="text-ink font-medium">Partner not found.</p>
        <Link href="/partners" className="text-navy text-sm underline underline-offset-2 mt-2 inline-block">
          Back to directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-2xl bg-gradient-to-br from-navy to-navy-dark text-white px-6 py-7 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="h-11 w-11 rounded-lg bg-white/15 text-white text-sm font-semibold flex items-center justify-center mb-3">
          {partner.code}
        </div>
        <p className="text-[11px] uppercase tracking-wide text-white/70">
          {partner.category} · Partner since {partner.partnerSince}
        </p>
        <h1 className="font-display text-xl font-semibold mt-1">{partner.name}</h1>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {partner.tags.map((t) => (
            <span key={t} className="text-[11px] rounded-full bg-white/15 px-2.5 py-1">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white border border-line shadow-card p-5">
        <p className="text-[11px] uppercase tracking-wide text-ink-faint mb-2">About</p>
        <p className="text-sm text-ink-muted leading-relaxed">{partner.about}</p>
      </div>

      <div className="mt-4 rounded-2xl bg-white border border-line shadow-card p-5">
        <p className="text-[11px] uppercase tracking-wide text-ink-faint mb-3">Contact at Convening</p>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-navy/10 text-navy text-xs font-semibold flex items-center justify-center shrink-0">
            {partner.contactName
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink truncate">{partner.contactName}</p>
            <p className="text-xs text-ink-faint truncate">{partner.contactEmail}</p>
          </div>
        </div>
      </div>

      <a
        href={partner.website}
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex items-center justify-between rounded-xl bg-navy px-4 py-3 text-sm font-semibold text-white hover:bg-navy-light transition-colors"
      >
        <span className="flex items-center gap-2">Visit Website</span>
        <ArrowUpRightIcon className="h-4 w-4" />
      </a>

      <a
        href={`mailto:${partner.contactEmail}`}
        className="mt-2.5 flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink hover:bg-canvas transition-colors"
      >
        <span className="flex items-center gap-2">
          <MailIcon className="h-4 w-4" />
          Send Message
        </span>
      </a>
    </div>
  );
}
