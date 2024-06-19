import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  Alert,
  AlertTitle,
} from "@mui/material";

interface GuideProps {
  onComplete: () => void;
  onSkip: () => void; // Add onSkip prop
}

type Browser = "Chrome" | "Firefox" | "Edge" | "Safari";

const Guide: React.FC<GuideProps> = ({ onComplete, onSkip }) => {
  const [browser, setBrowser] = useState<Browser | "">("");
  const [step, setStep] = useState<number>(0);

  const steps = [
    {
      description: "Open the developer tools in your browser.",
      instructions: {
        Chrome:
          "Press `F12` or `Ctrl + Shift + I` to open the developer tools.",
        Firefox:
          "Press `F12` or `Ctrl + Shift + I` to open the developer tools.",
        Edge: "Press `F12` or `Ctrl + Shift + I` to open the developer tools.",
        Safari: "Press `Cmd + Option + I` to open the developer tools.",
      },
    },
    {
      description: "Go to the Network tab.",
      instructions: {
        Chrome: "Click on the `Network` tab.",
        Firefox: "Click on the `Network` tab.",
        Edge: "Click on the `Network` tab.",
        Safari: "Click on the `Network` tab.",
      },
    },
    {
      description: "Reload the page to capture the network requests.",
      instructions: {
        Chrome: "Press `F5` or click the reload button.",
        Firefox: "Press `F5` or click the reload button.",
        Edge: "Press `F5` or click the reload button.",
        Safari: "Press `Cmd + R` or click the reload button.",
      },
    },
    {
      description: "Save the network requests as a HAR file.",
      instructions: {
        Chrome:
          "Right-click any network request and select `Save all as HAR with content`.",
        Firefox:
          "Right-click any network request and select `Save all as HAR`.",
        Edge: "Right-click any network request and select `Save all as HAR with content`.",
        Safari: "Right-click any network request and select `Export HAR`.",
      },
    },
    {
      description: "Go to the Console tab to capture console logs.",
      instructions: {
        Chrome: "Click on the `Console` tab.",
        Firefox: "Click on the `Console` tab.",
        Edge: "Click on the `Console` tab.",
        Safari: "Click on the `Console` tab.",
      },
    },
    {
      description: "Save the console logs.",
      instructions: {
        Chrome: "Right-click in the console and select `Save as...`.",
        Firefox:
          "Right-click in the console and select `Export Visible Messages to` > `File`.",
        Edge: "Right-click in the console and select `Save as...`.",
        Safari: "Right-click in the console and select `Save as...`.",
      },
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onSkip(); // Call the onSkip function passed as prop
  };

  const handleBrowserChange = (event: SelectChangeEvent<string>) => {
    setBrowser(event.target.value as Browser);
    setStep(1); // Move to the first step after selecting the browser
  };

  return (
    <Container>
      <Box sx={{ mb: 2 }}>
        <Alert severity="warning">
          <AlertTitle>Warning</AlertTitle>
          HAR files and Console logs can capture sensitive information, such as
          user names, passwords, and keys. Before you send a HAR file and
          Console logs to AWS Support, make sure that you remove any sensitive
          information.
        </Alert>
      </Box>
      <Typography variant="h6" gutterBottom>
        Create a HAR file and collect Console logs
      </Typography>
      {browser ? (
        <Box>
          <Typography variant="body1" gutterBottom>
            {steps[step].description}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {steps[step].instructions[browser as Browser]}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" onClick={handleNext} sx={{ mr: 1 }}>
              Next
            </Button>
            <Button variant="outlined" onClick={handleSkip}>
              Skip Guide
            </Button>
          </Box>
        </Box>
      ) : (
        <Box>
          <FormControl fullWidth>
            <InputLabel id="browser-select-label">Select Browser</InputLabel>
            <Select
              labelId="browser-select-label"
              value={browser}
              label="Select Browser"
              onChange={handleBrowserChange}
            >
              <MenuItem value="Chrome">Chrome</MenuItem>
              <MenuItem value="Firefox">Firefox</MenuItem>
              <MenuItem value="Edge">Edge</MenuItem>
              <MenuItem value="Safari">Safari</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={handleSkip}>
              Skip Guide
            </Button>
          </Box>
        </Box>
      )}
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" gutterBottom>
          For more details, visit the{" "}
          <a
            href="https://repost.aws/knowledge-center/support-case-browser-har-file"
            target="_blank"
            rel="noopener noreferrer"
          >
            AWS Knowledge Center
          </a>
          .
        </Typography>
      </Box>
    </Container>
  );
};

export default Guide;
