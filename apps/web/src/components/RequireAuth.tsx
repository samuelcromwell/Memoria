"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

type RequireAuthProps = {
  children: React.ReactNode;
  allowWithoutPassword?: boolean;
};

export function RequireAuth({ children, allowWithoutPassword = false }: RequireAuthProps) {
  const router = useRouter();
  const { user, initialized, fetchMe } = useAuthStore();

  useEffect(() => {
    if (!initialized) {
      void fetchMe();
    }
  }, [fetchMe, initialized]);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (!user) {
      router.replace("/");
      return;
    }

    if (!allowWithoutPassword && !user.hasPassword) {
      router.replace("/setup-password");
    }
  }, [allowWithoutPassword, initialized, router, user]);

  if (!initialized || !user || (!allowWithoutPassword && !user.hasPassword)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-6 text-sm text-muted">
        Loading account...
      </div>
    );
  }

  return children;
}
