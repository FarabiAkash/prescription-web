"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Image from "next/image";
import Link from "next/link";
import type {
  MedicineRecord,
  PatientRecord,
  SessionUser,
} from "@/types/portal";
import SectionEditorDialog from "@/components/prescription/section-editor-dialog";
import MedicineEditorDialog from "@/components/prescription/medicine-editor-dialog";
import RichTextContent from "@/components/prescription/rich-text-content";
import { formatRxItem, parseRxItems, stringifyRxItems } from "@/lib/rx";

type SectionKey =
  | "complaintsSummary"
  | "complaintsDetail"
  | "visionSummary"
  | "visionDetail"
  | "refractionSummary"
  | "refractionDetail"
  | "historySummary"
  | "historyDetail"
  | "diagnosis"
  | "investigation"
  | "plan"
  | "glassPrediction"
  | "advice"
  | "followUp";

const TAB_TO_SECTION: Record<string, { key: SectionKey; title: string }> = {
  complaints: { key: "complaintsDetail", title: "Complaints Details" },
  vision: { key: "visionDetail", title: "Vision Details" },
  refraction: { key: "refractionDetail", title: "Refraction Details" },
  history: { key: "historyDetail", title: "History Details" },
  diagnosis: { key: "diagnosis", title: "Diagnosis" },
  advice: { key: "advice", title: "Advice" },
};

const LEFT_SECTIONS: Array<{
  title: string;
  summaryKey: keyof PatientRecord;
  detailKey: keyof PatientRecord;
}> = [
  {
    title: "Complaints",
    summaryKey: "complaintsSummary",
    detailKey: "complaintsDetail",
  },
  {
    title: "Vision",
    summaryKey: "visionSummary",
    detailKey: "visionDetail",
  },
  {
    title: "History",
    summaryKey: "historySummary",
    detailKey: "historyDetail",
  },
  {
    title: "Refraction",
    summaryKey: "refractionSummary",
    detailKey: "refractionDetail",
  },
];

type EditorState = {
  key: SectionKey;
  title: string;
  open: boolean;
};

export default function PrescriptionWorkspace({
  session,
  medicines,
  hospital,
  today,
  now,
  initialPatient,
}: {
  session: SessionUser;
  medicines: MedicineRecord[];
  hospital: {
    hospitalName: string;
    address: string;
    contact: string;
    website: string;
  };
  today: string;
  now: string;
  initialPatient: PatientRecord;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  const [patient, setPatient] = useState<PatientRecord | null>(initialPatient);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [rxEditorOpen, setRxEditorOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const infoText = useMemo(() => {
    if (!patient) {
      return "Load a patient to start prescription entry.";
    }
    return `Patient loaded: ${patient.patientName} (${patient.patientCode})`;
  }, [patient]);

  const rxItems = useMemo(() => parseRxItems(patient?.rx ?? ""), [patient?.rx]);

  const tabMapping = tab ? TAB_TO_SECTION[tab] : undefined;
  const activeEditor: EditorState | null =
    editor ??
    (tabMapping && patient
      ? { key: tabMapping.key, title: tabMapping.title, open: true }
      : null);

  function clearTabParam() {
    if (!tab) {
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tab");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  function closeEditor() {
    setEditor(null);
    clearTabParam();
  }

  async function saveField(key: keyof PatientRecord, value: string) {
    if (!patient) {
      return;
    }
    setSaving(true);

    const response = await fetch("/api/prescription/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        patientCode: patient.patientCode,
        updates: {
          [key]: value,
        },
      }),
    });

    const payload = (await response.json()) as { patient?: PatientRecord };
    if (response.ok && payload.patient) {
      setPatient(payload.patient);
    }

    setSaving(false);
  }

  return (
    <Stack spacing={2.5}>
      <Alert
        severity="info"
        action={
          <Button
            component={Link}
            href="/portal/patients"
            color="inherit"
            size="small"
          >
            Change Patient
          </Button>
        }
      >
        {infoText}
      </Alert>

      <Paper sx={{ p: 2.5, border: "1px solid #d8e2eb" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h5">Prescription</Typography>
          <Chip
            color={saving ? "secondary" : "primary"}
            label={saving ? "Saving..." : "Auto-save ready"}
          />
        </Box>
      </Paper>

      <Paper
        className="rx-paper"
        sx={{ p: { xs: 2, md: 3 }, border: "1px solid #d8e2eb" }}
      >
        <Stack spacing={2}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              <Image
                src="/images/logo.jpg"
                alt="Hospital Logo"
                width={72}
                height={72}
              />
              <Box>
                <Typography variant="h6">{hospital.hospitalName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {hospital.address}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {hospital.contact} | {hospital.website}
                </Typography>
              </Box>
            </Box>
            <Typography variant="h6">Prescription Sheet</Typography>
          </Box>

          <Divider />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 1.5,
            }}
          >
            <Typography>Name: {patient?.patientName ?? "-"}</Typography>
            <Typography sx={{ textAlign: { xs: "left", md: "right" } }}>
              ID: {patient?.patientCode ?? "-"}
            </Typography>
            <Typography>
              Details: {patient?.sex ?? "-"}, Age {patient?.age ?? "-"}
            </Typography>
            <Typography sx={{ textAlign: { xs: "left", md: "right" } }}>
              Date: {today}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "340px minmax(0, 1fr)" },
              gap: 2.5,
            }}
          >
            <Stack spacing={1.5}>
              {LEFT_SECTIONS.map((section) => {
                const summary = String(patient?.[section.summaryKey] ?? "");
                const detail = String(patient?.[section.detailKey] ?? "");
                return (
                  <Paper key={section.title} variant="outlined" sx={{ p: 1.2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="subtitle2">
                        {section.title}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Tooltip
                          title={summary ? "Edit summary" : "Add summary"}
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              setEditor({
                                key: section.summaryKey as SectionKey,
                                title: `${section.title} Summary`,
                                open: true,
                              })
                            }
                          >
                            {summary ? (
                              <EditIcon fontSize="small" />
                            ) : (
                              <AddIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View/Edit details">
                          <IconButton
                            size="small"
                            onClick={() =>
                              setEditor({
                                key: section.detailKey as SectionKey,
                                title: `${section.title} Details`,
                                open: true,
                              })
                            }
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <RichTextContent
                      html={summary || "No summary yet."}
                      sx={{
                        mt: 0.8,
                        fontSize: 14,
                        color: "text.secondary",
                      }}
                    />
                    {detail ? (
                      <RichTextContent
                        html={detail}
                        sx={{ fontSize: 12, color: "text.secondary" }}
                      />
                    ) : null}
                  </Paper>
                );
              })}

              {[
                ["Diagnosis", "diagnosis"],
                ["Investigation", "investigation"],
                ["Plan", "plan"],
              ].map(([label, key]) => {
                const content = String(
                  patient?.[key as keyof PatientRecord] ?? "",
                );
                return (
                  <Paper key={label} variant="outlined" sx={{ p: 1.2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="subtitle2">{label}</Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          setEditor({
                            key: key as SectionKey,
                            title: label,
                            open: true,
                          })
                        }
                      >
                        {content ? (
                          <EditIcon fontSize="small" />
                        ) : (
                          <AddIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Box>
                    <RichTextContent
                      html={content || "No entry yet."}
                      sx={{
                        mt: 0.6,
                        fontSize: 14,
                        color: "text.secondary",
                      }}
                    />
                  </Paper>
                );
              })}
            </Stack>

            <Stack spacing={1.5}>
              <Paper variant="outlined" sx={{ p: 1.4 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h6">Rx.</Typography>
                  <IconButton
                    size="small"
                    onClick={() => setRxEditorOpen(true)}
                  >
                    {rxItems.length > 0 ? (
                      <EditIcon fontSize="small" />
                    ) : (
                      <AddIcon fontSize="small" />
                    )}
                  </IconButton>
                </Box>
                {rxItems.length > 0 ? (
                  <Stack
                    component="ul"
                    spacing={0.5}
                    sx={{ mt: 1, pl: 2.5, m: 0 }}
                  >
                    {rxItems.map((item) => (
                      <Typography key={item.id} component="li" variant="body2">
                        {formatRxItem(item)}
                      </Typography>
                    ))}
                  </Stack>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    No medicine selected yet.
                  </Typography>
                )}
              </Paper>

              {[
                ["Glass Prediction", "glassPrediction"],
                ["Advice", "advice"],
                ["Follow Up", "followUp"],
              ].map(([label, key]) => {
                const content = String(
                  patient?.[key as keyof PatientRecord] ?? "",
                );
                return (
                  <Paper key={label} variant="outlined" sx={{ p: 1.4 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="subtitle1">{label}</Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          setEditor({
                            key: key as SectionKey,
                            title: label,
                            open: true,
                          })
                        }
                      >
                        {content ? (
                          <EditIcon fontSize="small" />
                        ) : (
                          <AddIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Box>
                    <RichTextContent
                      html={content || "No entry yet."}
                      sx={{
                        mt: 0.8,
                        fontSize: 14,
                        color: "text.secondary",
                      }}
                    />
                  </Paper>
                );
              })}
            </Stack>
          </Box>

          <Divider />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="subtitle2">{session.doctorName}</Typography>
              <Typography variant="caption" color="text.secondary">
                {session.designation} | Reg: {session.registrationNumber} |{" "}
                {session.specialization}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Generated: {today} {now}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {activeEditor ? (
        <SectionEditorDialog
          key={`${activeEditor.key}-${patient?.patientCode ?? "none"}`}
          open={activeEditor.open}
          title={activeEditor.title}
          value={String(patient?.[activeEditor.key] ?? "")}
          onCancel={closeEditor}
          onSave={async (nextValue) => {
            await saveField(activeEditor.key, nextValue);
            closeEditor();
          }}
        />
      ) : null}

      <MedicineEditorDialog
        key={`rx-${patient?.patientCode ?? "none"}-${patient?.rx ?? ""}`}
        open={rxEditorOpen}
        medicines={medicines}
        initialItems={rxItems}
        onCancel={() => setRxEditorOpen(false)}
        onSave={async (nextItems) => {
          await saveField("rx", stringifyRxItems(nextItems));
          setRxEditorOpen(false);
        }}
      />
    </Stack>
  );
}
