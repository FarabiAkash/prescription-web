"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";

export default function SectionEditorDialog({
  open,
  title,
  value,
  multiline = true,
  onCancel,
  onSave,
}: {
  open: boolean;
  title: string;
  value: string;
  multiline?: boolean;
  onCancel: () => void;
  onSave: (nextValue: string) => void;
}) {
  const [draft, setDraft] = useState(value);

  return (
    <Dialog open={open} fullWidth maxWidth="md" onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack sx={{ mt: 1 }}>
          <TextField
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            multiline={multiline}
            minRows={multiline ? 5 : undefined}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(draft)} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
