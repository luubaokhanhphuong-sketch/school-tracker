import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PRIORITY_META = {
  high: { label: "High", className: "border-destructive/30 bg-destructive/10 text-destructive" },
  medium: { label: "Medium", className: "border-[var(--chart-3)]/40 bg-[var(--chart-3)]/15 text-foreground" },
  low: { label: "Low", className: "border-[var(--chart-2)]/40 bg-[var(--chart-2)]/10 text-[var(--chart-2)]" },
};

const STATUS_META = {
  todo: { label: "To do", className: "bg-muted text-muted-foreground" },
  in_progress: { label: "In progress", className: "border-[var(--chart-1)]/40 bg-[var(--chart-1)]/10 text-[var(--chart-1)]" },
  completed: { label: "Completed", className: "border-[var(--chart-2)]/40 bg-[var(--chart-2)]/10 text-[var(--chart-2)]" },
};

export function PriorityBadge({ priority, className }) {
  const meta = PRIORITY_META[priority] || PRIORITY_META.medium;
  return (
    <Badge variant="outline" className={cn("h-6 font-mono text-[10px] uppercase tracking-wider", meta.className, className)}>
      {meta.label}
    </Badge>
  );
}

export function StatusBadge({ status, className }) {
  const meta = STATUS_META[status] || STATUS_META.todo;
  return (
    <Badge variant="outline" className={cn("h-6 text-[11px]", meta.className, className)}>
      {meta.label}
    </Badge>
  );
}

export function SubjectChip({ name, color, icon, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
        className
      )}
      style={{ backgroundColor: `${color}1f`, color }}
    >
      <span aria-hidden>{icon}</span>
      {name}
    </span>
  );
}

export function ColorDot({ color, size = 10, className }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block rounded-full", className)}
      style={{ width: size, height: size, backgroundColor: color }}
    />
  );
}