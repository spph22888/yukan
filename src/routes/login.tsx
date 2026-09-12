import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { BrandMark, useGatedUser } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TRIAL_DAYS, TRIAL_RUNS } from "@/lib/membership";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useGatedUser();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isPending) {
    return (
      <div className="flex min-h-dvh flex-col bg-bg text-fg">
        <header className="flex h-14 items-center px-4 ring-1 ring-border sm:px-6">
          <BrandMark />
        </header>
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="h-72 w-full max-w-sm animate-pulse rounded-2xl bg-fg/6" />
        </main>
      </div>
    );
  }

  if (user) return <Navigate to="/app" />;

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "up") {
        const res = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: name.trim() || email.trim(),
        });
        if (res.error) {
          setError(res.error.message || "注册失败");
          return;
        }
      } else {
        const res = await authClient.signIn.email({ email: email.trim(), password });
        if (res.error) {
          setError(res.error.message || "登录失败");
          return;
        }
      }
      await authClient.getSession();
      await navigate({ to: "/app" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <header className="flex h-14 items-center px-4 ring-1 ring-border sm:px-6">
        <BrandMark />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <p className="text-[11px] tracking-[0.22em] text-muted uppercase">Yukan · Trial</p>
          <h1 className="font-display mt-2 text-3xl">邮箱注册，免费试用</h1>
          <p className="mt-2 text-sm text-muted text-pretty">
            新账户自动获得 {TRIAL_DAYS} 天试用、共 {TRIAL_RUNS} 次研判。大陆请用邮箱，不要使用 Google / X。
          </p>

          {!authEnabled ? (
            <p className="mt-6 text-sm text-muted">登录尚未开启。</p>
          ) : (
            <>
              <div className="mt-6 flex rounded-xl bg-surface p-1 ring-1 ring-border">
                <button
                  type="button"
                  className={`flex-1 rounded-lg py-2 text-sm ${mode === "in" ? "bg-fg/10 text-fg" : "text-muted"}`}
                  onClick={() => setMode("in")}
                >
                  登录
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-lg py-2 text-sm ${mode === "up" ? "bg-fg/10 text-fg" : "text-muted"}`}
                  onClick={() => setMode("up")}
                >
                  注册试用
                </button>
              </div>

              <form className="mt-4 space-y-3" onSubmit={(e) => void onEmail(e)}>
                {mode === "up" ? (
                  <Input
                    placeholder="称呼（可选）"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                ) : null}
                <Input
                  type="email"
                  required
                  placeholder="邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
                <Input
                  type="password"
                  required
                  minLength={8}
                  placeholder="密码（至少 8 位）"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "up" ? "new-password" : "current-password"}
                />
                {error ? <p className="text-sm text-risk-high">{error}</p> : null}
                <Button className="w-full" type="submit" disabled={busy}>
                  {busy ? "请稍候…" : mode === "up" ? "注册并开始试用" : "登录"}
                </Button>
              </form>

              <details className="mt-6">
                <summary className="cursor-pointer text-center text-[11px] text-faint">
                  海外账号（Google / X，国内通常不可用）
                </summary>
                <div className="mt-3 space-y-2">
                  {GROK_PROVIDERS.map((p) => (
                    <Button
                      key={p.providerId}
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => signIn(p.providerId, { callbackURL: "/app" })}
                    >
                      使用 {p.label} 继续
                    </Button>
                  ))}
                </div>
              </details>
            </>
          )}

          <p className="mt-6 text-center text-xs text-faint">
            <Link to="/" className="hover:text-muted">
              返回首页
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
