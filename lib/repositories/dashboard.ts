import { getHospitalSummary } from "@/lib/repositories/hospital";
import { getMedicines } from "@/lib/repositories/medicines";

export async function getPortalBootstrapData() {
  const [hospital, medicines] = await Promise.all([
    getHospitalSummary(),
    getMedicines(),
  ]);

  return {
    hospital,
    medicines,
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
