"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EVENT, registerAttendee } from "@/lib/db";
import type { Role } from "@/lib/types";
import { UsersIcon, CalendarIcon, GlobeIcon } from "@/components/icons";

const ROLES: Role[] = ["Partner", "OAK Staff", "Coordination Team", "Presenter", "Observer"];

interface FormState {
  firstName: string;
  lastName: string;
  organisation: string;
  subPartner: string;
  role: Role | "";
  email: string;
  phone: string;
  dietary: string;
  accessibility: string;
  travel: string;
  consent: boolean;
}

const EMPTY: FormState = {
  firstName: "",
  lastName: "",
  organisation: "",
  subPartner: "",
  role: "",
  email: "",
  phone: "",
  dietary: "",
  accessibility: "",
  travel: "",
  consent: false,
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.firstName.trim()) next.firstName = "First name is required";
    if (!form.lastName.trim()) next.lastName = "Last name is required";
    if (!form.organisation.trim()) next.organisation = "Organisation is required";
    if (!form.role) next.role = "Select a role";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address";
    if (!form.consent) next.consent = "Consent is required to complete registration";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || submitting) return;
    setSubmitting(true);
    try {
      const attendee = await registerAttendee({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        organisation: form.organisation.trim(),
        subPartner: form.subPartner.trim() || undefined,
        role: form.role as Role,
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        dietary: form.dietary.trim() || undefined,
        accessibility: form.accessibility.trim() || undefined,
        travel: form.travel.trim() || undefined,
      });
      router.push(`/pass/${attendee.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[608px] px-3 py-4 md:px-5">
      <div className="rounded-[24px] bg-[#162E55] px-8 py-7 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
        <h1 className="font-display text-[58px] leading-[0.9] tracking-[-0.06em] text-white">
          Partner
          <br />
          Convening 2026
        </h1>
        <p className="mt-5 text-[20px] leading-none text-white/80">
          {EVENT.city} · {EVENT.dateRange}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <StatMini icon={<UsersIcon className="h-5 w-5" />} value={`${EVENT.expectedAttendees}+`} label="Attendees" />
        <StatMini icon={<CalendarIcon className="h-5 w-5" />} value={EVENT.sessionCount} label="Sessions" />
        <StatMini icon={<GlobeIcon className="h-5 w-5" />} value={EVENT.partnerCount} label="Partners" />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 rounded-[24px] border border-[#dfe3eb] bg-[#f5f5f5] p-5 md:p-6">
        <h2 className="font-display text-[42px] font-semibold leading-none text-ink mb-5">Registration Form</h2>

        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name" required error={errors.firstName}>
            <input
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              placeholder="Maria"
              className={inputClass(!!errors.firstName)}
            />
          </Field>
          <Field label="Last Name" required error={errors.lastName}>
            <input
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              placeholder="Schmidt"
              className={inputClass(!!errors.lastName)}
            />
          </Field>
        </div>

        <Field label="Organisation" required error={errors.organisation} className="mt-4">
          <input
            value={form.organisation}
            onChange={(e) => set("organisation", e.target.value)}
            placeholder="Your organisation name"
            className={inputClass(!!errors.organisation)}
          />
        </Field>

        <Field label="Sub-Partner / Programme Area" className="mt-4">
          <input
            value={form.subPartner}
            onChange={(e) => set("subPartner", e.target.value)}
            placeholder="Optional"
            className={inputClass(false)}
          />
        </Field>

        <Field label="Role / Capacity" required error={errors.role} className="mt-4">
          <select
            value={form.role}
            onChange={(e) => set("role", e.target.value as Role)}
            className={inputClass(!!errors.role)}
          >
            <option value="">Select your role</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Email Address" required error={errors.email} className="mt-4">
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="you@organisation.org"
            className={inputClass(!!errors.email)}
          />
        </Field>

        <Field label="Phone Number" className="mt-4">
          <input
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+41 xx xxx xxxx"
            className={inputClass(false)}
          />
        </Field>

        <div className="mt-4 rounded-xl bg-[#f0f1f3] p-4 space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-faint">Requirements</p>
          <Field label="Dietary Requirements">
            <input
              value={form.dietary}
              onChange={(e) => set("dietary", e.target.value)}
              placeholder="e.g. Vegetarian, Halal, Gluten-free"
              className={inputClass(false)}
            />
          </Field>
          <Field label="Accessibility Requirements">
            <input
              value={form.accessibility}
              onChange={(e) => set("accessibility", e.target.value)}
              placeholder="e.g. Wheelchair access, hearing loop"
              className={inputClass(false)}
            />
          </Field>
          <Field label="Travel & Accommodation">
            <input
              value={form.travel}
              onChange={(e) => set("travel", e.target.value)}
              placeholder="e.g. Flight from Bulawayo, hotel needed"
              className={inputClass(false)}
            />
          </Field>
        </div>

        <label className="mt-4 flex items-start gap-3 cursor-pointer rounded-[16px] border border-[#dfe3eb] bg-[#f7f7f8] px-4 py-4">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => set("consent", e.target.checked)}
            className="mt-1 h-5 w-5 rounded border-[#c8ced8] bg-white text-[#162E55] focus:ring-[#162E55]"
          />
          <span className="text-[15px] leading-[1.45] text-[#3d4a5a]">
            I agree to OAK Foundation&apos;s{" "}
            <a href="#" className="text-[#162E55] underline underline-offset-2">
              privacy policy
            </a>{" "}
            and consent to my registration data being used for event coordination.
          </span>
        </label>
        {errors.consent && <p className="mt-1 text-xs text-danger">{errors.consent}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 flex h-[56px] w-full items-center justify-center rounded-[16px] bg-[#162E55] text-[28px] font-semibold text-white shadow-[0_0_0_3px_rgba(22,46,85,0.12)] transition-colors hover:bg-[#122a4a] disabled:opacity-60"
        >
          {submitting ? "Registering…" : "Register"}
        </button>
      </form>

      <p className="text-center text-[11px] text-ink-faint mt-4">
        Your data is secured and handled by OAK Foundation in accordance with data protection best practice.
      </p>
    </div>
  );
}

function StatMini({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="flex min-h-[122px] flex-col justify-center rounded-[18px] border border-[#dfe3eb] bg-[#f7f7f8] px-4 py-3 shadow-[0_1px_0_rgba(17,24,39,0.02)]">
      <div className="mb-2 flex items-center gap-2 text-[#162E55]">{icon}</div>
      <p className="text-[40px] font-semibold leading-none text-ink">{value}</p>
      <p className="mt-2 text-[17px] text-ink-faint">{label}</p>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7b8795]">
        {label}
        {required && <span className="text-[#d92d2d]"> *</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-[#d92d2d]">{error}</p>}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return [
    "w-full rounded-[12px] border bg-[#edf1f4] px-4 py-3.5 text-[17px] text-ink placeholder:text-[#7d8894]",
    "focus:outline-none focus:ring-2 focus:ring-[#162E55]/20 focus:border-[#162E55]",
    hasError ? "border-[#d92d2d]" : "border-[#dfe4eb]",
  ].join(" ");
}
