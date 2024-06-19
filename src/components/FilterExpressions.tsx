import React, { useState, useEffect } from "react";
import { Box, Button, Chip, Typography, Tooltip } from "@mui/material";
import CommonTable from "./CommonTable";
import ExpressionGraphDialog from "./ExpressionGraphDialog";
import { Expression, NodeData } from "../types/interfaces";
import { TreeMap, TreeNode } from "../utils/requestHierarchyTree";

interface FilterExpressionsProps {
  hierarchy: TreeMap<NodeData>;
  highlightedField?: string | null;
}

const FilterExpressions: React.FC<FilterExpressionsProps> = ({
  hierarchy,
  highlightedField,
}) => {
  const [expressions, setExpressions] = useState<Expression[]>([]);
  const [filterMetadata, setFilterMetadata] = useState<any[]>([]);
  const [parameterMap, setParameterMap] = useState<{ [key: string]: string }>(
    {},
  );
  const [selectedExpression, setSelectedExpression] =
    useState<Expression | null>(null);
  const [open, setOpen] = useState(false);
  const [sortBy, setSortBy] = useState("cost");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const resetState = () => {
      setExpressions([]);
      setParameterMap({});
      setFilterMetadata([]);
    };

    const traverseHierarchy = (node: TreeNode<NodeData>) => {
      if (node.data.expressions) {
        setExpressions((prev) => [...prev, ...node.data.expressions!]);
        setParameterMap((prev) => ({ ...prev, ...node.data.parameterMap }));
      }
      if (node.data.filters) {
        setFilterMetadata((prev) => [...prev, ...node.data.filters!]);
      }
      node.children.forEach((child) => traverseHierarchy(child));
    };

    resetState();
    traverseHierarchy(hierarchy.root);
  }, [hierarchy]);

  const filteredExpressions = Array.from(
    new Map(
      expressions
        .filter((expr) => expr.type === "filterExpression")
        .map((expr) => [expr.alias, expr]),
    ).values(),
  );

  const handleViewGraph = (exp: Expression) => {
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

  const sortedExpressions = [...filteredExpressions].sort((a, b) => {
    if (sortBy === "alias") {
      return sortOrder === "asc"
        ? a.alias.localeCompare(b.alias)
        : b.alias.localeCompare(a.alias);
    }
    if (sortBy === "func") {
      return sortOrder === "asc"
        ? a.expression.localeCompare(b.expression)
        : b.expression.localeCompare(a.expression);
    }
    if (sortBy === "maxDepth") {
      return sortOrder === "asc"
        ? (a.maxDepth || 0) - (b.maxDepth || 0)
        : (b.maxDepth || 0) - (a.maxDepth || 0);
    }
    if (sortBy === "cost") {
      return sortOrder === "asc"
        ? (a.cost || 0) - (b.cost || 0)
        : (b.cost || 0) - (a.cost || 0);
    }
    return 0;
  });

  const filterExpressionColumns = [
    { id: "alias", label: "Alias", sortable: true },
    {
      id: "expression",
      label: "Expression",
      sortable: true,
      format: (value: string, row: Expression) => (
        <Box display="flex" alignItems="center">
          {value}
          {row.hasError && (
            <Tooltip title="This is just a limitation of the Chrome extension, not the QuickSight data">
              <Chip
                label="Parsing Error"
                color="error"
                size="small"
                sx={{ ml: 1 }}
              />
            </Tooltip>
          )}
        </Box>
      ),
    },
    { id: "maxDepth", label: "Max Depth", sortable: true },
    { id: "cost", label: "Cost", sortable: true },
    { id: "actions", label: "Actions", sortable: false },
  ];

  const filterMetadataColumns = [
    { id: "filterType", label: "Filter Type", sortable: true },
    { id: "columnId", label: "Column ID", sortable: true },
    { id: "mode", label: "Mode", sortable: true },
    { id: "matchType", label: "Match Type", sortable: true },
    { id: "nullFilter", label: "Null Filter", sortable: true },
    { id: "parameterId", label: "Parameter ID", sortable: true },
  ];

  const sortedFilterMetadata = [...filterMetadata].sort((a, b) => {
    if (sortBy === "filterType") {
      return sortOrder === "asc"
        ? a.filterType.localeCompare(b.filterType)
        : b.filterType.localeCompare(a.filterType);
    }
    if (sortBy === "columnId") {
      return sortOrder === "asc"
        ? a.columnId.localeCompare(b.columnId)
        : b.columnId.localeCompare(a.columnId);
    }
    if (sortBy === "mode") {
      return sortOrder === "asc"
        ? a.mode.localeCompare(b.mode)
        : b.mode.localeCompare(a.mode);
    }
    if (sortBy === "matchType") {
      return sortOrder === "asc"
        ? a.matchType.localeCompare(b.matchType)
        : b.matchType.localeCompare(a.matchType);
    }
    if (sortBy === "nullFilter") {
      return sortOrder === "asc"
        ? a.nullFilter.localeCompare(b.nullFilter)
        : b.nullFilter.localeCompare(a.nullFilter);
    }
    if (sortBy === "parameterId") {
      return sortOrder === "asc"
        ? a.parameterId.localeCompare(b.parameterId)
        : b.parameterId.localeCompare(a.parameterId);
    }
    return 0;
  });

  const tableData = sortedExpressions.map((expression) => ({
    ...expression,
    expression: (
      <Box display="flex" alignItems="center">
        {expression.expression}
        {expression.hasError && (
          <Tooltip title="This is just a limitation of the Chrome extension, not the QuickSight data">
            <Chip
              label="Parsing Error"
              color="error"
              size="small"
              sx={{ ml: 1 }}
            />
          </Tooltip>
        )}
      </Box>
    ),
    maxDepth: expression.maxDepth ?? "N/A",
    cost: expression.cost ?? "N/A",
    actions: (
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleViewGraph(expression)}
      >
        View Graph
      </Button>
    ),
  }));

  return (
    <Box sx={{ overflowY: "auto", padding: 2 }}>
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h6">Filter Expressions</Typography>
        <CommonTable
          columns={filterExpressionColumns}
          data={tableData}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      </Box>
      <Box sx={{ marginTop: 4 }}>
        <Typography variant="h6">Filter Metadata</Typography>
        <CommonTable
          columns={filterMetadataColumns}
          data={sortedFilterMetadata}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      </Box>
      <ExpressionGraphDialog
        expressions={expressions}
        expression={selectedExpression}
        open={open}
        onClose={handleCloseDialog}
        parseError={""}
        parameterMap={parameterMap}
      />
    </Box>
  );
};

export default FilterExpressions;
