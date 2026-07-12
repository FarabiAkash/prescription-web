import { Suspense } from "react";
import { getSession } from "@/lib/auth/session";
import { getPortalBootstrapData } from "@/lib/repositories/dashboard";
import PrescriptionWorkspace from "@/components/prescription/prescription-workspace";

export default async function PrescriptionPage() {
  const [session, bootstrap] = await Promise.all([
    getSession(),
    getPortalBootstrapData(),
  ]);

  if (!session) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <PrescriptionWorkspace
        session={session}
        medicines={bootstrap.medicines}
        hospital={bootstrap.hospital}
        today={bootstrap.today}
        now={bootstrap.now}
      />
    </Suspense>
  );
}
