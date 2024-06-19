import React from "react";
import { Box, Grid } from "@mui/material";
import { WebSocketMessage, APIMessage } from "../types/interfaces";
import { filterHierarchyByRequestId } from "../utils/hierarchyBuilder";
import Summary from "./Summary";
import Fields from "./Fields";
import Metrics from "./Metrics";
import FilterExpressions from "./FilterExpressions";
import CalculatedFields from "./CalculatedFields";
import MessagesLayout from "./MessagesLayout";
import APIMessages from "./APIMessages"; // Import the new APIMessages component
import Parameters from "./Parameters";
import AWSSupport from "./AWSSupport"; // Import the new AWSSupport component

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
    | "apiMessages"
    | "parameters"
    | "awsSupport"; // Add 'awsSupport' to activeSection type
  selectedMessage: WebSocketMessage | null;
  handleListItemClick: (message: WebSocketMessage) => void;
  handleHighlightCalculatedField: (name: string) => void;
  highlightedField: string | null;
  apiMessages: Map<string, APIMessage>; // Add apiMessages prop
}

const RequestAnalysis: React.FC<RequestAnalysisProps> = ({
  hierarchy,
  selectedCid,
  activeSection,
  selectedMessage,
  handleListItemClick,
  handleHighlightCalculatedField,
  highlightedField,
  apiMessages, // Add apiMessages prop
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
        {activeSection === "apiMessages" && (
          <APIMessages
            apiMessages={apiMessages} // Pass apiMessages to APIMessages
          />
        )}
        {activeSection === "awsSupport" && (
          <AWSSupport hierarchy={filteredHierarchy} />
        )}
      </Box>
    </Grid>
  );
};

export default RequestAnalysis;
