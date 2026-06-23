"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UploadCloud } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/Button";
import { apiFetch } from "@/lib/api";
import type { StoredFile } from "@/types/api";

const schema = z.object({
  description: z.string().max(4000).optional(),
  tags: z.string().optional(),
  file: z
    .custom<FileList>()
    .refine((files) => files instanceof FileList && files.length === 1, "Choose one file to upload")
});

type UploadValues = z.infer<typeof schema>;

export function UploadForm({ onUploaded }: { onUploaded: (file: StoredFile) => void }) {
  const [message, setMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<UploadValues>({
    resolver: zodResolver(schema)
  });

  async function onSubmit(values: UploadValues) {
    setMessage(null);
    const formData = new FormData();
    formData.append("file", values.file[0]);
    formData.append("description", values.description ?? "");
    formData.append("tags", values.tags ?? "");

    const response = await apiFetch<{ file: StoredFile }>("/api/files/upload", {
      method: "POST",
      body: formData
    });

    reset();
    setMessage("File uploaded");
    onUploaded(response.file);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold">Upload file</h2>
          <p className="text-sm text-muted">Add a description and comma-separated tags.</p>
        </div>
        <UploadCloud className="h-5 w-5 text-brand-600" aria-hidden="true" />
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label className="label" htmlFor="file">
            File
          </label>
          <input id="file" type="file" className="input" {...register("file")} />
          {errors.file ? <p className="mt-1 text-sm text-red-700">{errors.file.message}</p> : null}
        </div>

        <div>
          <label className="label" htmlFor="description">
            Description
          </label>
          <textarea id="description" rows={3} className="input resize-none" {...register("description")} />
        </div>

        <div>
          <label className="label" htmlFor="tags">
            Tags
          </label>
          <input id="tags" className="input" placeholder="contracts, finance, invoices" {...register("tags")} />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          {message}
        </p>
        <Button type="submit" loading={isSubmitting}>
          Upload
        </Button>
      </div>
    </form>
  );
}
