"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/Button";
import { API_URL, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

type LoginValues = z.infer<typeof schema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const { user, initialized, fetchMe, login, loading } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginValues>({
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    if (!initialized) {
      void fetchMe();
    }
  }, [fetchMe, initialized]);

  useEffect(() => {
    if (initialized && user) {
      router.replace(user.hasPassword ? "/dashboard" : "/setup-password");
    }
  }, [initialized, router, user]);

  useEffect(() => {
    if (searchParams.get("auth") === "google-not-configured") {
      setError("Google OAuth is not configured on the API server.");
    }
  }, [searchParams]);

  async function onSubmit(values: LoginValues) {
    setError(null);
    try {
      await login(values.email, values.password);
      const loggedInUser = useAuthStore.getState().user;
      router.push(loggedInUser?.hasPassword ? "/dashboard" : "/setup-password");
    } catch (submissionError) {
      setError(submissionError instanceof ApiError ? submissionError.message : "Unable to sign in");
    }
  }

  function startGoogleOAuth() {
    window.location.href = `${API_URL}/api/auth/oauth/google`;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-line bg-white shadow-soft lg:grid-cols-[1fr_0.9fr]">
        <section className="bg-ink px-6 py-8 text-white md:px-10">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/12">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-8 max-w-md text-3xl font-bold md:text-4xl">Memoria secure file dashboard</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/72">
            OAuth entry, local password setup, private upload storage, metadata tagging, and per-user statistics in one workflow.
          </p>
          <div className="mt-10 grid gap-3 text-sm text-white/78 sm:grid-cols-2">
            <div className="rounded-lg border border-white/12 p-4">Session-backed authentication</div>
            <div className="rounded-lg border border-white/12 p-4">User-scoped file records</div>
            <div className="rounded-lg border border-white/12 p-4">Tag and type analytics</div>
            <div className="rounded-lg border border-white/12 p-4">Dockerized MySQL stack</div>
          </div>
        </section>

        <section className="px-6 py-8 md:px-10">
          <h2 className="text-2xl font-bold">Sign in</h2>
          <p className="mt-2 text-sm text-muted">Use Google first, then sign in with the password set on your account.</p>

          <Button type="button" variant="secondary" className="mt-6 w-full" onClick={startGoogleOAuth}>
            Continue with Google
          </Button>

          <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted">
            <span className="h-px flex-1 bg-line" />
            Local login
            <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input id="email" type="email" className="input" autoComplete="email" {...register("email")} />
              {errors.email ? <p className="mt-1 text-sm text-red-700">{errors.email.message}</p> : null}
            </div>

            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input id="password" type="password" className="input" autoComplete="current-password" {...register("password")} />
              {errors.password ? <p className="mt-1 text-sm text-red-700">{errors.password.message}</p> : null}
            </div>

            {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

            <Button type="submit" className="w-full" loading={loading} icon={<KeyRound className="h-4 w-4" aria-hidden="true" />}>
              Sign in
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-surface px-6 text-sm text-muted">
          Loading sign in...
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
