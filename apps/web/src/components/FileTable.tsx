"use client";

import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";
import { API_URL, apiFetch } from "@/lib/api";
import { formatBytes } from "@/lib/format";
import type { StoredFile } from "@/types/api";

export function FileTable({ files, onDeleted }: { files: StoredFile[]; onDeleted: (id: number) => void }) {
  async function deleteFile(id: number) {
    await apiFetch<void>(`/api/files/${id}`, { method: "DELETE" });
    onDeleted(id);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line">
          <thead className="bg-surface">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted">File</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted">Tags</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted">Size</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted">Uploaded</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-white">
            {files.map((file) => (
              <tr key={file.id}>
                <td className="max-w-xs px-4 py-4">
                  <p className="truncate text-sm font-semibold text-ink">{file.fileName}</p>
                  <p className="truncate text-xs text-muted">{file.description || file.fileType}</p>
                </td>
                <td className="px-4 py-4">
                  <div className="flex max-w-sm flex-wrap gap-1">
                    {file.tags.length ? (
                      file.tags.map((tag) => (
                        <span key={tag} className="rounded-md bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted">None</span>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-muted">{formatBytes(file.fileSize)}</td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-muted">
                  {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(file.createdAt))}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <a
                      href={`${API_URL}/api/files/${file.id}/download`}
                      className="inline-flex min-h-10 items-center justify-center rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink transition hover:bg-surface"
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">Download {file.fileName}</span>
                    </a>
                    <Button
                      type="button"
                      variant="danger"
                      className="px-3"
                      onClick={() => void deleteFile(file.id)}
                      aria-label={`Delete ${file.fileName}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {!files.length ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted">
                  No files uploaded yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
