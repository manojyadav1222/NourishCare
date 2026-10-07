import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Search, ShoppingBasket } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

const PLATFORM_META: Record<
  string,
  { delivery: string; trust: string; accent: string; initials: string }
> = {
  Amazon: {
    delivery: "2-4 day delivery",
    trust: "Amazon partner link",
    accent: "bg-[#ffedcc] text-[#7a4a00]",
    initials: "A",
  },
  Blinkit: {
    delivery: "10-20 min delivery",
    trust: "Blinkit quick commerce",
    accent: "bg-[#fff4b8] text-[#5f4b00]",
    initials: "B",
  },
  BigBasket: {
    delivery: "Same/next day slots",
    trust: "BigBasket grocery",
    accent: "bg-[#e8f6df] text-[#315d19]",
    initials: "BB",
  },
  JioMart: {
    delivery: "Store delivery slots",
    trust: "JioMart grocery",
    accent: "bg-[#e7f0ff] text-[#1d4f91]",
    initials: "J",
  },
};

function getPlatformMeta(platform: string) {
  return (
    PLATFORM_META[platform] ?? {
      delivery: "Partner delivery",
      trust: `${platform} partner link`,
      accent: "bg-secondary text-secondary-foreground",
      initials: platform.slice(0, 2).toUpperCase(),
    }
  );
}

function productRating(product: MarketProduct) {
  const seed = [...product.name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (4.2 + (seed % 7) / 10).toFixed(1);
}

function MarketPage() {
  const navigate = useNavigate();
  const marketSearch = Route.useSearch();
  const [category, setCategory] = useState(marketSearch.category || "All");
  const [search, setSearch] = useState(marketSearch.q || marketSearch.topic || "");

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
              </div>
            </div>
            <Card className="rounded-3xl border-border shadow-lift">
              <CardContent className="p-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <ShoppingBasket className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="font-semibold">Partner marketplace</p>
                    <p className="text-sm text-muted-foreground">
                      Amazon · Blinkit · BigBasket · JioMart
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
          className="mx-auto max-w-6xl px-4 py-14"
        >
          <div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Nutrient food catalog</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Browse foods by nutrition benefit and continue to the matching partner platform.
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
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function ProductCard({ product }: { product: MarketProduct }) {
  const available = product.stock_status.toLowerCase() === "in stock";
  const platform = getPlatformMeta(product.platform);
  const rating = productRating(product);

  return (
    <Card className="overflow-hidden rounded-3xl border-border shadow-soft transition-shadow hover:shadow-lift">
      <CardContent className="flex h-full flex-col p-0">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary">
          <ProductImage product={product} />
          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-soft ${platform.accent}`}
          >
            {product.platform}
          </span>
          <span className="absolute right-3 top-3 rounded-full bg-background/95 px-3 py-1 text-[11px] font-semibold text-foreground shadow-soft">
            ★ {rating}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {product.category}
              </p>
              <h3 className="mt-2 text-lg font-semibold">{product.name}</h3>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold">
              {platform.initials}
            </span>
          </div>

          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-4 grid gap-2 rounded-2xl bg-secondary/60 p-3 text-xs">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Delivery</span>
              <span className="font-medium text-foreground">{platform.delivery}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Status</span>
              <span
                className={available ? "font-medium text-primary" : "font-medium text-destructive"}
              >
                {product.stock_status}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Checkout</span>
              <span className="font-medium text-foreground">{platform.trust}</span>
            </div>
          </div>

          <p className="mt-4 rounded-2xl border border-border p-3 text-xs leading-relaxed text-muted-foreground">
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
          </div>
          <Button asChild variant="hero" className="mt-3 w-full" disabled={!product.product_url}>
            <a href={product.product_url ?? "#"} target="_blank" rel="noreferrer">
              Continue to {product.platform}
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
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
