import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, Droplet, ShieldAlert, Users } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Community Analytics | NourishCare" },
      {
        name: "description",
        content: "Anonymized community nutrition analytics for NourishCare administrators.",
      },
      { property: "og:title", content: "Admin — Community Analytics" },
      { property: "og:description", content: "Aggregate community health insights." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

type Stats = {
  total_users?: number;
  total_assessments?: number;
  avg_bmi?: number;
  avg_water?: number;
  bmi_distribution?: Record<string, number>;
};

function Admin() {
  const { isAdmin, loading } = useAuth();

  const { data } = useQuery({
    queryKey: ["community-stats"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("community_stats");
      if (error) throw error;
      return (data ?? {}) as Stats;
    },
  });

  if (!loading && !isAdmin) {
    return (
      <AppShell title="Admin dashboard">
        <Card className="rounded-3xl border-border shadow-soft">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <ShieldAlert className="h-9 w-9 text-muted-foreground" />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              This area is restricted to NourishCare administrators.
            </p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const dist = Object.entries(data?.bmi_distribution ?? {}).map(([category, count]) => ({
    category,
    count,
  }));

  return (
    <AppShell
      title="Community analytics"
      description="Aggregated, anonymized insights. No individual health records are shown here."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users} label="Registered users" value={String(data?.total_users ?? 0)} />
        <Stat
          icon={Activity}
          label="Assessments taken"
          value={String(data?.total_assessments ?? 0)}
        />
        <Stat icon={Activity} label="Average BMI" value={data?.avg_bmi ? String(data.avg_bmi) : "—"} />
        <Stat
          icon={Droplet}
          label="Avg glasses / day"
          value={data?.avg_water ? String(data.avg_water) : "—"}
        />
      </div>

      <Card className="mt-6 rounded-3xl border-border shadow-soft">
        <CardContent className="p-7">
          <h2 className="text-base font-semibold">BMI category distribution</h2>
          {dist.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No community data recorded yet.
            </p>
          ) : (
            <div className="mt-5 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dist}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="category" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card className="rounded-3xl border-border shadow-soft">
      <CardContent className="p-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <Icon className="h-5 w-5" />
        </span>
        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 font-display text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
