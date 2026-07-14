"use client";

import { useMemo, useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PropsWithChildren } from "react";
import type { SessionUser, SidebarModule } from "@/types/portal";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import CenterFocusStrongRoundedIcon from "@mui/icons-material/CenterFocusStrongRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import MedicalServicesRoundedIcon from "@mui/icons-material/MedicalServicesRounded";
import TipsAndUpdatesRoundedIcon from "@mui/icons-material/TipsAndUpdatesRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import type { SvgIconComponent } from "@mui/icons-material";

const SIDEBAR_WIDTH = 264;

type ModuleItem = {
  label: SidebarModule;
  path: string;
  icon: SvgIconComponent;
  requiresPatient?: boolean;
};

const MODULES: ModuleItem[] = [
  { label: "Patients", path: "/portal/patients", icon: PeopleAltRoundedIcon },
  {
    label: "Complaints",
    path: "/portal/prescription?tab=complaints",
    icon: ReportProblemRoundedIcon,
    requiresPatient: true,
  },
  {
    label: "Vision",
    path: "/portal/prescription?tab=vision",
    icon: VisibilityRoundedIcon,
    requiresPatient: true,
  },
  {
    label: "Refraction",
    path: "/portal/prescription?tab=refraction",
    icon: CenterFocusStrongRoundedIcon,
    requiresPatient: true,
  },
  {
    label: "History",
    path: "/portal/prescription?tab=history",
    icon: HistoryRoundedIcon,
    requiresPatient: true,
  },
  {
    label: "Diagnosis",
    path: "/portal/prescription?tab=diagnosis",
    icon: MedicalServicesRoundedIcon,
    requiresPatient: true,
  },
  {
    label: "Advice",
    path: "/portal/prescription?tab=advice",
    icon: TipsAndUpdatesRoundedIcon,
    requiresPatient: true,
  },
];

export default function PortalShell({
  children,
  session,
}: PropsWithChildren<{ session: SessionUser }>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [busy, setBusy] = useState(false);

  const patientCode = searchParams.get("code");
  const hasPatient = Boolean(patientCode);
  const tab = searchParams.get("tab");

  const visibleModules = useMemo(
    () => MODULES.filter((item) => !item.requiresPatient || hasPatient),
    [hasPatient],
  );

  const active = useMemo(() => {
    if (!pathname.startsWith("/portal/prescription")) {
      return MODULES.find((item) => pathname.startsWith(item.path))?.label;
    }
    const match = MODULES.find((item) => {
      const [base, query] = item.path.split("?");
      if (base !== "/portal/prescription") {
        return false;
      }
      const itemTab = query ? new URLSearchParams(query).get("tab") : null;
      return itemTab === tab;
    });
    return match?.label;
  }, [pathname, tab]);

  const initials = session.doctorName
    .split(" ")
    .filter((part) => /^[A-Za-z]/.test(part))
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

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
        elevation={0}
        className="no-print"
        sx={{
          width: { sm: `calc(100% - ${SIDEBAR_WIDTH}px)` },
          ml: { sm: `${SIDEBAR_WIDTH}px` },
          borderBottom: "1px solid #e3eaf0",
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
              <Typography variant="h6">Ispahani Doctors Portal</Typography>
              <Typography variant="caption" color="text.secondary">
                Signed in as {session.doctorName}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: "primary.main",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {initials || "DR"}
              </Avatar>
              <Button
                onClick={handleLogout}
                disabled={busy}
                variant="outlined"
                startIcon={<LogoutRoundedIcon />}
              >
                Logout
              </Button>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        className="no-print"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: SIDEBAR_WIDTH,
            boxSizing: "border-box",
            borderRight: "1px solid #e3eaf0",
            backgroundColor: "#ffffff",
            color: "#1d2b36",
          },
        }}
      >
        <Toolbar sx={{ px: 3 }}>
          <Typography
            variant="h6"
            sx={{ color: "primary.main", fontWeight: 800, letterSpacing: 0.4 }}
          >
            Modules
          </Typography>
        </Toolbar>

        {hasPatient ? (
          <Box sx={{ px: 1.5, pt: 1 }}>
            <ListItemButton
              onClick={() => router.push("/portal/patients")}
              sx={{
                borderRadius: 1,
                border: "1px solid",
                borderColor: "secondary.main",
                color: "secondary.main",
                transition: "background-color 0.15s ease, color 0.15s ease",
                "&:hover": {
                  backgroundColor: "secondary.main",
                  color: "secondary.contrastText",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                <ArrowBackRoundedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                    Back to Patients
                  </Typography>
                }
              />
            </ListItemButton>
            <Divider sx={{ my: 1 }} />
          </Box>
        ) : null}

        <List sx={{ px: 1.5, py: 1 }}>
          {visibleModules.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.label;
            return (
              <ListItemButton
                key={item.label}
                selected={isActive}
                onClick={() => handleNavigate(item.path)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  pl: 1.75,
                  borderLeft: "3px solid transparent",
                  color: "text.secondary",
                  transition: "background-color 0.15s ease, color 0.15s ease",
                  "&:hover": {
                    backgroundColor: "rgba(4,102,156,0.06)",
                    color: "primary.main",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "rgba(4,102,156,0.09)",
                    borderLeft: "3px solid",
                    borderLeftColor: "primary.main",
                    color: "primary.main",
                  },
                  "&.Mui-selected:hover": {
                    backgroundColor: "rgba(4,102,156,0.12)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: isActive ? "primary.main" : "text.secondary",
                  }}
                >
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      sx={{ fontWeight: isActive ? 700 : 500, fontSize: 14 }}
                    >
                      {item.label}
                    </Typography>
                  }
                />
              </ListItemButton>
            );
          })}
        </List>

        {!hasPatient ? (
          <>
            <Divider sx={{ mx: 2 }} />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                px: 3,
                py: 2,
                display: "block",
                lineHeight: 1.5,
              }}
            >
              Select a patient to unlock the prescription workflow sections.
            </Typography>
          </>
        ) : null}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: 8,
          p: { xs: 2, sm: 3 },
          minWidth: 0,
          "@media print": {
            mt: 0,
            p: 0,
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
