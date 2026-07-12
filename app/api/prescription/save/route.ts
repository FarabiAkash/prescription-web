import { NextResponse } from "next/server";
import { updatePatientRecord } from "@/lib/repositories/patients";
import type { PatientRecord } from "@/types/portal";

export async function POST(request: Request) {
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

  return NextResponse.json({ patient: updated });
}
