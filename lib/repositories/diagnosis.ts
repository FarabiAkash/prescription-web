import { DATA_FILES } from "@/lib/csv/paths";
import { readCsv } from "@/lib/csv/file";
import type { DiagnosisRecord } from "@/types/portal";

type DiagnosisCsvRow = {
  "Diagnosis Name": string;
  Category: string;
};

function mapDiagnosis(row: DiagnosisCsvRow): DiagnosisRecord {
  return {
    name: row["Diagnosis Name"],
    category: row.Category,
  };
}

export async function getDiagnoses(): Promise<DiagnosisRecord[]> {
  const rows = await readCsv<DiagnosisCsvRow>(DATA_FILES.diagnosis);
  return rows.map(mapDiagnosis);
}
