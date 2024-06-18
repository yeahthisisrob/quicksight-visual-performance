import React from "react";
import { Box, Button, Typography } from "@mui/material";

interface InitialMessageProps {
  onConfirm: () => void;
}

const InitialMessage: React.FC<InitialMessageProps> = ({ onConfirm }) => {
  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography variant="h6" component="div" gutterBottom>
        Please confirm that you understand the entire file will be parsed but no
        information is sent anywhere.
      </Typography>
      <Button variant="contained" color="primary" onClick={onConfirm}>
        I Understand
      </Button>
    </Box>
  );
};

export default InitialMessage;
