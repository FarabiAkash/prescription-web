import { promises as fs } from "node:fs";
import { stringify } from "csv-stringify/sync";
import { parse } from "csv-parse/sync";
import { DATA_FILES } from "@/lib/csv/paths";

const AUDIT_HEADERS = [
  "Timestamp",
  "Doctor Username",
  "Patient Code",
  "Field",
  "Value Snippet",
] as const;

export type AuditEntry = {
  doctorUsername: string;
  patientCode: string;
  field: string;
  valueSnippet: string;
};

function truncate(value: string, max = 120): string {
  if (value.length <= max) {
    return value;
  }
  return `${value.slice(0, max)}...`;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function appendAuditEntry(entry: AuditEntry): Promise<void> {
  const row = {
    Timestamp: new Date().toISOString(),
    "Doctor Username": entry.doctorUsername,
    "Patient Code": entry.patientCode,
    Field: entry.field,
    "Value Snippet": truncate(entry.valueSnippet),
  };

  // Best-effort only: the audit trail is a nice-to-have, not something that
  // should ever block or fail a save. On read-only deployments (e.g. Vercel
  // serverless) writing to the CSV file will throw, so swallow errors here
  // instead of letting them bubble up and crash the save request.
  try {
    const exists = await fileExists(DATA_FILES.auditLog);

    if (!exists) {
      const output = stringify([row], {
        header: true,
        columns: AUDIT_HEADERS as unknown as string[],
      });
      await fs.writeFile(DATA_FILES.auditLog, output, "utf-8");
      return;
    }

    const output = stringify([row], {
      header: false,
      columns: AUDIT_HEADERS as unknown as string[],
    });
    await fs.appendFile(DATA_FILES.auditLog, output, "utf-8");
  } catch (error) {
    console.warn("Unable to write audit log entry; skipping.", error);
  }
}

export async function getAuditEntries(): Promise<AuditEntry[]> {
  const exists = await fileExists(DATA_FILES.auditLog);
  if (!exists) {
    return [];
  }

  const csv = await fs.readFile(DATA_FILES.auditLog, "utf-8");
  const rows = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Array<Record<string, string>>;

  return rows.map((row) => ({
    doctorUsername: row["Doctor Username"],
    patientCode: row["Patient Code"],
    field: row.Field,
    valueSnippet: row["Value Snippet"],
  }));
}
