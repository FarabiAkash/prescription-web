import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { sanitizeRichText } from "@/lib/sanitize-html";

export default function RichTextContent({
  html,
  sx,
}: {
  html: string;
  sx?: SxProps<Theme>;
}) {
  return (
    <Box
      sx={{
        "& ul, & ol": { pl: 2.5, m: 0 },
        "& p": { m: 0 },
        ...sx,
      }}
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(html) }}
    />
  );
}
