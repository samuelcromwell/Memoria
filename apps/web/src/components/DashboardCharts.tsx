"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashboardStats } from "@/types/api";

const colors = ["#2D7FF9", "#12805C", "#9F640A", "#7C3AED", "#DB2777", "#475467"];

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
                <Tooltip />
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
