import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Chip,
  Box,
  Paper,
  Link,
  IconButton,
} from "@mui/material";
import { Expression } from "../types/interfaces";
import { getDependencyChain } from "../utils/graphUtils";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

interface ExpressionGraphDialogProps {
  expressions: Expression[];
  expression: Expression | null;
  open: boolean;
  onClose: () => void;
  parseError: string | null;
  parameterMap: { [key: string]: string };
}

export const getChipColor = (type: string) => {
  switch (type) {
    case "calculatedField":
      return "primary";
    case "field":
      return "secondary";
    case "parameter":
      return "default";
    case "function":
      return "success";
    case "aggr_func":
      return "success";
    default:
      return "error";
  }
};

const renderDependencyChain = (expressionChain: any[]) => {
  return expressionChain.map((item) => (
    <TableRow key={item.id}>
      <TableCell>
        <Box
          display="flex"
          alignItems="center"
          pl={item.level * 4}
          sx={{ width: "100%" }}
        >
          <Paper elevation={3} sx={{ padding: "8px", width: "100%" }}>
            <Box display="flex" justifyContent="space-between">
              <Box display="flex" alignItems="center">
                {item.docLink ? (
                  <Link
                    href={item.docLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.alias}
                    <IconButton size="small" color="primary">
                      <OpenInNewIcon />
                    </IconButton>
                  </Link>
                ) : (
                  <Box>{item.alias}</Box>
                )}
              </Box>
              <Chip
                label={item.type}
                color={getChipColor(item.type)}
                size="small"
              />
            </Box>
          </Paper>
        </Box>
      </TableCell>
      <TableCell sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {item.expression}
      </TableCell>
      <TableCell>{item.cost}</TableCell>
    </TableRow>
  ));
};

const ExpressionGraphDialog: React.FC<ExpressionGraphDialogProps> = ({
  expression,
  open,
  onClose,
  parseError,
  parameterMap,
  expressions,
}) => {
  const expressionChain = expression
    ? getDependencyChain(expression, parameterMap, expressions)
    : [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>Parsed SQL Expression</DialogTitle>
      <DialogContent>
        {parseError ? (
          <Typography color="error" variant="h6">
            Error: {parseError}
          </Typography>
        ) : expression && expression.expression ? (
          <>
            <Typography variant="h6">
              Dependency Chain for: {expression.alias}
            </Typography>
            <Table>
              <TableBody>{renderDependencyChain(expressionChain)}</TableBody>
            </Table>
          </>
        ) : (
          <Typography color="error" variant="h6">
            Unable to parse the SQL expression.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExpressionGraphDialog;
