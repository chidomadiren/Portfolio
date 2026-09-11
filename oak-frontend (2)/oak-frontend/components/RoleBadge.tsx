import { roleColor } from "@/lib/db";
import type { Role } from "@/lib/types";

export default function RoleBadge({ role }: { role: Role }) {
  const c = roleColor(role);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${c.bg} ${c.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {role}
    </span>
  );
}
