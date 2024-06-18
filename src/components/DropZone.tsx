import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Box, Typography } from "@mui/material";

interface DropZoneProps {
  onFileDrop: (file: File) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ onFileDrop }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      console.log("Accepted files:", acceptedFiles);
      if (acceptedFiles.length > 0) {
        onFileDrop(acceptedFiles[0]);
      } else {
        console.log("No files accepted.");
      }
    },
    [onFileDrop],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ".har,application/json", // Ensure the correct MIME types are used
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: "2px dashed #ccc",
        borderRadius: "20px",
        textAlign: "center",
        color: "#ccc",
        padding: "40px",
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "20px",
      }}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <Typography variant="h6" component="div">
          Drop the HAR file here ...
        </Typography>
      ) : (
        <Typography variant="h6" component="div">
          Drag and drop a HAR file here, or click to select one
        </Typography>
      )}
    </Box>
  );
};

export default DropZone;
