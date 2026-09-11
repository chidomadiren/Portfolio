/**
 * Original logo used in the app.
 * Reverted to the simpler globe + OAK wordmark design.
 */
export function GlobeMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.4" />
      <ellipse cx="16" cy="16" rx="5.5" ry="13" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3 16h26M4.3 10h23.4M4.3 22h23.4" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

export default function Logo({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  const iconSize = size === "sm" ? "h-6 w-6" : "h-8 w-8";
  const wordSize = size === "sm" ? "text-xs" : "text-sm";
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <GlobeMark className={`${iconSize} text-navy shrink-0`} />
      <div className="leading-none">
        <p className={`font-display font-semibold text-navy ${wordSize}`}>OAK</p>
        <p className="text-[9px] tracking-[0.14em] text-ink-faint">FOUNDATION</p>
      </div>
    </div>
  );
}
