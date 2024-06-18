import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  LinearProgress,
  Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import DropZone from "./DropZone";
import ProgressLog from "./ProgressLog";
import { analyzeHarFile } from "../utils/harAnalyzer";
import { treeMapToObject } from "../utils/dataUtils";

const theme = createTheme();

const App: React.FC = () => {
  const [step, setStep] = useState<"initial" | "drop" | "analyzing" | "done">(
    "initial",
  );
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<
    { label: string; status: "pending" | "done" }[]
  >([
    { label: "Parsing WebSocket messages", status: "pending" },
    { label: "Parsing API messages", status: "pending" },
    { label: "Parsing Metadata documents", status: "pending" },
  ]);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [messageCount, setMessageCount] = useState<number | null>(null);
  const [dashboardCount, setDashboardCount] = useState<number | null>(null);
  const [analysisCount, setAnalysisCount] = useState<number | null>(null);
  const [sheetCount, setSheetCount] = useState<number | null>(null);
  const [visualCount, setVisualCount] = useState<number | null>(null);
  const [requestCount, setRequestCount] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number | null>(null);
  const [hierarchyObject, setHierarchyObject] = useState<any>(null); // Local state for hierarchyObject

  const handleFileDrop = (droppedFile: File) => {
    console.log("File dropped:", droppedFile);
    setFile(droppedFile);
    setFileSize(droppedFile.size);
    setStep("drop");
  };

  useEffect(() => {
    if (file && step === "drop") {
      handleAnalyze();
    }
  }, [file, step]);

  const handleAnalyze = () => {
    if (file) {
      setLoading(true);
      console.log("Starting file analysis...");
      const startTime = performance.now();

      const updateProgress = (stepIndex: number) => {
        setProgress((prevProgress) => {
          return prevProgress.map((step, index) => {
            if (index === stepIndex) return { ...step, status: "done" };
            return step;
          });
        });
      };

      analyzeHarFile(file, updateProgress)
        .then(({ hierarchy, wsMessages, apiMessages, counts }) => {
          const endTime = performance.now();
          setElapsedTime(endTime - startTime);

          setMessageCount(wsMessages.size + apiMessages.size);
          setDashboardCount(counts.dashboardCount);
          setAnalysisCount(counts.analysisCount);
          setSheetCount(counts.sheetCount);
          setVisualCount(counts.visualCount);
          setRequestCount(counts.requestCount);

          const hierarchyObject = treeMapToObject(hierarchy);
          setHierarchyObject(hierarchyObject); // Set local state for hierarchyObject

          setLoading(false);
          setStep("done");
        })
        .catch((error) => {
          console.error("Error during analysis:", error);
          setLoading(false);
        });
    }
  };

  const handleReset = () => {
    setStep("initial");
    setFile(null);
    setFileSize(null);
    setMessageCount(null);
    setDashboardCount(null);
    setAnalysisCount(null);
    setSheetCount(null);
    setVisualCount(null);
    setRequestCount(null);
    setElapsedTime(null);
    setProgress([
      { label: "Parsing WebSocket messages", status: "pending" },
      { label: "Parsing API messages", status: "pending" },
      { label: "Parsing Metadata documents", status: "pending" },
    ]);
    setHierarchyObject(null); // Reset local state for hierarchyObject
  };

  const handleViewResults = () => {
    if (hierarchyObject) {
      // Save hierarchy to Chrome storage
      chrome.storage.local.set(
        { hierarchy: JSON.stringify(hierarchyObject) },
        () => {
          console.log("Hierarchy saved to local storage");

          // Open the viewer in a new tab
          const viewerUrl = chrome.runtime.getURL("viewer.html");
          chrome.tabs.create({ url: viewerUrl });
        },
      );
    } else {
      console.error("Hierarchy object is not available."); // Handle error scenario
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 2,
        }}
      >
        {step === "initial" && <DropZone onFileDrop={handleFileDrop} />}
        {step === "drop" && (
          <>
            <DropZone onFileDrop={handleFileDrop} />
            {file && (
              <>
                <ProgressLog
                  steps={progress}
                  fileSize={fileSize}
                  messageCount={messageCount}
                  dashboardCount={dashboardCount}
                  analysisCount={analysisCount}
                  sheetCount={sheetCount}
                  visualCount={visualCount}
                  requestCount={requestCount}
                  elapsedTime={elapsedTime}
                />
                <Box sx={{ textAlign: "center", marginTop: "20px" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setStep("analyzing");
                      handleAnalyze();
                    }}
                  >
                    Analyze File
                  </Button>
                </Box>
              </>
            )}
          </>
        )}
        {step === "analyzing" && loading && (
          <LinearProgress sx={{ marginTop: "20px" }} />
        )}
        {step === "done" && (
          <Box sx={{ textAlign: "center", marginTop: "20px" }}>
            <ProgressLog
              steps={progress}
              fileSize={fileSize}
              messageCount={messageCount}
              dashboardCount={dashboardCount}
              analysisCount={analysisCount}
              sheetCount={sheetCount}
              visualCount={visualCount}
              requestCount={requestCount}
              elapsedTime={elapsedTime}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleReset}
              sx={{ marginRight: "10px" }}
            >
              Load New HAR
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleViewResults}
            >
              View Results
            </Button>
          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default App;
