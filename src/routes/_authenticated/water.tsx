import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Droplet, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { waterApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/water")({
  head: () => ({
    meta: [
      { title: "Water Tracker — NourishCare" },
      {
        name: "description",
        content: "Log your daily water intake against a personal glass target.",
      },
      { property: "og:title", content: "Water Tracker — NourishCare" },
      { property: "og:description", content: "Stay hydrated with a simple daily glass tracker." },
    ],
  }),
  component: Water,
});

const today = () => new Date().toISOString().slice(0, 10);

function Water() {
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const goal = profile?.water_goal ?? 8;

  const { data } = useQuery({
    queryKey: ["water", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const since = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
      const { records } = await waterApi.list(since);
      return records;
    },
  });

  const todayLog = (data ?? []).find((w) => w.date === today());
  const amount = todayLog?.amount ?? 0;
  const pct = Math.min(100, Math.round((amount / goal) * 100));

  async function setAmount(next: number) {
    if (!user) return;
    const value = Math.max(0, Math.min(30, next));
    try {
      await waterApi.save({ date: today(), amount: value, goal });
    } catch {
      toast.error("Could not update your water log.");
      return;
    }
    void qc.invalidateQueries({ queryKey: ["water", user.id] });
  }

  return (
    <AppShell
      title="Water tracker"
      description={`Your daily target is ${goal} glasses. You can change it on your profile.`}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-3xl border-border shadow-soft lg:col-span-2">
          <CardContent className="p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="font-display text-4xl font-semibold">
                  {amount}
                  <span className="text-lg text-muted-foreground"> / {goal} glasses</span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => setAmount(amount - 1)}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Button variant="hero" size="icon" onClick={() => setAmount(amount + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Progress value={pct} className="mt-6" />
            <div className="mt-6 flex flex-wrap gap-2">
              {Array.from({ length: goal }, (_, i) => (
                <button
                  key={i}
                  aria-label={`Set ${i + 1} glasses`}
                  onClick={() => setAmount(i + 1)}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border"
                >
                  <Droplet
                    className={
                      i < amount ? "h-5 w-5 text-primary" : "h-5 w-5 text-muted-foreground/40"
                    }
                  />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border shadow-soft">
          <CardContent className="p-7">
            <h2 className="text-base font-semibold">Last 7 days</h2>
            <div className="mt-5 space-y-3">
              {Array.from({ length: 7 }, (_, i) => {
                const d = new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10);
                const log = (data ?? []).find((w) => w.date === d);
                const value = log?.amount ?? 0;
                return (
                  <div key={d} className="flex items-center gap-3 text-xs">
                    <span className="w-10 text-muted-foreground">
                      {new Date(d).toLocaleDateString(undefined, { weekday: "short" })}
                    </span>
                    <Progress value={Math.min(100, (value / goal) * 100)} className="flex-1" />
                    <span className="w-8 text-right text-muted-foreground">{value}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
