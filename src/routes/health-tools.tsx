import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ClipboardList,
  Droplet,
  LineChart,
  ListChecks,
  Scale,
  Utensils,
} from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Disclaimer } from "@/components/site/Disclaimer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BmiGauge, useBmiForm } from "@/components/health/BmiGauge";
import { BMI_DISCLAIMER } from "@/lib/nutrition";

export const Route = createFileRoute("/health-tools")({
  head: () => ({
    meta: [
      { title: "Health Tools — BMI Calculator & Assessments | NourishCare" },
      {
        name: "description",
        content:
          "Free BMI calculator plus nutrition assessment, meal planner, habit tracker, water tracker and progress charts.",
      },
      { property: "og:title", content: "Health Tools — NourishCare" },
      {
        property: "og:description",
        content: "Calculate your BMI instantly and explore NourishCare's health tools.",
      },
    ],
  }),
  component: HealthTools,
});

const TOOLS = [
  {
    icon: ClipboardList,
    title: "Health & Nutrition Assessment",
    text: "A structured questionnaire covering diet, hydration, activity and sleep, with a wellness summary.",
    to: "/assessment" as const,
  },
  {
    icon: Utensils,
    title: "Personalized Meal Planner",
    text: "A full day of affordable Indian meals matched to your diet preference, goal and budget.",
    to: "/meal-planner" as const,
  },
  {
    icon: ListChecks,
    title: "Healthy Habit Tracker",
    text: "Seven daily habits with completion percentages, streaks and a weekly chart.",
    to: "/habits" as const,
  },
  {
    icon: Droplet,
    title: "Water Tracker",
    text: "Set a daily glass target and log your intake as you go.",
    to: "/water" as const,
  },
  {
    icon: LineChart,
    title: "My Progress",
    text: "BMI, weight, habits, water and assessment history over 7 days, 30 days or 3 months.",
    to: "/progress" as const,
  },
];

function HealthTools() {
  const { height, setHeight, weight, setWeight, error, result, compute } = useBmiForm();

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main>
        <div className="bg-hero-gradient">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Health tools
            </p>
            <h1 className="mt-3 max-w-2xl text-4xl font-semibold md:text-5xl">
              Check your health in a couple of minutes.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Start with the BMI calculator below — no account needed. Create a free account to save
              your results and unlock assessments, meal plans and habit tracking.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-16">
          <Card className="rounded-3xl border-border shadow-lift">
            <CardContent className="grid gap-10 p-8 md:grid-cols-2 md:p-10">
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <Scale className="h-5 w-5" />
                  </span>
                  <h2 className="text-xl font-semibold">BMI Calculator</h2>
                </div>
                <form
                  className="mt-6 space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    compute();
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      inputMode="decimal"
                      placeholder="e.g. 165"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      inputMode="decimal"
                      placeholder="e.g. 62"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      required
                    />
                  </div>
                  {error ? (
                    <p role="alert" className="text-sm font-medium text-destructive">
                      {error}
                    </p>
                  ) : null}
                  <Button type="submit" variant="hero" className="w-full">
                    Calculate BMI
                  </Button>
                </form>
              </div>

              <div className="rounded-3xl bg-secondary/50 p-7">
                {result ? (
                  <>
                    <p className="text-sm text-muted-foreground">Your BMI</p>
                    <p className="mt-1 font-display text-5xl font-semibold text-primary">
                      {result.bmi}
                    </p>
                    <p className="mt-1 text-sm font-medium">{result.category}</p>
                    <div className="mt-6">
                      <BmiGauge bmi={result.bmi} />
                    </div>
                    <Button asChild variant="soft" className="mt-6 w-full">
                      <Link to="/auth" search={{ mode: "register" }}>
                        Save this result to my account
                      </Link>
                    </Button>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                    <Scale className="h-9 w-9 text-muted-foreground" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      Enter your height and weight to see your BMI and category here.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Disclaimer className="mt-6" title="About BMI">
            {BMI_DISCLAIMER}
          </Disclaimer>

          <h2 className="mt-16 text-xl font-semibold">More tools in your account</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t) => (
              <Card key={t.title} className="rounded-3xl border-border shadow-soft">
                <CardContent className="flex h-full flex-col p-7">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <t.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{t.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {t.text}
                  </p>
                  <Button asChild variant="soft" size="sm" className="mt-5 self-start">
                    <Link to={t.to}>Open</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
