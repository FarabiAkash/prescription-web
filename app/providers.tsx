"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import type { PropsWithChildren } from "react";
import { portalTheme } from "./theme";

export default function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider theme={portalTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
