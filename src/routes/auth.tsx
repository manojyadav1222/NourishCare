import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Leaf, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";

const searchSchema = z.object({
  mode: z.enum(["login", "register"]).catch("login"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Login or Register — NourishCare" },
      {
        name: "description",
        content:
          "Sign in to NourishCare to save your BMI records, health assessments, meal plans and daily habits.",
      },
      { property: "og:title", content: "Login or Register — NourishCare" },
      { property: "og:description", content: "Access your NourishCare health dashboard." },
    ],
  }),
  component: AuthPage,
});

const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  age: z.coerce.number().int().min(1, "Enter a valid age").max(120, "Enter a valid age"),
  gender: z.string().min(1, "Please select a gender"),
  phone: z
    .string()
    .trim()
    .max(20)
    .regex(/^[0-9+\-\s]*$/, "Phone can only contain digits, spaces, + and -")
    .optional()
    .or(z.literal("")),
});

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [gender, setGender] = useState("");
  const [confirmSent, setConfirmSent] = useState(false);

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/dashboard", replace: true });
  }, [loading, user, navigate]);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse({
      email: form.get("email"),
      password: form.get("password"),
    });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setBusy(false);
    if (error) {
      toast.error(
        error.message.includes("Invalid login")
          ? "Incorrect email or password."
          : error.message,
      );
      return;
    }
    toast.success("Welcome back!");
    void navigate({ to: "/dashboard" });
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = registerSchema.safeParse({
      fullName: form.get("fullName"),
      email: form.get("email"),
      password: form.get("password"),
      age: form.get("age"),
      gender,
      phone: form.get("phone") ?? "",
    });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: parsed.data.fullName,
          age: String(parsed.data.age),
          gender: parsed.data.gender,
          phone: parsed.data.phone ?? "",
        },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(
        error.message.includes("already registered")
          ? "That email is already registered. Try logging in instead."
          : error.message,
      );
      return;
    }
    if (!data.session) {
      setConfirmSent(true);
      toast.success("Account created — check your email to confirm it.");
      return;
    }
    toast.success("Account created!");
    void navigate({ to: "/dashboard" });
  }

  async function handleGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in could not be started. Please try again.");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/dashboard" });
  }

  async function handleForgot() {
    const parsed = z.string().trim().email().safeParse(forgotEmail);
    if (!parsed.success) {
      toast.error("Enter a valid email address.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setForgotOpen(false);
    toast.success("If that email is registered, a reset link is on its way.");
  }

  return (
    <div className="grid min-h-screen bg-hero-gradient lg:grid-cols-2">
      <div className="hidden flex-col justify-between p-12 lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf-gradient text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-semibold">NourishCare</span>
        </Link>
        <div>
          <h1 className="max-w-md text-4xl font-semibold leading-tight">
            Better Nutrition. Healthier Communities.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
            Save your BMI records, wellness assessments, meal plans and daily habits securely — and
            watch your progress build over time.
          </p>
        </div>
        <p className="max-w-md text-xs text-muted-foreground">
          NourishCare is an educational nutrition awareness platform. It does not diagnose diseases
          or replace professional medical advice.
        </p>
      </div>

      <div className="flex items-center justify-center bg-background p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf-gradient text-primary-foreground">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-semibold">NourishCare</span>
          </Link>

          {confirmSent ? (
            <div className="rounded-3xl border border-border p-8 text-center shadow-soft">
              <h2 className="text-xl font-semibold">Check your email</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                We've sent a confirmation link to your inbox. Click it to activate your NourishCare
                account, then come back and log in.
              </p>
              <Button
                variant="soft"
                className="mt-6"
                onClick={() => {
                  setConfirmSent(false);
                  void navigate({ to: "/auth", search: { mode: "login" } });
                }}
              >
                Back to login
              </Button>
            </div>
          ) : (
            <Tabs
              value={mode}
              onValueChange={(v) =>
                void navigate({ to: "/auth", search: { mode: v as "login" | "register" } })
              }
            >
              <TabsList className="grid w-full grid-cols-2 rounded-full">
                <TabsTrigger value="login" className="rounded-full">
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="rounded-full">
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-8">
                <h2 className="text-2xl font-semibold">Welcome back</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Log in to continue tracking your nutrition and habits.
                </p>
                <form className="mt-6 space-y-4" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" name="email" type="email" autoComplete="email" required />
                    {errors["email"] ? (
                      <p className="text-xs text-destructive">{errors["email"]}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                    />
                    {errors["password"] ? (
                      <p className="text-xs text-destructive">{errors["password"]}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => setForgotOpen(true)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Forgot your password?
                  </button>
                  <Button type="submit" variant="hero" className="w-full" disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Log in
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-8">
                <h2 className="text-2xl font-semibold">Create your account</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  It takes less than a minute and it's completely free.
                </p>
                <form className="mt-6 space-y-4" onSubmit={handleRegister}>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input id="fullName" name="fullName" autoComplete="name" required />
                    {errors["fullName"] ? (
                      <p className="text-xs text-destructive">{errors["fullName"]}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input id="reg-email" name="email" type="email" autoComplete="email" required />
                    {errors["email"] ? (
                      <p className="text-xs text-destructive">{errors["email"]}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                    />
                    {errors["password"] ? (
                      <p className="text-xs text-destructive">{errors["password"]}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">At least 8 characters.</p>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input id="age" name="age" type="number" min={1} max={120} required />
                      {errors["age"] ? (
                        <p className="text-xs text-destructive">{errors["age"]}</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                          <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors["gender"] ? (
                        <p className="text-xs text-destructive">{errors["gender"]}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone number (optional)</Label>
                    <Input id="phone" name="phone" type="tel" autoComplete="tel" />
                    {errors["phone"] ? (
                      <p className="text-xs text-destructive">{errors["phone"]}</p>
                    ) : null}
                  </div>
                  <Button type="submit" variant="hero" className="w-full" disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Create account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}

          {!confirmSent ? (
            <>
              <div className="my-6 flex items-center gap-4">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogle}
                disabled={busy}
              >
                Continue with Google
              </Button>
            </>
          ) : null}

          <p className="mt-8 text-center text-xs text-muted-foreground">
            By continuing you agree that NourishCare provides general educational information only
            and does not replace professional medical advice.
          </p>
        </div>
      </div>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              Enter your account email and we'll send you a link to set a new password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="forgot-email">Email</Label>
            <Input
              id="forgot-email"
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setForgotOpen(false)}>
              Cancel
            </Button>
            <Button variant="hero" onClick={handleForgot} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Send reset link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
