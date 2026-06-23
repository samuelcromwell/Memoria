"use client";

import { BarChart3, FileText, LogOut, UploadCloud } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import { Button } from "@/components/Button";
import { useAuthStore } from "@/store/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/files", label: "Files", icon: FileText }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-white px-5 py-6 lg:block">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
            <UploadCloud className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-lg font-bold">Memoria</span>
            <span className="text-xs text-muted">File operations</span>
          </span>
        </Link>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition",
                  active ? "bg-brand-50 text-brand-700" : "text-muted hover:bg-surface hover:text-ink"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-line bg-white/95 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
              <UploadCloud className="h-5 w-5 text-brand-600" aria-hidden="true" />
              <span className="font-bold">Memoria</span>
            </Link>
            <div className="hidden min-w-0 lg:block">
              <p className="truncate text-sm font-semibold text-ink">{user?.displayName ?? user?.email}</p>
              <p className="truncate text-xs text-muted">{user?.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <nav className="flex lg:hidden">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={clsx(
                        "rounded-lg p-2",
                        pathname === item.href ? "bg-brand-50 text-brand-700" : "text-muted"
                      )}
                      aria-label={item.label}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </Link>
                  );
                })}
              </nav>
              <Button variant="secondary" onClick={handleLogout} icon={<LogOut className="h-4 w-4" aria-hidden="true" />}>
                Sign out
              </Button>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
