import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  Menu,
  MenuItem,
  Paper,
} from "@mui/material";
import CopyIcon from "@mui/icons-material/ContentCopy";
import { TreeMap, TreeNode } from "../utils/requestHierarchyTree";
import { NodeData } from "../types/interfaces";

interface AWSSupportProps {
  hierarchy: TreeMap<NodeData>;
}

const AWSSupport: React.FC<AWSSupportProps> = ({ hierarchy }) => {
  const [open, setOpen] = useState(false);
  const [copiedData, setCopiedData] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedData(text);
    setOpen(true);
    setAnchorEl(null);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const formatAWSData = (data: NodeData, format: "text" | "markdown") => {
    const formattedData = `
      Origin: ${data.origin || "N/A"}
      User-Agent: ${data.userAgent || "N/A"}
      Start Time: ${new Date(data.startTime).toUTCString() || "N/A"}
      End Time: ${new Date(data.endTime).toUTCString() || "N/A"}
      Request ID: ${data.requestId || "N/A"}
      Analysis ID: ${data.analysisId || "N/A"}
      Dashboard ID: ${data.dashboardId || "N/A"}
      Datasource ID: ${data.dataSourceId || "N/A"}
      Sheet ID: ${data.sheetId || "N/A"}
      Visual ID: ${data.visualId || "N/A"}
      Visual Type: ${data.visualType || "N/A"}
    `;

    if (format === "markdown") {
      return `
        **Origin**: ${data.origin || "N/A"}
        **User-Agent**: ${data.userAgent || "N/A"}
        **Start Time**: ${new Date(data.startTime).toUTCString() || "N/A"}
        **End Time**: ${new Date(data.endTime).toUTCString() || "N/A"}
        **Request ID**: ${data.requestId || "N/A"}
        **Analysis ID**: ${data.analysisId || "N/A"}
        **Dashboard ID**: ${data.dashboardId || "N/A"}
        **Datasource ID**: ${data.dataSourceId || "N/A"}
        **Sheet ID**: ${data.sheetId || "N/A"}
        **Visual ID**: ${data.visualId || "N/A"}
        **Visual Type**: ${data.visualType || "N/A"}
      `;
    }

    return formattedData;
  };

  if (!hierarchy?.root) {
    console.error("Hierarchy root is undefined");
    return null;
  }

  const requestNode = hierarchy.root;
  const data = requestNode.data;

  return (
    <Box p={2}>
      <Box mt={2} component={Paper} elevation={2} p={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body1">
            Origin: {data.origin || "N/A"}
          </Typography>
          <Tooltip title="Copy to Clipboard">
            <IconButton onClick={handleMenuClick}>
              <CopyIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Typography variant="body1">
          User-Agent: {data.userAgent || "N/A"}
        </Typography>
        <Typography variant="body1">
          Start Time: {new Date(data.startTime).toUTCString() || "N/A"}
        </Typography>
        <Typography variant="body1">
          End Time: {new Date(data.endTime).toUTCString() || "N/A"}
        </Typography>
        <Typography variant="body1">
          Request ID: {data.requestId || "N/A"}
        </Typography>
        <Typography variant="body1">
          Analysis ID: {data.analysisId || "N/A"}
        </Typography>
        <Typography variant="body1">
          Dashboard ID: {data.dashboardId || "N/A"}
        </Typography>
        <Typography variant="body1">
          Datasource ID: {data.dataSourceId || "N/A"}
        </Typography>
        <Typography variant="body1">
          Sheet ID: {data.sheetId || "N/A"}
        </Typography>
        <Typography variant="body1">
          Visual ID: {data.visualId || "N/A"}
        </Typography>
        <Typography variant="body1">
          Visual Type: {data.visualType || "N/A"}
        </Typography>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
        >
          <MenuItem onClick={() => handleCopy(formatAWSData(data, "text"))}>
            Copy as Text
          </MenuItem>
          <MenuItem onClick={() => handleCopy(formatAWSData(data, "markdown"))}>
            Copy as Markdown
          </MenuItem>
        </Menu>
      </Box>
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Copied AWS Support Data</DialogTitle>
        <DialogContent>
          <Box
            component="pre"
            sx={{
              whiteSpace: "pre-wrap",
              margin: 0,
              maxHeight: "500px",
              overflowY: "auto",
            }}
          >
            {copiedData}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AWSSupport;
