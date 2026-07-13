"use client";

import { useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PropsWithChildren } from "react";
import type { SessionUser, SidebarModule } from "@/types/portal";

const SIDEBAR_WIDTH = 250;

const MODULES: Array<{ label: SidebarModule; path: string }> = [
  { label: "Patients", path: "/portal/patients" },
  { label: "Prescription", path: "/portal/prescription" },
  { label: "Complaints", path: "/portal/prescription?tab=complaints" },
  { label: "Vision", path: "/portal/prescription?tab=vision" },
  { label: "Refraction", path: "/portal/prescription?tab=refraction" },
  { label: "History", path: "/portal/prescription?tab=history" },
  { label: "Diagnosis", path: "/portal/prescription?tab=diagnosis" },
  { label: "Advice", path: "/portal/prescription?tab=advice" },
];

export default function PortalShell({
  children,
  session,
}: PropsWithChildren<{ session: SessionUser }>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [busy, setBusy] = useState(false);

  const active = useMemo(() => {
    return MODULES.find((item) => pathname.startsWith(item.path.split("?")[0]))
      ?.label;
  }, [pathname]);

  function handleNavigate(path: string) {
    const [base, query] = path.split("?");
    if (base === "/portal/prescription") {
      const params = new URLSearchParams(query ?? "");
      const code = searchParams.get("code");
      if (code && !params.has("code")) {
        params.set("code", code);
      }
      const qs = params.toString();
      router.push(qs ? `${base}?${qs}` : base);
      return;
    }
    router.push(path);
  }

  async function handleLogout() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh" }}>
      <AppBar
        position="fixed"
        color="inherit"
        sx={{
          width: { sm: `calc(100% - ${SIDEBAR_WIDTH}px)` },
          ml: { sm: `${SIDEBAR_WIDTH}px` },
          borderBottom: "1px solid #d8e2eb",
          backgroundColor: "#ffffff",
        }}
      >
        <Toolbar>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography variant="h6">Eye Hospital Doctors Portal</Typography>
              <Typography variant="caption" color="text.secondary">
                Signed in as {session.doctorName}
              </Typography>
            </Box>
            <Button onClick={handleLogout} disabled={busy} variant="outlined">
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: SIDEBAR_WIDTH,
            boxSizing: "border-box",
            borderRight: "1px solid #d8e2eb",
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6">Modules</Typography>
        </Toolbar>
        <List sx={{ px: 1 }}>
          {MODULES.map((item) => (
            <ListItemButton
              key={item.label}
              selected={active === item.label}
              onClick={() => handleNavigate(item.path)}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemText
                primary={
                  <Typography
                    sx={{ fontWeight: active === item.label ? 700 : 500 }}
                  >
                    {item.label}
                  </Typography>
                }
              />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: 8,
          p: { xs: 2, sm: 3 },
          minWidth: 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
