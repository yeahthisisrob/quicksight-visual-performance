import React, { useState } from "react";
import { Box, Grid, TextField } from "@mui/material";
import { WebSocketMessage, NodeData } from "../types/interfaces";
import WebSocketMessages from "./WebSocketMessages";
import { TreeMap } from "../utils/requestHierarchyTree";

interface MessagesLayoutProps {
  hierarchy: TreeMap<NodeData>;
  selectedMessage: WebSocketMessage | null;
  onMessageClick: (message: WebSocketMessage) => void;
}

const MessagesLayout: React.FC<MessagesLayoutProps> = ({
  hierarchy,
  selectedMessage,
  onMessageClick,
}) => {
  const [filter, setFilter] = useState("");

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  return (
    <Grid container direction="column" sx={{ height: "100%" }}>
      <Grid item>
        <Box
          sx={{
            height: "40px",
            zIndex: 1,
            position: "sticky",
            top: 0,
            background: "#fff",
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Filter messages"
            value={filter}
            onChange={handleFilterChange}
            size="small"
          />
        </Box>
      </Grid>
      <Grid item sx={{ flexGrow: 1, overflowY: "auto" }}>
        <WebSocketMessages
          hierarchy={hierarchy}
          selectedMessage={selectedMessage}
          onMessageClick={onMessageClick}
          filter={filter}
        />
      </Grid>
    </Grid>
  );
};

export default MessagesLayout;
