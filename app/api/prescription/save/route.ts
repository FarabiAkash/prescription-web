import { NextResponse } from "next/server";
import { updatePatientRecord } from "@/lib/repositories/patients";
import { appendAuditEntry } from "@/lib/repositories/audit";
import { getSession } from "@/lib/auth/session";
import type { PatientRecord } from "@/types/portal";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { message: "Not authenticated." },
      { status: 401 },
    );
  }

  const body = (await request.json()) as {
    patientCode?: string;
    updates?: Partial<PatientRecord>;
  };

  if (!body.patientCode || !body.updates) {
    return NextResponse.json(
      { message: "patientCode and updates are required." },
      { status: 400 },
    );
  }

  const updated = await updatePatientRecord(body.patientCode, body.updates);
  if (!updated) {
    return NextResponse.json(
      { message: "Patient not found." },
      { status: 404 },
    );
  }

  await Promise.all(
    Object.entries(body.updates).map(([field, value]) =>
      appendAuditEntry({
        doctorUsername: session.username,
        patientCode: body.patientCode as string,
        field,
        valueSnippet: String(value ?? ""),
      }),
    ),
  );

  return NextResponse.json({ patient: updated });
}
