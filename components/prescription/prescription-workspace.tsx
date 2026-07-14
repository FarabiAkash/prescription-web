"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PrintIcon from "@mui/icons-material/Print";
import Image from "next/image";
import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import type {
  DiagnosisRecord,
  MedicineRecord,
  MedicineSetRecord,
  PatientRecord,
  SessionUser,
} from "@/types/portal";
import SectionEditorDialog from "@/components/prescription/section-editor-dialog";
import MedicineEditorDialog from "@/components/prescription/medicine-editor-dialog";
import DiagnosisPickerDialog from "@/components/prescription/diagnosis-picker-dialog";
import GlassPredictionDialog from "@/components/prescription/glass-prediction-dialog";
import RichTextContent from "@/components/prescription/rich-text-content";
import { isRichTextEmpty } from "@/lib/sanitize-html";
import { parseRxItems, stringifyRxItems } from "@/lib/rx";
import { parseDiagnosisItems, stringifyDiagnosisItems } from "@/lib/diagnosis";
import {
  parseGlassPrediction,
  stringifyGlassPrediction,
  isGlassPredictionEmpty,
  type GlassRow,
} from "@/lib/glass-prediction";

function actionIconSx(color: "primary" | "success" | "info") {
  return (theme: Theme) => ({
    p: 0.3,
    border: "1px solid",
    borderColor: theme.palette[color].main,
    backgroundColor: alpha(theme.palette[color].main, 0.12),
    transition: "background-color 0.15s ease",
    "&:hover": {
      backgroundColor: alpha(theme.palette[color].main, 0.26),
    },
  });
}

const EYE_ABBREVIATIONS: Record<string, string> = {
  Left: "LE",
  Right: "RE",
  Both: "BE",
};

function formatEyeAbbreviation(eye: string): string {
  return EYE_ABBREVIATIONS[eye] ?? eye;
}

type SectionKey =
  | "complaintsSummary"
  | "complaintsDetail"
  | "visionSummary"
  | "visionDetail"
  | "refractionSummary"
  | "refractionDetail"
  | "historySummary"
  | "historyDetail"
  | "investigation"
  | "plan"
  | "advice"
  | "followUp";

const TAB_TO_SECTION: Record<string, { key: SectionKey; title: string }> = {
  complaints: { key: "complaintsDetail", title: "Complaints Details" },
  vision: { key: "visionDetail", title: "Vision Details" },
  refraction: { key: "refractionDetail", title: "Refraction Details" },
  history: { key: "historyDetail", title: "History Details" },
  advice: { key: "advice", title: "Advice" },
};

const LEFT_SECTIONS: Array<{
  title: string;
  summaryKey: keyof PatientRecord;
  detailKey: keyof PatientRecord;
}> = [
  {
    title: "Complaints: ",
    summaryKey: "complaintsSummary",
    detailKey: "complaintsDetail",
  },
  {
    title: "Vision: ",
    summaryKey: "visionSummary",
    detailKey: "visionDetail",
  },
  {
    title: "History: ",
    summaryKey: "historySummary",
    detailKey: "historyDetail",
  },
  {
    title: "Refraction: ",
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
  sets,
  diagnoses,
  hospital,
  today,
  now,
  initialPatient,
}: {
  session: SessionUser;
  medicines: MedicineRecord[];
  sets: MedicineSetRecord[];
  diagnoses: DiagnosisRecord[];
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
  const [diagnosisEditorOpen, setDiagnosisEditorOpen] = useState(false);
  const [glassPredictionEditorOpen, setGlassPredictionEditorOpen] =
    useState(false);

  const rxItems = useMemo(() => parseRxItems(patient?.rx ?? ""), [patient?.rx]);
  const diagnosisItems = useMemo(
    () => parseDiagnosisItems(patient?.diagnosis ?? ""),
    [patient?.diagnosis],
  );
  const glassPrediction = useMemo(
    () => parseGlassPrediction(patient?.glassPrediction ?? ""),
    [patient?.glassPrediction],
  );

  const tabMapping = tab ? TAB_TO_SECTION[tab] : undefined;
  const activeEditor: EditorState | null =
    editor ??
    (tabMapping && patient
      ? { key: tabMapping.key, title: tabMapping.title, open: true }
      : null);
  const diagnosisDialogOpen = diagnosisEditorOpen || tab === "diagnosis";

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

  function closeDiagnosisEditor() {
    setDiagnosisEditorOpen(false);
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
          position: "relative",
          p: { xs: 1.25, md: 1.75 },
          px: { xs: 2, sm: 3, md: 4 },
          border: "1px solid #d8e2eb",
        }}
      >
        <Tooltip title="Print prescription">
          <IconButton
            onClick={() => window.print()}
            className="no-print"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 1,
              color: "primary.main",
              backgroundColor: "transparent",
              border: "1px solid",
              borderColor: "primary.main",
              transition: "background-color 0.15s ease, color 0.15s ease",
              "&:hover": {
                backgroundColor: "primary.main",
                color: "primary.contrastText",
              },
            }}
          >
            <PrintIcon fontSize="small" />
          </IconButton>
        </Tooltip>
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
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 24 }}>
                {hospital.hospitalName}
              </Typography>
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: 13 }}
            >
              {hospital.address} | {hospital.contact} |{" "}
              <Box
                component="a"
                href={hospital.website}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: "primary.main" }}
              >
                {hospital.website}
              </Box>
            </Typography>
            <Box
              sx={{
                position: "relative",
                alignSelf: "stretch",
                display: "flex",
                justifyContent: "center",
                mt: 0.25,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 24 }}>
                Prescription Sheet
              </Typography>
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  right: 3,
                  top: "50%",
                  transform: "translateY(-50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.25,
                  "@media print": { display: "flex" },
                }}
              >
                <Box
                  sx={{
                    width: 100,
                    height: 26,
                    backgroundImage:
                      "repeating-linear-gradient(90deg, #111 0px, #111 2px, transparent 2px, transparent 4px, #111 4px, #111 5px, transparent 5px, transparent 9px, #111 9px, #111 12px, transparent 12px, transparent 14px, #111 14px, #111 15px, transparent 15px, transparent 18px)",
                  }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: 8, letterSpacing: 1 }}
                >
                  0000 506025
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 0.5,
              "@media print": {
                gridTemplateColumns: "1fr 1fr",
              },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 16 }}>
              Name: {patient?.patientName ?? "-"}
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "flex-start", md: "flex-end" },
                "@media print": { justifyContent: "flex-end" },
                gap: 2,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, fontSize: 16 }}
              >
                UIN: {patient?.patientCode ?? "-"}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: 16 }}>
                <Box component="span" sx={{ fontWeight: 700 }}>
                  MRN:
                </Box>{" "}
                {patient?.mrn ?? "-"}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 16 }}>
              {patient?.sex ?? "-"}, Age {patient?.age ?? "-"}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                fontSize: 16,
                textAlign: { xs: "left", md: "right" },
                "@media print": { textAlign: "right" },
              }}
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
              "@media print": {
                gridTemplateColumns: "3fr auto 7fr",
              },
            }}
          >
            <Stack spacing={0.75} sx={{ height: "100%" }}>
              {LEFT_SECTIONS.map((section) => {
                const summary = String(patient?.[section.summaryKey] ?? "");
                const hasSummary = !isRichTextEmpty(summary);
                const isHistory = section.title === "History";
                return (
                  <Box key={section.title} sx={{ p: 0.75 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 0.5,
                          minWidth: 0,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            fontSize: 14,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {section.title}
                          {isHistory ? ":" : ""}
                        </Typography>
                        {isHistory && hasSummary ? (
                          <RichTextContent
                            html={summary}
                            sx={{
                              display: "inline",
                              fontSize: 13,
                              color: "text.secondary",
                              "& ul": {
                                display: "inline",
                                listStyleType: "none",
                                pl: 0,
                                m: 0,
                              },
                              "& li": { display: "inline" },
                            }}
                          />
                        ) : null}
                      </Box>
                      <Box sx={{ display: "flex", gap: 0.25 }}>
                        <Tooltip
                          title={hasSummary ? "Edit summary" : "Add summary"}
                        >
                          <IconButton
                            size="small"
                            color={hasSummary ? "primary" : "success"}
                            sx={actionIconSx(
                              hasSummary ? "primary" : "success",
                            )}
                            onClick={() =>
                              setEditor({
                                key: section.summaryKey as SectionKey,
                                title: `${section.title} Summary`,
                                open: true,
                              })
                            }
                          >
                            {hasSummary ? (
                              <EditIcon sx={{ fontSize: 16 }} />
                            ) : (
                              <AddIcon sx={{ fontSize: 16 }} />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View/Edit details">
                          <IconButton
                            size="small"
                            color="info"
                            sx={actionIconSx("info")}
                            onClick={() =>
                              setEditor({
                                key: section.detailKey as SectionKey,
                                title: `${section.title} Details`,
                                open: true,
                              })
                            }
                          >
                            <VisibilityIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    {!isHistory && hasSummary ? (
                      <RichTextContent
                        html={summary}
                        sx={{
                          mt: 0.25,
                          fontSize: 13,
                          color: "text.secondary",
                        }}
                      />
                    ) : null}
                  </Box>
                );
              })}

              <Box sx={{ p: 0.75 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, fontSize: 14 }}
                  >
                    Diagnosis:{" "}
                  </Typography>
                  <IconButton
                    size="small"
                    color={diagnosisItems.length > 0 ? "primary" : "success"}
                    sx={actionIconSx(
                      diagnosisItems.length > 0 ? "primary" : "success",
                    )}
                    onClick={() => setDiagnosisEditorOpen(true)}
                  >
                    {diagnosisItems.length > 0 ? (
                      <EditIcon sx={{ fontSize: 16 }} />
                    ) : (
                      <AddIcon sx={{ fontSize: 16 }} />
                    )}
                  </IconButton>
                </Box>
                {diagnosisItems.length > 0 ? (
                  <Stack
                    component="ul"
                    spacing={0.25}
                    sx={{
                      mt: 0.25,
                      pl: 2,
                      m: 0,
                      listStyleType: "disc",
                      "& li": { listStylePosition: "outside" },
                    }}
                  >
                    {diagnosisItems.map((item) => (
                      <Box component="li" key={item.id}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: 13 }}
                        >
                          {item.name}
                          {item.eye
                            ? ` (${formatEyeAbbreviation(item.eye)})`
                            : ""}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : null}
              </Box>

              {[
                ["Investigation: ", "investigation"],
                ["Plan: ", "plan"],
              ].map(([label, key]) => {
                const content = String(
                  patient?.[key as keyof PatientRecord] ?? "",
                );
                const hasContent = !isRichTextEmpty(content);
                return (
                  <Box key={label} sx={{ p: 0.75 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, fontSize: 14 }}
                      >
                        {label}
                      </Typography>
                      <IconButton
                        size="small"
                        color={hasContent ? "primary" : "success"}
                        sx={actionIconSx(hasContent ? "primary" : "success")}
                        onClick={() =>
                          setEditor({
                            key: key as SectionKey,
                            title: label,
                            open: true,
                          })
                        }
                      >
                        {hasContent ? (
                          <EditIcon sx={{ fontSize: 16 }} />
                        ) : (
                          <AddIcon sx={{ fontSize: 16 }} />
                        )}
                      </IconButton>
                    </Box>
                    {hasContent ? (
                      <RichTextContent
                        html={content}
                        sx={{
                          mt: 0.25,
                          fontSize: 13,
                          color: "text.secondary",
                        }}
                      />
                    ) : null}
                  </Box>
                );
              })}
            </Stack>

            <Divider
              orientation="vertical"
              flexItem
              sx={{
                display: { xs: "none", lg: "block" },
                "@media print": {
                  display: "block",
                },
              }}
            />

            <Stack
              spacing={0.75}
              sx={{ height: "100%", "& > :last-child": { mt: "auto" } }}
            >
              <Box sx={{ p: 0.75, minHeight: "40%", flexShrink: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, fontSize: 14 }}
                  >
                    Rx.
                  </Typography>
                  <IconButton
                    size="small"
                    color={rxItems.length > 0 ? "primary" : "success"}
                    sx={actionIconSx(
                      rxItems.length > 0 ? "primary" : "success",
                    )}
                    onClick={() => setRxEditorOpen(true)}
                  >
                    {rxItems.length > 0 ? (
                      <EditIcon sx={{ fontSize: 16 }} />
                    ) : (
                      <AddIcon sx={{ fontSize: 16 }} />
                    )}
                  </IconButton>
                </Box>
                {rxItems.length > 0 ? (
                  <Stack
                    component="ol"
                    spacing={0.5}
                    sx={{
                      mt: 0.5,
                      pl: 2,
                      m: 0,
                      listStyleType: "decimal",
                      "& li": { listStylePosition: "outside" },
                    }}
                  >
                    {rxItems.map((item) => {
                      const usageParts = [
                        [item.dosage, item.frequency]
                          .filter(Boolean)
                          .join(" X "),
                        item.eye ? `${item.eye} eye` : "",
                        item.duration,
                      ].filter(Boolean);
                      return (
                        <Box key={item.id} component="li">
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              fontSize: 14,
                              display: "block",
                            }}
                          >
                            {item.medicine}
                          </Typography>
                          {usageParts.length > 0 ? (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: 13, display: "block" }}
                            >
                              {usageParts.join(" --------------- ")}
                            </Typography>
                          ) : null}
                        </Box>
                      );
                    })}
                  </Stack>
                ) : (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "block", fontSize: 13 }}
                  >
                    No medicine selected yet.
                  </Typography>
                )}
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: 1,
                  justifyContent: "space-evenly",
                  gap: 0.75,
                }}
              >
                <Box sx={{ p: 0.75 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, fontSize: 14 }}
                    >
                      Glass Prediction:
                    </Typography>
                    <IconButton
                      size="small"
                      color={
                        isGlassPredictionEmpty(glassPrediction)
                          ? "success"
                          : "primary"
                      }
                      sx={actionIconSx(
                        isGlassPredictionEmpty(glassPrediction)
                          ? "success"
                          : "primary",
                      )}
                      onClick={() => setGlassPredictionEditorOpen(true)}
                    >
                      {isGlassPredictionEmpty(glassPrediction) ? (
                        <AddIcon sx={{ fontSize: 16 }} />
                      ) : (
                        <EditIcon sx={{ fontSize: 16 }} />
                      )}
                    </IconButton>
                  </Box>
                  <Table
                    size="small"
                    sx={{
                      mt: 0.5,
                      "& td, & th": {
                        border: "1px solid",
                        borderColor: "divider",
                        p: 0.25,
                        fontSize: 12,
                        textAlign: "center",
                      },
                      "& th": { fontWeight: 700 },
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell colSpan={2} />
                        <TableCell component="th">SPH</TableCell>
                        <TableCell component="th">CYL</TableCell>
                        <TableCell component="th">AXIS</TableCell>
                        <TableCell component="th">V/A</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell rowSpan={2} sx={{ fontWeight: 700 }}>
                          DIST
                        </TableCell>
                        <TableCell>R</TableCell>
                        {(
                          ["sph", "cyl", "axis", "va"] as Array<keyof GlassRow>
                        ).map((field) => (
                          <TableCell key={field}>
                            {glassPrediction.dist.right[field] || "-"}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell>L</TableCell>
                        {(
                          ["sph", "cyl", "axis", "va"] as Array<keyof GlassRow>
                        ).map((field) => (
                          <TableCell key={field}>
                            {glassPrediction.dist.left[field] || "-"}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                  {glassPrediction.notes ? (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5, display: "block", fontSize: 13 }}
                    >
                      {glassPrediction.notes}
                    </Typography>
                  ) : null}
                </Box>

                {[
                  ["Advice:", "advice"],
                  ["Follow Up:", "followUp"],
                ].map(([label, key]) => {
                  const content = String(
                    patient?.[key as keyof PatientRecord] ?? "",
                  );
                  const hasContent = !isRichTextEmpty(content);
                  return (
                    <Box key={label} sx={{ p: 0.75 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, fontSize: 14 }}
                        >
                          {label}
                        </Typography>
                        <IconButton
                          size="small"
                          color={hasContent ? "primary" : "success"}
                          sx={actionIconSx(hasContent ? "primary" : "success")}
                          onClick={() =>
                            setEditor({
                              key: key as SectionKey,
                              title: label,
                              open: true,
                            })
                          }
                        >
                          {hasContent ? (
                            <EditIcon sx={{ fontSize: 16 }} />
                          ) : (
                            <AddIcon sx={{ fontSize: 16 }} />
                          )}
                        </IconButton>
                      </Box>
                      {hasContent ? (
                        <RichTextContent
                          html={content}
                          sx={{
                            mt: 0.25,
                            fontSize: 13,
                            color: "text.secondary",
                          }}
                        />
                      ) : null}
                    </Box>
                  );
                })}
              </Box>

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
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, fontSize: 14 }}
                  >
                    {session.doctorName}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: 13 }}
                  >
                    {session.designation} | Reg: {session.registrationNumber} |{" "}
                    {session.specialization}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: 13 }}
                  >
                    {today} at {now}
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
        sets={sets}
        initialItems={rxItems}
        onCancel={() => setRxEditorOpen(false)}
        onSave={async (nextItems) => {
          await saveField("rx", stringifyRxItems(nextItems));
          setRxEditorOpen(false);
        }}
      />

      <DiagnosisPickerDialog
        key={`dx-${patient?.patientCode ?? "none"}-${patient?.diagnosis ?? ""}`}
        open={diagnosisDialogOpen}
        diagnoses={diagnoses}
        favorites={session.favoriteDiagnoses ?? []}
        initialItems={diagnosisItems}
        onCancel={closeDiagnosisEditor}
        onSave={async (nextItems) => {
          await saveField("diagnosis", stringifyDiagnosisItems(nextItems));
          closeDiagnosisEditor();
        }}
      />

      <GlassPredictionDialog
        key={`gp-${patient?.patientCode ?? "none"}-${patient?.glassPrediction ?? ""}`}
        open={glassPredictionEditorOpen}
        initialValue={glassPrediction}
        onCancel={() => setGlassPredictionEditorOpen(false)}
        onSave={async (next) => {
          await saveField("glassPrediction", stringifyGlassPrediction(next));
          setGlassPredictionEditorOpen(false);
        }}
      />
    </Stack>
  );
}
