import { getHospitalSummary } from "@/lib/repositories/hospital";
import { getMedicines } from "@/lib/repositories/medicines";
import { getMedicineSets } from "@/lib/repositories/sets";
import { getDiagnoses } from "@/lib/repositories/diagnosis";

export async function getPortalBootstrapData() {
  const [hospital, medicines, sets, diagnoses] = await Promise.all([
    getHospitalSummary(),
    getMedicines(),
    getMedicineSets(),
    getDiagnoses(),
  ]);

  return {
    hospital,
    medicines,
    sets,
    diagnoses,
    today: new Date().toLocaleDateString("en-BD", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    }),
    now: new Date().toLocaleTimeString("en-BD", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}
