import { Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
import { HEALTH_DISCLAIMER } from "@/lib/nutrition";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf-gradient text-primary-foreground">
                <Leaf className="h-5 w-5" />
              </span>
              <span className="font-display text-xl font-semibold">NourishCare</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              A community service initiative for nutrition counseling, health awareness and healthy
              lifestyle development — built for families with limited access to structured
              nutritional guidance.
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold">Explore</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/nutrition" className="hover:text-foreground">
                  Nutrition Learning Center
                </Link>
              </li>
              <li>
                <Link to="/health-tools" className="hover:text-foreground">
                  Health Tools
                </Link>
              </li>
              <li>
                <Link to="/awareness" className="hover:text-foreground">
                  Health Awareness
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-foreground">
                  About the Project
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold">Get started</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/auth" search={{ mode: "register" }} className="hover:text-foreground">
                  Create an account
                </Link>
              </li>
              <li>
                <Link to="/auth" search={{ mode: "login" }} className="hover:text-foreground">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-foreground">
                  My dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-background p-4 text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Health disclaimer: </strong>
          {HEALTH_DISCLAIMER}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} NourishCare — Community Service Project. Educational use
          only.
        </p>
      </div>
    </footer>
  );
}
