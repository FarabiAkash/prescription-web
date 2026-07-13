import { DATA_FILES } from "@/lib/csv/paths";
import { readCsv } from "@/lib/csv/file";
import type { HospitalRecord } from "@/types/portal";

type HospitalCsvRow = {
  Category: string;
  Detail: string;
  Notes: string;
};

function mapHospital(row: HospitalCsvRow): HospitalRecord {
  return {
    category: row.Category,
    detail: row.Detail,
    notes: row.Notes,
  };
}

export async function getHospitalRows(): Promise<HospitalRecord[]> {
  const rows = await readCsv<HospitalCsvRow>(DATA_FILES.hospital);
  return rows.map(mapHospital);
}

export async function getHospitalSummary(): Promise<{
  hospitalName: string;
  address: string;
  contact: string;
  website: string;
}> {
  const rows = await getHospitalRows();
  const pick = (category: string) =>
    rows.find((row) => row.category === category)?.detail ?? "";

  return {
    hospitalName: pick("Hospital Name"),
    address: pick("Main Address"),
    contact: pick("Contact Number"),
    website: pick("Official Website"),
  };
}
