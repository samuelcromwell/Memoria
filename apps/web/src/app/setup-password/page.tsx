"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/Button";
import { RequireAuth } from "@/components/RequireAuth";
import { ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

const schema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password")
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

type PasswordValues = z.infer<typeof schema>;

export default function SetupPasswordPage() {
  const router = useRouter();
  const { user, setupPassword, loading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<PasswordValues>({
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    if (user?.hasPassword) {
      router.replace("/dashboard");
    }
  }, [router, user]);

  async function onSubmit(values: PasswordValues) {
    setError(null);
    try {
      await setupPassword(values.password, values.confirmPassword);
      router.push("/dashboard");
    } catch (submissionError) {
      setError(submissionError instanceof ApiError ? submissionError.message : "Unable to save password");
    }
  }

  return (
    <RequireAuth allowWithoutPassword>
      <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-soft">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <LockKeyhole className="h-5 w-5" aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-2xl font-bold">Set your password</h1>
          <p className="mt-2 text-sm text-muted">This enables local sign-in after your Google OAuth account is created.</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input id="password" type="password" className="input" autoComplete="new-password" {...register("password")} />
              {errors.password ? <p className="mt-1 text-sm text-red-700">{errors.password.message}</p> : null}
            </div>
            <div>
              <label className="label" htmlFor="confirmPassword">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="input"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword ? <p className="mt-1 text-sm text-red-700">{errors.confirmPassword.message}</p> : null}
            </div>
          </div>

          {error ? <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <Button type="submit" className="mt-6 w-full" loading={loading}>
            Save password
          </Button>
        </form>
      </main>
    </RequireAuth>
  );
}
