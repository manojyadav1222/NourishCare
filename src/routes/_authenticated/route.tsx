import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authApi, clearToken, getToken } from "@/lib/api";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (!getToken()) throw redirect({ to: "/auth", search: { mode: "login" } });
    try {
      const { user } = await authApi.me();
      return { user };
    } catch {
      clearToken();
      throw redirect({ to: "/auth", search: { mode: "login" } });
    }
  },
  component: () => <Outlet />,
});
