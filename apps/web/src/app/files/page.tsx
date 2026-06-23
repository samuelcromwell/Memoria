"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { FileTable } from "@/components/FileTable";
import { RequireAuth } from "@/components/RequireAuth";
import { apiFetch } from "@/lib/api";
import type { StoredFile } from "@/types/api";

export default function FilesPage() {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = useCallback(async () => {
    try {
      const response = await apiFetch<{ files: StoredFile[] }>("/api/files");
      setFiles(response.files);
      setError(null);
    } catch {
      setError("Unable to load files.");
    }
  }, []);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  return (
    <RequireAuth>
      <AppShell>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Files</h1>
            <p className="mt-1 text-sm text-muted">Review, download, and delete your uploaded files.</p>
          </div>

          {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <FileTable files={files} onDeleted={(id) => setFiles((current) => current.filter((file) => file.id !== id))} />
        </div>
      </AppShell>
    </RequireAuth>
  );
}
