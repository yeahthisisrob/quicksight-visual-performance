import React, { useState, useEffect } from "react";
import { Box, Button } from "@mui/material";
import CommonTable from "./CommonTable";
import ExpressionGraphDialog from "./ExpressionGraphDialog";
import { Expression, Field, NodeData } from "../types/interfaces";
import { TreeNode, TreeMap } from "../utils/requestHierarchyTree";

interface FieldsProps {
  hierarchy: TreeMap<NodeData>;
  onHighlightCalculatedField: (name: string) => void;
}

const Fields: React.FC<FieldsProps> = ({
  hierarchy,
  onHighlightCalculatedField,
}) => {
  const [expressions, setExpressions] = useState<Field[]>([]);
  const [parameterMap, setParameterMap] = useState<{ [key: string]: string }>(
    {},
  );
  const [selectedExpression, setSelectedExpression] = useState<Field | null>(
    null,
  );
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

  const filteredExpressions = Array.from(
    new Map(
      expressions
        .filter((expr) => expr.type === "field")
        .map((expr) => [expr.alias, expr]),
    ).values(),
  );

  const handleViewGraph = (exp: Field) => {
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
    if (sortBy === "cost") {
      return sortOrder === "asc"
        ? (a.cost || 0) - (b.cost || 0)
        : (b.cost || 0) - (a.cost || 0);
    }
    if (sortBy === "maxDepth") {
      return sortOrder === "asc"
        ? (a.maxDepth || 0) - (b.maxDepth || 0)
        : (b.maxDepth || 0) - (a.maxDepth || 0);
    }
    return 0;
  });

  const columns = [
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
        data={sortedFields.map((field, index) => ({
          ...field,
          maxDepth: field.maxDepth ?? "N/A",
          cost: field.cost ?? "N/A",
          actions: (
            <React.Fragment key={`${field.alias}-${index}-actions`}>
              {expressions.find((expr) => expr.alias === field.alias) && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleViewGraph(field)}
                >
                  View Graph
                </Button>
              )}
            </React.Fragment>
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

export default Fields;
