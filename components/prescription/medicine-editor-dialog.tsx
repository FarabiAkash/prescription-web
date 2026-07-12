"use client";

import { useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { MedicineRecord } from "@/types/portal";

const DEFAULT_DOSE = "1 drop";
const DEFAULT_EYE = "Both";
const DEFAULT_FREQUENCY = "3 times daily";
const DEFAULT_DURATION = "14 days";

type RxDraft = {
  medicine: string;
  dosage: string;
  eye: string;
  frequency: string;
  duration: string;
};

export default function MedicineEditorDialog({
  open,
  medicines,
  value,
  onCancel,
  onSave,
}: {
  open: boolean;
  medicines: MedicineRecord[];
  value: string;
  onCancel: () => void;
  onSave: (nextValue: string) => void;
}) {
  const [draft, setDraft] = useState<RxDraft>({
    medicine: value,
    dosage: DEFAULT_DOSE,
    eye: DEFAULT_EYE,
    frequency: DEFAULT_FREQUENCY,
    duration: DEFAULT_DURATION,
  });

  const options = useMemo(
    () =>
      medicines.map(
        (item) =>
          `${item.medicineName} (${item.dosageForm}) - ${item.category}`,
      ),
    [medicines],
  );

  function resetDefaults() {
    setDraft((prev) => ({
      ...prev,
      dosage: DEFAULT_DOSE,
      eye: DEFAULT_EYE,
      frequency: DEFAULT_FREQUENCY,
      duration: DEFAULT_DURATION,
    }));
  }

  function save() {
    const payload = `${draft.medicine}; ${draft.dosage}; ${draft.eye} eye; ${draft.frequency}; ${draft.duration}`;
    onSave(payload);
  }

  return (
    <Dialog open={open} fullWidth maxWidth="md" onClose={onCancel}>
      <DialogTitle>Rx Medicine Picker</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Search a medicine, then set dosage, eye, frequency, and duration.
          </Typography>

          <Autocomplete
            options={options}
            value={draft.medicine}
            onChange={(_, next) =>
              setDraft((prev) => ({ ...prev, medicine: next ?? "" }))
            }
            renderInput={(params) => <TextField {...params} label="Medicine" />}
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <TextField
              label="Dosage"
              value={draft.dosage}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, dosage: event.target.value }))
              }
            />
            <TextField
              select
              label="Which Eye"
              value={draft.eye}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, eye: event.target.value }))
              }
            >
              <MenuItem value="Right">Right</MenuItem>
              <MenuItem value="Left">Left</MenuItem>
              <MenuItem value="Both">Both</MenuItem>
            </TextField>
            <TextField
              label="Frequency"
              value={draft.frequency}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, frequency: event.target.value }))
              }
            />
            <TextField
              label="Duration"
              value={draft.duration}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, duration: event.target.value }))
              }
            />
          </Box>

          <Button
            onClick={resetDefaults}
            variant="outlined"
            sx={{ alignSelf: "start" }}
          >
            Reset to Default
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={save} variant="contained" disabled={!draft.medicine}>
          Save Rx
        </Button>
      </DialogActions>
    </Dialog>
  );
}
