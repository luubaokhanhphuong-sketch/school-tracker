import { useState } from "react";
import { MoreHorizontal, Pencil, Plus, Trash2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Reveal } from "@/components/Reveal";
import { usePlanner } from "@/hooks/use-planner-data";
import { SubjectDialog, ConfirmDialog, EmptyState } from "@/components/dialogs";
import { toast } from "sonner";

export default function Subjects() {
  const { subjects, createSubject, updateSubject, deleteSubject } = usePlanner();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (subject) => {
    setEditing(subject);
    setDialogOpen(true);
  };

  const handleSave = (payload, isDelete) => {
    if (isDelete && editing) {
      deleteSubject(editing.id)
        .then(() => toast.success("Subject deleted"))
        .catch(() => toast.error("Could not delete the subject"));
      return;
    }
    const op = editing ? updateSubject(editing.id, payload) : createSubject(payload);
    op.then(() =>
        toast.success(editing ? "Subject saved" : "Subject added")
      )
      .catch(() => toast.error("Could not save the subject"));
  };

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Subjects
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              The modules you are studying. Their colours carry through every list.
            </p>
          </div>
          <Button onClick={openNew}>
            <Plus className="mr-2 size-4" aria-hidden />
            New subject
          </Button>
        </div>
      </Reveal>

      {subjects.length === 0 ? (
        <Reveal>
          <EmptyState
            icon={ClipboardList}
            title="No subjects yet"
            hint="Add the modules you're studying — assignments, exams and sessions will hang off them."
            action={
              <Button variant="outline" size="sm" onClick={openNew} className="mt-2">
                <Plus className="mr-2 size-4" aria-hidden />
                Add your first subject
              </Button>
            }
          />
        </Reveal>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Reveal key={subject.id} stagger={0.05}>
              <Card className="group relative overflow-hidden p-5 transition-shadow">
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1.5"
                  style={{ backgroundColor: subject.color }}
                />
                <div className="flex items-start justify-between gap-2 pt-2">
                  <div
                    className="flex size-11 items-center justify-center rounded-xl text-xl"
                    style={{ backgroundColor: `${subject.color}1f` }}
                  >
                    <span aria-hidden>{subject.icon}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground"
                        aria-label={`Options for ${subject.name}`}
                      >
                        <MoreHorizontal className="size-4" aria-hidden />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => openEdit(subject)}>
                        <Pencil className="mr-2 size-4" aria-hidden />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={() => setConfirmDelete(subject)}
                      >
                        <Trash2 className="mr-2 size-4" aria-hidden />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h2 className="mt-4 font-display text-xl font-bold">{subject.name}</h2>
                <p className="mt-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {subject.pending_tasks === 0
                    ? "no pending work"
                    : `${subject.pending_tasks} pending task${subject.pending_tasks === 1 ? "" : "s"}`}
                </p>
              </Card>
            </Reveal>
          ))}

          <Reveal stagger={0.05}>
            <button
              onClick={openNew}
              className="flex min-h-[180px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-5 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Plus className="size-6" aria-hidden />
              <span className="text-sm font-medium">Add a subject</span>
            </button>
          </Reveal>
        </div>
      )}

      <SubjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        subject={editing}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
        onConfirm={() =>
          deleteSubject(confirmDelete.id)
            .then(() => toast.success("Subject deleted"))
            .catch(() => toast.error("Could not delete the subject"))
        }
        title="Delete subject?"
        description={`"${confirmDelete?.name}" and all its assignments, exams and sessions will be removed. This cannot be undone.`}
      />
    </div>
  );
}