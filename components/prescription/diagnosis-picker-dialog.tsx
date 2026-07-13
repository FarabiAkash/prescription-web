"use client";

import { useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { createFilterOptions } from "@mui/material/Autocomplete";
import DeleteOutlineIcon from "@mui/icons-material/Delete";
import type { DiagnosisRecord } from "@/types/portal";
import type { DiagnosisItem } from "@/lib/diagnosis";
import EyeToggle from "@/components/prescription/eye-toggle";

const ADD_OPTION_PATTERN = /^Add "(.+)" as new diagnosis$/;
const filterDiagnosisOptions = createFilterOptions<string>();

export default function DiagnosisPickerDialog({
  open,
  diagnoses,
  favorites,
  initialItems,
  onCancel,
  onSave,
}: {
  open: boolean;
  diagnoses: DiagnosisRecord[];
  favorites: string[];
  initialItems: DiagnosisItem[];
  onCancel: () => void;
  onSave: (items: DiagnosisItem[]) => void;
}) {
  const [items, setItems] = useState<DiagnosisItem[]>(initialItems);
  const [searchValue, setSearchValue] = useState("");

  const options = useMemo(
    () => diagnoses.map((diagnosis) => diagnosis.name),
    [diagnoses],
  );

  const favoriteChips = useMemo(() => {
    if (favorites.length > 0) {
      return favorites;
    }
    // Fall back to a handful of common diagnoses if the doctor has no
    // favorites configured yet.
    return diagnoses.slice(0, 6).map((diagnosis) => diagnosis.name);
  }, [favorites, diagnoses]);

  function addDiagnosis(name: string) {
    const match = name.match(ADD_OPTION_PATTERN);
    const trimmed = (match ? match[1] : name).trim();
    if (!trimmed || items.some((item) => item.name === trimmed)) {
      setSearchValue("");
      return;
    }
    setItems((prev) => [
      ...prev,
      { id: `dx-${Date.now()}-${prev.length}`, name: trimmed, eye: "Both" },
    ]);
    setSearchValue("");
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function updateEye(id: string, eye: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, eye } : item)),
    );
  }

  return (
    <Dialog open={open} fullWidth maxWidth="sm" onClose={onCancel}>
      <DialogTitle>Diagnosis</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <Autocomplete
            freeSolo
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            options={options}
            inputValue={searchValue}
            onInputChange={(_event, next) => setSearchValue(next)}
            onChange={(_event, next) => {
              if (typeof next === "string") {
                addDiagnosis(next);
              }
            }}
            filterOptions={(opts, params) => {
              const filtered = filterDiagnosisOptions(opts, params);
              const inputValue = params.inputValue.trim();
              const isExisting = opts.some(
                (option) => option.toLowerCase() === inputValue.toLowerCase(),
              );
              if (inputValue !== "" && !isExisting) {
                filtered.push(`Add "${inputValue}" as new diagnosis`);
              }
              return filtered;
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                autoFocus
                label="Search diagnosis"
                placeholder="Type to search or add a new diagnosis..."
                onKeyDown={(event) => {
                  if (event.key === "Enter" && searchValue.trim()) {
                    event.preventDefault();
                    addDiagnosis(searchValue);
                  }
                }}
              />
            )}
          />

          {favoriteChips.length > 0 ? (
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 0.75 }}
              >
                Favorite / Common Diagnoses
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                {favoriteChips.map((name) => {
                  const selected = items.some((item) => item.name === name);
                  return (
                    <Chip
                      key={name}
                      label={name}
                      size="small"
                      onClick={() => addDiagnosis(name)}
                      color={selected ? "primary" : "default"}
                      variant={selected ? "filled" : "outlined"}
                    />
                  );
                })}
              </Box>
            </Box>
          ) : null}

          <Divider />

          <Stack spacing={1}>
            <Typography variant="subtitle2">Selected Diagnoses</Typography>
            {items.length > 0 ? (
              items.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    p: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    {item.name}
                  </Typography>
                  <EyeToggle
                    value={item.eye}
                    onChange={(next) => updateEye(item.id, next)}
                    size="small"
                  />
                  <IconButton size="small" onClick={() => removeItem(item.id)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No diagnosis added yet.
              </Typography>
            )}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(items)} variant="contained">
          Save Diagnosis
        </Button>
      </DialogActions>
    </Dialog>
  );
}
