"use client";

import { useRef, useState } from "react";
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
  patientName,
  onPatientLoaded,
  onClose,
}: {
  open: boolean;
  patientName?: string;
  onPatientLoaded: (patient: PatientRecord) => void;
  onClose?: () => void;
}) {
  const [patientCode, setPatientCode] = useState("001");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      slotProps={{
        transition: {
          onEntered: () => {
            inputRef.current?.focus();
            inputRef.current?.select();
          },
        },
      }}
    >
      <DialogTitle>
        {patientName ? `Confirm Code for ${patientName}` : "Enter Patient Code"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Load patient details from CSV by entering the last 3 digits of the
            patient code. e.g. 001, 002, 003
          </Typography>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField
            autoFocus
            label="Patient Code (last 3 digits)"
            value={patientCode}
            onChange={(event) => setPatientCode(event.target.value)}
            onFocus={(event) => event.target.select()}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleLookup();
              }
            }}
            placeholder="e.g. 001, 002, 003"
            slotProps={{ htmlInput: { maxLength: 3, ref: inputRef } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        {onClose ? <Button onClick={onClose}>Cancel</Button> : null}
        <Button onClick={handleLookup} variant="contained" disabled={loading}>
          {loading ? "Loading..." : "Load Patient"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
