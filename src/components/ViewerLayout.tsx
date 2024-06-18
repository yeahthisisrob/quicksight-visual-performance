import React from "react";
import {
  Grid,
  Typography,
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Box,
  Tabs,
  Tab,
  Divider,
} from "@mui/material";
import { WebSocketMessage } from "../types/interfaces";
import VisualRequests from "./VisualRequests";
import RequestAnalysis from "./RequestAnalysis";
import GanttChart from "./GanttChart";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

const theme = createTheme({
  typography: {
    fontSize: 12,
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          margin: "4px 0",
        },
      },
    },
  },
});

interface ViewerLayoutProps {
  selectedCid: string | null;
  selectedMessage: WebSocketMessage | null;
  activeSection:
    | "summary"
    | "fields"
    | "metrics"
    | "filterExpressions"
    | "calculatedFields"
    | "webSocketMessages";
  hierarchy: any;
  handleCidClick: (cid: string) => void;
  handleListItemClick: (message: WebSocketMessage) => void;
  handleSectionChange: (
    event: React.ChangeEvent<{}>,
    newValue:
      | "summary"
      | "fields"
      | "metrics"
      | "filterExpressions"
      | "calculatedFields"
      | "webSocketMessages",
  ) => void;
  handleHighlightCalculatedField: (name: string) => void;
  highlightedField: string | null;
  highlightedRequestId: string | null;
}

const ViewerLayout: React.FC<ViewerLayoutProps> = ({
  selectedCid,
  selectedMessage,
  activeSection,
  handleCidClick,
  handleListItemClick,
  handleSectionChange,
  handleHighlightCalculatedField,
  highlightedField,
  highlightedRequestId,
  hierarchy,
}) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth={false} disableGutters>
        <Grid container direction="column" height="100vh" wrap="nowrap">
          <Grid item flexShrink={0}>
            <Box
              sx={{
                height: 30,
                borderBottom: "3px solid #ccc",
                position: "sticky",
                top: 0,
                zIndex: 2,
                backgroundColor: "#f5f5f5",
              }}
            >
              <Typography variant="h6" align="center" sx={{ padding: "2px 0" }}>
                REQUESTS
              </Typography>
            </Box>
            <ResizableBox
              width={Infinity}
              height={350}
              minConstraints={[Infinity, 200]}
              maxConstraints={[Infinity, 600]}
              axis="y"
              resizeHandles={["s"]}
            >
              <Box sx={{ height: "100%", overflowY: "auto" }}>
                <VisualRequests
                  hierarchy={hierarchy}
                  selectedCid={selectedCid}
                  onCidClick={handleCidClick}
                  highlightedRequestId={highlightedRequestId}
                />
              </Box>
            </ResizableBox>
          </Grid>
          <Grid item flexShrink={0}>
            <Box
              sx={{
                height: 30,
                borderBottom: "3px solid #ccc",
                position: "sticky",
                top: 50,
                zIndex: 2,
                backgroundColor: "#f5f5f5",
              }}
            >
              <Typography variant="h6" align="center" sx={{ padding: "2px 0" }}>
                DURATIONS
              </Typography>
            </Box>
            <ResizableBox
              width={Infinity}
              height={300}
              minConstraints={[Infinity, 200]}
              maxConstraints={[Infinity, 600]}
              axis="y"
              resizeHandles={["s"]}
            >
              <Box sx={{ height: "100%", overflowY: "auto" }}>
                <GanttChart
                  hierarchy={hierarchy}
                  selectedCid={selectedCid}
                  onBarClick={handleCidClick}
                  highlightedRequestId={highlightedRequestId}
                />
              </Box>
            </ResizableBox>
          </Grid>
          <Grid item flexShrink={0}>
            <Box
              sx={{
                height: 30,
                borderBottom: "3px solid #ccc",
                position: "sticky",
                top: 100,
                zIndex: 2,
                backgroundColor: "#f5f5f5",
              }}
            >
              <Typography variant="h6" align="center" sx={{ padding: "2px 0" }}>
                DETAILS
              </Typography>
            </Box>
          </Grid>
          <Grid item flexShrink={0}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                padding: "2px",
                background: "#fff",
              }}
            >
              <Tabs
                value={activeSection}
                onChange={handleSectionChange}
                variant="scrollable"
                scrollButtons="auto"
                textColor="primary"
                indicatorColor="primary"
              >
                <Tab value="summary" label="Summary" />
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                <Tab value="fields" label="Fields" />
                <Tab value="metrics" label="Metrics" />
                <Tab value="filterExpressions" label="Filter Expressions" />
                <Tab value="parameters" label="Parameters" />
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                <Tab value="calculatedFields" label="Calculated Fields" />
                <Tab value="webSocketMessages" label="WebSocket Messages" />
              </Tabs>
            </Box>
          </Grid>
          <Grid item flexGrow={1} sx={{ overflowY: "auto" }}>
            {selectedCid ? (
              <RequestAnalysis
                hierarchy={hierarchy}
                selectedCid={selectedCid}
                activeSection={activeSection}
                selectedMessage={selectedMessage}
                handleListItemClick={handleListItemClick}
                handleHighlightCalculatedField={handleHighlightCalculatedField}
                highlightedField={highlightedField}
              />
            ) : (
              <Grid
                container
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h4" color="grey">
                  Select a requestId
                </Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
};

export default ViewerLayout;
