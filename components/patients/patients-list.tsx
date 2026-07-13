"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type { PatientRecord } from "@/types/portal";
import PatientCodeDialog from "@/components/prescription/patient-code-dialog";

export default function PatientsList({
  patients,
}: {
  patients: PatientRecord[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<PatientRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);

  function handleSelect(patient: PatientRecord) {
    setSelected(patient);
    setDialogKey((key) => key + 1);
    setDialogOpen(true);
  }

  function handlePatientLoaded(patient: PatientRecord) {
    setDialogOpen(false);
    router.push(
      `/portal/prescription?code=${encodeURIComponent(patient.patientCode)}`,
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Patients</Typography>
      <Typography variant="body2" color="text.secondary">
        Select a patient to open the prescription workflow.
      </Typography>

      <Paper sx={{ border: "1px solid #d8e2eb" }}>
        <List disablePadding>
          {patients.map((patient) => (
            <ListItemButton
              key={patient.patientCode}
              divider
              onClick={() => handleSelect(patient)}
            >
              <ListItemText
                primary={`${patient.patientName} (${patient.patientCode})`}
                secondary={`${patient.sex}, Age ${patient.age}`}
              />
            </ListItemButton>
          ))}
        </List>
      </Paper>

      <PatientCodeDialog
        key={dialogKey}
        open={dialogOpen}
        patientName={selected?.patientName}
        onPatientLoaded={handlePatientLoaded}
        onClose={() => setDialogOpen(false)}
      />
    </Stack>
  );
}
