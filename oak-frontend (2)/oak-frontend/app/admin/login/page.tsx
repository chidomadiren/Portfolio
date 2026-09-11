"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Enter your coordination team email and password.");
      return;
    }
    setSubmitting(true);
    try {

      await signIn(email.trim(), password);
      const next = params.get("next") || "/checkin/scan";
      router.push(next);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto py-16">
      <h1 className="text-xl font-semibold text-ink text-center">Coordination Team Login</h1>
      <p className="text-sm text-ink-muted text-center mt-1">
        Check-in and attendance are restricted to admins.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 rounded-2xl bg-white border border-line shadow-card p-5 space-y-3">
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-wide text-ink-faint mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@oakfnd.org"
            className="w-full rounded-lg border border-line px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-wide text-ink-faint mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-line px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
          />
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-navy py-2.5 text-sm font-semibold text-white hover:bg-navy-light transition-colors disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
