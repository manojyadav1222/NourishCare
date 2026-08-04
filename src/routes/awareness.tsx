import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Apple,
  Baby,
  Brain,
  CandyOff,
  Egg,
  Flame,
  Hand,
  Heart,
  Moon,
  Refrigerator,
  Salad,
  Soup,
  Users,
} from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Disclaimer } from "@/components/site/Disclaimer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AWARENESS_TOPICS, HEALTH_DISCLAIMER } from "@/lib/nutrition";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/awareness")({
  head: () => ({
    meta: [
      { title: "Health Awareness — NourishCare" },
      {
        name: "description",
        content:
          "Community health awareness on healthy eating, iron and protein rich foods, nutrition across life stages, hygiene, activity, stress and sleep.",
      },
      { property: "og:title", content: "Health Awareness — NourishCare" },
      {
        property: "og:description",
        content: "Awareness resources on nutrition, hygiene, activity, stress and sleep.",
      },
    ],
  }),
  component: Awareness,
});

const ICONS: Record<string, typeof Salad> = {
  salad: Salad,
  flame: Flame,
  egg: Egg,
  heart: Heart,
  baby: Baby,
  users: Users,
  "candy-off": CandyOff,
  soup: Soup,
  hand: Hand,
  refrigerator: Refrigerator,
  activity: Activity,
  brain: Brain,
  moon: Moon,
  apple: Apple,
};

type Article = {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
};

export function useArticles() {
  return useQuery({
    queryKey: ["articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nutrition_articles")
        .select("id,title,category,description,content")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Article[];
    },
  });
}

function Awareness() {
  const { data: articles, isLoading, isError } = useArticles();
  const [open, setOpen] = useState<Article | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main>
        <div className="bg-hero-gradient">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Health awareness
            </p>
            <h1 className="mt-3 max-w-2xl text-4xl font-semibold md:text-5xl">
              Awareness resources for common community health concerns.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Educational material on the topics that come up most often during community nutrition
              counseling sessions.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-xl font-semibold">Awareness topics</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {AWARENESS_TOPICS.map((t) => {
              const Icon = ICONS[t.icon] ?? Salad;
              return (
                <Card key={t.title} className="rounded-3xl border-border shadow-soft">
                  <CardContent className="p-7">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold">{t.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.text}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <h2 className="mt-16 text-xl font-semibold">In-depth articles</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Longer reads maintained by the NourishCare community health team.
          </p>

          {isLoading ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-44 rounded-3xl" />
              ))}
            </div>
          ) : isError ? (
            <p className="mt-6 rounded-2xl border border-border bg-secondary/50 p-6 text-sm text-muted-foreground">
              We couldn't load the articles right now. Please refresh the page to try again.
            </p>
          ) : articles && articles.length > 0 ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => (
                <Card key={a.id} className="rounded-3xl border-border shadow-soft">
                  <CardContent className="flex h-full flex-col p-7">
                    <span className="w-fit rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary-foreground">
                      {a.category}
                    </span>
                    <h3 className="mt-4 text-lg font-semibold">{a.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {a.description}
                    </p>
                    <Button
                      variant="soft"
                      size="sm"
                      className="mt-5 self-start"
                      onClick={() => setOpen(a)}
                    >
                      Read article
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-2xl border border-border bg-secondary/50 p-6 text-sm text-muted-foreground">
              No articles have been published yet. Please check back soon.
            </p>
          )}

          <Disclaimer className="mt-12">{HEALTH_DISCLAIMER}</Disclaimer>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild variant="hero">
              <Link to="/auth" search={{ mode: "register" }}>
                Create free account
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/nutrition">Nutrition Learning Center</Link>
            </Button>
          </div>
        </div>
      </main>

      <Dialog open={Boolean(open)} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-3xl sm:max-w-lg">
          {open ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">{open.title}</DialogTitle>
                <DialogDescription>{open.description}</DialogDescription>
              </DialogHeader>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {open.content}
              </p>
              <Disclaimer className="mt-2">{HEALTH_DISCLAIMER}</Disclaimer>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <SiteFooter />
    </div>
  );
}
