import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { ensureBulletHtml, sanitizeRichText } from "@/lib/sanitize-html";

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
        "& ul": { pl: 2.5, m: 0, listStyleType: "disc" },
        "& ol": { pl: 2.5, m: 0, listStyleType: "decimal" },
        "& li": { listStylePosition: "outside" },
        "& p": { m: 0 },
        ...sx,
      }}
      dangerouslySetInnerHTML={{
        __html: ensureBulletHtml(sanitizeRichText(html)),
      }}
    />
  );
}
