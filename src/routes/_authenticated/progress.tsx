import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/progress")({
  head: () => ({
    meta: [
      { title: "My Progress — NourishCare" },
      {
        name: "description",
        content: "See how your BMI, weight, habits and water intake have changed over time.",
      },
      { property: "og:title", content: "My Progress — NourishCare" },
      { property: "og:description", content: "Your nutrition and habit progress over time." },
    ],
  }),
  component: ProgressPage,
});

const RANGES = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "3 months", days: 90 },
];

function ProgressPage() {
  const { user } = useAuth();
  const [days, setDays] = useState(30);

  const { data } = useQuery({
    queryKey: ["progress", user?.id, days],
    enabled: Boolean(user),
    queryFn: async () => {
      const since = new Date(Date.now() - days * 86400000).toISOString();
      const [bmi, water, habits] = await Promise.all([
        supabase
          .from("bmi_records")
          .select("bmi, weight, created_at")
          .gte("created_at", since)
          .order("created_at"),
        supabase
          .from("water_logs")
          .select("amount, date")
          .gte("date", since.slice(0, 10))
          .order("date"),
        supabase
          .from("habit_logs")
          .select("completed, date")
          .gte("date", since.slice(0, 10)),
      ]);
      const habitByDay = new Map<string, number>();
      for (const h of habits.data ?? []) {
        if (h.completed) habitByDay.set(h.date, (habitByDay.get(h.date) ?? 0) + 1);
      }
      return {
        bmi: (bmi.data ?? []).map((r) => ({
          date: new Date(r.created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
          bmi: r.bmi,
          weight: r.weight,
        })),
        water: (water.data ?? []).map((r) => ({
          date: new Date(r.date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
          glasses: r.amount,
        })),
        habits: [...habitByDay.entries()]
          .sort()
          .map(([d, count]) => ({
            date: new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
            habits: count,
          })),
      };
    },
  });

  return (
    <AppShell title="My progress" description="Consistency over weeks matters more than any one day.">
      <div className="flex gap-2">
        {RANGES.map((r) => (
          <Button
            key={r.days}
            variant={days === r.days ? "hero" : "soft"}
            size="sm"
            onClick={() => setDays(r.days)}
          >
            {r.label}
          </Button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="BMI over time" data={data?.bmi ?? []} dataKey="bmi" />
        <ChartCard title="Weight (kg)" data={data?.bmi ?? []} dataKey="weight" />
        <ChartCard title="Water intake (glasses)" data={data?.water ?? []} dataKey="glasses" />
        <ChartCard title="Habits completed per day" data={data?.habits ?? []} dataKey="habits" />
      </div>
    </AppShell>
  );
}

function ChartCard({
  title,
  data,
  dataKey,
}: {
  title: string;
  data: Record<string, unknown>[];
  dataKey: string;
}) {
  return (
    <Card className="rounded-3xl border-border shadow-soft">
      <CardContent className="p-7">
        <h2 className="text-base font-semibold">{title}</h2>
        {data.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No data yet for this period.
          </p>
        ) : (
          <div className="mt-5 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey={dataKey}
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
