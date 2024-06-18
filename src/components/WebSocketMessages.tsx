import React, { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Send as SendIcon,
  CallReceived as ReceiveIcon,
  CloudDownload as DataReceivedIcon,
  Error as ErrorIcon,
  ContentCopy as CopyIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import { WebSocketMessage, NodeData } from "../types/interfaces";
import { getTimeDifference } from "../utils/dataUtils";
import { TreeMap, TreeNode } from "../utils/requestHierarchyTree";

interface WebSocketMessagesProps {
  hierarchy: TreeMap<NodeData>;
  selectedMessage: WebSocketMessage | null;
  onMessageClick: (message: WebSocketMessage) => void;
  filter: string;
}

const collectMessagesFromHierarchy = (
  node: TreeNode<NodeData>,
): WebSocketMessage[] => {
  const messages: WebSocketMessage[] = [];
  if (node.data && node.data.messages) {
    messages.push(...node.data.messages);
  }
  if (node.children) {
    node.children.forEach((child) => {
      messages.push(...collectMessagesFromHierarchy(child));
    });
  }
  return messages;
};

const WebSocketMessages: React.FC<WebSocketMessagesProps> = ({
  hierarchy,
  selectedMessage,
  onMessageClick,
  filter,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState("");

  if (!hierarchy?.root) {
    console.error("Hierarchy root is undefined");
    return null;
  }

  const messages = collectMessagesFromHierarchy(hierarchy.root).filter((msg) =>
    msg.data.includes(filter),
  );
  const firstMessageTime = messages.length > 0 ? messages[0].time : null;

  const getIcon = (msg: WebSocketMessage, data: any) => {
    if (data.errorCodeHierarchyPrimitiveModel || data.error) {
      return <ErrorIcon fontSize="small" style={{ color: "red" }} />;
    } else if (data.data) {
      return <DataReceivedIcon fontSize="small" />;
    } else if (msg.type === "send") {
      return <SendIcon fontSize="small" />;
    } else if (msg.type === "receive") {
      return <ReceiveIcon fontSize="small" />;
    }
    return null;
  };

  const getMessageText = (msg: WebSocketMessage, data: any) => {
    if (data.errorCodeHierarchyPrimitiveModel || data.error) {
      return "Error";
    } else if (data.data) {
      return `Data Received`;
    }
    return data.status || data.type || "Unknown";
  };

  const truncateData = (data: string, length: number) => {
    return data.length > length ? `${data.substring(0, length)}...` : data;
  };

  const handleDataClick = (data: string) => {
    setSelectedData(data);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedData);
  };

  return (
    <>
      <Box p={2} sx={{ overflowY: "auto", maxHeight: "calc(50vh - 10px)" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Elapsed Time (ms)</TableCell>
              <TableCell>Length</TableCell>
              <TableCell>Data</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {messages.map((msg, index) => {
              const data = JSON.parse(msg.data);
              const timeDifference = getTimeDifference(
                msg.time,
                firstMessageTime,
              );
              const icon = getIcon(msg, data);
              const messageText = getMessageText(msg, data);

              return (
                <TableRow
                  key={`${data.cid || "unknown"}-${index}`}
                  onClick={() => onMessageClick(msg)}
                  selected={selectedMessage === msg}
                  sx={{ cursor: "pointer", maxHeight: "100px" }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      {icon}
                      <Typography variant="body2" sx={{ marginLeft: "10px" }}>
                        {messageText}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {new Date(msg.time * 1000).toLocaleString()}
                  </TableCell>
                  <TableCell>{timeDifference}</TableCell>
                  <TableCell>{msg.data.length}</TableCell>
                  <TableCell
                    sx={{
                      maxHeight: "100px",
                      overflowY: "auto",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      handleDataClick(JSON.stringify(data, null, 2))
                    }
                  >
                    <Box display="flex" alignItems="center">
                      <OpenInNewIcon
                        fontSize="small"
                        sx={{ marginRight: "5px" }}
                      />
                      {truncateData(JSON.stringify(data), 100)}
                    </Box>
                  </TableCell>
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

export default WebSocketMessages;
