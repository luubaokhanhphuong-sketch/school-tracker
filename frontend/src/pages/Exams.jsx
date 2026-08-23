import { useMemo, useState } from "react";
import { MoreHorizontal, Pencil, Plus, Trash2, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Reveal } from "@/components/Reveal";
import { usePlanner } from "@/hooks/use-planner-data";
import { SubjectChip } from "@/components/badges";
import { ExamDialog, ConfirmDialog, EmptyState } from "@/components/dialogs";
import { fmtDate, fmtTime, daysLeft, isPast } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function ExamRow({ exam, onEdit, onDelete }) {
  const d = daysLeft(exam.exam_date);
  const past = isPast(exam.exam_date) && d !== 0;

  return (
    <Card className="overflow-hidden p-0">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <div
          className={cn(
            "highlight flex h-full min-h-[72px] w-full shrink-0 flex-col items-center justify-center rounded-xl border border-border max-sm:py-3 sm:w-24"
          )}
        >
          <span className="font-display text-4xl font-bold leading-none">
            {Math.abs(d)}
          </span>
          <span className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {past ? "days past" : d === 0 ? "today" : d === 1 ? "day to go" : "days to go"}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display text-lg font-bold">
                {exam.title || exam.subject_name}
              </h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <SubjectChip
                  name={exam.subject_name}
                  color={exam.subject_color}
                  icon={exam.subject_icon}
                />
                <span className="font-mono text-xs text-muted-foreground">
                  {fmtDate(exam.exam_date)}
                  {exam.start_time ? ` · ${fmtTime(exam.start_time)}` : ""}
                </span>
              </div>
              {exam.notes && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {exam.notes}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="-mr-1.5 -mt-1 size-8 shrink-0 text-muted-foreground"
                  aria-label={`Options for ${exam.title || exam.subject_name}`}
                >
                  <MoreHorizontal className="size-4" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onEdit(exam)}>
                  <Pencil className="mr-2 size-4" aria-hidden /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={() => onDelete(exam)}
                >
                  <Trash2 className="mr-2 size-4" aria-hidden /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
];

export default function ExamsPage() {
  const { exams, subjects, createExam, updateExam, deleteExam } = usePlanner();
  const [filter, setFilter] = useState("upcoming");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const sorted = useMemo(() => {
    const list = [...exams];
    if (filter === "upcoming")
      return list.filter((e) => daysLeft(e.exam_date) >= 0).sort((a, b) => a.exam_date.localeCompare(b.exam_date));
    if (filter === "past")
      return list.filter((e) => daysLeft(e.exam_date) < 0).sort((a, b) => b.exam_date.localeCompare(a.exam_date));
    return list.sort((a, b) => a.exam_date.localeCompare(b.exam_date));
  }, [exams, filter]);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleSave = (payload) => {
    const op = editing ? updateExam(editing.id, payload) : createExam(payload);
    op.then(() => toast.success(editing ? "Exam saved" : "Exam added"))
      .catch(() => toast.error("Could not save the exam"));
  };

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Exams</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              The countdown is your revision pace-setter.
            </p>
          </div>
          <Button onClick={openNew}>
            <Plus className="mr-2 size-4" aria-hidden />
            Add exam
          </Button>
        </div>
      </Reveal>

      <Reveal>
        <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                filter === f.key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Reveal>

      {subjects.length === 0 ? (
        <Reveal>
          <EmptyState
            icon={CalendarClock}
            title="Add a subject first"
            hint="Exams are tied to a subject, so create at least one subject to begin."
            action={
              <Button variant="outline" size="sm" className="mt-2" asChild>
                <a href="/subjects">Go to subjects</a>
              </Button>
            }
          />
        </Reveal>
      ) : sorted.length === 0 ? (
        <Reveal>
          <EmptyState
            icon={CalendarClock}
            title={filter === "all" ? "No exams yet" : "Nothing here"}
            hint={
              filter === "upcoming"
                ? "No upcoming exams. Enjoy the calm, add one when it's scheduled."
                : "No exams match this view."
            }
            action={
              <Button variant="outline" size="sm" className="mt-2" onClick={openNew}>
                <Plus className="mr-2 size-4" aria-hidden />
                {filter === "all" ? "Add an exam" : "View all exams"}
              </Button>
            }
          />
        </Reveal>
      ) : (
        <div className="space-y-3">
          {sorted.map((exam) => (
            <Reveal key={exam.id} stagger={0.05}>
              <ExamRow
                exam={exam}
                onEdit={(e) => {
                  setEditing(e);
                  setDialogOpen(true);
                }}
                onDelete={setConfirmDelete}
              />
            </Reveal>
          ))}
        </div>
      )}

      <ExamDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        exam={editing}
        subjects={subjects}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
        onConfirm={() =>
          deleteExam(confirmDelete.id)
            .then(() => toast.success("Exam deleted"))
            .catch(() => toast.error("Could not delete the exam"))
        }
        title="Delete exam?"
        description={`The exam in ${confirmDelete?.subject_name} will be removed. This cannot be undone.`}
      />
    </div>
  );
}