import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function Disclaimer({
  children,
  className,
  title = "Health disclaimer",
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-2xl border border-border bg-secondary/60 p-4 text-xs leading-relaxed text-muted-foreground",
        className,
      )}
      role="note"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
      <p>
        <strong className="text-foreground">{title}: </strong>
        {children}
      </p>
    </div>
  );
}
