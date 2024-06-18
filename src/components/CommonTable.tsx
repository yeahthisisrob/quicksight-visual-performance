import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Button,
} from "@mui/material";

interface CommonTableProps {
  columns: Array<{ id: string; label: React.ReactNode; sortable: boolean }>;
  data: any[];
  onActionClick?: (item: any) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (sortKey: string) => void;
}

const CommonTable: React.FC<CommonTableProps> = ({
  columns,
  data,
  onActionClick,
  sortBy,
  sortOrder,
  onSort,
}) => {
  return (
    <Box sx={{ flex: 1, overflowY: "auto" }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            {columns.map((column) => (
              <TableCell key={column.id} sx={{ padding: "8px" }}>
                {column.sortable ? (
                  <TableSortLabel
                    active={sortBy === column.id}
                    direction={sortOrder}
                    onClick={() => onSort(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                ) : (
                  column.label
                )}
              </TableCell>
            ))}
            {onActionClick && (
              <TableCell sx={{ padding: "8px" }}>Actions</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              <TableCell sx={{ padding: "8px" }}>{index + 1}</TableCell>
              {columns.map((column) => (
                <TableCell
                  key={`${column.id}-${index}`}
                  sx={{ padding: "8px" }}
                >
                  {item[column.id]}
                </TableCell>
              ))}
              {onActionClick && (
                <TableCell sx={{ padding: "8px" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => onActionClick(item)}
                  >
                    Action
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default CommonTable;
