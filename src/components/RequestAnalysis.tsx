import React from "react";
import { Box, Grid } from "@mui/material";
import { WebSocketMessage } from "../types/interfaces";
import { filterHierarchyByRequestId } from "../utils/hierarchyBuilder";
import Summary from "./Summary";
import Fields from "./Fields";
import Metrics from "./Metrics";
import FilterExpressions from "./FilterExpressions";
import CalculatedFields from "./CalculatedFields";
import MessagesLayout from "./MessagesLayout";
import Parameters from "./Parameters"; // Import the Parameters component

interface RequestAnalysisProps {
  hierarchy: any;
  selectedCid: string | null;
  activeSection:
    | "summary"
    | "fields"
    | "metrics"
    | "filterExpressions"
    | "calculatedFields"
    | "webSocketMessages"
    | "parameters"; // Add 'parameters' to activeSection type
  selectedMessage: WebSocketMessage | null;
  handleListItemClick: (message: WebSocketMessage) => void;
  handleHighlightCalculatedField: (name: string) => void;
  highlightedField: string | null;
}

const RequestAnalysis: React.FC<RequestAnalysisProps> = ({
  hierarchy,
  selectedCid,
  activeSection,
  selectedMessage,
  handleListItemClick,
  handleHighlightCalculatedField,
  highlightedField,
}) => {
  const filteredHierarchy = selectedCid
    ? filterHierarchyByRequestId(hierarchy, selectedCid)
    : hierarchy;
  return (
    <Grid item sx={{ height: "100%" }}>
      <Box sx={{ flexGrow: 1, overflowY: "auto", padding: 2 }}>
        {activeSection === "summary" && (
          <Summary hierarchy={filteredHierarchy} />
        )}
        {activeSection === "fields" && (
          <Fields
            hierarchy={filteredHierarchy}
            onHighlightCalculatedField={handleHighlightCalculatedField}
          />
        )}
        {activeSection === "metrics" && (
          <Metrics hierarchy={filteredHierarchy} />
        )}
        {activeSection === "filterExpressions" && (
          <FilterExpressions hierarchy={filteredHierarchy} />
        )}
        {activeSection === "parameters" && (
          <Parameters hierarchy={filteredHierarchy} />
        )}
        {activeSection === "calculatedFields" && (
          <CalculatedFields
            hierarchy={filteredHierarchy}
            highlightedField={highlightedField}
          />
        )}
        {activeSection === "webSocketMessages" && (
          <MessagesLayout
            hierarchy={filteredHierarchy}
            selectedMessage={selectedMessage}
            onMessageClick={handleListItemClick}
          />
        )}
      </Box>
    </Grid>
  );
};

export default RequestAnalysis;
