import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ClipboardCheck,
  Clock,
  TrendingUp,
  CalendarCheck2,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal } from "@/components/Reveal";
import { usePlanner, useFetch } from "@/hooks/use-planner-data";
import { hoursLabel } from "@/lib/dates";
import { ColorDot } from "@/components/badges";

function BigStat({ icon: Icon, label, value, unit, sub }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-4" aria-hidden />
        <span className="text-[11px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-3 font-display text-4xl font-bold tracking-tight">
        {value}
        {unit && <span className="ml-1 text-xl text-muted-foreground">{unit}</span>}
      </p>
      {sub && <p className="mt-1.5 text-xs text-muted-foreground">{sub}</p>}
    </Card>
  );
}

function SubjectBar({ item }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-medium">
          <ColorDot color={item.color} size={9} />
          <span aria-hidden>{item.icon}</span>
          {item.name}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {item.completed}/{item.total} · {item.percentage}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--rule)]">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
        />
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const { version } = usePlanner();
  const state = useFetch("/progress/", [version]);
  const data = state.data;

  const studyHours = useMemo(
    () => (data ? Math.round((data.total_study_minutes / 60) * 10) / 10 : 0),
    [data]
  );

  return (
    <div className="space-y-6">
      <Reveal>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Progress</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The semester so far, measured in work done and time logged.
          </p>
        </div>
      </Reveal>

      {!state.loading && !state.error && data && (
        <>
          <Reveal>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <BigStat
                icon={Target}
                label="Completion"
                value={data.completion_percentage}
                unit="%"
                sub={`${data.completed_assignments} of ${data.total_assignments} assignments done`}
              />
              <BigStat
                icon={Clock}
                label="Study time"
                value={studyHours}
                unit="h"
                sub={`${data.total_sessions} session${data.total_sessions === 1 ? "" : "s"} planned`}
              />
              <BigStat
                icon={ClipboardCheck}
                label="Work finished"
                value={data.completed_assignments}
                sub={
                  data.total_assignments
                    ? `${data.total_assignments - data.completed_assignments} still on the list`
                    : "No assignments yet"
                }
              />
              <BigStat
                icon={CalendarCheck2}
                label="Sessions logged"
                value={data.completed_sessions}
                sub={
                  data.completed_sessions
                    ? `${hoursLabel(data.total_study_minutes)} of recorded focus`
                    : "Log a session to start tracking focus time"
                }
              />
            </div>
          </Reveal>

          <Reveal>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="size-4 text-primary" aria-hidden />
                  Progress by subject
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pb-6">
                {data.subject_progress.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Add subjects and assignments to see per-module progress.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/subjects">
                        Go to subjects <ArrowRight className="ml-2 size-3.5" aria-hidden />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  data.subject_progress.map((item) => (
                    <SubjectBar key={item.id} item={item} />
                  ))
                )}
              </CardContent>
            </Card>
          </Reveal>
        </>
      )}

      {state.error && (
        <Reveal>
          <Card className="p-8 text-center text-sm text-destructive">
            Could not load progress: {state.error}
          </Card>
        </Reveal>
      )}
    </div>
  );
}