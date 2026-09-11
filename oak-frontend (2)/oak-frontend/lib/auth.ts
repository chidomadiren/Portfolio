/**
 * Admin auth.
 *
 * SWAP POINT: replace the body of these functions with Supabase Auth
 * (supabase.auth.signInWithPassword / signOut / getSession). Keep the
 * same function signatures so ProtectedRoute and the login page don't
 * need to change.
 *
 * Only the coordination team should ever reach /checkin or /attendance —
 * attendees never log in (see project brief: "Out of Scope").
 */

import type { AdminSession } from "./types";

const KEY = "oak_admin_session";

export async function signIn(email: string, _password: string): Promise<AdminSession> {
  const session: AdminSession = { email, signedInAt: new Date().toISOString() };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(session));
  }
  return session;
}

export function getSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as AdminSession) : null;
}

export function signOut() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
