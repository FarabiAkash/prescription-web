import { getPatients } from "@/lib/repositories/patients";
import PatientsList from "@/components/patients/patients-list";

export default async function PatientsPage() {
  const patients = await getPatients();

  return <PatientsList patients={patients} />;
}
