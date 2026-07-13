import { DATA_FILES } from "@/lib/csv/paths";
import { readCsv } from "@/lib/csv/file";
import type { MedicineSetRecord } from "@/types/portal";

type SetsCsvRow = {
  "Set Name": string;
  Category: string;
  Medicines: string;
};

function mapSet(row: SetsCsvRow): MedicineSetRecord {
  let items: MedicineSetRecord["items"] = [];

  try {
    const parsed = JSON.parse(row.Medicines);
    if (Array.isArray(parsed)) {
      items = parsed
        .filter((item): item is Record<string, unknown> => Boolean(item))
        .map((item) => ({
          medicine: typeof item.medicine === "string" ? item.medicine : "",
          dosage: typeof item.dosage === "string" ? item.dosage : "",
          eye: typeof item.eye === "string" ? item.eye : "",
          frequency: typeof item.frequency === "string" ? item.frequency : "",
          duration: typeof item.duration === "string" ? item.duration : "",
        }));
    }
  } catch {
    items = [];
  }

  return {
    name: row["Set Name"],
    category: row.Category,
    items,
  };
}

export async function getMedicineSets(): Promise<MedicineSetRecord[]> {
  const rows = await readCsv<SetsCsvRow>(DATA_FILES.sets);
  return rows.map(mapSet);
}
