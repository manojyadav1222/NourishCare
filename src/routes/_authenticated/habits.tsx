import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { habitsApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { DEFAULT_HABITS } from "@/lib/nutrition";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/habits")({
  head: () => ({
    meta: [
      { title: "Healthy Habit Tracker — NourishCare" },
      {
        name: "description",
        content: "Tick off seven daily nutrition habits and watch your weekly consistency build.",
      },
      { property: "og:title", content: "Healthy Habit Tracker — NourishCare" },
      { property: "og:description", content: "Track seven daily healthy habits." },
    ],
  }),
  component: Habits,
});

const today = () => new Date().toISOString().slice(0, 10);

function Habits() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["habits", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const since = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
      const { records } = await habitsApi.list(since);
      return records;
    },
  });

  const todays = (data ?? []).filter((h) => h.date === today());
  const done = (name: string) => todays.some((h) => h.habit_name === name && h.completed);
  const completedCount = DEFAULT_HABITS.filter((h) => done(h.name)).length;
  const pct = Math.round((completedCount / DEFAULT_HABITS.length) * 100);

  async function toggle(name: string) {
    if (!user) return;
    const next = !done(name);
    try {
      await habitsApi.save({ habit_name: name, date: today(), completed: next });
    } catch {
      toast.error("Could not update that habit.");
      return;
    }
    void qc.invalidateQueries({ queryKey: ["habits", user.id] });
  }

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10);
    const count = (data ?? []).filter((h) => h.date === d && h.completed).length;
    return { d, pct: Math.round((count / DEFAULT_HABITS.length) * 100) };
  });

  return (
    <AppShell
      title="Healthy habit tracker"
      description="Small daily actions, tracked consistently, are what change long-term health."
    >
      <Card className="rounded-3xl border-border shadow-soft">
        <CardContent className="p-7">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Today</span>
            <span className="text-muted-foreground">
              {completedCount} of {DEFAULT_HABITS.length} complete
            </span>
          </div>
          <Progress value={pct} className="mt-3" />

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {DEFAULT_HABITS.map((h) => {
              const active = done(h.name);
              return (
                <button
                  key={h.name}
                  onClick={() => toggle(h.name)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm font-medium transition-colors",
                    active
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border hover:bg-secondary/60",
                  )}
                >
                  {active ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  {h.name}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 rounded-3xl border-border shadow-soft">
        <CardContent className="p-7">
          <h2 className="text-lg font-semibold">Last 7 days</h2>
          <div className="mt-6 flex items-end gap-3">
            {days.map((d) => (
              <div key={d.d} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-32 w-full items-end rounded-xl bg-secondary/70">
                  <div
                    className="w-full rounded-xl bg-leaf-gradient transition-all"
                    style={{ height: `${Math.max(4, d.pct)}%` }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {new Date(d.d).toLocaleDateString(undefined, { weekday: "short" })}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
