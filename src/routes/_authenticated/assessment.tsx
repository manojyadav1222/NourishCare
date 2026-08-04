import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { Disclaimer } from "@/components/site/Disclaimer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  ASSESSMENT_OPTIONS,
  HEALTH_DISCLAIMER,
  bmiCategory,
  buildWellnessSummary,
  calculateBmi,
  type AssessmentData,
  type WellnessSummary,
} from "@/lib/nutrition";

export const Route = createFileRoute("/_authenticated/assessment")({
  head: () => ({
    meta: [
      { title: "Health & Nutrition Assessment — NourishCare" },
      {
        name: "description",
        content:
          "Answer a short questionnaire on diet, hydration, activity and sleep to get a personalised wellness summary.",
      },
      { property: "og:title", content: "Health & Nutrition Assessment — NourishCare" },
      {
        property: "og:description",
        content: "Get a wellness summary based on your everyday eating and lifestyle habits.",
      },
    ],
  }),
  component: AssessmentPage,
});

const STEPS = ["About you", "Eating habits", "Lifestyle", "Health notes"];

function AssessmentPage() {
  const { user, profile, refreshProfile } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<WellnessSummary | null>(null);
  const [form, setForm] = useState<AssessmentData>({
    age: profile?.age ?? 0,
    gender: profile?.gender ?? "",
    height: profile?.height ?? 0,
    weight: profile?.weight ?? 0,
    meals: "",
    fruits: "",
    vegetables: "",
    protein: "",
    processed: "",
    sugary: "",
    water: "",
    exercise: "",
    sleep: "",
    conditions: [],
  });

  function set<K extends keyof AssessmentData>(key: K, value: AssessmentData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const stepValid = (() => {
    if (step === 0) return form.age > 0 && form.height >= 50 && form.weight >= 10 && !!form.gender;
    if (step === 1)
      return !!form.meals && !!form.fruits && !!form.vegetables && !!form.protein && !!form.processed && !!form.sugary;
    if (step === 2) return !!form.water && !!form.exercise && !!form.sleep;
    return true;
  })();

  async function handleSubmit() {
    if (!user) return;
    setBusy(true);
    const result = buildWellnessSummary(form);
    const bmi = calculateBmi(form.height, form.weight);

    const [{ error: aErr }] = await Promise.all([
      supabase.from("health_assessments").insert({
        user_id: user.id,
        assessment_data: form as unknown as Record<string, unknown>,
        wellness_summary: result as unknown as Record<string, unknown>,
      }),
      supabase.from("bmi_records").insert({
        user_id: user.id,
        height: form.height,
        weight: form.weight,
        bmi,
        category: bmiCategory(bmi),
      }),
      supabase
        .from("profiles")
        .update({
          age: form.age,
          gender: form.gender,
          height: form.height,
          weight: form.weight,
        })
        .eq("user_id", user.id),
    ]);

    setBusy(false);
    if (aErr) {
      toast.error("Could not save your assessment. Please try again.");
      return;
    }
    await refreshProfile();
    void qc.invalidateQueries();
    setSummary(result);
    toast.success("Assessment saved.");
  }

  if (summary) {
    return (
      <AppShell title="Your wellness summary" description="Based on the answers you just gave.">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="rounded-3xl border-border bg-leaf-gradient text-primary-foreground shadow-lift">
            <CardContent className="p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-80">
                Wellness score
              </p>
              <p className="mt-3 font-display text-6xl font-semibold">{summary.score}</p>
              <p className="text-sm opacity-90">out of 100</p>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-border shadow-soft lg:col-span-2">
            <CardContent className="grid gap-5 p-7 sm:grid-cols-2">
              <Metric label="Nutrition status" value={summary.nutritionStatus} />
              <Metric label="Hydration" value={summary.hydrationStatus} />
              <Metric label="Activity level" value={summary.activityStatus} />
              <Metric label="Diet quality" value={summary.dietQuality} />
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 rounded-3xl border-border shadow-soft">
          <CardContent className="p-7">
            <h2 className="text-lg font-semibold">Suggestions for you</h2>
            <ul className="mt-4 space-y-3">
              {summary.suggestions.map((s) => (
                <li key={s} className="flex gap-3 text-sm leading-relaxed">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {summary.needsProfessionalNote ? (
          <Disclaimer className="mt-6" title="Please speak to a professional">
            You mentioned an existing health condition. Nutrition needs in these situations are
            highly individual — please follow guidance from your doctor or a registered dietitian
            before making changes.
          </Disclaimer>
        ) : null}
        <Disclaimer className="mt-4">{HEALTH_DISCLAIMER}</Disclaimer>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="hero" onClick={() => void navigate({ to: "/meal-planner" })}>
            Build a matching meal plan
          </Button>
          <Button
            variant="soft"
            onClick={() => {
              setSummary(null);
              setStep(0);
            }}
          >
            Retake assessment
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Health & nutrition assessment"
      description="Four short steps. Your answers stay private to your account."
    >
      <div className="max-w-2xl">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{STEPS[step]}</span>
          <span className="text-muted-foreground">
            Step {step + 1} of {STEPS.length}
          </span>
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} className="mt-3" />

        <Card className="mt-6 rounded-3xl border-border shadow-soft">
          <CardContent className="space-y-6 p-7">
            {step === 0 ? (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Age">
                    <Input
                      type="number"
                      min={1}
                      max={120}
                      value={form.age || ""}
                      onChange={(e) => set("age", Number(e.target.value))}
                    />
                  </Field>
                  <Field label="Gender">
                    <Input
                      value={form.gender}
                      placeholder="e.g. Female"
                      onChange={(e) => set("gender", e.target.value)}
                    />
                  </Field>
                  <Field label="Height (cm)">
                    <Input
                      type="number"
                      min={50}
                      max={250}
                      value={form.height || ""}
                      onChange={(e) => set("height", Number(e.target.value))}
                    />
                  </Field>
                  <Field label="Weight (kg)">
                    <Input
                      type="number"
                      min={10}
                      max={400}
                      value={form.weight || ""}
                      onChange={(e) => set("weight", Number(e.target.value))}
                    />
                  </Field>
                </div>
              </>
            ) : null}

            {step === 1 ? (
              <>
                <Choice
                  label="How many main meals do you eat a day?"
                  options={ASSESSMENT_OPTIONS.meals}
                  value={form.meals}
                  onChange={(v) => set("meals", v)}
                />
                <Choice
                  label="How often do you eat fruit?"
                  options={ASSESSMENT_OPTIONS.frequency}
                  value={form.fruits}
                  onChange={(v) => set("fruits", v)}
                />
                <Choice
                  label="How often do you eat vegetables?"
                  options={ASSESSMENT_OPTIONS.frequency}
                  value={form.vegetables}
                  onChange={(v) => set("vegetables", v)}
                />
                <Choice
                  label="How often do you eat a protein source (dal, egg, curd, meat, sprouts)?"
                  options={ASSESSMENT_OPTIONS.frequency}
                  value={form.protein}
                  onChange={(v) => set("protein", v)}
                />
                <Choice
                  label="How often do you eat processed or fried snacks?"
                  options={ASSESSMENT_OPTIONS.frequency}
                  value={form.processed}
                  onChange={(v) => set("processed", v)}
                />
                <Choice
                  label="How often do you have sugary drinks or sweets?"
                  options={ASSESSMENT_OPTIONS.frequency}
                  value={form.sugary}
                  onChange={(v) => set("sugary", v)}
                />
              </>
            ) : null}

            {step === 2 ? (
              <>
                <Choice
                  label="How much water do you drink daily?"
                  options={ASSESSMENT_OPTIONS.water}
                  value={form.water}
                  onChange={(v) => set("water", v)}
                />
                <Choice
                  label="How often do you exercise or walk briskly?"
                  options={ASSESSMENT_OPTIONS.exercise}
                  value={form.exercise}
                  onChange={(v) => set("exercise", v)}
                />
                <Choice
                  label="How many hours do you usually sleep?"
                  options={ASSESSMENT_OPTIONS.sleep}
                  value={form.sleep}
                  onChange={(v) => set("sleep", v)}
                />
              </>
            ) : null}

            {step === 3 ? (
              <div>
                <p className="text-sm font-medium">
                  Do any of these apply to you? (optional, select any)
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {ASSESSMENT_OPTIONS.conditions.map((c) => (
                    <label
                      key={c}
                      className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm"
                    >
                      <Checkbox
                        checked={form.conditions.includes(c)}
                        onCheckedChange={(checked) =>
                          set(
                            "conditions",
                            checked
                              ? [...form.conditions, c]
                              : form.conditions.filter((x) => x !== c),
                          )
                        }
                      />
                      {c}
                    </label>
                  ))}
                </div>
                <Disclaimer className="mt-6">
                  This assessment does not diagnose any condition. It only reflects the habits you
                  described. {HEALTH_DISCLAIMER}
                </Disclaimer>
              </div>
            ) : null}

            <div className="flex justify-between pt-2">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button
                  variant="hero"
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!stepValid}
                >
                  Continue
                </Button>
              ) : (
                <Button variant="hero" onClick={handleSubmit} disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  See my summary
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary/60 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-semibold">{value}</p>
    </div>
  );
}

function Choice({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <RadioGroup value={value} onValueChange={onChange} className="mt-3 grid gap-2 sm:grid-cols-2">
        {options.map((o) => (
          <label
            key={o}
            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border px-4 py-2.5 text-sm"
          >
            <RadioGroupItem value={o} />
            {o}
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}
