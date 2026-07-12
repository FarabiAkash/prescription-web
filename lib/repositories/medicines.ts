import { DATA_FILES } from "@/lib/csv/paths";
import { readCsv } from "@/lib/csv/file";
import type { MedicineRecord } from "@/types/portal";

type MedicineCsvRow = {
  "Medicine Name": string;
  "Generic Name": string;
  "Dosage Form": string;
  Category: string;
};

function mapMedicine(row: MedicineCsvRow): MedicineRecord {
  return {
    medicineName: row["Medicine Name"],
    genericName: row["Generic Name"],
    dosageForm: row["Dosage Form"],
    category: row.Category,
  };
}

export async function getMedicines(): Promise<MedicineRecord[]> {
  const rows = await readCsv<MedicineCsvRow>(DATA_FILES.medicine);
  return rows.map(mapMedicine);
}
