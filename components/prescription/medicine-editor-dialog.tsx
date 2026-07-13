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
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/Delete";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import type { MedicineRecord, MedicineSetRecord } from "@/types/portal";
import type { RxItem } from "@/lib/rx";

const DEFAULT_DOSE = "1 drop";
const DEFAULT_EYE = "Both";
const DEFAULT_FREQUENCY = "3 times daily";
const DEFAULT_DURATION = "14 days";

const FREQUENCY_OPTIONS = [
  "1 time daily",
  "2 times daily",
  "3 times daily",
  "4 times daily",
  "5 times daily",
  "6 times daily",
];

const DURATION_OPTIONS = ["3 days", "7 days", "14 days", "1 month"];

function isEyeDosageForm(dosageForm: string): boolean {
  return dosageForm.toLowerCase().includes("eye");
}

function isEyeMedicineOption(medicine: string): boolean {
  return medicine.includes("(Eye");
}

function defaultDosageForForm(dosageForm: string): string {
  const form = dosageForm.toLowerCase();
  if (form.includes("tablet")) {
    return "1 tablet";
  }
  if (form.includes("syrup")) {
    return "5 ml";
  }
  if (form.includes("injection")) {
    return "1 injection";
  }
  return DEFAULT_DOSE;
}

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

function EyeToggle({
  value,
  onChange,
  size = "medium",
}: {
  value: string;
  onChange: (next: string) => void;
  size?: "small" | "medium";
}) {
  const selection =
    value === "Both"
      ? ["L", "R"]
      : value === "Left"
        ? ["L"]
        : value === "Right"
          ? ["R"]
          : [];

  function handleChange(_event: React.MouseEvent<HTMLElement>, next: string[]) {
    if (next.includes("L") && next.includes("R")) {
      onChange("Both");
    } else if (next.includes("L")) {
      onChange("Left");
    } else if (next.includes("R")) {
      onChange("Right");
    } else {
      onChange("");
    }
  }

  return (
    <ToggleButtonGroup
      value={selection}
      onChange={handleChange}
      size={size}
      aria-label="Which eye"
      sx={{
        "& .MuiToggleButton-root": {
          px: 1.5,
        },
        "& .MuiToggleButton-root.Mui-selected": {
          backgroundColor: "success.main",
          color: "success.contrastText",
          "&:hover": {
            backgroundColor: "success.dark",
          },
        },
      }}
    >
      <ToggleButton value="L" aria-label="Left eye">
        L
      </ToggleButton>
      <ToggleButton value="R" aria-label="Right eye">
        R
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

export default function MedicineEditorDialog({
  open,
  medicines,
  sets,
  initialItems,
  onCancel,
  onSave,
}: {
  open: boolean;
  medicines: MedicineRecord[];
  sets: MedicineSetRecord[];
  initialItems: RxItem[];
  onCancel: () => void;
  onSave: (nextItems: RxItem[]) => void;
}) {
  const [items, setItems] = useState<RxItem[]>(initialItems);
  const [draft, setDraft] = useState<RxDraft>(emptyDraft());
  const [selectedSet, setSelectedSet] = useState("");

  const medicineByOption = useMemo(() => {
    const map = new Map<string, MedicineRecord>();
    medicines.forEach((item) => {
      map.set(
        `${item.medicineName} (${item.dosageForm}) - ${item.category}`,
        item,
      );
    });
    return map;
  }, [medicines]);

  const options = useMemo(
    () =>
      medicines.map(
        (item) =>
          `${item.medicineName} (${item.dosageForm}) - ${item.category}`,
      ),
    [medicines],
  );

  const showEyeField = isEyeMedicineOption(draft.medicine) || !draft.medicine;

  function resetDefaults() {
    const record = draft.medicine
      ? medicineByOption.get(draft.medicine)
      : undefined;
    setDraft((prev) => ({
      ...prev,
      dosage: record ? defaultDosageForForm(record.dosageForm) : DEFAULT_DOSE,
      eye: record
        ? isEyeDosageForm(record.dosageForm)
          ? DEFAULT_EYE
          : ""
        : DEFAULT_EYE,
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

  function applySet(setName: string) {
    const set = sets.find((item) => item.name === setName);
    if (!set) {
      return;
    }
    setSelectedSet(setName);
    const newItems: RxItem[] = set.items.map((item, index) => ({
      id: `rx-${Date.now()}-${index}`,
      medicine: item.medicine,
      dosage: item.dosage || DEFAULT_DOSE,
      eye: item.eye || DEFAULT_EYE,
      frequency: item.frequency || DEFAULT_FREQUENCY,
      duration: item.duration || DEFAULT_DURATION,
    }));
    setItems(newItems);
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

          {sets.length > 0 ? (
            <TextField
              select
              label="Load a Preset Set"
              value={selectedSet}
              onChange={(event) => applySet(event.target.value)}
              helperText="Selecting a set replaces the medicines below - edit, add, or delete as needed."
              sx={{ maxWidth: 320 }}
            >
              {sets.map((set) => (
                <MenuItem key={set.name} value={set.name}>
                  {set.name} ({set.category})
                </MenuItem>
              ))}
            </TextField>
          ) : null}

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-end",
              gap: 1.5,
            }}
          >
            <Autocomplete
              options={options}
              value={draft.medicine || null}
              onChange={(_, next) => {
                const record = next ? medicineByOption.get(next) : undefined;
                setDraft((prev) => ({
                  ...prev,
                  medicine: next ?? "",
                  dosage: record
                    ? defaultDosageForForm(record.dosageForm)
                    : prev.dosage,
                  eye: record
                    ? isEyeDosageForm(record.dosageForm)
                      ? DEFAULT_EYE
                      : ""
                    : prev.eye,
                }));
              }}
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
            <Box
              sx={{
                flex: "0 0 auto",
                position: "relative",
                height: 56,
                boxSizing: "border-box",
                display: showEyeField ? "flex" : "none",
                alignItems: "center",
                border: "1px solid rgba(0, 0, 0, 0.23)",
                borderRadius: 1,
                px: 1.25,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  position: "absolute",
                  top: -9,
                  left: 8,
                  px: 0.5,
                  bgcolor: "background.paper",
                  color: "text.secondary",
                  fontSize: 12,
                  lineHeight: 1,
                }}
              >
                Which Eye
              </Typography>
              <EyeToggle
                value={draft.eye}
                onChange={(next) =>
                  setDraft((prev) => ({ ...prev, eye: next }))
                }
              />
            </Box>
            <TextField
              select
              label="Frequency"
              value={draft.frequency}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  frequency: event.target.value,
                }))
              }
              sx={{ flex: "1 1 150px" }}
            >
              {FREQUENCY_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Duration"
              value={draft.duration}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, duration: event.target.value }))
              }
              sx={{ flex: "1 1 120px" }}
            >
              {DURATION_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <Tooltip title="Reset to Default">
              <IconButton onClick={resetDefaults}>
                <RestartAltIcon />
              </IconButton>
            </Tooltip>
            <Button
              onClick={addDraftToList}
              variant="contained"
              disabled={!draft.medicine}
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
                      {isEyeMedicineOption(item.medicine) ? (
                        <EyeToggle
                          value={item.eye}
                          onChange={(next) => updateItem(item.id, "eye", next)}
                          size="small"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ minWidth: 150 }}>
                      <TextField
                        select
                        size="small"
                        variant="standard"
                        value={item.frequency}
                        onChange={(event) =>
                          updateItem(item.id, "frequency", event.target.value)
                        }
                        fullWidth
                      >
                        {FREQUENCY_OPTIONS.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell sx={{ minWidth: 120 }}>
                      <TextField
                        select
                        size="small"
                        variant="standard"
                        value={item.duration}
                        onChange={(event) =>
                          updateItem(item.id, "duration", event.target.value)
                        }
                        fullWidth
                      >
                        {DURATION_OPTIONS.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
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
