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
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/Delete";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import type { MedicineRecord } from "@/types/portal";
import type { RxItem } from "@/lib/rx";

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

  function updateItem(id: string, field: keyof RxItem, value: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  }

  return (
    <Dialog open={open} fullWidth maxWidth="lg" onClose={onCancel}>
      <DialogTitle>Rx Medicine Picker</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Search a medicine, set dosage, eye, frequency, and duration, then
            add it below. Every field stays editable in the table.
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-start",
              gap: 1.5,
            }}
          >
            <Autocomplete
              options={options}
              value={draft.medicine || null}
              onChange={(_, next) =>
                setDraft((prev) => ({ ...prev, medicine: next ?? "" }))
              }
              sx={{ flex: "2 1 260px" }}
              renderInput={(params) => (
                <TextField {...params} label="Medicine" />
              )}
            />
            <TextField
              label="Dosage"
              value={draft.dosage}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, dosage: event.target.value }))
              }
              sx={{ flex: "1 1 130px" }}
            />
            <TextField
              select
              label="Which Eye"
              value={draft.eye}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, eye: event.target.value }))
              }
              sx={{ flex: "1 1 120px" }}
            >
              <MenuItem value="Right">Right</MenuItem>
              <MenuItem value="Left">Left</MenuItem>
              <MenuItem value="Both">Both</MenuItem>
            </TextField>
            <TextField
              label="Frequency"
              value={draft.frequency}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  frequency: event.target.value,
                }))
              }
              sx={{ flex: "1 1 150px" }}
            />
            <TextField
              label="Duration"
              value={draft.duration}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, duration: event.target.value }))
              }
              sx={{ flex: "1 1 120px" }}
            />
            <Tooltip title="Reset to Default">
              <IconButton onClick={resetDefaults} sx={{ mt: 1 }}>
                <RestartAltIcon />
              </IconButton>
            </Tooltip>
            <Button
              onClick={addDraftToList}
              variant="contained"
              disabled={!draft.medicine}
              sx={{ mt: 1 }}
            >
              Add Medicine
            </Button>
          </Box>

          <Divider />

          {items.length > 0 ? (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Medicine</TableCell>
                  <TableCell>Dosage</TableCell>
                  <TableCell>Eye</TableCell>
                  <TableCell>Frequency</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell sx={{ minWidth: 200 }}>
                      <Typography variant="body2">{item.medicine}</Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 110 }}>
                      <TextField
                        size="small"
                        variant="standard"
                        value={item.dosage}
                        onChange={(event) =>
                          updateItem(item.id, "dosage", event.target.value)
                        }
                        fullWidth
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 110 }}>
                      <TextField
                        select
                        size="small"
                        variant="standard"
                        value={item.eye}
                        onChange={(event) =>
                          updateItem(item.id, "eye", event.target.value)
                        }
                        fullWidth
                      >
                        <MenuItem value="Right">Right</MenuItem>
                        <MenuItem value="Left">Left</MenuItem>
                        <MenuItem value="Both">Both</MenuItem>
                      </TextField>
                    </TableCell>
                    <TableCell sx={{ minWidth: 130 }}>
                      <TextField
                        size="small"
                        variant="standard"
                        value={item.frequency}
                        onChange={(event) =>
                          updateItem(item.id, "frequency", event.target.value)
                        }
                        fullWidth
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 110 }}>
                      <TextField
                        size="small"
                        variant="standard"
                        value={item.duration}
                        onChange={(event) =>
                          updateItem(item.id, "duration", event.target.value)
                        }
                        fullWidth
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => removeItem(item.id)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No medicines added yet.
            </Typography>
          )}
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
