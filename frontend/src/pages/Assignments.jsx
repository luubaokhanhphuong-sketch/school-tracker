import { useMemo, useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  ClipboardList,
  ArrowRight,
  CheckCheck,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Reveal } from "@/components/Reveal";
import { usePlanner } from "@/hooks/use-planner-data";
import { PriorityBadge, SubjectChip } from "@/components/badges";
import { AssignmentDialog, ConfirmDialog, EmptyState } from "@/components/dialogs";
import { fmtDate, isPast, daysLeft } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const COLUMNS = [
  { key: "todo", label: "To do" },
  { key: "in_progress", label: "In progress" },
  { key: "completed", label: "Done" },
];

function DeadlineNote({ deadline }) {
  if (!deadline) return <span className="font-mono text-xs text-muted-foreground">no deadline</span>;
  const days = daysLeft(deadline);
  if (isPast(deadline) && days !== 0)
    return <span className="font-mono text-xs text-destructive">{Math.abs(days)}d overdue</span>;
  if (days === 0) return <span className="font-mono text-xs font-semibold text-[var(--chart-3)]">due today</span>;
  if (days === 1) return <span className="font-mono text-xs font-semibold text-[var(--chart-3)]">tomorrow</span>;
  return <span className="font-mono text-xs text-muted-foreground">{fmtDate(deadline)}</span>;
}

function AssignmentCard({ assignment, onEdit, onDelete }) {
  const { updateAssignment } = usePlanner();
  const todo = assignment.status !== "completed";

  const advance = () => {
    const next =
      assignment.status === "todo"
        ? "in_progress"
        : assignment.status === "in_progress"
          ? "completed"
          : "todo";
    updateAssignment(assignment.id, { status: next })
      .then(() =>
        toast.success(
          next === "completed"
            ? "Completed — nice work"
            : next === "in_progress"
              ? "Moved to in progress"
              : "Reset to to do"
        )
      )
      .catch(() => toast.error("Could not update status"));
  };

  return (
    <Card
      className={cn(
        "p-4 transition-opacity",
        assignment.status === "completed" && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <SubjectChip
          name={assignment.subject_name}
          color={assignment.subject_color}
          icon={assignment.subject_icon}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="-mr-1.5 -mt-1.5 size-8 shrink-0 text-muted-foreground"
              aria-label={`Options for ${assignment.title}`}
            >
              <MoreHorizontal className="size-4" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(assignment)}>
              <Pencil className="mr-2 size-4" aria-hidden /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => onDelete(assignment)}
            >
              <Trash2 className="mr-2 size-4" aria-hidden /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="mt-2 font-display text-base font-semibold leading-snug">
        {assignment.title}
      </p>
      {assignment.description && (
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {assignment.description}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={assignment.priority} />
          <DeadlineNote deadline={assignment.deadline} />
        </div>
        <Button
          variant={todo ? "outline" : "ghost"}
          size="sm"
          className="h-7 shrink-0 gap-1 px-2 text-xs"
          onClick={advance}
          aria-label={
            assignment.status === "todo"
              ? "Start this assignment"
              : assignment.status === "in_progress"
                ? "Mark as completed"
                : "Reopen the assignment"
          }
        >
          {assignment.status === "todo" && (
            <>
              <Play className="size-3" aria-hidden /> Start
            </>
          )}
          {assignment.status === "in_progress" && (
            <>
              <CheckCheck className="size-3" aria-hidden /> Complete
            </>
          )}
          {assignment.status === "completed" && (
            <>
              <ArrowRight className="size-3" aria-hidden /> Reopen
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}

export default function Assignments() {
  const {
    assignments,
    subjects,
    createAssignment,
    updateAssignment,
    deleteAssignment,
  } = usePlanner();
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = useMemo(
    () =>
      assignments.filter((a) => {
        if (statusFilter !== "all" && a.status !== statusFilter) return false;
        if (priorityFilter !== "all" && a.priority !== priorityFilter) return false;
        if (subjectFilter !== "all" && a.subject !== Number(subjectFilter)) return false;
        return true;
      }),
    [assignments, statusFilter, priorityFilter, subjectFilter]
  );

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleSave = (payload) => {
    const op = editing
      ? updateAssignment(editing.id, payload)
      : createAssignment(payload);
    op.then(() => toast.success(editing ? "Assignment saved" : "Assignment added"))
      .catch(() => toast.error("Could not save the assignment"));
  };

  const clearFilters =
    statusFilter !== "all" || priorityFilter !== "all" || subjectFilter !== "all";

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Assignments
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Urgent work floats to the top. Filter to focus on what matters now.
            </p>
          </div>
          <Button onClick={openNew}>
            <Plus className="mr-2 size-4" aria-hidden />
            New assignment
          </Button>
        </div>
      </Reveal>

      <Reveal>
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="todo">To do</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-[170px]"><SelectValue placeholder="Subject" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subjects</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.icon} {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {clearFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter("all");
                setPriorityFilter("all");
                setSubjectFilter("all");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      </Reveal>

      {subjects.length === 0 ? (
        <Reveal>
          <EmptyState
            icon={ClipboardList}
            title="No subjects to attach work to"
            hint="Create a subject first, then assignments can hang off it."
            action={
              <Button variant="outline" size="sm" className="mt-2" asChild>
                <a href="/subjects">Go to subjects</a>
              </Button>
            }
          />
        </Reveal>
      ) : filtered.length === 0 ? (
        <Reveal>
          <EmptyState
            icon={ClipboardList}
            title="Nothing here"
            hint={
              clearFilters
                ? "No assignments match the filters."
                : "Add an assignment to start tracking it."
            }
            action={
              !clearFilters && (
                <Button variant="outline" size="sm" className="mt-2" onClick={openNew}>
                  <Plus className="mr-2 size-4" aria-hidden />
                  Add an assignment
                </Button>
              )
            }
          />
        </Reveal>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3 lg:items-start">
          {COLUMNS.map((col, ci) => {
            const items = filtered.filter((a) => a.status === col.key);
            return (
              <Reveal key={col.key} stagger={0.06}>
                <Card className="bg-transparent shadow-none">
                  <CardHeader className="px-2 pb-3 pt-0">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          col.key === "todo" &&
                            "bg-[var(--chart-1)]",
                          col.key === "in_progress" &&
                            "bg-[var(--chart-3)]",
                          col.key === "completed" &&
                            "bg-[var(--chart-2)]"
                        )}
                        aria-hidden
                      />
                      {col.label}
                      <span className="ml-auto font-mono text-xs font-normal text-muted-foreground">
                        {items.length}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 px-2">
                    {items.length === 0 ? (
                      <p className="rounded-xl border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
                        Empty column
                      </p>
                    ) : (
                      items.map((a) => (
                        <AssignmentCard
                          key={a.id}
                          assignment={a}
                          onEdit={(asg) => {
                            setEditing(asg);
                            setDialogOpen(true);
                          }}
                          onDelete={setConfirmDelete}
                        />
                      ))
                    )}
                    {ci < 1 && (
                      <div className="flex justify-center pt-1">
                        <Button variant="ghost" size="sm" onClick={openNew}>
                          <Plus className="mr-1.5 size-3.5" aria-hidden /> Add
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Reveal>
            );
          })}
        </div>
      )}

      <AssignmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        assignment={editing}
        subjects={subjects}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
        onConfirm={() =>
          deleteAssignment(confirmDelete.id)
            .then(() => toast.success("Assignment deleted"))
            .catch(() => toast.error("Could not delete the assignment"))
        }
        title="Delete assignment?"
        description={`"${confirmDelete?.title}" will be removed. This cannot be undone.`}
      />
    </div>
  );
}