"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import type { GlassPrediction, GlassRow } from "@/lib/glass-prediction";

type Side = "right" | "left";

const CELL_SX = {
  border: "1px solid",
  borderColor: "divider",
  p: 0.5,
  textAlign: "center" as const,
};

function RowCells({
  row,
  onChange,
}: {
  row: GlassRow;
  onChange: (field: keyof GlassRow, value: string) => void;
}) {
  return (
    <>
      {(["sph", "cyl", "axis", "va"] as Array<keyof GlassRow>).map((field) => (
        <TableCell key={field} sx={CELL_SX}>
          <TextField
            variant="standard"
            size="small"
            value={row[field]}
            onChange={(event) => onChange(field, event.target.value)}
            slotProps={{
              htmlInput: { style: { textAlign: "center" } },
            }}
            fullWidth
          />
        </TableCell>
      ))}
    </>
  );
}

export default function GlassPredictionDialog({
  open,
  initialValue,
  onCancel,
  onSave,
}: {
  open: boolean;
  initialValue: GlassPrediction;
  onCancel: () => void;
  onSave: (next: GlassPrediction) => void;
}) {
  const [value, setValue] = useState<GlassPrediction>(initialValue);

  function updateRow(side: Side, field: keyof GlassRow, fieldValue: string) {
    setValue((prev) => ({
      ...prev,
      dist: {
        ...prev.dist,
        [side]: {
          ...prev.dist[side],
          [field]: fieldValue,
        },
      },
    }));
  }

  return (
    <Dialog open={open} fullWidth maxWidth="sm" onClose={onCancel}>
      <DialogTitle>Glass Prediction</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Table size="small" sx={{ "& th": { fontWeight: 700 } }}>
            <TableHead>
              <TableRow>
                <TableCell sx={CELL_SX} colSpan={2} />
                <TableCell sx={CELL_SX} component="th">
                  SPH
                </TableCell>
                <TableCell sx={CELL_SX} component="th">
                  CYL
                </TableCell>
                <TableCell sx={CELL_SX} component="th">
                  AXIS
                </TableCell>
                <TableCell sx={CELL_SX} component="th">
                  V/A
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ ...CELL_SX, fontWeight: 700 }} rowSpan={2}>
                  DIST
                </TableCell>
                <TableCell sx={CELL_SX}>R</TableCell>
                <RowCells
                  row={value.dist.right}
                  onChange={(field, fieldValue) =>
                    updateRow("right", field, fieldValue)
                  }
                />
              </TableRow>
              <TableRow>
                <TableCell sx={CELL_SX}>L</TableCell>
                <RowCells
                  row={value.dist.left}
                  onChange={(field, fieldValue) =>
                    updateRow("left", field, fieldValue)
                  }
                />
              </TableRow>
            </TableBody>
          </Table>

          <Typography variant="body2" color="text.secondary">
            Leave a row blank if it doesn&apos;t apply.
          </Typography>

          <TextField
            label="Notes"
            placeholder="Any additional remarks (optional)"
            value={value.notes}
            onChange={(event) =>
              setValue((prev) => ({ ...prev, notes: event.target.value }))
            }
            multiline
            minRows={2}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(value)} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
