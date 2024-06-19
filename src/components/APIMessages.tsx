import React, { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ContentCopy as CopyIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import { APIMessage } from "../types/interfaces";
import * as he from "he";

interface APIMessagesProps {
  apiMessages: Map<string, APIMessage>;
}

const APIMessages: React.FC<APIMessagesProps> = ({ apiMessages }) => {
  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState("");

  const messages = Array.from(apiMessages.values()).sort(
    (a, b) =>
      new Date(a.startedDateTime).getTime() -
      new Date(b.startedDateTime).getTime(),
  );

  const initialTime =
    messages.length > 0 ? new Date(messages[0].startedDateTime).getTime() : 0;

  const handleDataClick = (data: string, msg: APIMessage) => {
    let formattedData = data;

    const formatJsonString = (jsonString: string) => {
      try {
        return JSON.stringify(JSON.parse(jsonString), null, 2);
      } catch (error) {
        return jsonString; // Fallback to original string if JSON parsing fails
      }
    };

    const cleanAndFormatJson = (obj: any): any => {
      if (typeof obj === "string") {
        obj = obj
          .replace(/\\n/g, "")
          .replace(/\\t/g, "")
          .replace(/\\\\/g, "\\")
          .replace(/\\"/g, '"')
          .replace(/\\'/g, "'");
        return formatJsonString(obj);
      } else if (typeof obj === "object" && obj !== null) {
        for (const key in obj) {
          if (typeof obj[key] === "string") {
            obj[key] = cleanAndFormatJson(obj[key]);
          } else if (typeof obj[key] === "object") {
            obj[key] = cleanAndFormatJson(JSON.stringify(obj[key]));
          }
        }
      }
      return obj;
    };

    const recursivelyCleanAndFormatJson = (obj: any): any => {
      if (typeof obj === "string") {
        obj = cleanAndFormatJson(obj);
        try {
          obj = JSON.parse(obj);
        } catch (error) {
          return obj; // Return cleaned string if JSON parsing fails
        }
      }

      if (typeof obj === "object" && obj !== null) {
        for (const key in obj) {
          obj[key] = recursivelyCleanAndFormatJson(obj[key]);
        }
      }
      return obj;
    };

    if (msg.response?.content?.mimeType === "text/html") {
      const parser = new DOMParser();
      const doc = parser.parseFromString(
        msg.response.content.text,
        "text/html",
      );
      const divElement = doc.getElementById("page-type-metadata");
      if (divElement) {
        const decodedString = he.decode(divElement.textContent || "");
        try {
          const parsedData = JSON.parse(decodedString);
          const cleanedData = recursivelyCleanAndFormatJson(parsedData);
          formattedData = JSON.stringify(cleanedData, null, 2);
        } catch (error) {
          formattedData = decodedString; // Fallback to decoded string if JSON parsing fails
        }
      }
    } else {
      try {
        const parsedData = JSON.parse(data);
        const cleanedData = recursivelyCleanAndFormatJson(parsedData);
        formattedData = JSON.stringify(cleanedData, null, 2);
      } catch (error) {
        formattedData = data; // Fallback to original data if JSON parsing fails
      }
    }

    setSelectedData(formattedData);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedData);
  };

  const getTimeDifference = (startTime: string) => {
    const start = new Date(startTime).getTime();
    return start - initialTime;
  };

  const roundToHundredth = (value: number) => Math.round(value * 100) / 100;

  return (
    <>
      <Box p={2} sx={{ overflowY: "auto", maxHeight: "calc(50vh - 10px)" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Operation</TableCell>
              <TableCell>RequestId</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Request Time</TableCell>
              <TableCell>Elapsed Time (ms)</TableCell>
              <TableCell>Total Time (ms)</TableCell>
              <TableCell>Send (ms)</TableCell>
              <TableCell>Wait (ms)</TableCell>
              <TableCell>Receive (ms)</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Transfer Size</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {messages.map((msg, index) => {
              const operation = msg.request.queryString.find(
                (param) => param.name === "Operation",
              )?.value;
              const requestId = msg.response?.headers?.find(
                (header) => header.name.toLowerCase() === "x-amzn-requestid",
              )?.value;
              const status = msg.response?.status ?? "Unknown";
              const requestTime = new Date(
                msg.startedDateTime,
              ).toLocaleString();
              const elapsedTime = getTimeDifference(msg.startedDateTime);
              const totalTime = msg.time ? roundToHundredth(msg.time) : "N/A";
              const sendTime = msg.timings?.send
                ? roundToHundredth(msg.timings.send)
                : "N/A";
              const waitTime = msg.timings?.wait
                ? roundToHundredth(msg.timings.wait)
                : "N/A";
              const receiveTime = msg.timings?.receive
                ? roundToHundredth(msg.timings.receive)
                : "N/A";
              let data = "{}";
              if (msg.response?.content?.mimeType === "text/html") {
                data = he.decode(msg.response.content.text || "");
              } else {
                data = msg.response?.content?.text ?? "{}";
              }

              return (
                <TableRow
                  key={`${operation || "unknown"}-${index}`}
                  sx={{ cursor: "pointer", maxHeight: "100px" }}
                >
                  <TableCell>{msg.type}</TableCell>
                  <TableCell>{operation}</TableCell>
                  <TableCell>{requestId}</TableCell> {/* Add RequestId here */}
                  <TableCell>{status}</TableCell>
                  <TableCell>{requestTime}</TableCell>
                  <TableCell>{elapsedTime}</TableCell>
                  <TableCell>{totalTime}</TableCell>
                  <TableCell>{sendTime}</TableCell>
                  <TableCell>{waitTime}</TableCell>
                  <TableCell>{receiveTime}</TableCell>
                  <TableCell
                    sx={{
                      maxHeight: "100px",
                      overflowY: "auto",
                      cursor: "pointer",
                    }}
                    onClick={() => handleDataClick(data, msg)}
                  >
                    <Box display="flex" alignItems="center">
                      <OpenInNewIcon
                        fontSize="small"
                        sx={{ marginRight: "5px" }}
                      />
                      {data.length > 100
                        ? `${data.substring(0, 100)}...`
                        : data}
                    </Box>
                  </TableCell>
                  <TableCell>{msg.response?._transferSize ?? "N/A"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Formatted JSON Data
          <Tooltip title="Copy to Clipboard">
            <IconButton onClick={handleCopy}>
              <CopyIcon />
            </IconButton>
          </Tooltip>
        </DialogTitle>
        <DialogContent dividers>
          <Box
            component="pre"
            sx={{
              whiteSpace: "pre-wrap",
              margin: 0,
              maxHeight: "500px",
              overflowY: "auto",
            }}
          >
            {selectedData}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default APIMessages;
