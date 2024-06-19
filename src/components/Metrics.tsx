import React, { useState, useEffect } from "react";
import { Box, Button } from "@mui/material";
import CommonTable from "./CommonTable";
import ExpressionGraphDialog from "./ExpressionGraphDialog";
import { Expression, NodeData, Metric } from "../types/interfaces";
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
  const [sortBy, setSortBy] = useState("cost");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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

  const combinedMetrics = Array.from(
    new Map(
      expressions
        .filter(
          (expr) =>
            expr.type === "metric" ||
            expr.type === "conditionalFormattingMetric",
        )
        .map((expr) => [expr.alias, expr]),
    ).values(),
  );

  const handleViewGraph = (expression: Expression) => {
    setParseError(null);

    let exp: Expression;

    if (
      (expression.type === "metric" ||
        expression.type === "conditionalFormattingMetric") &&
      (expression as Metric).aggregation === "CUSTOM"
    ) {
      const calculatedFields = expressions.filter(
        (expr) => expr.type === "calculatedField",
      );
      exp =
        calculatedFields.find((field) => field.alias === expression.alias) ||
        expression;
    } else {
      exp =
        combinedMetrics.find((metric) => metric.alias === expression.alias) ||
        expression;
    }

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
    if (sortBy === "userAlias") {
      return sortOrder === "asc"
        ? (a.userAlias || "").localeCompare(b.userAlias || "")
        : (b.userAlias || "").localeCompare(a.userAlias || "");
    }
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
    if (sortBy === "type") {
      return sortOrder === "asc"
        ? (a.type ?? "").localeCompare(b.type ?? "")
        : (b.type ?? "").localeCompare(a.type ?? "");
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

  const columns = [
    { id: "type", label: "Type", sortable: true },
    { id: "aggregation", label: "Aggregation", sortable: true },
    { id: "userAlias", label: "Alias", sortable: true },
    { id: "alias", label: "ID", sortable: true },
    { id: "maxDepth", label: "Max Depth", sortable: true },
    { id: "cost", label: "Cost", sortable: true },
    { id: "actions", label: "Actions", sortable: false },
  ];

  return (
    <Box sx={{ overflowY: "auto" }}>
      <CommonTable
        columns={columns}
        data={sortedMetrics.map((metric) => ({
          ...metric,
          maxDepth: metric.maxDepth ?? 0,
          cost: metric.cost ?? 0,
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
