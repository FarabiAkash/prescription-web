import { getHospitalSummary } from "@/lib/repositories/hospital";
import { getMedicines } from "@/lib/repositories/medicines";
import { getMedicineSets } from "@/lib/repositories/sets";

export async function getPortalBootstrapData() {
  const [hospital, medicines, sets] = await Promise.all([
    getHospitalSummary(),
    getMedicines(),
    getMedicineSets(),
  ]);

  return {
    hospital,
    medicines,
    sets,
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
