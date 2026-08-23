import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PriorityBadge, StatusBadge } from "@/components/badges";

export const SUBJECT_COLORS = [
  "#2347d2",
  "#177a52",
  "#c8452c",
  "#e8a012",
  "#7a3ff2",
  "#0f766e",
  "#b01f5f",
  "#475569",
];

export const SUBJECT_ICONS = ["📘", "📕", "📗", "📙", "📖", "🧮", "🔬", "💻", "🌍", "🎨", "⚗️", "🎼", "💡", "📐"];

export function DatePicker({ value, onChange, className }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground", className)}
        >
          <CalendarDays className="mr-2 size-4" />
          {value ? format(new Date(value), "EEE, MMM d, yyyy") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value ? new Date(value) : undefined}
          onSelect={(d) => onChange(d ? format(d, "yyyy-MM-dd") : "")}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

function subjectOptions(subjects, allowNone = false) {
  const items = allowNone
    ? [
        <SelectItem key="none" value="none">
          No subject
        </SelectItem>,
      ]
    : [];
  return [
    ...items,
    ...subjects.map((s) => (
      <SelectItem key={s.id} value={String(s.id)}>
        {s.icon} {s.name}
      </SelectItem>
    )),
  ];
}

export function EmptyState({ icon: Icon, title, hint, action }) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-10 text-center">
      {Icon && <Icon className="size-8 text-muted-foreground/50" aria-hidden />}
      <p className="font-display text-lg font-semibold">{title}</p>
      {hint && <p className="max-w-sm text-sm text-muted-foreground">{hint}</p>}
      {action}
    </div>
  );
}

function FormGrid({ children }) {
  return <div className="grid gap-4 py-4 sm:grid-cols-2">{children}</div>;
}

function Field({ label, children, className }) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function SubjectDialog({
  open,
  onOpenChange,
  onSave,
  subject,
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(SUBJECT_COLORS[0]);
  const [icon, setIcon] = useState(SUBJECT_ICONS[0]);

  useEffect(() => {
    if (open) {
      setName(subject?.name || "");
      setColor(subject?.color || SUBJECT_COLORS[0]);
      setIcon(subject?.icon || SUBJECT_ICONS[0]);
    }
  }, [open, subject]);

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), color, icon });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{subject ? "Edit subject" : "New subject"}</DialogTitle>
          <DialogDescription>
            {subject
              ? "Rename or restyle this subject."
              : "Add a subject you are studying."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit}>
          <FormGrid>
            <Field label="Subject name" className="sm:col-span-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Linear Algebra"
                autoFocus
              />
            </Field>
            <Field label="Colour">
              <div className="flex flex-wrap gap-2 pt-1">
                {SUBJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    aria-label={`Use colour ${c}`}
                    className={cn(
                      "size-7 rounded-full border-2 transition-transform hover:scale-110",
                      color === c ? "border-foreground" : "border-transparent"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </Field>
            <Field label="Icon">
              <div className="flex flex-wrap gap-1 pt-1">
                {SUBJECT_ICONS.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    aria-label={`Use icon ${i}`}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-md text-base transition-colors",
                      icon === i
                        ? "bg-secondary ring-1 ring-ring"
                        : "hover:bg-secondary/60"
                    )}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </Field>
          </FormGrid>
          <DialogFooter>
            {subject && (
              <Button
                type="button"
                variant="ghost"
                className="mr-auto text-destructive"
                onClick={() => {
                  onOpenChange(false);
                  onSave(null, true);
                }}
              >
                Delete
              </Button>
            )}
            <Button type="submit" disabled={!name.trim()}>
              {subject ? "Save changes" : "Add subject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AssignmentDialog({ open, onOpenChange, onSave, assignment, subjects }) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState("todo");

  useEffect(() => {
    if (open) {
      const first = subjects[0] && String(subjects[0].id);
      setTitle(assignment?.title || "");
      setSubject(assignment ? String(assignment.subject) : first || "");
      setDescription(assignment?.description || "");
      setDeadline(assignment?.deadline || "");
      setPriority(assignment?.priority || "medium");
      setStatus(assignment?.status || "todo");
    }
  }, [open, assignment, subjects]);

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim() || !subject) return;
    onSave({ title: title.trim(), subject: Number(subject), description, deadline: deadline || null, priority, status });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{assignment ? "Edit assignment" : "New assignment"}</DialogTitle>
          <DialogDescription>
            {assignment
              ? "Update the details of this work."
              : "Log a piece of work with a deadline."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit}>
          <FormGrid>
            <Field label="Title" className="sm:col-span-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Problem set 4"
                autoFocus
              />
            </Field>
            <Field label="Subject" className="sm:col-span-2">
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger><SelectValue placeholder={subjects.length ? "Choose a subject" : "Add a subject first"} /></SelectTrigger>
                <SelectContent>{subjectOptions(subjects)}</SelectContent>
              </Select>
            </Field>
            <Field label="Deadline" className="sm:col-span-2">
              <DatePicker value={deadline} onChange={setDeadline} />
            </Field>
            <Field label="Priority">
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2"><PriorityBadge priority={priority} /></div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {["high", "medium", "low"].map((p) => (
                    <SelectItem key={p} value={p}><PriorityBadge priority={p} /></SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue><StatusBadge status={status} /></SelectValue></SelectTrigger>
                <SelectContent>
                  {["todo", "in_progress", "completed"].map((s) => (
                    <SelectItem key={s} value={s}><StatusBadge status={s} /></SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Notes" className="sm:col-span-2">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What needs to happen?"
                rows={3}
              />
            </Field>
          </FormGrid>
          <DialogFooter>
            <Button type="submit" disabled={!title.trim() || !subject}>
              {assignment ? "Save changes" : "Add assignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ExamDialog({ open, onOpenChange, onSave, exam, subjects }) {
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      const first = subjects[0] && String(subjects[0].id);
      setSubject(exam ? String(exam.subject) : first || "");
      setTitle(exam?.title || "");
      setDate(exam?.exam_date || "");
      setStartTime(exam?.start_time || "");
      setNotes(exam?.notes || "");
    }
  }, [open, exam, subjects]);

  const submit = (e) => {
    e.preventDefault();
    if (!subject || !date) return;
    onSave({ subject: Number(subject), title: title.trim(), exam_date: date, start_time: startTime || null, notes });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{exam ? "Edit exam" : "Add an exam"}</DialogTitle>
          <DialogDescription>
            Enter the date of an assessment so the countdown can help you pace revision.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit}>
          <FormGrid>
            <Field label="Subject" className="sm:col-span-2">
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger><SelectValue placeholder={subjects.length ? "Choose a subject" : "Add a subject first"} /></SelectTrigger>
                <SelectContent>{subjectOptions(subjects)}</SelectContent>
              </Select>
            </Field>
            <Field label="Exam title" className="sm:col-span-2">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Midterm" autoFocus />
            </Field>
            <Field label="Exam date" className="sm:col-span-2">
              <DatePicker value={date} onChange={setDate} />
            </Field>
            <Field label="Start time">
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </Field>
            <Field label="Notes" className="sm:col-span-2">
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Scope, topics to revise…" rows={3} />
            </Field>
          </FormGrid>
          <DialogFooter>
            <Button type="submit" disabled={!subject || !date}>Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SessionDialog({ open, onOpenChange, onSave, session, subjects, defaultDate }) {
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [completed, setCompleted] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      const first = subjects[0] && String(subjects[0].id);
      setSubject(session ? String(session.subject) : first || "");
      setTitle(session?.title || "");
      setDate(session?.date || defaultDate || "");
      setStartTime(session?.start_time || "");
      setDuration(String(session?.duration_minutes || 60));
      setCompleted(session?.completed || false);
      setNotes(session?.notes || "");
    }
  }, [open, session, subjects, defaultDate]);

  const submit = (e) => {
    e.preventDefault();
    if (!subject || !date) return;
    onSave({ subject: Number(subject), title: title.trim(), date, start_time: startTime || null, duration_minutes: Number(duration), completed, notes });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{session ? "Edit session" : "Plan a study session"}</DialogTitle>
          <DialogDescription>
            Block out time in your calendar for focused work.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit}>
          <FormGrid>
            <Field label="Subject" className="sm:col-span-2">
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger><SelectValue placeholder={subjects.length ? "Choose a subject" : "Add a subject first"} /></SelectTrigger>
                <SelectContent>{subjectOptions(subjects)}</SelectContent>
              </Select>
            </Field>
            <Field label="Session title" className="sm:col-span-2">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Revise chapter 3" autoFocus />
            </Field>
            <Field label="Date" className="sm:col-span-2">
              <DatePicker value={date} onChange={setDate} />
            </Field>
            <Field label="Start time">
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </Field>
            <Field label="Duration">
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["25", "45", "60", "90", "120", "180"].map((m) => (
                    <SelectItem key={m} value={m}>{m === "60" ? "1 hour" : m === "90" ? "1.5 hours" : m === "120" ? "2 hours" : m === "180" ? "3 hours" : `${m} minutes`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Notes" className="sm:col-span-2">
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What will you focus on?" rows={2} />
            </Field>
            <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
                className="size-4 accent-[var(--chart-3)]"
              />
              Mark as completed
            </label>
          </FormGrid>
          <DialogFooter>
            <Button type="submit" disabled={!subject || !date}>Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ConfirmDialog({ open, onOpenChange, onConfirm, title, description }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}