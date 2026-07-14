"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Divider,
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

      <Paper sx={{ border: "1px solid #d8e2eb", p: { xs: 2, md: 3 } }}>
        <Stack spacing={1.5}>
          <Typography variant="h6">
            How the Prescription Workflow Works
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Clicking a patient above opens a confirmation dialog pre-filled with
            that patient&apos;s last 3 code digits (you can edit it before
            confirming) so a doctor can quickly double-check they are opening
            the right chart before it loads. Once confirmed, you land on the
            prescription paper for that patient, laid out as a single landscape
            sheet split into a left column (Complaints, Vision, History,
            Refraction) and a right column (Rx, Diagnosis, Investigation, Plan,
            Glass Prediction, Advice, Follow Up), with the hospital header at
            the top and the doctor&apos;s signature block at the bottom. Every
            field shows a small pencil or plus icon next to its label &mdash;
            plus means the field is still empty, pencil means it already has
            content &mdash; and clicking it opens the relevant editor: a
            rich-text bullet editor for free-text fields, the dedicated medicine
            picker for Rx (with dosage, frequency, duration and left/right/both
            eye tagging), or the dedicated diagnosis picker for Diagnosis (with
            search, favorite/common diagnosis chips, and the same eye tagging).
            Changes save immediately back to the patient record, and the print
            icon in the corner of the sheet produces a single-page, print-ready
            prescription using the same layout you see on screen.
          </Typography>

          <Divider />

          <Typography variant="h6">Demo Patient Data Guide</Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>0000-506025 (Md. Rahim Uddin)</strong> is set up as a mostly
            complete chart to demonstrate a typical multi-diagnosis eye visit:
            Complaints, Vision and History are filled in, but Refraction,
            Investigation and Plan are intentionally left empty so you can see
            the empty-state plus icon in context. Its Diagnosis section has four
            entries (Dry Eye Syndrome, Corneal Ulcer, Keratoconus and Pterygium)
            each tagged to a specific eye, and its Rx list has seven medicines
            mixing eye drops (with left/right/both tagging) and a plain oral
            tablet, useful for exercising the full medicine picker.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>0000-506026 (Sharmin Akter)</strong> is deliberately minimal
            &mdash; only Complaints, Vision and History are populated, and every
            other section (Refraction, Diagnosis, Investigation, Plan, Rx, Glass
            Prediction, Advice, Follow Up) is empty. Use this patient to confirm
            that new/empty fields render correctly and that adding data from a
            completely blank chart works as expected.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>0000-506027 (Abdul Karim)</strong> is fully filled in across
            every field to represent a pre-operative cataract case: it has
            Complaints, Vision, Refraction and History details, two tagged
            Diagnosis entries (Cataract and Diabetic Retinopathy), a structured
            Rx (a pre-op antibiotic eye drop plus an oral analgesic), an
            Investigation and Plan describing the workup and surgical
            counseling, and Glass Prediction, Advice and Follow Up notes. Use
            this patient when you want to see the complete prescription sheet
            fully populated, including print output.
          </Typography>
        </Stack>
      </Paper>

      <PatientCodeDialog
        key={dialogKey}
        open={dialogOpen}
        patientName={selected?.patientName}
        patientCode={selected?.patientCode}
        onPatientLoaded={handlePatientLoaded}
        onClose={() => setDialogOpen(false)}
      />
    </Stack>
  );
}
