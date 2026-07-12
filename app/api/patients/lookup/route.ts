import { NextResponse } from "next/server";
import { findPatientByCode } from "@/lib/repositories/patients";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code") ?? "";

  if (!code.trim()) {
    return NextResponse.json(
      { message: "Patient code is required." },
      { status: 400 },
    );
  }

  const patient = await findPatientByCode(code);
  if (!patient) {
    return NextResponse.json(
      { message: "Patient not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ patient });
}
