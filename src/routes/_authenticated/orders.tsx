import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Package, ReceiptText, ShoppingBasket } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { marketApi } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({
    meta: [
      { title: "Saved Shopping Lists — NourishCare" },
      {
        name: "description",
        content: "View saved Nourish Market healthy shopping lists.",
      },
      { property: "og:title", content: "Saved Shopping Lists — NourishCare" },
      { property: "og:description", content: "Your saved Nourish Market shopping lists." },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const { user } = useAuth();

  const {
    data: orders = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["market-orders", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { records } = await marketApi.lists();
      return records;
    },
  });

  return (
    <AppShell
      title="Saved shopping lists"
      description="Healthy product lists saved from Nourish Market. Purchases happen on partner platforms."
    >
      {isLoading ? (
        <Card className="rounded-3xl border-border shadow-soft">
          <CardContent className="p-7 text-sm text-muted-foreground">Loading orders...</CardContent>
        </Card>
      ) : isError ? (
        <Card className="rounded-3xl border-border shadow-soft">
          <CardContent className="p-7 text-sm text-muted-foreground">
            Could not load your order history.
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card className="rounded-3xl border-border shadow-soft">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <ShoppingBasket className="h-9 w-9 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">No shopping lists yet</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Add nutrient foods to your list and save it to see it here.
            </p>
            <Button asChild variant="hero" className="mt-6">
              <Link to="/market">Open Nourish Market</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5">
          {orders.map((order) => (
            <Card key={order.id} className="rounded-3xl border-border shadow-soft">
              <CardContent className="p-7">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                      <ReceiptText className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="font-semibold">{order.customer_name}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleString()} · {order.status}
                      </p>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="font-display text-2xl font-semibold">
                      Rs {order.total_amount.toFixed(0)}
                    </p>
                    <p className="text-xs text-muted-foreground">estimated total</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-2xl border border-border p-4"
                    >
                      <Package className="h-5 w-5 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} x Rs {item.unit_price.toFixed(0)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">Rs {item.line_total.toFixed(0)}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">How to buy</p>
                  <p className="mt-1">
                    Open Nourish Market and use each product's partner-platform button to complete
                    the purchase on Amazon, Blinkit, BigBasket or JioMart.
                  </p>
                  <Button asChild variant="soft" size="sm" className="mt-4">
                    <Link to="/market">
                      Open Market
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
