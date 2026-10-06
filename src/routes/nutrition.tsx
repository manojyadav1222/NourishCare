import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  Bone,
  ChefHat,
  Droplet,
  Droplets,
  Egg,
  Flame,
  Hand,
  Refrigerator,
  Salad,
  ScanLine,
  Scale,
  Sun,
  Wheat,
} from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Disclaimer } from "@/components/site/Disclaimer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NUTRITION_TOPICS, HEALTH_DISCLAIMER, type Topic } from "@/lib/nutrition";

export const Route = createFileRoute("/nutrition")({
  head: () => ({
    meta: [
      { title: "Nutrition Learning Center — NourishCare" },
      {
        name: "description",
        content:
          "Learn about carbohydrates, proteins, fats, iron, calcium, vitamins, balanced diets, hygiene, portions, hydration and food labels.",
      },
      { property: "og:title", content: "Nutrition Learning Center — NourishCare" },
      {
        property: "og:description",
        content: "Plain-language nutrition education for everyday Indian households.",
      },
    ],
  }),
  component: NutritionCenter,
});

export const TOPIC_ICONS: Record<string, typeof Salad> = {
  wheat: Wheat,
  egg: Egg,
  droplets: Droplets,
  flame: Flame,
  bone: Bone,
  sun: Sun,
  salad: Salad,
  hand: Hand,
  refrigerator: Refrigerator,
  scale: Scale,
  droplet: Droplet,
  "chef-hat": ChefHat,
  "scan-line": ScanLine,
  activity: Activity,
};

const GROUPS = ["Macronutrients", "Micronutrients", "Everyday Practice"];

export function TopicGrid({ onOpen }: { onOpen: (t: Topic) => void }) {
  return (
    <div className="space-y-14">
      {GROUPS.map((group) => (
        <div key={group}>
          <h2 className="text-xl font-semibold">{group}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {NUTRITION_TOPICS.filter((t) => t.group === group).map((t) => {
              const Icon = TOPIC_ICONS[t.icon] ?? Salad;
              return (
                <Card
                  key={t.slug}
                  className="rounded-3xl border-border shadow-soft transition-shadow hover:shadow-lift"
                >
                  <CardContent className="flex h-full flex-col p-7">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold">{t.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {t.summary}
                    </p>
                    <Button
                      variant="soft"
                      size="sm"
                      className="mt-5 self-start"
                      onClick={() => onOpen(t)}
                    >
                      Read more
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TopicDialog({ topic, onClose }: { topic: Topic | null; onClose: () => void }) {
  return (
    <Dialog open={Boolean(topic)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-3xl sm:max-w-lg">
        {topic ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">{topic.title}</DialogTitle>
              <DialogDescription>{topic.summary}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {topic.body.map((p) => (
                <p key={p} className="text-sm leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </div>
            <Disclaimer className="mt-2">{HEALTH_DISCLAIMER}</Disclaimer>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function NutritionCenter() {
  const [topic, setTopic] = useState<Topic | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main>
        <div className="bg-hero-gradient">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Nutrition Learning Center
            </p>
            <h1 className="mt-3 max-w-2xl text-4xl font-semibold md:text-5xl">
              Understand what your food actually does.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Short, practical explanations of the nutrients and everyday practices that matter most
              — written for real kitchens and real budgets.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-16">
          <TopicGrid onOpen={setTopic} />

          <div className="mt-16 rounded-3xl border border-border bg-secondary/50 p-8">
            <h2 className="text-xl font-semibold">Put it into practice</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Create a free account to build a personalised meal plan, check your BMI and track
              daily habits.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="hero">
                <Link to="/auth" search={{ mode: "register" }}>
                  Get started
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/awareness">Health awareness topics</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <TopicDialog topic={topic} onClose={() => setTopic(null)} />
      <SiteFooter />
    </div>
  );
}
