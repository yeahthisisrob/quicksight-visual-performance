import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

interface ProgressLogProps {
  steps: { label: string; status: "pending" | "done" }[];
  fileSize: number | null;
  messageCount: number | null;
  dashboardCount: number | null;
  analysisCount: number | null;
  sheetCount: number | null;
  visualCount: number | null;
  requestCount: number | null;
  elapsedTime: number | null;
}

const ProgressLog: React.FC<ProgressLogProps> = ({
  steps,
  fileSize,
  messageCount,
  dashboardCount,
  analysisCount,
  sheetCount,
  visualCount,
  requestCount,
  elapsedTime,
}) => {
  const formatFileSize = (size: number | null) => {
    if (size === null) return "N/A";
    const inMB = size / (1024 * 1024); // Convert bytes to megabytes
    return `${inMB.toFixed(2)} MB`;
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 600, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Analysis Progress
      </Typography>
      <List>
        {steps.map((step, index) => (
          <ListItem key={index}>
            <ListItemIcon>
              {step.status === "done" ? (
                <CheckCircleIcon color="success" />
              ) : (
                <HourglassEmptyIcon color="disabled" />
              )}
            </ListItemIcon>
            <ListItemText primary={step.label} />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Typography variant="body1">
        File Size: {formatFileSize(fileSize)}
      </Typography>
      <Typography variant="body1">
        Messages Parsed: {messageCount !== null ? messageCount : "N/A"}
      </Typography>
      <Typography variant="body1">
        Dashboards: {dashboardCount !== null ? dashboardCount : "N/A"}
      </Typography>
      <Typography variant="body1">
        Analyses: {analysisCount !== null ? analysisCount : "N/A"}
      </Typography>
      <Typography variant="body1">
        Sheets: {sheetCount !== null ? sheetCount : "N/A"}
      </Typography>
      <Typography variant="body1">
        Visuals: {visualCount !== null ? visualCount : "N/A"}
      </Typography>
      <Typography variant="body1">
        Requests: {requestCount !== null ? requestCount : "N/A"}
      </Typography>
      <Typography variant="body1">
        Elapsed Time:{" "}
        {elapsedTime !== null
          ? `${(elapsedTime / 1000).toFixed(2)} seconds`
          : "N/A"}
      </Typography>
    </Box>
  );
};

export default ProgressLog;
