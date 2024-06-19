import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import CommonTable from "./CommonTable";
import { NodeData } from "../types/interfaces";
import { TreeMap, TreeNode } from "../utils/requestHierarchyTree";

interface ParametersProps {
  hierarchy: TreeMap<NodeData>;
}

const Parameters: React.FC<ParametersProps> = ({ hierarchy }) => {
  const [parameters, setParameters] = useState<any[]>([]);
  const [parameterMap, setParameterMap] = useState<{ [key: string]: string }>(
    {},
  );

  useEffect(() => {
    const resetState = () => {
      setParameters([]);
      setParameterMap({});
    };

    const traverseHierarchy = (node: TreeNode<NodeData>) => {
      if (node.data.parameters) {
        setParameters((prev) => [...prev, ...(node.data.parameters || [])]);
        setParameterMap((prev) => ({ ...prev, ...node.data.parameterMap }));
      }
      node.children.forEach((child) => traverseHierarchy(child));
    };

    resetState();
    traverseHierarchy(hierarchy.root);
  }, [hierarchy]);

  // Remove duplicates based on parameterId
  const uniqueParameters = Array.from(
    new Map(parameters.map((param) => [param.parameterId, param])).values(),
  );

  const handleSort = (sortKey: string) => {
    const order = sortBy === sortKey && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(sortKey);
    setSortOrder(order);
  };

  const [sortBy, setSortBy] = useState("parameterId");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const sortedParameters = [...uniqueParameters].sort((a, b) => {
    if (sortBy === "parameterId") {
      return sortOrder === "asc"
        ? a.parameterId.localeCompare(b.parameterId)
        : b.parameterId.localeCompare(a.parameterId);
    }
    if (sortBy === "name") {
      return sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    if (sortBy === "type") {
      return sortOrder === "asc"
        ? a.type.localeCompare(b.type)
        : b.type.localeCompare(a.type);
    }
    if (sortBy === "valueWhenUnset") {
      return sortOrder === "asc"
        ? a.valueWhenUnset.localeCompare(b.valueWhenUnset)
        : b.valueWhenUnset.localeCompare(a.valueWhenUnset);
    }
    return 0;
  });

  const columns = [
    { id: "parameterId", label: "Parameter ID", sortable: true },
    { id: "name", label: "Name", sortable: true },
    { id: "parameterValue", label: "Parameter Value", sortable: false },
    { id: "type", label: "Type", sortable: true },
    { id: "valueWhenUnset", label: "Value When Unset", sortable: true },
    { id: "defaultValue", label: "Default Value", sortable: false },
    { id: "multiValueEnabled", label: "Multi Value Enabled", sortable: false },
    { id: "expressionDefault", label: "Expression Default", sortable: false },
  ];

  return (
    <Box sx={{ overflowY: "auto" }}>
      <CommonTable
        columns={columns}
        data={sortedParameters.map((parameter, index) => ({
          row: index + 1,
          parameterId: parameter.parameterId,
          name: parameter.name,
          type: parameter.type,
          valueWhenUnset: parameter.valueWhenUnset,
          defaultValue: parameter.defaultValue,
          multiValueEnabled: parameter.multiValueEnabled ? "Yes" : "No",
          expressionDefault: parameter.expressionDefault,
          parameterValue: parameterMap[parameter.parameterId] || "N/A",
        }))}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />
    </Box>
  );
};

export default Parameters;
