export type SidebarModule =
  | "Patients"
  | "Prescription"
  | "Complaints"
  | "Vision"
  | "Refraction"
  | "History"
  | "Diagnosis"
  | "Advice";

export type DoctorRecord = {
  username: string;
  password: string;
  doctorName: string;
  designation: string;
  qualifications: string;
  specialization: string;
  hospitalDepartment: string;
  registrationNumber: string;
};

export type PatientRecord = {
  patientCode: string;
  patientName: string;
  sex: string;
  age: string;
  complaintsSummary: string;
  complaintsDetail: string;
  visionSummary: string;
  visionDetail: string;
  refractionSummary: string;
  refractionDetail: string;
  historySummary: string;
  historyDetail: string;
  diagnosis: string;
  investigation: string;
  plan: string;
  rx: string;
  glassPrediction: string;
  advice: string;
  followUp: string;
};

export type HospitalRecord = {
  category: string;
  detail: string;
  notes: string;
};

export type MedicineRecord = {
  medicineName: string;
  genericName: string;
  dosageForm: string;
  category: string;
};

export type SessionUser = {
  username: string;
  doctorName: string;
  designation: string;
  specialization: string;
  registrationNumber: string;
};
