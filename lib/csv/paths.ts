import path from "node:path";

export const DATA_DIR = path.join(process.cwd(), "data");

export const DATA_FILES = {
  doctors: path.join(DATA_DIR, "doctors.csv"),
  hospital: path.join(DATA_DIR, "hospital.csv"),
  medicine: path.join(DATA_DIR, "medicine.csv"),
  patients: path.join(DATA_DIR, "patients.csv"),
} as const;
