import { DATA_FILES } from "@/lib/csv/paths";
import { readCsv } from "@/lib/csv/file";
import type { DoctorRecord } from "@/types/portal";

type DoctorsCsvRow = {
  Username: string;
  Password: string;
  "Doctor Name": string;
  Designation: string;
  Qualifications: string;
  Specialization: string;
  "Hospital Department": string;
  "Registration Number": string;
  "Favorite Diagnoses": string;
};

function mapDoctor(row: DoctorsCsvRow): DoctorRecord {
  return {
    username: row.Username,
    password: row.Password,
    doctorName: row["Doctor Name"],
    designation: row.Designation,
    qualifications: row.Qualifications,
    specialization: row.Specialization,
    hospitalDepartment: row["Hospital Department"],
    registrationNumber: row["Registration Number"],
    favoriteDiagnoses: row["Favorite Diagnoses"]
      ? row["Favorite Diagnoses"].split("|").map((item) => item.trim())
      : [],
  };
}

export async function getDoctors(): Promise<DoctorRecord[]> {
  const rows = await readCsv<DoctorsCsvRow>(DATA_FILES.doctors);
  return rows.map(mapDoctor);
}

export async function findDoctorByCredentials(
  username: string,
  password: string,
): Promise<DoctorRecord | null> {
  const doctors = await getDoctors();
  return (
    doctors.find(
      (doctor) => doctor.username === username && doctor.password === password,
    ) ?? null
  );
}
