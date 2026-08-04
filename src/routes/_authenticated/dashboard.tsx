import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ClipboardList,
  Droplet,
  ListChecks,
  Scale,
  Utensils,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Disclaimer } from "@/components/site/Disclaimer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DEFAULT_HABITS, HEALTH_DISCLAIMER } from "@/lib/nutrition";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My Dashboard — NourishCare" },
      {
        name: "description",
        content:
          "Your personal nutrition dashboard: latest BMI, wellness score, habits completed today and water intake.",
      },
      { property: "og:title", content: "My Dashboard — NourishCare" },
      { property: "og:description", content: "Track your nutrition and daily habits." },
    ],
  }),
  component: Dashboard,
});

function today() {
  return new Date().toISOString().slice(0, 10);
}

function Dashboard() {
  const { user, profile } = useAuth();
  const uid = user?.id;

  const { data } = useQuery({
    queryKey: ["dashboard", uid],
    enabled: Boolean(uid),
    queryFn: async () => {
      const d = today();
      const [bmi, assessment, habits, water, tip] = await Promise.all([
        supabase
          .from("bmi_records")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("health_assessments")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase.from("habit_logs").select("habit_name, completed").eq("date", d),
        supabase.from("water_logs").select("amount, goal").eq("date", d).maybeSingle(),
        supabase.from("nutrition_tips").select("title, content").limit(20),
      ]);
      const tips = tip.data ?? [];
      return {
        bmi: bmi.data,
        assessment: assessment.data,
        habitsDone: (habits.data ?? []).filter((h) => h.completed).length,
        water: water.data,
        tip: tips.length ? tips[Math.floor(Math.random() * tips.length)] : null,
      };
    },
  });

  const wellnessScore =
    (data?.assessment?.wellness_summary as { score?: number } | null)?.score ?? null;
  const waterAmount = data?.water?.amount ?? 0;
  const waterGoal = data?.water?.goal ?? profile?.water_goal ?? 8;
  const habitPct = Math.round(((data?.habitsDone ?? 0) / DEFAULT_HABITS.length) * 100);

  return (
    <AppShell
      title={`Welcome back${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}`}
      description="A quick view of where your health habits stand today."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Scale}
          label="Latest BMI"
          value={data?.bmi ? String(data.bmi.bmi) : "—"}
          sub={data?.bmi ? data.bmi.category : "Not calculated yet"}
        />
        <StatCard
          icon={ClipboardList}
          label="Wellness score"
          value={wellnessScore !== null ? `${wellnessScore}` : "—"}
          sub={wellnessScore !== null ? "out of 100" : "Take the assessment"}
        />
        <StatCard
          icon={ListChecks}
          label="Habits today"
          value={`${data?.habitsDone ?? 0}/${DEFAULT_HABITS.length}`}
          sub={`${habitPct}% complete`}
        />
        <StatCard
          icon={Droplet}
          label="Water today"
          value={`${waterAmount}/${waterGoal}`}
          sub="glasses"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="rounded-3xl border-border shadow-soft lg:col-span-2">
          <CardContent className="p-7">
            <h2 className="text-lg font-semibold">Today's progress</h2>
            <div className="mt-6 space-y-6">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Healthy habits</span>
                  <span className="text-muted-foreground">{habitPct}%</span>
                </div>
                <Progress value={habitPct} className="mt-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Water intake</span>
                  <span className="text-muted-foreground">
                    {waterAmount} of {waterGoal} glasses
                  </span>
                </div>
                <Progress
                  value={Math.min(100, Math.round((waterAmount / waterGoal) * 100))}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <QuickLink to="/assessment" icon={ClipboardList} label="Take health assessment" />
              <QuickLink to="/meal-planner" icon={Utensils} label="Generate a meal plan" />
              <QuickLink to="/habits" icon={ListChecks} label="Log today's habits" />
              <QuickLink to="/water" icon={Droplet} label="Track water intake" />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-3xl border-border bg-leaf-gradient text-primary-foreground shadow-lift">
            <CardContent className="p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-80">
                Tip of the day
              </p>
              <h3 className="mt-3 text-lg font-semibold">
                {data?.tip?.title ?? "Eat a rainbow this week"}
              </h3>
              <p className="mt-2 text-sm leading-relaxed opacity-90">
                {data?.tip?.content ??
                  "Different coloured vegetables and fruit supply different vitamins — variety across the week does most of the work."}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border shadow-soft">
            <CardContent className="p-7">
              <h3 className="text-base font-semibold">Your profile</h3>
              <dl className="mt-4 space-y-2 text-sm">
                <Row label="Height" value={profile?.height ? `${profile.height} cm` : "—"} />
                <Row label="Weight" value={profile?.weight ? `${profile.weight} kg` : "—"} />
                <Row label="Diet" value={profile?.diet_preference ?? "—"} />
                <Row label="Goal" value={profile?.health_goal ?? "—"} />
              </dl>
              <Button asChild variant="soft" size="sm" className="mt-5 w-full">
                <Link to="/profile">Update profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Disclaimer className="mt-6">{HEALTH_DISCLAIMER}</Disclaimer>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
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
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

function QuickLink({
  to,
  icon: Icon,
  label,
}: {
  to: "/assessment" | "/meal-planner" | "/habits" | "/water";
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
    >
      <span className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </span>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
