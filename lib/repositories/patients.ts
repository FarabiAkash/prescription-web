import { DATA_FILES } from "@/lib/csv/paths";
import { readCsv, writeCsv } from "@/lib/csv/file";
import type { PatientRecord } from "@/types/portal";

type PatientsCsvRow = {
  "Patient Code": string;
  "Patient Name": string;
  Sex: string;
  Age: string;
  "Complaints Summary": string;
  "Complaints Detail": string;
  "Vision Summary": string;
  "Vision Detail": string;
  "Refraction Summary": string;
  "Refraction Detail": string;
  "History Summary": string;
  "History Detail": string;
  Diagnosis: string;
  Investigation: string;
  Plan: string;
  Rx: string;
  "Glass Prediction": string;
  Advice: string;
  "Follow Up": string;
};

const PATIENT_HEADERS: Array<keyof PatientsCsvRow> = [
  "Patient Code",
  "Patient Name",
  "Sex",
  "Age",
  "Complaints Summary",
  "Complaints Detail",
  "Vision Summary",
  "Vision Detail",
  "Refraction Summary",
  "Refraction Detail",
  "History Summary",
  "History Detail",
  "Diagnosis",
  "Investigation",
  "Plan",
  "Rx",
  "Glass Prediction",
  "Advice",
  "Follow Up",
];

function mapPatient(row: PatientsCsvRow): PatientRecord {
  return {
    patientCode: row["Patient Code"],
    patientName: row["Patient Name"],
    sex: row.Sex,
    age: row.Age,
    complaintsSummary: row["Complaints Summary"],
    complaintsDetail: row["Complaints Detail"],
    visionSummary: row["Vision Summary"],
    visionDetail: row["Vision Detail"],
    refractionSummary: row["Refraction Summary"],
    refractionDetail: row["Refraction Detail"],
    historySummary: row["History Summary"],
    historyDetail: row["History Detail"],
    diagnosis: row.Diagnosis,
    investigation: row.Investigation,
    plan: row.Plan,
    rx: row.Rx,
    glassPrediction: row["Glass Prediction"],
    advice: row.Advice,
    followUp: row["Follow Up"],
  };
}

function toCsvRow(patient: PatientRecord): PatientsCsvRow {
  return {
    "Patient Code": patient.patientCode,
    "Patient Name": patient.patientName,
    Sex: patient.sex,
    Age: patient.age,
    "Complaints Summary": patient.complaintsSummary,
    "Complaints Detail": patient.complaintsDetail,
    "Vision Summary": patient.visionSummary,
    "Vision Detail": patient.visionDetail,
    "Refraction Summary": patient.refractionSummary,
    "Refraction Detail": patient.refractionDetail,
    "History Summary": patient.historySummary,
    "History Detail": patient.historyDetail,
    Diagnosis: patient.diagnosis,
    Investigation: patient.investigation,
    Plan: patient.plan,
    Rx: patient.rx,
    "Glass Prediction": patient.glassPrediction,
    Advice: patient.advice,
    "Follow Up": patient.followUp,
  };
}

export async function getPatients(): Promise<PatientRecord[]> {
  const rows = await readCsv<PatientsCsvRow>(DATA_FILES.patients);
  return rows.map(mapPatient);
}

export async function findPatientByCode(
  patientCode: string,
): Promise<PatientRecord | null> {
  const patients = await getPatients();
  const normalized = patientCode.trim().toUpperCase();

  const exactMatch = patients.find(
    (patient) => patient.patientCode.trim().toUpperCase() === normalized,
  );
  if (exactMatch) {
    return exactMatch;
  }

  // Support entering just the last few digits of the patient code.
  const suffixMatch = patients.find((patient) =>
    patient.patientCode.trim().toUpperCase().endsWith(normalized),
  );
  if (suffixMatch) {
    return suffixMatch;
  }

  // Demo fallback: any unrecognized code loads the first demo patient.
  return (
    patients.find(
      (patient) => patient.patientCode.trim().toUpperCase() === "P-1001",
    ) ?? null
  );
}

export async function updatePatientRecord(
  patientCode: string,
  updates: Partial<PatientRecord>,
): Promise<PatientRecord | null> {
  const rows = await readCsv<PatientsCsvRow>(DATA_FILES.patients);
  const normalized = patientCode.trim().toUpperCase();
  const index = rows.findIndex(
    (row) => row["Patient Code"].trim().toUpperCase() === normalized,
  );

  if (index === -1) {
    return null;
  }

  const current = mapPatient(rows[index]);
  const merged = {
    ...current,
    ...updates,
  } satisfies PatientRecord;

  rows[index] = toCsvRow(merged);
  await writeCsv(
    DATA_FILES.patients,
    rows,
    PATIENT_HEADERS as unknown as string[],
  );

  return merged;
}
