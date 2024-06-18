import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import { NodeData } from "../types/interfaces";
import { TreeMap, TreeNode } from "../utils/requestHierarchyTree";

interface SummaryProps {
  hierarchy: TreeMap<NodeData>;
}

const Summary: React.FC<SummaryProps> = ({ hierarchy }) => {
  const findRequestNode = (
    node: TreeNode<NodeData>,
  ): TreeNode<NodeData> | null => {
    if (!node || !node.children) {
      return null;
    }
    if (node.children.size === 0 && node.data.startTime) {
      return node;
    }
    const childrenArray = Array.from(node.children.values());
    for (const child of childrenArray) {
      const result = findRequestNode(child);
      if (result) {
        return result;
      }
    }
    return null;
  };

  if (!hierarchy?.root) {
    console.error("Hierarchy root is undefined");
    return null;
  }

  const nodeDetails = findRequestNode(hierarchy.root);

  if (!nodeDetails) {
    return <Typography variant="body2">No data available.</Typography>;
  }

  const {
    dashboardId,
    analysisId,
    sheetId,
    visualId,
    visualType,
    startTime,
    endTime,
    duration,
    calculatedFields,
    dashboardName,
    analysisName,
    sheetName,
    visualName,
  } = nodeDetails.data;

  return (
    <Box sx={{ overflowY: "auto" }}>
      <Typography variant="h6" gutterBottom>
        Visual Request Summary
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="body2">
            <strong>Dashboard/Analysis ID:</strong> {dashboardId || analysisId}
          </Typography>
          <Typography variant="body2">
            <strong>Dashboard/Analysis Name:</strong>{" "}
            {dashboardName || analysisName}
          </Typography>
          <Typography variant="body2">
            <strong>Sheet ID:</strong> {sheetId}
          </Typography>
          <Typography variant="body2">
            <strong>Sheet Name:</strong> {sheetName}
          </Typography>
          <Typography variant="body2">
            <strong>Visual ID:</strong> {visualId}
          </Typography>
          <Typography variant="body2">
            <strong>Visual Name:</strong> {visualName}
          </Typography>
          <Typography variant="body2">
            <strong>Visual Type:</strong> {visualType}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2">
            <strong>Start Time:</strong>{" "}
            {startTime ? new Date(startTime).toLocaleString() : "N/A"}
          </Typography>
          <Typography variant="body2">
            <strong>End Time:</strong>{" "}
            {endTime ? new Date(endTime).toLocaleString() : "N/A"}
          </Typography>
          <Typography variant="body2">
            <strong>Duration:</strong> {duration}
          </Typography>
          <Typography variant="body2">
            <strong>Calculated Fields:</strong> {calculatedFields.length}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Summary;
