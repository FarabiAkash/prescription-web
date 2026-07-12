import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";
import { getSession } from "@/lib/auth/session";
import PortalShell from "@/components/portal/portal-shell";

export default async function PortalLayout({ children }: PropsWithChildren) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return <PortalShell session={session}>{children}</PortalShell>;
}
