export type GlassRow = {
  sph: string;
  cyl: string;
  axis: string;
  va: string;
};

export type GlassPrediction = {
  dist: { right: GlassRow; left: GlassRow };
  notes: string;
};

function emptyRow(): GlassRow {
  return { sph: "", cyl: "", axis: "", va: "" };
}

export function emptyGlassPrediction(): GlassPrediction {
  return {
    dist: { right: emptyRow(), left: emptyRow() },
    notes: "",
  };
}

function toRow(value: unknown): GlassRow {
  const base = emptyRow();
  if (!value || typeof value !== "object") {
    return base;
  }
  const row = value as Partial<GlassRow>;
  return {
    sph: typeof row.sph === "string" ? row.sph : "",
    cyl: typeof row.cyl === "string" ? row.cyl : "",
    axis: typeof row.axis === "string" ? row.axis : "",
    va: typeof row.va === "string" ? row.va : "",
  };
}

export function parseGlassPrediction(raw: string): GlassPrediction {
  const trimmed = raw.trim();
  if (!trimmed) {
    return emptyGlassPrediction();
  }

  try {
    const parsed = JSON.parse(trimmed) as {
      dist?: { right?: unknown; left?: unknown };
      notes?: unknown;
    };
    if (parsed && typeof parsed === "object" && "dist" in parsed) {
      return {
        dist: {
          right: toRow(parsed.dist?.right),
          left: toRow(parsed.dist?.left),
        },
        notes: typeof parsed.notes === "string" ? parsed.notes : "",
      };
    }
  } catch {
    // Fall through to legacy text handling below.
  }

  // Legacy format: free-text glass prediction saved before the structured
  // table existed. Keep it visible as a note instead of discarding it.
  return {
    ...emptyGlassPrediction(),
    notes: trimmed,
  };
}

export function stringifyGlassPrediction(data: GlassPrediction): string {
  return JSON.stringify(data);
}

function rowHasData(row: GlassRow): boolean {
  return Boolean(row.sph || row.cyl || row.axis || row.va);
}

export function hasDistData(data: GlassPrediction): boolean {
  return rowHasData(data.dist.right) || rowHasData(data.dist.left);
}

export function isGlassPredictionEmpty(data: GlassPrediction): boolean {
  return !hasDistData(data) && !data.notes.trim();
}
