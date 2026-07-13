"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Box,
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
  }

  return (
    <Stack spacing={1.5}>
      <Paper
        className="rx-paper"
        sx={{
          p: { xs: 1.25, md: 1.75 },
          px: { xs: 2, sm: 3, md: 4 },
          border: "1px solid #d8e2eb",
        }}
      >
        <Stack spacing={1} sx={{ height: "100%" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 0.25,
            }}
          >
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Image
                src="/images/logo.jpg"
                alt="Hospital Logo"
                width={40}
                height={40}
              />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {hospital.hospitalName}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {hospital.address}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {hospital.contact} | {hospital.website}
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.25, fontWeight: 700 }}>
              Prescription Sheet
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 0.5,
            }}
          >
            <Typography variant="body2">
              Name: {patient?.patientName ?? "-"}
            </Typography>
            <Typography
              variant="body2"
              sx={{ textAlign: { xs: "left", md: "right" } }}
            >
              ID: {patient?.patientCode ?? "-"}
            </Typography>
            <Typography variant="body2">
              Details: {patient?.sex ?? "-"}, Age {patient?.age ?? "-"}
            </Typography>
            <Typography
              variant="body2"
              sx={{ textAlign: { xs: "left", md: "right" } }}
            >
              Date: {today}
            </Typography>
          </Box>

          <Divider />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "3fr auto 7fr" },
              gap: 1.25,
              flexGrow: 1,
              alignItems: "stretch",
            }}
          >
            <Stack spacing={0.75} sx={{ height: "100%" }}>
              {LEFT_SECTIONS.map((section) => {
                const summary = String(patient?.[section.summaryKey] ?? "");
                const detail = String(patient?.[section.detailKey] ?? "");
                return (
                  <Box key={section.title} sx={{ p: 0.75 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {section.title}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.25 }}>
                        <Tooltip
                          title={summary ? "Edit summary" : "Add summary"}
                        >
                          <IconButton
                            size="small"
                            sx={{ p: 0.25 }}
                            onClick={() =>
                              setEditor({
                                key: section.summaryKey as SectionKey,
                                title: `${section.title} Summary`,
                                open: true,
                              })
                            }
                          >
                            {summary ? (
                              <EditIcon sx={{ fontSize: 14 }} />
                            ) : (
                              <AddIcon sx={{ fontSize: 14 }} />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View/Edit details">
                          <IconButton
                            size="small"
                            sx={{ p: 0.25 }}
                            onClick={() =>
                              setEditor({
                                key: section.detailKey as SectionKey,
                                title: `${section.title} Details`,
                                open: true,
                              })
                            }
                          >
                            <VisibilityIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <RichTextContent
                      html={summary || "No summary yet."}
                      sx={{
                        mt: 0.25,
                        fontSize: 11,
                        color: "text.secondary",
                      }}
                    />
                    {detail ? (
                      <RichTextContent
                        html={detail}
                        sx={{ fontSize: 10, color: "text.secondary" }}
                      />
                    ) : null}
                  </Box>
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
                  <Box key={label} sx={{ p: 0.75 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {label}
                      </Typography>
                      <IconButton
                        size="small"
                        sx={{ p: 0.25 }}
                        onClick={() =>
                          setEditor({
                            key: key as SectionKey,
                            title: label,
                            open: true,
                          })
                        }
                      >
                        {content ? (
                          <EditIcon sx={{ fontSize: 14 }} />
                        ) : (
                          <AddIcon sx={{ fontSize: 14 }} />
                        )}
                      </IconButton>
                    </Box>
                    <RichTextContent
                      html={content || "No entry yet."}
                      sx={{
                        mt: 0.25,
                        fontSize: 11,
                        color: "text.secondary",
                      }}
                    />
                  </Box>
                );
              })}
            </Stack>

            <Divider
              orientation="vertical"
              flexItem
              sx={{ display: { xs: "none", lg: "block" } }}
            />

            <Stack
              spacing={0.75}
              sx={{ height: "100%", "& > :last-child": { mt: "auto" } }}
            >
              <Box sx={{ p: 0.75 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="subtitle2">Rx.</Typography>
                  <IconButton
                    size="small"
                    sx={{ p: 0.25 }}
                    onClick={() => setRxEditorOpen(true)}
                  >
                    {rxItems.length > 0 ? (
                      <EditIcon sx={{ fontSize: 14 }} />
                    ) : (
                      <AddIcon sx={{ fontSize: 14 }} />
                    )}
                  </IconButton>
                </Box>
                {rxItems.length > 0 ? (
                  <Stack
                    component="ul"
                    spacing={0.25}
                    sx={{ mt: 0.5, pl: 2, m: 0 }}
                  >
                    {rxItems.map((item) => (
                      <Typography
                        key={item.id}
                        component="li"
                        variant="caption"
                      >
                        {formatRxItem(item)}
                      </Typography>
                    ))}
                  </Stack>
                ) : (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    No medicine selected yet.
                  </Typography>
                )}
              </Box>

              {[
                ["Glass Prediction", "glassPrediction"],
                ["Advice", "advice"],
                ["Follow Up", "followUp"],
              ].map(([label, key]) => {
                const content = String(
                  patient?.[key as keyof PatientRecord] ?? "",
                );
                return (
                  <Box key={label} sx={{ p: 0.75 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {label}
                      </Typography>
                      <IconButton
                        size="small"
                        sx={{ p: 0.25 }}
                        onClick={() =>
                          setEditor({
                            key: key as SectionKey,
                            title: label,
                            open: true,
                          })
                        }
                      >
                        {content ? (
                          <EditIcon sx={{ fontSize: 14 }} />
                        ) : (
                          <AddIcon sx={{ fontSize: 14 }} />
                        )}
                      </IconButton>
                    </Box>
                    <RichTextContent
                      html={content || "No entry yet."}
                      sx={{
                        mt: 0.25,
                        fontSize: 11,
                        color: "text.secondary",
                      }}
                    />
                  </Box>
                );
              })}

              <Box>
                <Divider sx={{ mb: 1 }} />

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    gap: 0.1,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    {session.doctorName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {session.designation} | Reg: {session.registrationNumber} |{" "}
                    {session.specialization}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Generated: {today} {now}
                  </Typography>
                </Box>
              </Box>
            </Stack>
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
