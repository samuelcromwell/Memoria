"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/Button";
import { ApiError, apiFetch } from "@/lib/api";
import type { StoredFile } from "@/types/api";

const schema = z.object({
  description: z.string().trim().min(1, "Description is required").max(4000),
  tags: z.string().trim().min(1, "At least one tag is required"),
  file: z
    .custom<FileList>()
    .refine((files) => files instanceof FileList && files.length === 1, "Choose one file to upload")
});

type UploadValues = z.infer<typeof schema>;

function RequiredLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label className="label" htmlFor={htmlFor}>
      {children} <span className="text-red-600">*</span>
    </label>
  );
}

function UploadSuccessModal({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/18 px-4">
      <div
        className="w-full max-w-sm rounded-lg border border-line bg-white p-6 text-center shadow-soft"
        style={{ animation: "modal-pop-in 220ms ease-out" }}
        role="status"
        aria-live="polite"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint-100">
          <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
            <path
              d="M5.5 12.5 9.5 16.5 18.5 7.5"
              fill="none"
              stroke="#12805C"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="24"
              strokeDashoffset="24"
              style={{ animation: "tick-draw 320ms ease-out 80ms forwards" }}
            />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-bold text-ink">Upload complete</h3>
        <p className="mt-2 text-sm text-muted">{message}</p>
      </div>
    </div>
  );
}

export function UploadForm({ onUploaded }: { onUploaded: (file: StoredFile) => void }) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<UploadValues>({
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  async function onSubmit(values: UploadValues) {
    setSuccessMessage(null);
    setSubmitError(null);
    const formData = new FormData();
    formData.append("file", values.file[0]);
    formData.append("description", values.description);
    formData.append("tags", values.tags);

    try {
      const response = await apiFetch<{ file: StoredFile }>("/api/files/upload", {
        method: "POST",
        body: formData
      });

      reset();
      setSuccessMessage("File uploaded successfully.");
      onUploaded(response.file);
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : "Upload failed. Check the fields and try again.");
    }
  }

  return (
    <>
      {successMessage ? <UploadSuccessModal message={successMessage} /> : null}
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
            <RequiredLabel htmlFor="file">File</RequiredLabel>
            <input id="file" type="file" className="input" {...register("file")} />
            {errors.file ? <p className="mt-1 text-sm text-red-700">{errors.file.message}</p> : null}
          </div>

          <div>
            <RequiredLabel htmlFor="description">Description</RequiredLabel>
            <textarea id="description" rows={3} className="input resize-none" {...register("description")} />
            {errors.description ? <p className="mt-1 text-sm text-red-700">{errors.description.message}</p> : null}
          </div>

          <div>
            <RequiredLabel htmlFor="tags">Tags</RequiredLabel>
            <input id="tags" className="input" placeholder="contracts, finance, invoices" {...register("tags")} />
            {errors.tags ? <p className="mt-1 text-sm text-red-700">{errors.tags.message}</p> : null}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="min-h-5 text-sm" aria-live="polite">
            {submitError ? <p className="text-red-700">{submitError}</p> : null}
          </div>
          <Button type="submit" loading={isSubmitting}>
            Upload
          </Button>
        </div>
      </form>
    </>
  );
}
