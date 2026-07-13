"use client";

import { useEffect, useRef } from "react";
import { Box, IconButton, Paper, Tooltip } from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import { sanitizeRichText } from "@/lib/sanitize-html";

export const EMPTY_BULLET_LIST = "<ul><li><br></li></ul>";

/**
 * Guarantees the content is always a single <ul> of <li> items. If the user
 * (via browser default contentEditable behavior, e.g. pressing Enter twice
 * on an empty item, or pasting) breaks out of the list, this rebuilds the
 * content back into a bullet list, treating each stray block/text run as
 * its own list item.
 */
function ensureBulletList(html: string): string {
  const container = document.createElement("div");
  container.innerHTML = html;

  const topLevel = Array.from(container.childNodes).filter(
    (node) => node.nodeType !== Node.TEXT_NODE || node.textContent?.trim(),
  );

  if (
    topLevel.length === 1 &&
    topLevel[0].nodeType === Node.ELEMENT_NODE &&
    (topLevel[0] as Element).tagName === "UL"
  ) {
    return container.innerHTML;
  }

  const items: Element[] = [];

  const collect = (node: ChildNode) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? "";
      if (text.trim()) {
        const li = document.createElement("li");
        li.textContent = text;
        items.push(li);
      }
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    const el = node as Element;
    if (el.tagName === "UL" || el.tagName === "OL") {
      Array.from(el.children).forEach((child) => {
        if (child.tagName === "LI") {
          items.push(child.cloneNode(true) as Element);
        }
      });
      return;
    }

    if (el.tagName === "LI") {
      items.push(el.cloneNode(true) as Element);
      return;
    }

    if (el.tagName === "BR") {
      return;
    }

    if (el.innerHTML.trim()) {
      const li = document.createElement("li");
      li.innerHTML = el.innerHTML;
      items.push(li);
    }
  };

  Array.from(container.childNodes).forEach(collect);

  const ul = document.createElement("ul");
  if (items.length === 0) {
    items.push(document.createElement("li"));
  }
  items.forEach((item) => ul.appendChild(item));

  return ul.outerHTML;
}

function placeCaretAtEnd(element: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

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
    const initialHtml = ensureBulletList(
      sanitizeRichText(value.trim() ? value : EMPTY_BULLET_LIST),
    );
    editorRef.current.innerHTML = initialHtml;
    onChange(initialHtml);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyChange(rawHtml: string) {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }
    const sanitized = sanitizeRichText(rawHtml);
    const normalized = ensureBulletList(sanitized);
    if (normalized !== rawHtml) {
      editor.innerHTML = normalized;
      placeCaretAtEnd(editor);
    }
    onChange(normalized);
  }

  function exec(command: string) {
    editorRef.current?.focus();
    document.execCommand(command);
    if (editorRef.current) {
      applyChange(editorRef.current.innerHTML);
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
      </Box>
      <Box
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(event) => applyChange(event.currentTarget.innerHTML)}
        sx={{
          minHeight,
          maxHeight: 420,
          overflowY: "auto",
          px: 2,
          py: 1.5,
          fontSize: 14,
          lineHeight: 1.6,
          color: "text.primary",
          outline: "none",
          "& ul": { pl: 3, m: 0, listStyleType: "disc" },
          "& ol": { pl: 3, m: 0, listStyleType: "decimal" },
          "& li": { listStylePosition: "outside" },
        }}
      />
    </Paper>
  );
}
