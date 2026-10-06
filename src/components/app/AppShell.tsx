import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  ClipboardList,
  Droplet,
  LayoutDashboard,
  Leaf,
  LineChart,
  ListChecks,
  LogOut,
  Menu,
  ReceiptText,
  Shield,
  ShoppingBasket,
  User,
  Utensils,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/assessment", label: "Assessment", icon: ClipboardList },
  { to: "/meal-planner", label: "Meal Planner", icon: Utensils },
  { to: "/habits", label: "Habits", icon: ListChecks },
  { to: "/water", label: "Water", icon: Droplet },
  { to: "/progress", label: "Progress", icon: LineChart },
  { to: "/market", label: "Market", icon: ShoppingBasket },
  { to: "/orders", label: "Saved Lists", icon: ReceiptText },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const { isAdmin, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    void navigate({ to: "/", replace: true });
  }

  const items = isAdmin ? [...NAV, { to: "/admin", label: "Admin", icon: Shield } as const] : NAV;

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf-gradient text-primary-foreground">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold">NourishCare</span>
          </Link>
          <div className="hidden items-center gap-3 md:flex">
            <span className="text-sm text-muted-foreground">
              {profile?.full_name ? `Hi, ${profile.full_name.split(" ")[0]}` : "Welcome"}
            </span>
            <Button variant="soft" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
          <button className="md:hidden" aria-label="Toggle menu" onClick={() => setOpen((v) => !v)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open ? (
          <div className="border-t border-border bg-background px-4 py-4 md:hidden">
            <nav className="grid gap-1">
              {items.map((i) => (
                <Link
                  key={i.to}
                  to={i.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium",
                    pathname === i.to
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  <i.icon className="h-4 w-4" />
                  {i.label}
                </Link>
              ))}
            </nav>
            <Button variant="soft" size="sm" className="mt-4 w-full" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        ) : null}
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="sticky top-24 grid gap-1">
            {items.map((i) => (
              <Link
                key={i.to}
                to={i.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === i.to
                    ? "bg-background text-foreground shadow-soft"
                    : "text-muted-foreground hover:bg-background/60",
                )}
              >
                <i.icon className="h-4 w-4" />
                {i.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
          <div className="mt-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
