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
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/Delete";
import type { MedicineRecord } from "@/types/portal";
import { formatRxItem, type RxItem } from "@/lib/rx";

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

function emptyDraft(): RxDraft {
  return {
    medicine: "",
    dosage: DEFAULT_DOSE,
    eye: DEFAULT_EYE,
    frequency: DEFAULT_FREQUENCY,
    duration: DEFAULT_DURATION,
  };
}

export default function MedicineEditorDialog({
  open,
  medicines,
  initialItems,
  onCancel,
  onSave,
}: {
  open: boolean;
  medicines: MedicineRecord[];
  initialItems: RxItem[];
  onCancel: () => void;
  onSave: (nextItems: RxItem[]) => void;
}) {
  const [items, setItems] = useState<RxItem[]>(initialItems);
  const [draft, setDraft] = useState<RxDraft>(emptyDraft());

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

  function addDraftToList() {
    if (!draft.medicine) {
      return;
    }
    const newItem: RxItem = {
      id: `rx-${Date.now()}`,
      ...draft,
    };
    setItems((prev) => [...prev, newItem]);
    setDraft(emptyDraft());
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <Dialog open={open} fullWidth maxWidth="md" onClose={onCancel}>
      <DialogTitle>Rx Medicine Picker</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Search a medicine, then set dosage, eye, frequency, and duration.
            Add as many medicines as needed.
          </Typography>

          {items.length > 0 ? (
            <List dense disablePadding>
              {items.map((item) => (
                <ListItem
                  key={item.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => removeItem(item.id)}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  }
                  sx={{
                    border: "1px solid #e3e9ee",
                    borderRadius: 1.5,
                    mb: 0.5,
                  }}
                >
                  <ListItemText primary={formatRxItem(item)} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No medicines added yet.
            </Typography>
          )}

          <Divider />

          <Autocomplete
            options={options}
            value={draft.medicine || null}
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

          <Stack direction="row" spacing={1.5}>
            <Button onClick={resetDefaults} variant="outlined">
              Reset to Default
            </Button>
            <Button
              onClick={addDraftToList}
              variant="contained"
              disabled={!draft.medicine}
            >
              Add Medicine
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(items)} variant="contained">
          Save Rx
        </Button>
      </DialogActions>
    </Dialog>
  );
}
