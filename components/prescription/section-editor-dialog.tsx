"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
import RichTextEditor from "@/components/prescription/rich-text-editor";

export default function SectionEditorDialog({
  open,
  title,
  value,
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
          <RichTextEditor value={draft} onChange={setDraft} />
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
