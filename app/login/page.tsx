"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import Image from "next/image";
import { useRouter } from "next/navigation";

const QUICK_LOGIN_USERS = [
  { username: "sarwar", password: "1234", label: "Prof. Dr. Sarwar Alam" },
  { username: "salam", password: "1234", label: "Dr. Abdus Salam" },
];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function login(loginUsername: string, loginPassword: string) {
    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: loginUsername,
        password: loginPassword,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json()) as { message?: string };
      setError(payload.message ?? "Failed to log in.");
      setSubmitting(false);
      return;
    }

    router.replace("/portal/patients");
    router.refresh();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await login(username, password);
  }

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      {/* Left Panel */}
      <Box
        sx={{
          width: { xs: "100%", md: "30%" },
          minWidth: { md: 380 },
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          px: { xs: 3, sm: 5 },
          py: { xs: 4, md: 6 },
        }}
      >
        <Image
          src="/images/logo.jpg"
          alt="Hospital Logo"
          width={56}
          height={56}
        />

        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Box
            sx={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              bgcolor: "primary.main",
              color: "primary.contrastText",
              display: "grid",
              placeItems: "center",
              mb: 3,
            }}
          >
            <PersonIcon sx={{ fontSize: 48 }} />
          </Box>

          <Typography variant="h5" align="center" sx={{ mb: 0.5 }}>
            Doctor Login
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mb: 3 }}
          >
            Sign in to access the prescription workspace.
          </Typography>

          {error ? (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {error}
            </Alert>
          ) : null}

          <Stack
            spacing={2}
            component="form"
            onSubmit={handleSubmit}
            sx={{ width: "100%" }}
          >
            <TextField
              label="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              fullWidth
            />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                }
                label={<Typography variant="body2">Remember me</Typography>}
              />
              <MuiLink component="button" type="button" variant="body2">
                Forgot your password?
              </MuiLink>
            </Box>

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={submitting}
            >
              {submitting ? "Signing in..." : "Login"}
            </Button>
          </Stack>

          <Divider sx={{ width: "100%", my: 3 }}>or quick login as</Divider>

          <Stack spacing={1} sx={{ width: "100%" }}>
            {QUICK_LOGIN_USERS.map((user) => (
              <Button
                key={user.username}
                variant="outlined"
                fullWidth
                disabled={submitting}
                onClick={() => login(user.username, user.password)}
              >
                {user.label}
              </Button>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Right Panel */}
      <Box
        sx={{
          flexGrow: 1,
          position: "relative",
          minHeight: { xs: 260, md: "auto" },
          backgroundImage:
            'linear-gradient(135deg, rgba(4,102,156,0.82), rgba(4,102,156,0.35)), url("/images/wall.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: { xs: "center", md: "flex-start" },
          color: "#fff",
          px: { xs: 4, md: 10 },
          py: { xs: 6, md: 0 },
        }}
      >
        <Box sx={{ maxWidth: 480, textAlign: { xs: "center", md: "left" } }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: "2.75rem", md: "4rem" },
            }}
          >
            Welcome
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 3, color: "rgba(255,255,255,0.9)" }}
          >
            Manage patient prescriptions, records and consultations from one
            modern, secure doctors portal built for your hospital.
          </Typography>
          <MuiLink
            href="https://www.islamia.org.bd/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: "#fff",
              fontWeight: 600,
              borderBottom: "2px solid #f08c00",
              pb: 0.5,
            }}
            underline="none"
          >
            Learn more about the portal &rarr;
          </MuiLink>
        </Box>
      </Box>
    </Box>
  );
}
