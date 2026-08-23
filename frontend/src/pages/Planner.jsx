import { useMemo, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  isSameDay,
  parse,
} from "date-fns";
import { Check, Clock, Pencil, Plus, Trash2, CalendarDays, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Reveal } from "@/components/Reveal";
import { usePlanner } from "@/hooks/use-planner-data";
import { SubjectChip } from "@/components/badges";
import { SessionDialog, ConfirmDialog, EmptyState } from "@/components/dialogs";
import { fmtLong, fmtTime, hoursLabel } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function PlannerPage() {
  const {
    sessions,
    subjects,
    createSession,
    updateSession,
    deleteSession,
  } = usePlanner();
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const sessionDays = useMemo(() => {
    const days = {};
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    sessions.forEach((s) => {
      const d = parse(s.date, "yyyy-MM-dd", new Date());
      if (d >= start && d <= end) {
        const key = format(d, "yyyy-MM-dd");
        days[key] = (days[key] || 0) + 1;
      }
    });
    return days;
  }, [sessions, month]);

  const selectedKey = format(selected, "yyyy-MM-dd");
  const daySessions = useMemo(
    () =>
      sessions
        .filter((s) => s.date === selectedKey)
        .sort(
          (a, b) =>
            (a.start_time || "").localeCompare(b.start_time || "")
        ),
    [sessions, selectedKey]
  );

  const dayMinutes = daySessions
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + s.duration_minutes, 0);

  const monthPlanned = sessions.filter((s) => {
    const d = parse(s.date, "yyyy-MM-dd", new Date());
    return d >= startOfMonth(month) && d <= endOfMonth(month);
  });

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openNewForDay = () => {
    const dateStr = format(selected, "yyyy-MM-dd");
    setEditing({ __prefill: dateStr });
    setDialogOpen(true);
  };

  const handleSave = (payload) => {
    const op = editing?.__prefill
      ? createSession({ ...payload, date: editing.__prefill })
      : editing
        ? updateSession(editing.id, payload)
        : createSession(payload);
    op.then(() => toast.success(editing ? "Session saved" : "Session planned"))
      .catch(() => toast.error("Could not save the session"));
  };

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Study planner
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Block out focused time. Log what you actually complete.
            </p>
          </div>
          <Button onClick={openNew}>
            <Plus className="mr-2 size-4" aria-hidden />
            Plan a session
          </Button>
        </div>
      </Reveal>

      <Reveal>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
          <Card className="self-start">
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={selected}
                onSelect={(d) => d && setSelected(d)}
                month={month}
                onMonthChange={setMonth}
                modifiers={{ session: (d) => !!sessionDays[format(d, "yyyy-MM-dd")] }}
                modifiersClassNames={{
                  session: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:size-1 after:rounded-full after:bg-primary",
                }}
                className="w-full"
              />
              <p className="mt-2 text-center font-mono text-xs text-muted-foreground">
                {monthPlanned.length} session{monthPlanned.length === 1 ? "" : "s"} planned this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="size-4 text-primary" aria-hidden />
                <span>{isSameDay(selected, new Date()) ? "Today" : fmtLong(selectedKey)}</span>
              </CardTitle>
              <div className="flex items-center gap-2">
                {dayMinutes > 0 && (
                  <span className="font-mono text-xs text-success">
                    {hoursLabel(dayMinutes)} logged
                  </span>
                )}
                <Button variant="outline" size="sm" onClick={openNewForDay}>
                  <Plus className="mr-1.5 size-3.5" aria-hidden />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              {subjects.length === 0 ? (
                <EmptyState
                  icon={CalendarDays}
                  title="Create a subject first"
                  hint="Study sessions attach to a subject. Head to Subjects to begin."
                  action={
                    <Button variant="outline" size="sm" className="mt-2" asChild>
                      <a href="/subjects">Go to subjects</a>
                    </Button>
                  }
                />
              ) : daySessions.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="No sessions planned"
                  hint="Pick a time and log some focused work for this day."
                  action={
                    <Button variant="outline" size="sm" className="mt-2" onClick={openNewForDay}>
                      <Plus className="mr-2 size-4" aria-hidden />
                      Plan a session
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-2.5">
                  {daySessions.map((s) => (
                    <div
                      key={s.id}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border border-border/80 p-3.5",
                        s.completed && "bg-muted/40"
                      )}
                    >
                      <button
                        onClick={() =>
                          updateSession(s.id, { completed: !s.completed })
                            .then(() =>
                              toast.success(s.completed ? "Session unlogged" : "Session logged")
                            )
                            .catch(() => toast.error("Could not update session"))
                        }
                        className={cn(
                          "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                          s.completed
                            ? "border-[var(--chart-2)] bg-[var(--chart-2)] text-background"
                            : "border-muted-foreground/40 hover:border-[var(--chart-2)]"
                        )}
                        aria-label={
                          s.completed ? "Mark session as not completed" : "Mark session as completed"
                        }
                      >
                        {s.completed && <Check className="size-3.5" aria-hidden />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={cn("truncate text-sm font-medium", s.completed && "line-through opacity-60")}>
                          {s.title || "Study session"}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <SubjectChip
                            name={s.subject_name}
                            color={s.subject_color}
                            icon={s.subject_icon}
                          />
                          <span className="font-mono text-xs text-muted-foreground">
                            {s.start_time ? fmtTime(s.start_time) : "Anytime"}
                            {s.duration_minutes ? ` · ${hoursLabel(s.duration_minutes)}` : ""}
                          </span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 shrink-0 text-muted-foreground"
                            aria-label={`Options for ${s.title || "session"}`}
                          >
                            <MoreHorizontal className="size-4" aria-hidden />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() => {
                              setEditing(s);
                              setDialogOpen(true);
                            }}
                          >
                            <Pencil className="mr-2 size-4" aria-hidden /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={() => setConfirmDelete(s)}
                          >
                            <Trash2 className="mr-2 size-4" aria-hidden /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Reveal>

      <SessionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        session={editing?.__prefill ? null : editing}
        subjects={subjects}
        defaultDate={editing?.__prefill}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
        onConfirm={() =>
          deleteSession(confirmDelete.id)
            .then(() => toast.success("Session deleted"))
            .catch(() => toast.error("Could not delete the session"))
        }
        title="Delete session?"
        description="This planned study block will be removed. This cannot be undone."
      />
    </div>
  );
}