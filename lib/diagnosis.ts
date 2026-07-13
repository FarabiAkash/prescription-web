export type DiagnosisItem = {
  id: string;
  name: string;
  eye: string;
};

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseDiagnosisItems(raw: string): DiagnosisItem[] {
  const trimmed = raw.trim();
  if (!trimmed) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item): item is Partial<DiagnosisItem> => Boolean(item))
        .map((item, index) => ({
          id: typeof item.id === "string" ? item.id : `dx-${index}`,
          name: item.name ?? "",
          eye: item.eye ?? "",
        }));
    }
  } catch {
    // Fall through to legacy text handling below.
  }

  // Legacy format: plain text or rich-text HTML saved before the structured
  // diagnosis picker existed. Treat each line/bullet as its own entry.
  const text = stripHtml(trimmed);
  if (!text) {
    return [];
  }
  return text
    .split(/\n|;/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((name, index) => ({
      id: `dx-legacy-${index}`,
      name,
      eye: "",
    }));
}

export function stringifyDiagnosisItems(items: DiagnosisItem[]): string {
  return JSON.stringify(items);
}
