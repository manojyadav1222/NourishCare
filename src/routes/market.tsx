import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Loader2, Minus, Plus, Search, ShoppingBasket, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { marketApi, type MarketProduct } from "@/lib/api";

const searchSchema = z.object({
  topic: z.string().catch(""),
  q: z.string().catch(""),
  category: z.string().catch("All"),
});

export const Route = createFileRoute("/market")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Nourish Market — Nutrient Food Store | NourishCare" },
      {
        name: "description",
        content:
          "Discover nutrient-rich foods and buy them from partner platforms like Amazon, Blinkit, BigBasket and JioMart.",
      },
      { property: "og:title", content: "Nourish Market — NourishCare" },
      {
        property: "og:description",
        content: "A nutrition-based product finder for healthy Indian food items.",
      },
    ],
  }),
  component: MarketPage,
});

type CartItem = {
  product: MarketProduct;
  quantity: number;
};

const CART_KEY = "nourishcare_market_cart";

function readCart(products: MarketProduct[]): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(window.localStorage.getItem(CART_KEY) || "[]") as {
      product_id: number;
      quantity: number;
    }[];
    return raw
      .map((item) => {
        const product = products.find((p) => p.id === item.product_id);
        return product ? { product, quantity: Math.max(1, item.quantity) } : null;
      })
      .filter(Boolean) as CartItem[];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  window.localStorage.setItem(
    CART_KEY,
    JSON.stringify(items.map((item) => ({ product_id: item.product.id, quantity: item.quantity }))),
  );
}

function MarketPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const marketSearch = Route.useSearch();
  const qc = useQueryClient();
  const [category, setCategory] = useState(marketSearch.category || "All");
  const [search, setSearch] = useState(marketSearch.q || marketSearch.topic || "");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [saveOpen, setSaveOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["market-products", marketSearch.topic],
    queryFn: async () => {
      const { records } = await marketApi.products(
        marketSearch.topic ? { topic: marketSearch.topic } : undefined,
      );
      return records;
    },
  });

  useEffect(() => {
    setCategory(marketSearch.category || "All");
    setSearch(marketSearch.q || marketSearch.topic || "");
  }, [marketSearch.category, marketSearch.q, marketSearch.topic]);

  useEffect(() => {
    if (products.length) setCart(readCart(products));
  }, [products]);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((product) => product.category)))],
    [products],
  );

  const filtered = products.filter((product) => {
    const matchesCategory = category === "All" || product.category === category;
    const needle = search.trim().toLowerCase();
    const matchesSearch =
      !needle ||
      product.name.toLowerCase().includes(needle) ||
      product.category.toLowerCase().includes(needle) ||
      product.nutrition_tags.some((tag) => tag.toLowerCase().includes(needle));
    return matchesCategory && matchesSearch;
  });

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  function addToCart(product: MarketProduct) {
    setCart((items) => {
      const existing = items.find((item) => item.product.id === product.id);
      if (existing) {
        return items.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...items, { product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart.`);
  }

  function setQuantity(productId: number, quantity: number) {
    setCart((items) =>
      items
        .map((item) =>
          item.product.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function removeFromCart(productId: number) {
    setCart((items) => items.filter((item) => item.product.id !== productId));
  }

  async function handleCheckout(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to save your shopping list.");
      void navigate({ to: "/auth", search: { mode: "login" } });
      return;
    }
    if (!cart.length) return;
    const form = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await marketApi.saveList({
        customer_name: String(form.get("customer_name") ?? "").trim(),
        items: cart.map((item) => ({ product_id: item.product.id, quantity: item.quantity })),
      });
      setSaveOpen(false);
      void qc.invalidateQueries({ queryKey: ["market-orders", user.id] });
      toast.success("Shopping list saved.");
      void navigate({ to: "/orders" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the shopping list.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main>
        <section className="bg-hero-gradient">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-[1.4fr_0.8fr] lg:items-center">
            <div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
                Nourish Market
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
                NourishCare acts as a mediator: learn about nutrition, discover relevant products,
                then buy directly from partner platforms like Amazon, Blinkit, BigBasket and
                JioMart.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild variant="hero">
                  <a href="#products">Shop nutrient foods</a>
                </Button>
                {user ? (
                  <Button asChild variant="soft">
                    <Link to="/orders">Saved lists</Link>
                  </Button>
                ) : (
                  <Button asChild variant="soft">
                    <Link to="/auth" search={{ mode: "login" }}>
                      Login to save lists
                    </Link>
                  </Button>
                )}
              </div>
            </div>
            <Card className="rounded-3xl border-border shadow-lift">
              <CardContent className="p-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <ShoppingBasket className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="font-semibold">Shopping list preview</p>
                    <p className="text-sm text-muted-foreground">
                      {totalItems} items · Rs {subtotal.toFixed(0)}
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                  NourishCare does not handle payment or delivery. Buy buttons open the partner
                  platform.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section
          id="products"
          className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-[1fr_340px]"
        >
          <div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Nutrient food catalog</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Browse foods by nutrition benefit, compare partner links and build a healthy
                  shopping list.
                </p>
              </div>
              <div className="relative md:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search iron, protein..."
                  className="pl-9"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              {categories.map((item) => (
                <Button
                  key={item}
                  variant={category === item ? "hero" : "soft"}
                  size="sm"
                  onClick={() => {
                    setCategory(item);
                    void navigate({
                      to: "/market",
                      search: {
                        topic: marketSearch.topic,
                        q: search,
                        category: item,
                      },
                    });
                  }}
                  className="shrink-0"
                >
                  {item}
                </Button>
              ))}
            </div>

            {isLoading ? (
              <p className="mt-8 text-sm text-muted-foreground">Loading market products...</p>
            ) : isError ? (
              <p className="mt-8 rounded-2xl border border-border bg-secondary/50 p-6 text-sm text-muted-foreground">
                Could not load products. Make sure the Flask backend is running.
              </p>
            ) : filtered.length === 0 ? (
              <p className="mt-8 rounded-2xl border border-border bg-secondary/50 p-6 text-sm text-muted-foreground">
                No products match that search.
              </p>
            ) : (
              <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} onAdd={addToCart} />
                ))}
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Card className="rounded-3xl border-border shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Shopping list</h2>
                  <span className="text-sm text-muted-foreground">{totalItems} items</span>
                </div>
                {cart.length === 0 ? (
                  <div className="py-12 text-center">
                    <ShoppingBasket className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      Add nutrient foods to build a healthy shopping list.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 space-y-4">
                    {cart.map((item) => (
                      <div key={item.product.id} className="rounded-2xl border border-border p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">{item.product.name}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Rs {item.product.price.toFixed(0)} · {item.product.platform}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.product.id)}
                            aria-label={`Remove ${item.product.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setQuantity(item.product.id, item.quantity - 1)}
                              disabled={item.quantity === 1}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <span className="w-7 text-center text-sm font-semibold">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setQuantity(item.product.id, item.quantity + 1)}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <p className="text-sm font-semibold">
                            Rs {(item.product.price * item.quantity).toFixed(0)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between border-t border-border pt-4">
                      <span className="text-sm font-medium">Subtotal</span>
                      <span className="font-display text-2xl font-semibold">
                        Rs {subtotal.toFixed(0)}
                      </span>
                    </div>
                    <Button
                      variant="hero"
                      className="w-full"
                      onClick={() => {
                        if (!user) {
                          toast.error("Login to save your shopping list.");
                          void navigate({ to: "/auth", search: { mode: "login" } });
                          return;
                        }
                        setSaveOpen(true);
                      }}
                    >
                      Save shopping list
                    </Button>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Use product buy buttons to complete purchases on partner platforms.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>
        </section>
      </main>
      <SiteFooter />

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="rounded-3xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Save shopping list</DialogTitle>
            <DialogDescription>
              Save this list to your NourishCare account. Purchases happen on partner platforms.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCheckout}>
            <div className="space-y-2">
              <Label htmlFor="customer_name">List name</Label>
              <Input
                id="customer_name"
                name="customer_name"
                defaultValue="My healthy shopping list"
                required
              />
            </div>
            <div className="rounded-2xl bg-secondary/60 p-4 text-sm">
              <div className="flex justify-between">
                <span>Estimated total</span>
                <span className="font-semibold">Rs {subtotal.toFixed(0)}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Final prices may change on Amazon, Blinkit, BigBasket or JioMart.
              </p>
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save list
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductCard({
  product,
  onAdd,
}: {
  product: MarketProduct;
  onAdd: (product: MarketProduct) => void;
}) {
  const available = product.stock_status.toLowerCase() === "in stock";

  return (
    <Card className="rounded-3xl border-border shadow-soft">
      <CardContent className="flex h-full flex-col p-6">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary">
          <ProductImage product={product} />
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-soft">
            {product.platform}
          </span>
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-primary">
          {product.category}
        </p>
        <h3 className="mt-2 text-lg font-semibold">{product.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>
        <p className="mt-4 rounded-2xl bg-secondary/60 p-3 text-xs leading-relaxed text-muted-foreground">
          {product.health_benefit}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {product.nutrition_tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full border border-border px-2.5 py-1 text-[11px]">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-display text-2xl font-semibold">Rs {product.price.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">estimated · {product.unit}</p>
          </div>
          <Button variant="soft" onClick={() => onAdd(product)} disabled={!available}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
        <Button asChild variant="hero" className="mt-3 w-full" disabled={!product.product_url}>
          <a href={product.product_url ?? "#"} target="_blank" rel="noreferrer">
            Buy on {product.platform}
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

function ProductImage({ product }: { product: MarketProduct }) {
  const [failed, setFailed] = useState(false);
  const imageUrl = getUsableImageUrl(product.image_url);

  if (imageUrl && !failed) {
    return (
      <img
        src={imageUrl}
        alt={product.name}
        className="h-full w-full object-cover"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }

  const visual = getProductVisual(product);

  return (
    <div
      className="flex h-full w-full flex-col justify-between p-5 text-white"
      style={{ background: visual.background }}
      role="img"
      aria-label={`${product.name} product visual`}
    >
      <div className="flex justify-end">
        <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold backdrop-blur">
          {product.category}
        </span>
      </div>
      <div className="relative">
        <div className="absolute -right-4 -top-16 h-28 w-28 rounded-full bg-white/15" />
        <div className="absolute right-12 top-1 h-14 w-14 rounded-full bg-white/20" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white/90 text-2xl font-bold text-foreground shadow-lift">
          {visual.initials}
        </div>
      </div>
      <div>
        <p className="text-lg font-semibold leading-tight">{product.name}</p>
        <p className="mt-1 text-xs text-white/85">
          {product.nutrition_tags.slice(0, 2).join(" · ")}
        </p>
      </div>
    </div>
  );
}

function getUsableImageUrl(imageUrl: string | null) {
  if (!imageUrl) return null;
  if (imageUrl.includes("source.unsplash.com")) return null;
  return imageUrl;
}

function getProductVisual(product: MarketProduct) {
  const palettes = [
    "linear-gradient(135deg, #1f7a4d 0%, #79a65a 52%, #f2c14e 100%)",
    "linear-gradient(135deg, #8a4f2a 0%, #c87941 50%, #f0b85a 100%)",
    "linear-gradient(135deg, #215a6d 0%, #4f9a94 52%, #c6d88c 100%)",
    "linear-gradient(135deg, #6d3f1f 0%, #a45f35 54%, #e1aa62 100%)",
    "linear-gradient(135deg, #32533d 0%, #7f9f54 50%, #d5c16a 100%)",
  ];
  const seed = [...product.name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const words = product.name.split(/\s+/).filter(Boolean).slice(0, 2);
  const initials = words.map((word) => word[0]?.toUpperCase()).join("") || "NC";

  return {
    background: palettes[seed % palettes.length],
    initials,
  };
}
