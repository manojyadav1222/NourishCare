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
import { assessmentsApi, bmiApi, habitsApi, waterApi } from "@/lib/api";
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
      const [bmi, water, habits, assessments] = await Promise.all([
        bmiApi.list(),
        waterApi.list(since.slice(0, 10)),
        habitsApi.list(since.slice(0, 10)),
        assessmentsApi.list(),
      ]);
      const habitByDay = new Map<string, number>();
      for (const h of habits.records ?? []) {
        if (h.completed) habitByDay.set(h.date, (habitByDay.get(h.date) ?? 0) + 1);
      }
      return {
        bmi: (bmi.records ?? [])
          .filter((r) => r.created_at >= since)
          .reverse()
          .map((r) => ({
            date: new Date(r.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            }),
            bmi: r.bmi,
            weight: r.weight,
          })),
        water: (water.records ?? []).reverse().map((r) => ({
          date: new Date(r.date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
          glasses: r.amount,
        })),
        habits: [...habitByDay.entries()].sort().map(([d, count]) => ({
          date: new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          habits: count,
        })),
        assessments: (assessments.records ?? [])
          .filter((r) => r.created_at >= since)
          .map((record) => {
            const summary = record.wellness_summary as {
              score?: number;
              nutritionStatus?: string;
              hydrationStatus?: string;
              activityStatus?: string;
              dietQuality?: string;
            };
            return {
              id: record.id,
              date: new Date(record.created_at).toLocaleDateString(),
              score: summary.score ?? "—",
              nutritionStatus: summary.nutritionStatus ?? "—",
              hydrationStatus: summary.hydrationStatus ?? "—",
              activityStatus: summary.activityStatus ?? "—",
              dietQuality: summary.dietQuality ?? "—",
            };
          }),
      };
    },
  });

  return (
    <AppShell
      title="My progress"
      description="Consistency over weeks matters more than any one day."
    >
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

      <Card className="mt-6 rounded-3xl border-border shadow-soft">
        <CardContent className="p-7">
          <h2 className="text-base font-semibold">Assessment history</h2>
          {data?.assessments && data.assessments.length > 0 ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {data.assessments.map((assessment) => (
                <div key={assessment.id} className="rounded-2xl border border-border p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold">{assessment.date}</p>
                    <p className="font-display text-2xl font-semibold text-primary">
                      {assessment.score}
                    </p>
                  </div>
                  <dl className="mt-4 space-y-2 text-xs">
                    <HistoryRow label="Nutrition" value={assessment.nutritionStatus} />
                    <HistoryRow label="Hydration" value={assessment.hydrationStatus} />
                    <HistoryRow label="Activity" value={assessment.activityStatus} />
                    <HistoryRow label="Diet quality" value={assessment.dietQuality} />
                  </dl>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No assessments saved for this period.
            </p>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}

function HistoryRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
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
