import React, { useEffect, useState, useRef } from "react";
import { Box } from "@mui/material";
import { WebSocketMessage, APIMessage, HarLog } from "../types/interfaces";
import { analyzeHarFile } from "../utils/harAnalyzer";
import mockHar from "../../__mocks__/mockHar.json";
import ViewerLayout from "./ViewerLayout";
import { TreeMap, NodeData } from "../utils/requestHierarchyTree";
import { objectToTreeMap } from "../utils/dataUtils";

const ViewerApp: React.FC = () => {
  const [hierarchy, setHierarchy] = useState<TreeMap<NodeData> | null>(null);
  const [selectedMessage, setSelectedMessage] =
    useState<WebSocketMessage | null>(null);
  const [selectedCid, setSelectedCid] = useState<string | null>(null);
  const [highlightedRequestId, setHighlightedRequestId] = useState<
    string | null
  >(null);
  const [activeSection, setActiveSection] = useState<
    | "summary"
    | "fields"
    | "metrics"
    | "filterExpressions"
    | "calculatedFields"
    | "webSocketMessages"
    | "apiMessages" // Add 'apiMessages' to activeSection type
    | "awsSupport"
    | "parameters"
  >("summary");
  const [highlightedField, setHighlightedField] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiMessages, setApiMessages] = useState<Map<string, APIMessage>>(
    new Map(),
  );

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        let hierarchyData;
        let apiMessageData: Map<string, APIMessage> = new Map();
        if (process.env.NODE_ENV === "development") {
          const result = await analyzeHarFile(
            mockHar as { log: HarLog },
            () => {},
          ); // No-op function for updateProgress
          hierarchyData = result.hierarchy;
          apiMessageData = result.apiMessages; // Assuming apiMessages are returned here
        } else {
          await new Promise((resolve) => {
            chrome.storage.local.get(["hierarchy", "apiMessages"], (items) => {
              console.log("Items retrieved from storage:", items);
              if (items.hierarchy) {
                hierarchyData = objectToTreeMap(JSON.parse(items.hierarchy));
              }
              if (items.apiMessages) {
                const parsedApiMessages = new Map<string, APIMessage>(
                  JSON.parse(items.apiMessages),
                );
                apiMessageData = parsedApiMessages;
              }
              resolve(null);
            });
          });
        }

        if (isMounted.current) {
          if (hierarchyData) {
            setHierarchy(hierarchyData);
          }
          if (apiMessageData) {
            setApiMessages(apiMessageData); // Set the API messages
          }
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    loadMessages();
  }, []);

  const handleCidClick = (cid: string) => {
    setSelectedCid(cid);
    setHighlightedRequestId(cid);
    setSelectedMessage(null);
  };

  const handleListItemClick = (message: WebSocketMessage) => {
    setSelectedMessage(message);
  };

  const handleSectionChange = (
    event: React.ChangeEvent<{}>,
    newValue:
      | "summary"
      | "fields"
      | "metrics"
      | "filterExpressions"
      | "calculatedFields"
      | "webSocketMessages"
      | "apiMessages" // Add 'apiMessages' to newValue type
      | "awsSupport"
      | "parameters",
  ) => {
    setActiveSection(newValue);
  };

  const handleHighlightCalculatedField = (name: string) => {
    setActiveSection("calculatedFields");
    setHighlightedField(name);
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {loading ? (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Loading...
        </Box>
      ) : hierarchy && hierarchy.root ? (
        <ViewerLayout
          selectedCid={selectedCid}
          selectedMessage={selectedMessage}
          activeSection={activeSection}
          hierarchy={hierarchy}
          apiMessages={apiMessages} // Pass apiMessages prop to ViewerLayout
          handleCidClick={handleCidClick}
          handleListItemClick={handleListItemClick}
          handleSectionChange={handleSectionChange}
          handleHighlightCalculatedField={handleHighlightCalculatedField}
          highlightedField={highlightedField}
          highlightedRequestId={highlightedRequestId}
        />
      ) : (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          No data available
        </Box>
      )}
    </Box>
  );
};

export default ViewerApp;
