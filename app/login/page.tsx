"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
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

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        background:
          "linear-gradient(135deg, rgba(15,106,154,0.08), rgba(240,140,0,0.10))",
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={1} sx={{ p: { xs: 3, sm: 5 } }}>
          <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
            <Typography variant="h4">Doctor Login</Typography>
            <Typography variant="body2" color="text.secondary">
              Demo POC authentication from CSV credentials.
            </Typography>

            {error ? <Alert severity="error">{error}</Alert> : null}

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

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
            >
              {submitting ? "Signing in..." : "Sign In"}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
