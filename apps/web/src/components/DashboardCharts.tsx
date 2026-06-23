"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashboardStats } from "@/types/api";

const colors = ["#2D7FF9", "#12805C", "#9F640A", "#7C3AED", "#DB2777", "#475467"];

const fileTypeLabels: Record<string, string> = {
  "application/pdf": "pdf",
  "application/zip": "zip",
  "application/json": "json",
  "application/msword": "doc",
  "application/vnd.ms-excel": "xls",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "text/csv": "csv",
  "text/plain": "txt"
};

function formatFileTypeLabel(name: string) {
  const normalized = name.toLowerCase();
  if (fileTypeLabels[normalized]) {
    return fileTypeLabels[normalized];
  }

  if (!normalized.includes("/")) {
    return normalized;
  }

  const subtype = normalized.split("/")[1] ?? normalized;
  return subtype.split("+")[0] ?? subtype;
}

export function DashboardCharts({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <h2 className="text-base font-bold">File types</h2>
        <div className="mt-4 h-72">
          {stats.fileTypes.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.fileTypes} dataKey="count" nameKey="name" innerRadius={58} outerRadius={96} paddingAngle={3}>
                  {stats.fileTypes.map((entry, index) => (
                    <Cell key={entry.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, _name, item) => [value, formatFileTypeLabel(String(item.payload?.name ?? "unknown"))]}
                  contentStyle={{ borderRadius: 8, borderColor: "#D0D5DD" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">No file types yet</div>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <h2 className="text-base font-bold">Frequent tags</h2>
        <div className="mt-4 h-72">
          {stats.mostUsedTags.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.mostUsedTags}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2D7FF9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">No tags yet</div>
          )}
        </div>
      </section>
    </div>
  );
}
