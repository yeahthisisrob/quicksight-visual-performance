import React from "react";
import { Box, Typography } from "@mui/material";

interface BadgeProps {
  text: string;
  color: string;
}

const Badge: React.FC<BadgeProps> = ({ text, color }) => {
  return (
    <Box
      sx={{
        ml: 1,
        px: 1,
        py: 0.5,
        borderRadius: 1,
        bgcolor: color,
        color: "primary.contrastText",
      }}
    >
      <Typography variant="body2">{text}</Typography>
    </Box>
  );
};

export default Badge;
