export function normalizeTags(input: unknown): string[] {
  const values = parseTagInput(input);
  const normalized = values
    .map((tag) =>
      tag
        .trim()
        .replace(/^#/, "")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9._-]/g, "")
        .slice(0, 100)
    )
    .filter(Boolean);

  return [...new Set(normalized)];
}

function parseTagInput(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input.flatMap((value) => parseTagInput(value));
  }

  if (typeof input !== "string") {
    return [];
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      return parseTagInput(parsed);
    } catch {
      return trimmed.split(",");
    }
  }

  return trimmed.split(",");
}
