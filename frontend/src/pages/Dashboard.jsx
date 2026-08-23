import { lazy, Suspense, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Circle,
  ClipboardPlus,
  Clock,
  Flame,
  Plus,
  CalendarClock,
  Trophy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Reveal } from "@/components/Reveal";
import { usePlanner, useFetch } from "@/hooks/use-planner-data";
import { fmtDate, fmtTime, isToday, daysLeft, hoursLabel } from "@/lib/dates";
import { SubjectChip, ColorDot } from "@/components/badges";
import { AssignmentDialog } from "@/components/dialogs";
import { toast } from "sonner";

const BooksScene = lazy(() => import("@/components/three/BooksScene"));

function BooksIllustration() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            loading the desk…
          </span>
        </div>
      }
    >
      <BooksScene />
    </Suspense>
  );
}

function Hero({ summary }) {
  const nextExam = summary.upcoming_exams?.[0];
  const days = nextExam ? daysLeft(nextExam.exam_date) : null;

  return (
    <section className="rule-paper relative overflow-hidden rounded-2xl border border-border bg-paper">
      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-2 lg:items-center">
        <div className="max-w-xl">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {nextExam ? "Nearest exam" : "Your study command post"}
          </p>
          {nextExam ? (
            <>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="highlight font-display text-7xl font-bold leading-none tracking-tight sm:text-[6.5rem]">
                  {days}
                </span>
                <span className="font-display text-2xl font-semibold sm:text-3xl">
                  {days === 0 ? "today." : days === 1 ? "day" : "days"}
                </span>
              </div>
              <p className="mt-1 font-display text-xl font-semibold sm:text-2xl">
                until {nextExam.title || `${nextExam.subject_name}`}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <SubjectChip
                  name={nextExam.subject_name}
                  color={nextExam.subject_color}
                  icon={nextExam.subject_icon}
                  className="text-sm"
                />
                <span className="font-mono text-sm text-muted-foreground">
                  {fmtDate(nextExam.exam_date)}
                </span>
                {nextExam.notes && (
                  <span className="text-sm text-muted-foreground">
                    {nextExam.notes}
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                Nothing on the timetable{" "}
                <span className="highlight">yet.</span>
              </h1>
              <p className="mt-3 text-base text-muted-foreground">
                Add your first exam to start a countdown, or log today&apos;s work
                to get moving.
              </p>
            </>
          )}
        </div>

        <div className="relative hidden h-56 lg:block">
          <BooksIllustration />
        </div>

        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat
              icon={ClipboardPlus}
              label="Due today"
              value={summary.todo_today}
              accent
            />
            <Stat
              icon={Flame}
              label="Overdue"
              value={summary.overdue}
              warn={summary.overdue > 0}
            />
            <Stat icon={Clock} label="Pending tasks" value={summary.pending_tasks} />
            <Stat
              icon={Trophy}
              label="Completion"
              value={`${Math.round(summary.completion_percentage || 0)}%`}
            />
          </div>
          <div className="mt-1.5">
            <Progress
              value={summary.completion_percentage || 0}
              className="h-1.5 bg-[var(--rule)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon: Icon, label, value, accent, warn }) {
  return (
    <div className="rounded-xl border border-border/80 bg-card p-3.5">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-3.5" aria-hidden />
        <span className="text-[11px] font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p
        className={
          "mt-1.5 font-display text-3xl font-bold " +
          (warn ? "text-destructive " : "") +
          (accent ? "text-primary " : "")
        }
      >
        {value}
      </p>
    </div>
  );
}

function DeadlineItem({ task }) {
  const { updateAssignment } = usePlanner();
  const days = isToday(task.deadline) ? 0 : daysLeft(task.deadline);
  const overdue = days < 0;
  return (
    <div className="group flex items-start gap-3 py-2.5">
      <button
        onClick={() =>
          updateAssignment(task.id, { status: "completed" })
            .then(() => toast.success("Marked as completed"))
            .catch(() => toast.error("Could not update the task"))
        }
        aria-label={`Mark "${task.title}" as completed`}
        className="mt-0.5 shrink-0 text-muted-foreground transition-colors hover:text-success"
      >
        <Circle className="size-5" aria-hidden />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{task.title}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <SubjectChip
            name={task.subject_name}
            color={task.subject_color}
            icon={task.subject_icon}
          />
        </div>
      </div>
      <span
        className={
          "shrink-0 pt-0.5 font-mono text-xs " +
          (overdue ? "text-destructive" : days <= 2 ? "text-[var(--chart-3)]" : "text-muted-foreground")
        }
      >
        {overdue ? `${-days}d late` : days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days}d`}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const { version, subjects, assignments, createAssignment } = usePlanner();
  const summaryState = useFetch("/dashboard/summary/", [version]);
  const [quickOpen, setQuickOpen] = useState(false);
  const summary = summaryState.data || {};

  const todaySessions = useMemo(
    () => summary.today_sessions || [],
    [summary]
  );
  const todayAssignments = useMemo(
    () =>
      assignments.filter(
        (a) =>
          a.deadline &&
          isToday(a.deadline) &&
          a.status !== "completed"
      ),
    [assignments]
  );

  const deadlines = summary.upcoming_deadlines || [];
  const exams = summary.upcoming_exams || [];

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Today&apos;s desk
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-mono">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              {" — "}
              {summary.overdue > 0
                ? `${summary.overdue} overdue. Kick one off now.`
                : summary.pending_tasks > 0
                  ? `${summary.pending_tasks} task${summary.pending_tasks === 1 ? "" : "s"} on the list.`
                  : "A clear desk. Add work or plan a session."}
            </p>
          </div>
          <Button onClick={() => setQuickOpen(true)}>
            <Plus className="mr-2 size-4" aria-hidden />
            Quick add
          </Button>
        </div>
      </Reveal>

      <Reveal>
        <Hero summary={summary} />
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">Today</CardTitle>
              <Link
                to="/planner"
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Session calendar <ArrowRight className="size-3" aria-hidden />
              </Link>
            </CardHeader>
            <CardContent className="pb-3">
              {(todayAssignments.length === 0 &&
                todaySessions.length === 0) ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Nothing due today. Enjoy a lighter load — or plan ahead.
                </p>
              ) : (
                <div>
                  {todayAssignments.map((a) => (
                    <DeadlineItem key={`a-${a.id}`} task={a} />
                  ))}
                  {todaySessions.map((s) => (
                    <div key={`s-${s.id}`} className="flex items-center gap-3 py-2.5">
                      <Clock className="size-5 shrink-0 text-primary" aria-hidden />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {s.title || "Study session"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {s.start_time ? fmtTime(s.start_time) : "Anytime"}
                          {" · "}
                          {hoursLabel(s.duration_minutes)}
                        </p>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {s.completed ? "✓ done" : "planned"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </Reveal>

        <Reveal>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">Upcoming deadlines</CardTitle>
              <Link
                to="/assignments"
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                All work <ArrowRight className="size-3" aria-hidden />
              </Link>
            </CardHeader>
            <CardContent className="pb-3">
              {deadlines.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No overdue or upcoming work. Nice.
                </p>
              ) : (
                <div className="divide-y divide-(--rule)">
                  {deadlines.map((t) => (
                    <DeadlineItem key={t.id} task={t} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </Reveal>
      </div>

      <Reveal>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClock className="size-4 text-primary" aria-hidden />
              Exam countdown
            </CardTitle>
            <Link
              to="/exams"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Manage exams <ArrowRight className="size-3" aria-hidden />
            </Link>
          </CardHeader>
          <CardContent>
            {exams.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No exams on the calendar yet.
                </p>
                <Link to="/exams">
                  <Button variant="outline" size="sm">
                    Add an exam
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {exams.map((exam) => {
                  const d = daysLeft(exam.exam_date);
                  return (
                    <div
                      key={exam.id}
                      className="flex items-center gap-4 rounded-xl border border-border/80 p-4 transition-colors hover:border-border"
                    >
                      <div className="highlight flex size-14 shrink-0 flex-col items-center justify-center rounded-lg border border-border/60">
                        <span className="font-display text-2xl font-bold leading-none">
                          {Math.abs(d)}
                        </span>
                        <span className="font-mono text-[9px] uppercase text-muted-foreground">
                          {d < 0 ? "late" : d === 0 ? "today" : d === 1 ? "day" : "days"}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {exam.title || exam.subject_name}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <ColorDot color={exam.subject_color} size={8} />
                          {exam.subject_name}
                          <span aria-hidden>·</span>
                          {fmtDate(exam.exam_date)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </Reveal>

      <AssignmentDialog
        open={quickOpen}
        onOpenChange={setQuickOpen}
        subjects={subjects}
        onSave={(payload) =>
          createAssignment({
            ...payload,
            deadline: payload.deadline || new Date().toISOString().slice(0, 10),
          })
            .then(() => toast.success("Assignment added"))
            .catch(() => toast.error("Could not add the assignment"))
        }
      />
    </div>
  );
}