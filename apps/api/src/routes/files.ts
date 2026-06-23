import type { Prisma, StoredFile, Tag } from "@prisma/client";
import { Router } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { upload } from "../upload.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";
import { normalizeTags } from "../utils/tags.js";

const router = Router();

const updateSchema = z.object({
  description: z.string().max(4000).optional(),
  tags: z.unknown().optional()
});

type FileWithTags = StoredFile & {
  tags: Array<{
    tag: Tag;
  }>;
};

function formatFile(file: FileWithTags) {
  return {
    id: file.id,
    fileName: file.fileName,
    fileSize: Number(file.fileSize),
    fileType: file.fileType,
    description: file.description,
    tags: file.tags.map((item) => item.tag.name),
    createdAt: file.createdAt.toISOString(),
    updatedAt: file.updatedAt.toISOString()
  };
}

async function attachTags(tx: Prisma.TransactionClient, fileId: number, tags: string[]) {
  if (tags.length === 0) {
    return;
  }

  const tagRecords = await Promise.all(
    tags.map((name) =>
      tx.tag.upsert({
        where: { name },
        create: { name },
        update: {}
      })
    )
  );

  await tx.fileTag.createMany({
    data: tagRecords.map((tag) => ({
      fileId,
      tagId: tag.id
    })),
    skipDuplicates: true
  });
}

router.post(
  "/upload",
  requireAuth,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ApiError(400, "A file field is required.");
    }

    const description = typeof req.body.description === "string" ? req.body.description.trim() : "";
    const tags = normalizeTags(req.body.tags);

    const created = await prisma.$transaction(async (tx) => {
      const file = await tx.storedFile.create({
        data: {
          userId: req.user!.id,
          fileName: req.file!.originalname,
          filePath: req.file!.path,
          fileSize: BigInt(req.file!.size),
          fileType: req.file!.mimetype || "application/octet-stream",
          description
        }
      });

      await attachTags(tx, file.id, tags);

      return tx.storedFile.findUniqueOrThrow({
        where: { id: file.id },
        include: { tags: { include: { tag: true } } }
      });
    });

    res.status(201).json({ file: formatFile(created) });
  })
);

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const files = await prisma.storedFile.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      include: { tags: { include: { tag: true } } }
    });

    res.json({ files: files.map(formatFile) });
  })
);

router.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const file = await prisma.storedFile.findFirst({
      where: { id: Number(req.params.id), userId: req.user!.id },
      include: { tags: { include: { tag: true } } }
    });

    if (!file) {
      throw new ApiError(404, "File not found");
    }

    res.json({ file: formatFile(file) });
  })
);

router.get(
  "/:id/download",
  requireAuth,
  asyncHandler(async (req, res) => {
    const file = await prisma.storedFile.findFirst({
      where: { id: Number(req.params.id), userId: req.user!.id }
    });

    if (!file) {
      throw new ApiError(404, "File not found");
    }

    res.download(path.resolve(file.filePath), file.fileName);
  })
);

router.put(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = updateSchema.parse(req.body);
    const fileId = Number(req.params.id);
    const existing = await prisma.storedFile.findFirst({
      where: { id: fileId, userId: req.user!.id }
    });

    if (!existing) {
      throw new ApiError(404, "File not found");
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (body.tags !== undefined) {
        await tx.fileTag.deleteMany({ where: { fileId } });
        await attachTags(tx, fileId, normalizeTags(body.tags));
      }

      return tx.storedFile.update({
        where: { id: fileId },
        data: {
          description: body.description?.trim()
        },
        include: { tags: { include: { tag: true } } }
      });
    });

    res.json({ file: formatFile(updated) });
  })
);

router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const fileId = Number(req.params.id);
    const file = await prisma.storedFile.findFirst({
      where: { id: fileId, userId: req.user!.id }
    });

    if (!file) {
      throw new ApiError(404, "File not found");
    }

    await prisma.storedFile.delete({ where: { id: file.id } });
    await fs.unlink(file.filePath).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") {
        throw error;
      }
    });

    res.status(204).send();
  })
);

export { formatFile, router as filesRouter };
