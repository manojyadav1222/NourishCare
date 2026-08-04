import { useState } from "react";
import { BMI_BANDS, bmiCategory, calculateBmi, bmiCategoryNote } from "@/lib/nutrition";
import { cn } from "@/lib/utils";

export function BmiGauge({ bmi }: { bmi: number }) {
  const max = 45;
  const pct = Math.min(100, Math.max(0, (bmi / max) * 100));
  const category = bmiCategory(bmi);

  return (
    <div>
      <div className="relative pt-7">
        <div
          className="absolute top-0 -translate-x-1/2 transition-all duration-500"
          style={{ left: `${pct}%` }}
        >
          <span className="whitespace-nowrap rounded-full bg-foreground px-2 py-0.5 text-[11px] font-semibold text-background">
            {bmi}
          </span>
        </div>
        <div className="flex h-3 overflow-hidden rounded-full">
          {BMI_BANDS.map((b) => (
            <div
              key={b.label}
              className={cn(b.token, b.label === category ? "opacity-100" : "opacity-40")}
              style={{ width: `${((b.to - b.from) / max) * 100}%` }}
            />
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <span>Underweight</span>
        <span>Normal</span>
        <span>Overweight</span>
        <span>Obese</span>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {bmiCategoryNote(category)}
      </p>
    </div>
  );
}

export function useBmiForm(initial?: { height?: number | null; weight?: number | null }) {
  const [height, setHeight] = useState(initial?.height ? String(initial.height) : "");
  const [weight, setWeight] = useState(initial?.weight ? String(initial.weight) : "");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ bmi: number; category: string } | null>(null);

  function compute() {
    const h = Number(height);
    const w = Number(weight);
    if (!h || h < 50 || h > 250) {
      setError("Enter a height between 50 and 250 cm.");
      setResult(null);
      return null;
    }
    if (!w || w < 10 || w > 400) {
      setError("Enter a weight between 10 and 400 kg.");
      setResult(null);
      return null;
    }
    setError(null);
    const bmi = calculateBmi(h, w);
    const value = { bmi, category: bmiCategory(bmi) as string };
    setResult(value);
    return { ...value, height: h, weight: w };
  }

  return { height, setHeight, weight, setWeight, error, result, compute, setResult };
}
