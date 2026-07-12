import { cookies } from "next/headers";
import type { SessionUser } from "@/types/portal";

const COOKIE_NAME = "portal_session";

export async function createSession(user: SessionUser): Promise<void> {
  const payload = Buffer.from(JSON.stringify(user), "utf8").toString("base64");
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, payload, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (!value) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64").toString("utf8"));
    if (!parsed.username || !parsed.doctorName) {
      return null;
    }
    return parsed as SessionUser;
  } catch {
    return null;
  }
}
