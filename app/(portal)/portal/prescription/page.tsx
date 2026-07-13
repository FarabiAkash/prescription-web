import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getPortalBootstrapData } from "@/lib/repositories/dashboard";
import { findPatientByCode } from "@/lib/repositories/patients";
import PrescriptionWorkspace from "@/components/prescription/prescription-workspace";

export default async function PrescriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const [{ code }, session, bootstrap] = await Promise.all([
    searchParams,
    getSession(),
    getPortalBootstrapData(),
  ]);

  if (!session) {
    return null;
  }

  if (!code) {
    redirect("/portal/patients");
  }

  const patient = await findPatientByCode(code);
  if (!patient) {
    redirect("/portal/patients");
  }

  return (
    <Suspense fallback={null}>
      <PrescriptionWorkspace
        session={session}
        medicines={bootstrap.medicines}
        sets={bootstrap.sets}
        diagnoses={bootstrap.diagnoses}
        hospital={bootstrap.hospital}
        today={bootstrap.today}
        now={bootstrap.now}
        initialPatient={patient}
      />
    </Suspense>
  );
}
