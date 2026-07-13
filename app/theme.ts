import { createTheme } from "@mui/material/styles";

export const portalTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#04669c",
    },
    secondary: {
      main: "#f08c00",
    },
    info: {
      main: "#4fb3e8",
    },
    warning: {
      main: "#f4c20d",
    },
    success: {
      main: "#2e9e5b",
    },
    background: {
      default: "#f2f6f9",
      paper: "#ffffff",
    },
    text: {
      primary: "#1d2b36",
      secondary: "#51616e",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "var(--font-geist-sans), Segoe UI, sans-serif",
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 10,
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
      },
    },
  },
});
