import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { formatBytes } from "../utils/format.js";
import { formatFile } from "./files.js";

const router = Router();

async function getTagStats(userId: number) {
  const fileTags = await prisma.fileTag.findMany({
    where: { file: { userId } },
    include: { tag: true }
  });

  const counts = new Map<string, number>();
  for (const item of fileTags) {
    counts.set(item.tag.name, (counts.get(item.tag.name) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

async function getRecentUploads(userId: number, take = 5) {
  const recent = await prisma.storedFile.findMany({
    where: { userId },
    take,
    orderBy: { createdAt: "desc" },
    include: { tags: { include: { tag: true } } }
  });

  return recent.map(formatFile);
}

router.get(
  "/stats",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const [totalFiles, storage, fileTypes, tagStats, recentUploads] = await Promise.all([
      prisma.storedFile.count({ where: { userId } }),
      prisma.storedFile.aggregate({
        where: { userId },
        _sum: { fileSize: true }
      }),
      prisma.storedFile.groupBy({
        by: ["fileType"],
        where: { userId },
        _count: { _all: true },
        orderBy: { _count: { fileType: "desc" } }
      }),
      getTagStats(userId),
      getRecentUploads(userId)
    ]);

    const totalStorageBytes = Number(storage._sum.fileSize ?? 0n);

    res.json({
      totalFiles,
      totalStorageBytes,
      totalStorageFormatted: formatBytes(totalStorageBytes),
      mostUsedTags: tagStats.slice(0, 8),
      fileTypes: fileTypes.map((type) => ({
        name: type.fileType || "unknown",
        count: type._count._all
      })),
      recentUploads
    });
  })
);

router.get(
  "/tags",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ tags: await getTagStats(req.user!.id) });
  })
);

router.get(
  "/recent",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ recentUploads: await getRecentUploads(req.user!.id, 10) });
  })
);

export { router as dashboardRouter };
