import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useGatedUser } from "@/components/site-nav";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { getMembership } from "@/lib/membership-server";

export const Route = createFileRoute("/app")({ component: AppPage });

function AppPage() {
  const { user, isPending } = useGatedUser();
  const [gate, setGate] = useState<"load" | "member" | "pay">("load");

  useEffect(() => {
    if (isPending) return;
    if (!user) {
      setGate("pay");
      return;
    }
    void getMembership()
      .then((m) => setGate(m.active ? "member" : "pay"))
      .catch(() => setGate("pay"));
  }, [isPending, user]);

  if (isPending || gate === "load") {
    return (
      <div className="flex h-dvh items-center justify-center bg-bg text-fg">
        <div className="w-48 animate-pulse">
          <div className="h-8 rounded-lg bg-fg/8" />
          <div className="mt-3 h-24 rounded-xl bg-fg/6" />
        </div>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (gate !== "member") return <Navigate to="/membership" />;
  return <AppShell />;
}
