"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { PatientRecord } from "@/types/portal";

export default function PatientCodeDialog({
  open,
  onPatientLoaded,
}: {
  open: boolean;
  onPatientLoaded: (patient: PatientRecord) => void;
}) {
  const [patientCode, setPatientCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLookup() {
    setLoading(true);
    setError(null);

    const response = await fetch(
      `/api/patients/lookup?code=${encodeURIComponent(patientCode)}`,
    );

    if (!response.ok) {
      const payload = (await response.json()) as { message?: string };
      setError(payload.message ?? "Unable to load patient.");
      setLoading(false);
      return;
    }

    const payload = (await response.json()) as { patient: PatientRecord };
    onPatientLoaded(payload.patient);
    setLoading(false);
  }

  return (
    <Dialog open={open} fullWidth maxWidth="sm">
      <DialogTitle>Enter Patient Code</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Load patient details from CSV by entering a valid patient code.
          </Typography>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField
            autoFocus
            label="Patient Code"
            value={patientCode}
            onChange={(event) => setPatientCode(event.target.value)}
            placeholder="P-1001"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleLookup} variant="contained" disabled={loading}>
          {loading ? "Loading..." : "Load Patient"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
