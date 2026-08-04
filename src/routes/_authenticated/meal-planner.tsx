import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Sparkles, Utensils } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { Disclaimer } from "@/components/site/Disclaimer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  FOOD_SWAPS,
  HEALTH_DISCLAIMER,
  generateMealPlan,
  type Budget,
  type DietPreference,
  type GeneratedPlan,
  type HealthGoal,
} from "@/lib/nutrition";

export const Route = createFileRoute("/_authenticated/meal-planner")({
  head: () => ({
    meta: [
      { title: "Personalized Meal Planner — NourishCare" },
      {
        name: "description",
        content:
          "Generate a full day of affordable, balanced Indian meals matched to your diet preference, health goal and budget.",
      },
      { property: "og:title", content: "Personalized Meal Planner — NourishCare" },
      {
        property: "og:description",
        content: "Affordable, balanced daily meal suggestions built around your goals.",
      },
    ],
  }),
  component: MealPlanner;
});

function MealPlanner() {
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const [diet, setDiet] = useState<DietPreference>(
    (profile?.diet_preference as DietPreference) || "Vegetarian",
  );
  const [goal, setGoal] = useState<HealthGoal>(
    (profile?.health_goal as HealthGoal) || "Balanced Nutrition",
  );
  const [budget, setBudget] = useState<Budget>("Low");
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: saved } = useQuery({
    queryKey: ["meal-plans", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data } = await supabase
        .from("meal_plans")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  async function handleSave() {
    if (!user || !plan) return;
    setBusy(true);
    const { error } = await supabase.from("meal_plans").insert({
      user_id: user.id,
      diet_preference: diet,
      health_goal: goal,
      budget,
      meal_plan: plan as unknown as Record<string, unknown>,
    });
    setBusy(false);
    if (error) {
      toast.error("Could not save the plan. Please try again.");
      return;
    }
    void qc.invalidateQueries({ queryKey: ["meal-plans", user.id] });
    toast.success("Meal plan saved to your account.");
  }

  return (
    <AppShell
      title="Personalized meal planner"
      description="Everyday Indian meals built from affordable, widely available ingredients."
    >
      <Card className="rounded-3xl border-border shadow-soft">
        <CardContent className="grid gap-5 p-7 md:grid-cols-4 md:items-end">
          <div className="space-y-2">
            <Label>Diet preference</Label>
            <Select value={diet} onValueChange={(v) => setDiet(v as DietPreference)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                <SelectItem value="Vegan">Vegan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Health goal</Label>
            <Select value={goal} onValueChange={(v) => setGoal(v as HealthGoal)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Balanced Nutrition">Balanced Nutrition</SelectItem>
                <SelectItem value="Weight Management">Weight Management</SelectItem>
                <SelectItem value="Improve Protein Intake">Improve Protein Intake</SelectItem>
                <SelectItem value="General Healthy Eating">General Healthy Eating</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Budget</Label>
            <Select value={budget} onValueChange={(v) => setBudget(v as Budget)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="hero" onClick={() => setPlan(generateMealPlan(diet, goal, budget))}>
            <Sparkles className="h-4 w-4" />
            Generate plan
          </Button>
        </CardContent>
      </Card>

      {plan ? (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-background p-6 shadow-soft">
            <div>
              <p className="text-sm text-muted-foreground">Plan focus</p>
              <p className="text-base font-semibold">{plan.focus}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approximate daily energy</p>
              <p className="text-base font-semibold">{plan.totalKcal} kcal</p>
            </div>
            <Button variant="soft" onClick={handleSave} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save this plan
            </Button>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {plan.meals.map((m) => (
              <Card key={m.slot} className="rounded-3xl border-border shadow-soft">
                <CardContent className="p-7">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                      <Utensils className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">~{m.kcal} kcal</span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{m.slot}</h3>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed">
                    {m.items.map((i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {i}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
                    {m.note}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card className="mt-6 rounded-3xl border-dashed border-border">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Utensils className="h-9 w-9 text-muted-foreground" />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Choose your preferences above and generate a full day of meal suggestions.
            </p>
          </CardContent>
        </Card>
      )}

      <h2 className="mt-12 text-xl font-semibold">Smart food swaps</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FOOD_SWAPS.map((s) => (
          <Card key={s.instead} className="rounded-3xl border-border shadow-soft">
            <CardContent className="p-6">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Instead of
              </p>
              <p className="mt-1 text-sm font-medium line-through decoration-muted-foreground/50">
                {s.instead}
              </p>
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-primary">Try</p>
              <p className="mt-1 text-sm font-semibold">{s.tryThis}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {saved && saved.length > 0 ? (
        <>
          <h2 className="mt-12 text-xl font-semibold">Recently saved plans</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((s) => (
              <Card key={s.id} className="rounded-3xl border-border shadow-soft">
                <CardContent className="p-6">
                  <p className="text-sm font-semibold">{s.health_goal}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.diet_preference} · {s.budget} budget
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Saved {new Date(s.created_at).toLocaleDateString()}
                  </p>
                  <Button
                    variant="soft"
                    size="sm"
                    className="mt-4"
                    onClick={() => setPlan(s.meal_plan as unknown as GeneratedPlan)}
                  >
                    View plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : null}

      <Disclaimer className="mt-8">
        These are general suggestions, not a prescribed diet. {HEALTH_DISCLAIMER}
      </Disclaimer>
    </AppShell>
  );
}
