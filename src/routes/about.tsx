import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartHandshake, Target, ShieldCheck, GraduationCap } from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Disclaimer } from "@/components/site/Disclaimer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HEALTH_DISCLAIMER } from "@/lib/nutrition";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the Project — NourishCare" },
      {
        name: "description",
        content:
          "NourishCare is a Community Service Project on nutrition counseling, community health awareness and healthy lifestyle development.",
      },
      { property: "og:title", content: "About NourishCare" },
      {
        property: "og:description",
        content:
          "A community service project improving nutrition awareness, balanced diet knowledge and healthy lifestyle habits.",
      },
    ],
  }),
  component: About,
});

const OBJECTIVES = [
  "Improve nutrition awareness among community residents",
  "Build practical balanced-diet knowledge",
  "Make affordable healthy meal planning accessible",
  "Strengthen food hygiene and safe storage practices",
  "Encourage healthy lifestyle habits that last",
  "Raise overall community health literacy",
];

function About() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main>
        <div className="bg-hero-gradient">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              About the project
            </p>
            <h1 className="mt-3 max-w-2xl text-4xl font-semibold md:text-5xl">
              A community service project for nutrition and health literacy.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
              NourishCare digitally represents a Community Service Project focused on nutrition
              counseling, community health awareness and healthy lifestyle development — designed
              especially for families with limited access to structured nutritional guidance.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                icon: Target,
                t: "Our mission",
                d: "Help community residents understand their nutritional status, learn what a balanced diet looks like, and adopt habits that are realistic for their household budget.",
              },
              {
                icon: HeartHandshake,
                t: "Who it serves",
                d: "Residents of the community, especially families who do not routinely have access to a dietitian or structured nutrition counseling.",
              },
              {
                icon: ShieldCheck,
                t: "What it never does",
                d: "The platform does not diagnose diseases, claim to cure conditions, recommend medication, or replace doctors and registered dietitians. It does not promote restrictive diets.",
              },
              {
                icon: GraduationCap,
                t: "How it was built",
                d: "A full-stack web application with secure authentication, a PostgreSQL database, role-based access, personal health records and anonymised community analytics.",
              },
            ].map((c) => (
              <Card key={c.t} className="rounded-3xl border-border shadow-soft">
                <CardContent className="p-8">
                  <c.icon className="h-6 w-6 text-primary" />
                  <h2 className="mt-4 text-lg font-semibold">{c.t}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.d}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-14 rounded-3xl border border-border bg-secondary/40 p-8">
            <h2 className="text-xl font-semibold">Project objectives</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {OBJECTIVES.map((o) => (
                <li
                  key={o}
                  className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground"
                >
                  {o}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-14">
            <h2 className="text-xl font-semibold">Privacy commitment</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Your BMI records, assessments, meal plans, habits and water logs are visible only to
              you. Community and administrator dashboards display anonymised, aggregate statistics
              only — never individual health details. Access rules are enforced at the database
              level, not just in the interface.
            </p>
          </div>

          <Disclaimer className="mt-10">{HEALTH_DISCLAIMER}</Disclaimer>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild variant="hero">
              <Link to="/auth" search={{ mode: "register" }}>
                Join NourishCare
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/health-tools">Explore the health tools</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
