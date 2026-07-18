import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "blue" | "emerald" | "slate" | "amber";

const tones: Record<Tone, string> = {
  blue: "bg-primary-50 text-primary-700 ring-primary-600/20",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  slate: "bg-slate-100 text-slate-600 ring-slate-500/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
};

export function Badge({ tone = "slate", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}
