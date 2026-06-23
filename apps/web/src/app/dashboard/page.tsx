"use client";

import { FileArchive, HardDrive, Tags, UploadCloud } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { DashboardCharts } from "@/components/DashboardCharts";
import { RequireAuth } from "@/components/RequireAuth";
import { UploadForm } from "@/components/UploadForm";
import { apiFetch } from "@/lib/api";
import { formatBytes } from "@/lib/format";
import type { DashboardStats } from "@/types/api";

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof FileArchive }) {
  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-muted">{label}</p>
        <Icon className="h-5 w-5 text-brand-600" aria-hidden="true" />
      </div>
      <p className="mt-4 text-3xl font-bold">{value}</p>
    </section>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const response = await apiFetch<DashboardStats>("/api/dashboard/stats");
      setStats(response);
      setError(null);
    } catch {
      setError("Unable to load dashboard statistics.");
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  function handleUploaded() {
    void loadStats();
  }

  return (
    <RequireAuth>
      <AppShell>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">Dashboard</h1>
              <p className="mt-1 text-sm text-muted">Per-user upload activity and storage metrics.</p>
            </div>
          </div>

          {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Total files" value={String(stats?.totalFiles ?? 0)} icon={FileArchive} />
            <StatCard label="Storage used" value={stats?.totalStorageFormatted ?? formatBytes(0)} icon={HardDrive} />
            <StatCard label="Top tags" value={String(stats?.mostUsedTags.length ?? 0)} icon={Tags} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
            <UploadForm onUploaded={handleUploaded} />

            <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-bold">Recent uploads</h2>
                <UploadCloud className="h-5 w-5 text-brand-600" aria-hidden="true" />
              </div>
              <div className="mt-4 divide-y divide-line">
                {stats?.recentUploads.length ? (
                  stats.recentUploads.map((file) => (
                    <div key={file.id} className="flex items-center justify-between gap-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{file.fileName}</p>
                        <p className="text-xs text-muted">{file.fileType}</p>
                      </div>
                      <span className="whitespace-nowrap text-sm text-muted">{formatBytes(file.fileSize)}</span>
                    </div>
                  ))
                ) : (
                  <p className="py-10 text-center text-sm text-muted">No recent uploads.</p>
                )}
              </div>
            </section>
          </div>

          {stats ? <DashboardCharts stats={stats} /> : null}
        </div>
      </AppShell>
    </RequireAuth>
  );
}
