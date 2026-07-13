"use client";

import { useEffect, useRef } from "react";
import { Box, Divider, IconButton, Paper, Tooltip } from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import { sanitizeRichText } from "@/lib/sanitize-html";

export const EMPTY_BULLET_LIST = "<ul><li><br></li></ul>";

export default function RichTextEditor({
  value,
  onChange,
  minHeight = 160,
}: {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !editorRef.current) {
      return;
    }
    initialized.current = true;
    const initialHtml = value.trim() ? value : EMPTY_BULLET_LIST;
    editorRef.current.innerHTML = initialHtml;
    if (!value.trim()) {
      onChange(initialHtml);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exec(command: string) {
    editorRef.current?.focus();
    document.execCommand(command);
    if (editorRef.current) {
      onChange(sanitizeRichText(editorRef.current.innerHTML));
    }
  }

  return (
    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          px: 1,
          py: 0.5,
          borderBottom: "1px solid #e3eaf0",
          backgroundColor: "#f8fafc",
        }}
      >
        <Tooltip title="Bold">
          <IconButton size="small" onClick={() => exec("bold")}>
            <FormatBoldIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Italic">
          <IconButton size="small" onClick={() => exec("italic")}>
            <FormatItalicIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Underline">
          <IconButton size="small" onClick={() => exec("underline")}>
            <FormatUnderlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />
        <Tooltip title="Bulleted list">
          <IconButton size="small" onClick={() => exec("insertUnorderedList")}>
            <FormatListBulletedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Numbered list">
          <IconButton size="small" onClick={() => exec("insertOrderedList")}>
            <FormatListNumberedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Box
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(event) =>
          onChange(sanitizeRichText(event.currentTarget.innerHTML))
        }
        sx={{
          minHeight,
          maxHeight: 420,
          overflowY: "auto",
          px: 2,
          py: 1.5,
          fontSize: 14,
          lineHeight: 1.6,
          outline: "none",
          "& ul, & ol": { pl: 3, m: 0 },
        }}
      />
    </Paper>
  );
}
