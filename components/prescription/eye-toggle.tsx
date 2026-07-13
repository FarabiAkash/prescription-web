"use client";

import { ToggleButton, ToggleButtonGroup } from "@mui/material";

export default function EyeToggle({
  value,
  onChange,
  size = "medium",
}: {
  value: string;
  onChange: (next: string) => void;
  size?: "small" | "medium";
}) {
  const selection =
    value === "Both"
      ? ["L", "R"]
      : value === "Left"
        ? ["L"]
        : value === "Right"
          ? ["R"]
          : [];

  function handleChange(_event: React.MouseEvent<HTMLElement>, next: string[]) {
    if (next.includes("L") && next.includes("R")) {
      onChange("Both");
    } else if (next.includes("L")) {
      onChange("Left");
    } else if (next.includes("R")) {
      onChange("Right");
    } else {
      onChange("");
    }
  }

  return (
    <ToggleButtonGroup
      value={selection}
      onChange={handleChange}
      size={size}
      aria-label="Which eye"
      sx={{
        "& .MuiToggleButton-root": {
          px: 1.5,
        },
        "& .MuiToggleButton-root.Mui-selected": {
          backgroundColor: "success.main",
          color: "success.contrastText",
          "&:hover": {
            backgroundColor: "success.dark",
          },
        },
      }}
    >
      <ToggleButton value="L" aria-label="Left eye">
        L
      </ToggleButton>
      <ToggleButton value="R" aria-label="Right eye">
        R
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
