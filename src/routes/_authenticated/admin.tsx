import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  Activity,
  Droplet,
  Loader2,
  Package,
  ShieldAlert,
  ShoppingBasket,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminApi, type MarketProduct, type NutritionArticle, type NutritionTip } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Community Analytics | NourishCare" },
      {
        name: "description",
        content: "Anonymized community nutrition analytics for NourishCare administrators.",
      },
      { property: "og:title", content: "Admin — Community Analytics" },
      { property: "og:description", content: "Aggregate community health insights." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

type Stats = {
  total_users?: number;
  total_assessments?: number;
  assessments?: number;
  total_meal_plans?: number;
  meal_plans?: number;
  active_trackers?: number;
  total_habit_logs?: number;
  avg_bmi?: number;
  average_bmi?: number;
  avg_water?: number;
  average_daily_water?: number;
  bmi_distribution?: Record<string, number>;
  market_products?: number;
  market_orders?: number;
  market_revenue?: number;
};

type Article = NutritionArticle;
type Tip = NutritionTip;
type Product = MarketProduct;

function Admin() {
  const { isAdmin, loading } = useAuth();

  const { data } = useQuery({
    queryKey: ["community-stats"],
    enabled: isAdmin,
    queryFn: async () => {
      const { stats } = await adminApi.stats();
      return stats as Stats;
    },
  });

  if (!loading && !isAdmin) {
    return (
      <AppShell title="Admin dashboard">
        <Card className="rounded-3xl border-border shadow-soft">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <ShieldAlert className="h-9 w-9 text-muted-foreground" />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              This area is restricted to NourishCare administrators.
            </p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const dist = Object.entries(data?.bmi_distribution ?? {}).map(([category, count]) => ({
    category,
    count,
  }));
  const totalAssessments = data?.total_assessments ?? data?.assessments ?? 0;
  const totalMealPlans = data?.total_meal_plans ?? data?.meal_plans ?? 0;

  return (
    <AppShell
      title="Community analytics"
      description="Aggregated, anonymized insights. No individual health records are shown here."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users} label="Registered users" value={String(data?.total_users ?? 0)} />
        <Stat icon={Activity} label="Assessments taken" value={String(totalAssessments)} />
        <Stat
          icon={Activity}
          label="Average BMI"
          value={
            data?.average_bmi || data?.avg_bmi ? String(data.average_bmi ?? data.avg_bmi) : "—"
          }
        />
        <Stat
          icon={Droplet}
          label="Avg water / day"
          value={
            data?.average_daily_water || data?.avg_water
              ? String(data.average_daily_water ?? data.avg_water)
              : "—"
          }
        />
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Activity} label="Saved meal plans" value={String(totalMealPlans)} />
        <Stat
          icon={Users}
          label="Active trackers"
          value={String(data?.active_trackers ?? data?.total_habit_logs ?? 0)}
        />
        <Stat icon={Package} label="Market products" value={String(data?.market_products ?? 0)} />
        <Stat
          icon={ShoppingBasket}
          label="Market orders"
          value={String(data?.market_orders ?? 0)}
        />
      </div>

      <Card className="mt-6 rounded-3xl border-border shadow-soft">
        <CardContent className="flex flex-col gap-3 p-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Nourish Market revenue</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Demo-order total for project presentation only.
            </p>
          </div>
          <p className="font-display text-3xl font-semibold">
            Rs {(data?.market_revenue ?? 0).toFixed(0)}
          </p>
        </CardContent>
      </Card>

      <Card className="mt-6 rounded-3xl border-border shadow-soft">
        <CardContent className="p-7">
          <h2 className="text-base font-semibold">BMI category distribution</h2>
          {dist.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No community data recorded yet.
            </p>
          ) : (
            <div className="mt-5 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dist}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 12 }}
                    stroke="var(--muted-foreground)"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                    stroke="var(--muted-foreground)"
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <ProductManager />
        <ArticleManager />
        <TipManager />
      </div>
    </AppShell>
  );
}

function ProductManager() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "Healthy Foods",
    price: "",
    unit: "pack",
    platform: "Amazon",
    product_url: "",
    image_url: "",
    description: "",
    health_benefit: "",
    nutrition_tags: "",
    related_topics: "",
    stock_status: "In Stock",
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { records } = await adminApi.products();
      return records;
    },
  });

  function reset() {
    setEditingId(null);
    setForm({
      name: "",
      category: "Healthy Foods",
      price: "",
      unit: "pack",
      platform: "Amazon",
      product_url: "",
      image_url: "",
      description: "",
      health_benefit: "",
      nutrition_tags: "",
      related_topics: "",
      stock_status: "In Stock",
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || Number(form.price) <= 0) {
      toast.error("Product name and price are required.");
      return;
    }
    setBusy(true);
    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      unit: form.unit.trim(),
      platform: form.platform.trim(),
      product_url: form.product_url.trim() || null,
      image_url: form.image_url.trim() || null,
      description: form.description.trim(),
      health_benefit: form.health_benefit.trim(),
      nutrition_tags: form.nutrition_tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      related_topics: form.related_topics
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      stock_status: form.stock_status.trim() || "In Stock",
    };
    try {
      if (editingId) await adminApi.updateProduct(editingId, payload);
      else await adminApi.createProduct(payload);
    } catch {
      toast.error("Could not save product. Make sure your account has admin access.");
      setBusy(false);
      return;
    }
    setBusy(false);
    reset();
    void qc.invalidateQueries({ queryKey: ["admin-products"] });
    void qc.invalidateQueries({ queryKey: ["market-products"] });
    void qc.invalidateQueries({ queryKey: ["community-stats"] });
    toast.success(editingId ? "Product updated." : "Product added.");
  }

  async function remove(id: number) {
    setBusy(true);
    try {
      await adminApi.deleteProduct(id);
    } catch {
      toast.error("Could not delete product.");
      setBusy(false);
      return;
    }
    setBusy(false);
    if (editingId === id) reset();
    void qc.invalidateQueries({ queryKey: ["admin-products"] });
    void qc.invalidateQueries({ queryKey: ["market-products"] });
    void qc.invalidateQueries({ queryKey: ["community-stats"] });
    toast.success("Product deleted.");
  }

  return (
    <Card className="rounded-3xl border-border shadow-soft xl:col-span-2">
      <CardContent className="p-7">
        <h2 className="text-base font-semibold">Nourish Market products</h2>
        <form className="mt-5 grid gap-4 lg:grid-cols-2" onSubmit={save}>
          <Field label="Product name">
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </Field>
          <Field label="Category">
            <Input
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            />
          </Field>
          <Field label="Price">
            <Input
              type="number"
              min={1}
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            />
          </Field>
          <Field label="Unit">
            <Input
              value={form.unit}
              onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
            />
          </Field>
          <Field label="Partner platform">
            <Input
              value={form.platform}
              placeholder="Amazon, Blinkit, BigBasket"
              onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
            />
          </Field>
          <Field label="Buy link">
            <Input
              value={form.product_url}
              placeholder="https://..."
              onChange={(e) => setForm((f) => ({ ...f, product_url: e.target.value }))}
            />
          </Field>
          <Field label="Product image URL">
            <Input
              value={form.image_url}
              placeholder="https://..."
              onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
            />
          </Field>
          <Field label="Nutrition tags">
            <Input
              value={form.nutrition_tags}
              placeholder="Iron, Protein, Calcium"
              onChange={(e) => setForm((f) => ({ ...f, nutrition_tags: e.target.value }))}
            />
          </Field>
          <Field label="Related topics">
            <Input
              value={form.related_topics}
              placeholder="Iron, Women, Balanced Diet"
              onChange={(e) => setForm((f) => ({ ...f, related_topics: e.target.value }))}
            />
          </Field>
          <Field label="Stock status">
            <Input
              value={form.stock_status}
              onChange={(e) => setForm((f) => ({ ...f, stock_status: e.target.value }))}
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </Field>
          <div className="lg:col-span-2">
            <Field label="Health benefit">
              <Textarea
                value={form.health_benefit}
                onChange={(e) => setForm((f) => ({ ...f, health_benefit: e.target.value }))}
              />
            </Field>
          </div>
          <div className="flex flex-wrap gap-2 lg:col-span-2">
            <Button type="submit" variant="hero" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editingId ? "Update product" : "Add product"}
            </Button>
            {editingId ? (
              <Button type="button" variant="ghost" onClick={reset}>
                Cancel edit
              </Button>
            ) : null}
          </div>
        </form>

        <ProductList
          items={data ?? []}
          isLoading={isLoading}
          isError={isError}
          onEdit={(product) => {
            setEditingId(product.id);
            setForm({
              name: product.name,
              category: product.category,
              price: String(product.price),
              unit: product.unit,
              platform: product.platform,
              product_url: product.product_url ?? "",
              image_url: product.image_url ?? "",
              description: product.description,
              health_benefit: product.health_benefit,
              nutrition_tags: product.nutrition_tags.join(", "),
              related_topics: product.related_topics.join(", "),
              stock_status: product.stock_status,
            });
          }}
          onDelete={remove}
        />
      </CardContent>
    </Card>
  );
}

function ArticleManager() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    content: "",
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-articles"],
    queryFn: async () => {
      const { records } = await adminApi.articles();
      return records;
    },
  });

  function reset() {
    setEditingId(null);
    setForm({ title: "", category: "", description: "", content: "" });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.category.trim() || !form.content.trim()) {
      toast.error("Title, category and content are required.");
      return;
    }

    setBusy(true);
    const payload = {
      title: form.title.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      content: form.content.trim(),
    };
    try {
      if (editingId) await adminApi.updateArticle(editingId, payload);
      else await adminApi.createArticle(payload);
    } catch {
      toast.error("Could not save article. Make sure your account has admin access.");
      setBusy(false);
      return;
    }
    setBusy(false);
    reset();
    void qc.invalidateQueries({ queryKey: ["admin-articles"] });
    void qc.invalidateQueries({ queryKey: ["articles"] });
    toast.success(editingId ? "Article updated." : "Article added.");
  }

  async function remove(id: number) {
    setBusy(true);
    try {
      await adminApi.deleteArticle(id);
    } catch {
      toast.error("Could not delete article.");
      setBusy(false);
      return;
    }
    setBusy(false);
    if (editingId === id) reset();
    void qc.invalidateQueries({ queryKey: ["admin-articles"] });
    void qc.invalidateQueries({ queryKey: ["articles"] });
    toast.success("Article deleted.");
  }

  return (
    <Card className="rounded-3xl border-border shadow-soft">
      <CardContent className="p-7">
        <h2 className="text-base font-semibold">Nutrition articles</h2>
        <form className="mt-5 space-y-4" onSubmit={save}>
          <Field label="Title">
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </Field>
          <Field label="Category">
            <Input
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </Field>
          <Field label="Content">
            <Textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="hero" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editingId ? "Update article" : "Add article"}
            </Button>
            {editingId ? (
              <Button type="button" variant="ghost" onClick={reset}>
                Cancel edit
              </Button>
            ) : null}
          </div>
        </form>

        <ContentList
          items={data ?? []}
          isLoading={isLoading}
          isError={isError}
          emptyText="No articles yet."
          onEdit={(article) => {
            setEditingId(article.id);
            setForm({
              title: article.title,
              category: article.category,
              description: article.description,
              content: article.content,
            });
          }}
          onDelete={remove}
        />
      </CardContent>
    </Card>
  );
}

function TipManager() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ title: "", category: "General", content: "" });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-tips"],
    queryFn: async () => {
      const { records } = await adminApi.tips();
      return records;
    },
  });

  function reset() {
    setEditingId(null);
    setForm({ title: "", category: "General", content: "" });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required.");
      return;
    }

    setBusy(true);
    const payload = {
      title: form.title.trim(),
      category: form.category.trim() || "General",
      content: form.content.trim(),
    };
    try {
      if (editingId) await adminApi.updateTip(editingId, payload);
      else await adminApi.createTip(payload);
    } catch {
      toast.error("Could not save tip. Make sure your account has admin access.");
      setBusy(false);
      return;
    }
    setBusy(false);
    reset();
    void qc.invalidateQueries({ queryKey: ["admin-tips"] });
    void qc.invalidateQueries({ queryKey: ["dashboard"] });
    toast.success(editingId ? "Tip updated." : "Tip added.");
  }

  async function remove(id: number) {
    setBusy(true);
    try {
      await adminApi.deleteTip(id);
    } catch {
      toast.error("Could not delete tip.");
      setBusy(false);
      return;
    }
    setBusy(false);
    if (editingId === id) reset();
    void qc.invalidateQueries({ queryKey: ["admin-tips"] });
    void qc.invalidateQueries({ queryKey: ["dashboard"] });
    toast.success("Tip deleted.");
  }

  return (
    <Card className="rounded-3xl border-border shadow-soft">
      <CardContent className="p-7">
        <h2 className="text-base font-semibold">Nutrition tips</h2>
        <form className="mt-5 space-y-4" onSubmit={save}>
          <Field label="Title">
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </Field>
          <Field label="Category">
            <Input
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            />
          </Field>
          <Field label="Content">
            <Textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="hero" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editingId ? "Update tip" : "Add tip"}
            </Button>
            {editingId ? (
              <Button type="button" variant="ghost" onClick={reset}>
                Cancel edit
              </Button>
            ) : null}
          </div>
        </form>

        <ContentList
          items={data ?? []}
          isLoading={isLoading}
          isError={isError}
          emptyText="No tips yet."
          onEdit={(tip) => {
            setEditingId(tip.id);
            setForm({ title: tip.title, category: tip.category, content: tip.content });
          }}
          onDelete={remove}
        />
      </CardContent>
    </Card>
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

function ContentList<T extends { id: number; title: string; category: string }>({
  items,
  isLoading,
  isError,
  emptyText,
  onEdit,
  onDelete,
}: {
  items: T[];
  isLoading: boolean;
  isError: boolean;
  emptyText: string;
  onEdit: (item: T) => void;
  onDelete: (id: number) => void;
}) {
  if (isLoading) {
    return <p className="mt-6 text-sm text-muted-foreground">Loading saved content...</p>;
  }
  if (isError) {
    return (
      <p className="mt-6 rounded-2xl border border-border p-4 text-sm text-muted-foreground">
        Could not load content. Please refresh and try again.
      </p>
    );
  }
  if (items.length === 0) {
    return <p className="mt-6 text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <div className="mt-6 space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-2xl border border-border p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.category}</p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="soft" size="sm" onClick={() => onEdit(item)}>
                Edit
              </Button>
              <Button type="button" variant="outline" size="icon" onClick={() => onDelete(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductList({
  items,
  isLoading,
  isError,
  onEdit,
  onDelete,
}: {
  items: Product[];
  isLoading: boolean;
  isError: boolean;
  onEdit: (item: Product) => void;
  onDelete: (id: number) => void;
}) {
  if (isLoading) {
    return <p className="mt-6 text-sm text-muted-foreground">Loading market products...</p>;
  }
  if (isError) {
    return (
      <p className="mt-6 rounded-2xl border border-border p-4 text-sm text-muted-foreground">
        Could not load market products. Please refresh and try again.
      </p>
    );
  }
  if (items.length === 0) {
    return <p className="mt-6 text-sm text-muted-foreground">No market products yet.</p>;
  }

  return (
    <div className="mt-6 grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <div key={item.id} className="rounded-2xl border border-border p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{item.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.category} · Rs {item.price.toFixed(0)} · {item.platform} · {item.stock_status}
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="soft" size="sm" onClick={() => onEdit(item)}>
                Edit
              </Button>
              <Button type="button" variant="outline" size="icon" onClick={() => onDelete(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {item.nutrition_tags.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-full bg-secondary px-2.5 py-1 text-[11px]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card className="rounded-3xl border-border shadow-soft">
      <CardContent className="p-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <Icon className="h-5 w-5" />
        </span>
        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 font-display text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
