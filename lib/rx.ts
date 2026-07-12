export type RxItem = {
  id: string;
  medicine: string;
  dosage: string;
  eye: string;
  frequency: string;
  duration: string;
};

export function parseRxItems(raw: string): RxItem[] {
  const trimmed = raw.trim();
  if (!trimmed) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item): item is Partial<RxItem> => Boolean(item))
        .map((item, index) => ({
          id: typeof item.id === "string" ? item.id : `rx-${index}`,
          medicine: item.medicine ?? "",
          dosage: item.dosage ?? "",
          eye: item.eye ?? "",
          frequency: item.frequency ?? "",
          duration: item.duration ?? "",
        }));
    }
  } catch {
    // Fall through to legacy text handling below.
  }

  // Legacy format: a single free-text Rx line saved before structured items existed.
  return [
    {
      id: "rx-legacy",
      medicine: trimmed,
      dosage: "",
      eye: "",
      frequency: "",
      duration: "",
    },
  ];
}

export function stringifyRxItems(items: RxItem[]): string {
  return JSON.stringify(items);
}

export function formatRxItem(item: RxItem): string {
  const parts = [item.medicine];
  if (item.dosage) parts.push(item.dosage);
  if (item.eye) parts.push(`${item.eye} eye`);
  if (item.frequency) parts.push(item.frequency);
  if (item.duration) parts.push(item.duration);
  return parts.filter(Boolean).join("; ");
}
