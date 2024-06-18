import React, { useState, useEffect } from "react";
import { Box, Button, IconButton, Popover, Typography } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import CommonTable from "./CommonTable";
import ExpressionGraphDialog from "./ExpressionGraphDialog";
import { CalculatedField, Expression, NodeData } from "../types/interfaces";
import { TreeMap, TreeNode } from "../utils/requestHierarchyTree";

interface CalculatedFieldsProps {
  hierarchy: TreeMap<NodeData>;
  highlightedField?: string | null;
}

const CalculatedFields: React.FC<CalculatedFieldsProps> = ({ hierarchy }) => {
  const [expressions, setExpressions] = useState<Expression[]>([]);
  const [parameterMap, setParameterMap] = useState<{ [key: string]: string }>(
    {},
  );
  const [selectedExpression, setSelectedExpression] =
    useState<Expression | null>(null);
  const [open, setOpen] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("alias");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // TODO: Fix this popover to close when the mouse leaves the popover
  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const openPopover = Boolean(anchorEl);

  useEffect(() => {
    const resetState = () => {
      setExpressions([]);
      setParameterMap({});
    };

    const traverseHierarchy = (node: TreeNode<NodeData>) => {
      if (node.data.expressions) {
        setExpressions((prev) => [...prev, ...node.data.expressions!]);
        setParameterMap((prev) => ({ ...prev, ...node.data.parameterMap }));
      }
      node.children.forEach((child) => traverseHierarchy(child));
    };

    resetState();
    traverseHierarchy(hierarchy.root);
  }, [hierarchy]);

  const filteredExpressions = expressions.filter(
    (expr) => expr.type === "calculatedField",
  );

  const handleViewGraph = (exp: CalculatedField) => {
    setSelectedExpression(exp);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedExpression(null);
  };

  const handleSort = (sortKey: string) => {
    if (sortKey === sortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(sortKey);
      setSortOrder("asc");
    }
  };

  const sortedFields = [...filteredExpressions].sort((a, b) => {
    if (sortBy === "alias") {
      return sortOrder === "asc"
        ? a.alias.localeCompare(b.alias)
        : b.alias.localeCompare(a.alias);
    }
    if (sortBy === "expression") {
      return sortOrder === "asc"
        ? a.expression.localeCompare(b.expression)
        : b.expression.localeCompare(a.expression);
    }
    if (sortBy === "dataSetCalculation") {
      return sortOrder === "asc"
        ? (a as CalculatedField).dataSetCalculation === true
          ? -1
          : 1
        : (a as CalculatedField).dataSetCalculation === true
          ? 1
          : -1;
    }
    if (sortBy === "preProcessed") {
      return sortOrder === "asc"
        ? (a as CalculatedField).preProcessed === true
          ? -1
          : 1
        : (a as CalculatedField).preProcessed === true
          ? 1
          : -1;
    }
    return 0;
  });

  const columns = [
    { id: "alias", label: "Alias", sortable: true },
    { id: "expression", label: "Expression", sortable: true },
    { id: "dataSetCalculation", label: "Dataset Calculation", sortable: true },
    {
      id: "preProcessed",
      label: (
        <Box display="flex" alignItems="center">
          Preprocessed
          <IconButton size="small" onClick={handlePopoverOpen}>
            <InfoIcon fontSize="small" />
          </IconButton>
          <Popover
            open={openPopover}
            anchorEl={anchorEl}
            onClose={handlePopoverClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            PaperProps={{
              sx: { width: "25%" },
            }}
          >
            <Box p={2}>
              <Typography>
                QuickSight allows you to add calculated fields in the data prep
                or analysis experiences. We strongly encourage you to move as
                many calculations as possible to the data prep stage which will
                allow QuickSight to materialize calculations which do not
                contain aggregation or parameters into the SPICE dataset.
                Materializing calculated fields in the dataset helps you reduce
                the runtime calculations, which improves query performance. Even
                if you are using aggregation or parameters in your calculation,
                it might still be possible to move parts of the calculations to
                data prep.
              </Typography>
              <Typography mt={2}>
                <a
                  href="https://aws.amazon.com/blogs/big-data/tips-and-tricks-for-high-performant-dashboards-in-amazon-quicksight"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Tips and tricks for high-performant dashboards in Amazon
                  QuickSight
                </a>
              </Typography>
            </Box>
          </Popover>
        </Box>
      ),
      sortable: true,
    },
    { id: "actions", label: "Actions", sortable: false },
  ];

  return (
    <Box sx={{ overflowY: "auto" }}>
      <CommonTable
        columns={columns}
        data={sortedFields.map((field) => ({
          ...field,
          dataSetCalculation: (field as CalculatedField).dataSetCalculation
            ? "Yes"
            : "No",
          preProcessed: (field as CalculatedField).preProcessed ? "Yes" : "No",
          actions: (
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleViewGraph(field as CalculatedField)}
            >
              View Graph
            </Button>
          ),
        }))}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />
      <ExpressionGraphDialog
        expression={selectedExpression}
        open={open}
        onClose={handleCloseDialog}
        parseError={parseError}
        parameterMap={parameterMap}
        expressions={expressions}
      />
    </Box>
  );
};

export default CalculatedFields;
