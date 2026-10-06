import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  Apple,
  BookOpen,
  CheckCircle2,
  Droplet,
  HeartPulse,
  LineChart,
  Salad,
  ShieldCheck,
  Sparkles,
  Users,
  Utensils,
} from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Disclaimer } from "@/components/site/Disclaimer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HEALTH_DISCLAIMER } from "@/lib/nutrition";
import heroImage from "@/assets/hero-counseling.jpg";
import foodsImage from "@/assets/foods-flatlay.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NourishCare — Better Nutrition. Healthier Communities." },
      {
        name: "description",
        content:
          "Understand your nutrition, calculate BMI, get affordable Indian meal guidance and track healthy habits with NourishCare's community health portal.",
      },
      { property: "og:title", content: "NourishCare — Better Nutrition. Healthier Communities." },
      {
        property: "og:description",
        content:
          "A community nutrition counseling and health awareness portal: BMI checks, wellness assessments, meal guidance and habit tracking.",
      },
    ],
  }),
  component: Landing,
});

const SERVICES = [
  {
    icon: HeartPulse,
    title: "Nutrition Counseling",
    text: "Structured, easy-to-follow guidance built around everyday, affordable foods.",
  },
  {
    icon: Activity,
    title: "Health Assessment",
    text: "A short questionnaire that summarises your nutrition, hydration and activity status.",
  },
  {
    icon: Utensils,
    title: "Meal Guidance",
    text: "Daily meal plans for vegetarian, non-vegetarian and vegan preferences on any budget.",
  },
  {
    icon: BookOpen,
    title: "Nutrition Education",
    text: "Learn macronutrients, micronutrients, hygiene, portions, labels and safe storage.",
  },
  {
    icon: CheckCircle2,
    title: "Habit Building",
    text: "Track seven core daily habits and watch your streak and weekly completion grow.",
  },
  {
    icon: LineChart,
    title: "Progress Monitoring",
    text: "BMI, weight, water and habit history in one place with simple, readable charts.",
  },
];

const WHY = [
  {
    title: "Nutrition shapes daily life",
    text: "Energy, concentration, immunity and recovery all depend on what a household eats every day — not on occasional special meals.",
  },
  {
    title: "Awareness is the missing link",
    text: "Many families already have access to nutritious, low-cost foods. What is often missing is clear, practical knowledge about how to combine them.",
  },
  {
    title: "Small changes compound",
    text: "One extra vegetable serving, one fewer sugary drink and a daily walk change long-term health outcomes far more than short-lived strict diets.",
  },
];

function Section({
  id,
  eyebrow,
  title,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`mx-auto max-w-6xl px-4 py-16 md:py-24 ${className}`}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      ) : null}
      <h2 className="mt-3 max-w-2xl text-3xl font-semibold md:text-4xl">{title}</h2>
      <div className="mt-10">{children}</div>
    </section>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <main>
        {/* Hero */}
        <section className="bg-hero-gradient">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-2 md:items-center md:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-background/70 px-3.5 py-1.5 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Stay Strong
              </span>
              <h1 className="mt-6 text-4xl font-semibold leading-[1.08] md:text-6xl">
                Better Nutrition.
                <br />
                Healthier Communities.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
                Understand your nutrition, build healthier habits, and receive personalized guidance
                for a better lifestyle.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="hero" size="lg">
                  <Link to="/auth" search={{ mode: "register" }}>
                    Get Started
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/health-tools">Check Your Health</Link>
                </Button>
              </div>
              <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-border/70 pt-6">
                {[
                  ["7", "daily habits tracked"],
                  ["13", "awareness topics"],
                  ["100%", "free & educational"],
                ].map(([v, l]) => (
                  <div key={l}>
                    <dt className="font-display text-2xl font-semibold text-primary">{v}</dt>
                    <dd className="text-xs text-muted-foreground">{l}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative">
              <img
                src={heroImage}
                alt="A community health worker explaining a balanced plate of dal, vegetables, roti, curd and fruit to a family"
                width={1600}
                height={1200}
                className="w-full rounded-3xl object-cover shadow-lift"
              />
              <div className="absolute -bottom-6 left-4 hidden rounded-2xl border border-border bg-background p-4 shadow-lift sm:block">
                <p className="text-xs text-muted-foreground">Average community BMI</p>
                <p className="font-display text-2xl font-semibold text-primary">Tracked safely</p>
                <p className="text-xs text-muted-foreground">Anonymous aggregates only</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why nutrition matters */}
        <Section
          eyebrow="Why nutrition matters"
          title="Good health starts on the plate, every single day."
        >
          <div className="grid gap-6 md:grid-cols-3">
            {WHY.map((w) => (
              <Card key={w.title} className="rounded-3xl border-border shadow-soft">
                <CardContent className="p-7">
                  <Salad className="h-6 w-6 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold">{w.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{w.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        {/* Services */}
        <div className="bg-secondary/40">
          <Section
            eyebrow="Our services"
            title="Everything a household needs to eat and live better."
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map((s) => (
                <Card
                  key={s.title}
                  className="rounded-3xl border-border bg-background shadow-soft transition-shadow hover:shadow-lift"
                >
                  <CardContent className="p-7">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                      <s.icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>
        </div>

        {/* BMI & assessment */}
        <Section
          eyebrow="BMI & health assessment"
          title="Know where you stand before you change anything."
        >
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div className="space-y-4">
              {[
                "Calculate BMI from height and weight, with a clear visual indicator.",
                "See which category your result falls into, explained in plain language.",
                "Complete a community-style nutrition questionnaire in a few minutes.",
                "Receive a wellness summary covering nutrition, hydration, activity and diet quality.",
                "Every result is stored so you can watch the trend over weeks and months.",
              ].map((t) => (
                <div key={t} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm leading-relaxed text-muted-foreground">{t}</p>
                </div>
              ))}
              <Disclaimer className="mt-6">{HEALTH_DISCLAIMER}</Disclaimer>
            </div>

            <Card className="rounded-3xl border-border shadow-lift">
              <CardContent className="p-8">
                <p className="text-sm text-muted-foreground">Example result</p>
                <p className="mt-2 font-display text-5xl font-semibold text-primary">22.4</p>
                <p className="mt-1 text-sm font-medium">Normal range</p>
                <div className="mt-6 flex h-3 overflow-hidden rounded-full">
                  <div className="w-[20%] bg-sky" />
                  <div className="w-[35%] bg-leaf" />
                  <div className="w-[25%] bg-sun" />
                  <div className="w-[20%] bg-berry" />
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
                  <span>Under</span>
                  <span>Normal</span>
                  <span>Over</span>
                  <span>Obese</span>
                </div>
                <Button asChild variant="hero" className="mt-8 w-full">
                  <Link to="/health-tools">Try the tools</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* Meal guidance */}
        <div className="bg-secondary/40">
          <Section
            eyebrow="Personalized meal guidance"
            title="Affordable Indian meals, matched to your preference and budget."
          >
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              <img
                src={foodsImage}
                alt="Bowls of dal, chickpeas, sprouts, spinach, curd, ragi flour, peanuts, bananas, guava, eggs and roti"
                width={1600}
                height={1008}
                loading="lazy"
                className="w-full rounded-3xl object-cover shadow-lift"
              />
              <div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Choose vegetarian, non-vegetarian or vegan, pick a goal and a budget, and get a
                  full day of meals — breakfast, two snacks, lunch and dinner — built around idli,
                  dosa, upma, poha, dal, roti, ragi, sprouts, curd, peanuts and seasonal produce.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    ["Instead of packaged chips", "Roasted chickpeas or peanuts"],
                    ["Instead of sugary drinks", "Buttermilk or lemon water"],
                  ].map(([a, b]) => (
                    <div key={a} className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs text-muted-foreground">{a}</p>
                      <p className="mt-1 text-sm font-semibold text-primary">{b}</p>
                    </div>
                  ))}
                </div>
                <Button asChild variant="hero" className="mt-8">
                  <Link to="/auth" search={{ mode: "register" }}>
                    Build my meal plan
                  </Link>
                </Button>
              </div>
            </div>
          </Section>
        </div>

        {/* Awareness */}
        <Section
          eyebrow="Nutrition awareness"
          title="Clear, practical knowledge for the whole household."
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Apple, t: "Balanced diets", d: "What a healthy plate actually looks like." },
              { icon: ShieldCheck, t: "Food hygiene", d: "Prepare and store food safely at home." },
              {
                icon: Droplet,
                t: "Hydration",
                d: "How much water, and what to drink instead of soda.",
              },
              { icon: Users, t: "Every life stage", d: "Women, children and older adults." },
            ].map((c) => (
              <Card key={c.t} className="rounded-3xl border-border shadow-soft">
                <CardContent className="p-6">
                  <c.icon className="h-6 w-6 text-primary" />
                  <h3 className="mt-4 text-base font-semibold">{c.t}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{c.d}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="soft">
              <Link to="/awareness">Browse awareness topics</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/nutrition">Nutrition Learning Center</Link>
            </Button>
          </div>
        </Section>

        {/* Habit tracking */}
        <div className="bg-secondary/40">
          <Section
            eyebrow="Healthy habit tracking"
            title="Seven small habits, checked off one day at a time."
          >
            <div className="grid gap-8 md:grid-cols-2 md:items-center">
              <ul className="grid gap-3 sm:grid-cols-2">
                {[
                  "Drink enough water",
                  "Eat vegetables",
                  "Eat fruit",
                  "Include protein",
                  "Exercise",
                  "Avoid excessive processed food",
                  "Maintain proper sleep",
                ].map((h) => (
                  <li
                    key={h}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    {h}
                  </li>
                ))}
              </ul>
              <div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Daily and weekly completion percentages, a live streak counter and a weekly chart
                  make progress visible — which is what keeps habits going. Water intake has its own
                  tracker with a personal daily glass target.
                </p>
                <Button asChild variant="hero" className="mt-8">
                  <Link to="/auth" search={{ mode: "register" }}>
                    Start tracking
                  </Link>
                </Button>
              </div>
            </div>
          </Section>
        </div>

        {/* Community mission */}
        <Section
          eyebrow="Community health mission"
          title="A student-led project for community health literacy."
        >
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                t: "Reach families first",
                d: "Focus on households with limited access to structured nutritional guidance, using foods they already buy.",
              },
              {
                t: "Teach, never diagnose",
                d: "The portal never diagnoses conditions or recommends medication. It builds understanding and points to professionals.",
              },
              {
                t: "Measure responsibly",
                d: "Community statistics are anonymous aggregates. Individual health data stays private to each account.",
              },
            ].map((c) => (
              <Card key={c.t} className="rounded-3xl border-border shadow-soft">
                <CardContent className="p-7">
                  <h3 className="text-lg font-semibold">{c.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.d}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 overflow-hidden rounded-3xl bg-leaf-gradient p-10 text-primary-foreground shadow-lift">
            <h3 className="max-w-xl text-2xl font-semibold md:text-3xl">
              Ready to understand your nutrition?
            </h3>
            <p className="mt-3 max-w-xl text-sm opacity-90">
              Create a free account to save your BMI records, assessments, meal plans and habit
              history in one secure place.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/auth" search={{ mode: "register" }}>
                  Create free account
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-primary-foreground hover:bg-primary-foreground/15"
              >
                <Link to="/auth" search={{ mode: "login" }}>
                  I already have an account
                </Link>
              </Button>
            </div>
          </div>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
