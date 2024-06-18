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

  const filteredExpressions = expressions.filter(
    (expr) => expr.type === "field",
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
    if (sortBy === "name") {
      return sortOrder === "asc"
        ? a.alias.localeCompare(b.alias)
        : b.alias.localeCompare(a.alias);
    }
    return 0;
  });

  const columns = [
    { id: "name", label: "Name", sortable: true },
    { id: "sort", label: "Sort", sortable: false },
    { id: "actions", label: "Actions", sortable: false },
  ];

  return (
    <Box sx={{ overflowY: "auto" }}>
      <CommonTable
        columns={columns}
        data={sortedFields.map((field, index) => ({
          ...field,
          sort: field.sort ? (
            <Box key={`${field.name}-${index}-sort`}>
              {field.sort.name ? (
                <Box key={`${field.sort.name}-${index}`}>
                  {field.sort.name} ({field.sort.dir})
                </Box>
              ) : expressions.find(
                  (expr) => expr.alias === field.sort?.metric.name,
                ) ? (
                <Button
                  variant="text"
                  onClick={() =>
                    onHighlightCalculatedField(field?.sort?.metric.name || "")
                  }
                >
                  {field.sort.metric.func}({field.sort.metric.name}) (
                  {field.sort.dir})
                </Button>
              ) : (
                <Box key={`${field.sort.metric.name}-${index}`}>
                  {field.sort.metric.func}({field.sort.metric.name}) (
                  {field.sort.dir})
                </Box>
              )}
            </Box>
          ) : null,
          actions: (
            <React.Fragment key={`${field.name}-${index}-actions`}>
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
