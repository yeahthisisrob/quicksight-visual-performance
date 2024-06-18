// utils/sqlNodes.ts
export interface SqlNode {
  type: string;
  id?: string; // Add a unique ID to each node
  expr?: SqlNode;
}

export interface SqlBinaryExprNode extends SqlNode {
  type: "binary_expr";
  left: SqlNode;
  right: SqlNode;
  operator: string;
}

export interface SqlAggrFuncNode extends SqlNode {
  type: "aggr_func";
  name: string;
  args: SqlNode;
}

export interface SqlFunctionNode extends SqlNode {
  type: "function";
  name: string;
  args: SqlExprListNode;
}

export interface SqlColumnRefNode extends SqlNode {
  type: "column_ref";
  table: string | null;
  column: string;
}

export interface SqlNumberNode extends SqlNode {
  type: "number";
  value: number;
}

export interface SqlStringNode extends SqlNode {
  type: "string";
  value: string;
}

export interface SqlDoubleQuoteStringNode extends SqlNode {
  type: "double_quote_string";
  value: string;
}

export interface SqlSingleQuoteStringNode extends SqlNode {
  type: "single_quote_string";
  value: string;
}

export interface SqlBoolNode extends SqlNode {
  type: "bool";
  value: boolean;
}

export interface SqlExprListNode extends SqlNode {
  type: "expr_list";
  value: SqlNode[];
}

export interface SqlSelectNode extends SqlNode {
  type: "select";
  columns: SqlNode[];
}

export interface SqlWindowNode extends SqlNode {
  type: "window";
  as_window_specification: {
    window_specification: {
      orderby?: SqlNode[];
      partitionby?: SqlNode[];
      window_frame_clause?: SqlNode;
    };
    parentheses: boolean;
  };
}

export interface SqlOrderByNode extends SqlNode {
  type: "order_by";
  expr: SqlNode;
  order: "ASC" | "DESC";
}
