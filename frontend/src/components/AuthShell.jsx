import { GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="rule-paper flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <GraduationCap className="size-7" aria-hidden />
        </span>
        <div>
          <p className="font-display text-2xl font-bold tracking-tight">
            School Tracker
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            semester notebook
          </p>
        </div>
      </div>

      <Card className="w-full max-w-sm p-6">
        <div className="mb-5">
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {children}
      </Card>

      {footer && (
        <p className="mt-6 text-sm text-muted-foreground">{footer}</p>
      )}
    </div>
  );
}
