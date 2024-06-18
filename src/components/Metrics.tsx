import React, { useState, useEffect } from "react";
import { Box, Button } from "@mui/material";
import CommonTable from "./CommonTable";
import ExpressionGraphDialog from "./ExpressionGraphDialog";
import { Expression, NodeData } from "../types/interfaces";
import { TreeMap, TreeNode } from "../utils/requestHierarchyTree";

interface MetricsProps {
  hierarchy: TreeMap<NodeData>;
}

const Metrics: React.FC<MetricsProps> = ({ hierarchy }) => {
  const [expressions, setExpressions] = useState<Expression[]>([]);
  const [parameterMap, setParameterMap] = useState<{ [key: string]: string }>(
    {},
  );
  const [selectedExpression, setSelectedExpression] =
    useState<Expression | null>(null);
  const [open, setOpen] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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

  const combinedMetrics = expressions.filter(
    (expr) =>
      expr.type === "metric" || expr.type === "conditionalFormattingMetric",
  );

  const handleViewGraph = (expression: Expression) => {
    setParseError(null);
    const calculatedFields = expressions.filter(
      (expr) => expr.type === "calculatedField",
    );
    const exp =
      calculatedFields.find((field) => field.alias === expression.alias) ||
      expression;

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

  const sortedMetrics = [...combinedMetrics].sort((a, b) => {
    if (sortBy === "name") {
      return sortOrder === "asc"
        ? a.alias.localeCompare(b.alias)
        : b.alias.localeCompare(a.alias);
    }
    if (sortBy === "func") {
      return sortOrder === "asc"
        ? a.expression.localeCompare(b.expression)
        : b.expression.localeCompare(a.expression);
    }
    if (sortBy === "type") {
      return sortOrder === "asc"
        ? (a.type ?? "").localeCompare(b.type ?? "")
        : (b.type ?? "").localeCompare(a.type ?? "");
    }
    return 0;
  });

  const columns = [
    { id: "type", label: "Type", sortable: true },
    { id: "aggregation", label: "Aggregation", sortable: true },
    { id: "alias", label: "Name", sortable: true },
    { id: "actions", label: "Actions", sortable: false },
  ];

  return (
    <Box sx={{ overflowY: "auto" }}>
      <CommonTable
        columns={columns}
        data={sortedMetrics.map((metric) => ({
          ...metric,
          actions: (
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleViewGraph(metric)}
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
        expressions={expressions}
        expression={selectedExpression}
        open={open}
        onClose={handleCloseDialog}
        parseError={parseError}
        parameterMap={parameterMap}
      />
    </Box>
  );
};

export default Metrics;
