import { promises as fs } from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";

export async function readCsv<T extends Record<string, string>>(
  filePath: string,
): Promise<T[]> {
  const csv = await fs.readFile(filePath, "utf-8");
  const rows = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as T[];
  return rows;
}

export async function writeCsv<T extends Record<string, string>>(
  filePath: string,
  rows: T[],
  headers: string[],
): Promise<void> {
  const output = stringify(rows, {
    header: true,
    columns: headers,
  });

  const dir = path.dirname(filePath);
  const tempPath = path.join(
    dir,
    `${path.basename(filePath)}.${Date.now()}.tmp`,
  );

  await fs.writeFile(tempPath, output, "utf-8");
  await fs.rename(tempPath, filePath);
}
