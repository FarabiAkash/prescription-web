import { NextResponse } from "next/server";
import { findDoctorByCredentials } from "@/lib/repositories/doctors";
import { createSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    username?: string;
    password?: string;
  };

  if (!body.username || !body.password) {
    return NextResponse.json(
      { message: "Username and password are required." },
      { status: 400 },
    );
  }

  const doctor = await findDoctorByCredentials(body.username, body.password);
  if (!doctor) {
    return NextResponse.json(
      { message: "Invalid credentials." },
      { status: 401 },
    );
  }

  await createSession({
    username: doctor.username,
    doctorName: doctor.doctorName,
    designation: doctor.designation,
    specialization: doctor.specialization,
    registrationNumber: doctor.registrationNumber,
    favoriteDiagnoses: doctor.favoriteDiagnoses,
  });

  return NextResponse.json({ ok: true });
}
