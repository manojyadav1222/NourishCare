import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — NourishCare" },
      {
        name: "description",
        content: "Update your height, weight, diet preference, health goal and daily water target.",
      },
      { property: "og:title", content: "My Profile — NourishCare" },
      { property: "og:description", content: "Manage your NourishCare health profile." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, refreshProfile, user } = useAuth();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [diet, setDiet] = useState(profile?.diet_preference ?? "");
  const [goal, setGoal] = useState(profile?.health_goal ?? "");

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const f = new FormData(e.currentTarget);
    const num = (k: string) => {
      const v = f.get(k);
      return v === null || v === "" ? null : Number(v);
    };
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: String(f.get("full_name") ?? "").trim().slice(0, 100),
        age: num("age"),
        gender: (f.get("gender") as string) || null,
        phone: String(f.get("phone") ?? "").trim().slice(0, 20) || null,
        height: num("height"),
        weight: num("weight"),
        diet_preference: diet || null,
        health_goal: goal || null,
        water_goal: num("water_goal") ?? 8,
      })
      .eq("user_id", user.id);
    setBusy(false);
    if (error) {
      toast.error("Could not save your profile. Please try again.");
      return;
    }
    await refreshProfile();
    void qc.invalidateQueries();
    toast.success("Profile updated.");
  }

  return (
    <AppShell
      title="My profile"
      description="Keeping this up to date makes your meal plans and progress charts more accurate."
    >
      <Card className="max-w-2xl rounded-3xl border-border shadow-soft">
        <CardContent className="p-7">
          <form className="space-y-5" onSubmit={handleSave}>
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" name="full_name" defaultValue={profile?.full_name ?? ""} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  min={1}
                  max={120}
                  defaultValue={profile?.age ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Input id="gender" name="gender" defaultValue={profile?.gender ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  min={50}
                  max={250}
                  defaultValue={profile?.height ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  min={10}
                  max={400}
                  defaultValue={profile?.weight ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue={profile?.phone ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="water_goal">Daily water goal (glasses)</Label>
                <Input
                  id="water_goal"
                  name="water_goal"
                  type="number"
                  min={1}
                  max={20}
                  defaultValue={profile?.water_goal ?? 8}
                />
              </div>
              <div className="space-y-2">
                <Label>Diet preference</Label>
                <Select value={diet} onValueChange={setDiet}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
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
                <Select value={goal} onValueChange={setGoal}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Balanced Nutrition">Balanced Nutrition</SelectItem>
                    <SelectItem value="Weight Management">Weight Management</SelectItem>
                    <SelectItem value="Improve Protein Intake">Improve Protein Intake</SelectItem>
                    <SelectItem value="General Healthy Eating">General Healthy Eating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" variant="hero" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
}
