import React, { useEffect, useState, useRef } from "react";
import { Box } from "@mui/material";
import { WebSocketMessage, HarLog } from "../types/interfaces";
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
  >("summary");
  const [highlightedField, setHighlightedField] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
        if (process.env.NODE_ENV === "development") {
          const result = await analyzeHarFile(
            mockHar as { log: HarLog },
            () => {},
          ); // No-op function for updateProgress
          hierarchyData = result.hierarchy;
        } else {
          await new Promise((resolve) => {
            chrome.storage.local.get(["hierarchy"], (items) => {
              console.log("Items retrieved from storage:", items);
              if (items.hierarchy) {
                hierarchyData = objectToTreeMap(JSON.parse(items.hierarchy));
              }
              resolve(null);
            });
          });
        }

        if (isMounted.current && hierarchyData) {
          setHierarchy(hierarchyData);
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
      | "webSocketMessages",
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
