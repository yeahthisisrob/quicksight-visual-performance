import {
  SqlNode,
  SqlBinaryExprNode,
  SqlAggrFuncNode,
  SqlFunctionNode,
  SqlExprListNode,
  SqlSelectNode,
  SqlColumnRefNode,
  SqlNumberNode,
  SqlStringNode,
  SqlDoubleQuoteStringNode,
  SqlSingleQuoteStringNode,
  SqlBoolNode,
  SqlWindowNode,
  SqlOrderByNode,
} from "../sqlNodes";

let idCounter = 0;

export interface SqlVisitor {
  visit(node: SqlNode): void;
}

export class BaseSqlVisitor implements SqlVisitor {
  visit(node: SqlNode): void {
    // Assign a unique ID to the node
    if (!node.id) {
      node.id = `_${idCounter++}`;
    }

    const exprNode = node.expr ? node.expr : node; // Check if node.expr exists, otherwise use node directly

    if (!exprNode || !exprNode.type) {
      throw new Error(`Unknown node type: ${JSON.stringify(node)}`);
    }

    switch (exprNode.type) {
      case "select":
        this.visitSelect(exprNode as SqlSelectNode);
        break;
      case "binary_expr":
        this.visitBinaryExpr(exprNode as SqlBinaryExprNode);
        break;
      case "aggr_func":
        this.visitAggrFunc(exprNode as SqlAggrFuncNode);
        break;
      case "function":
        this.visitFunction(exprNode as SqlFunctionNode);
        break;
      case "column_ref":
        this.visitColumnRef(exprNode as SqlColumnRefNode);
        break;
      case "number":
        this.visitNumber(exprNode as SqlNumberNode);
        break;
      case "string":
        this.visitString(exprNode as SqlStringNode);
        break;
      case "double_quote_string":
        this.visitDoubleQuoteString(exprNode as SqlDoubleQuoteStringNode);
        break;
      case "single_quote_string":
        this.visitSingleQuoteString(exprNode as SqlSingleQuoteStringNode);
        break;
      case "bool":
        this.visitBool(exprNode as SqlBoolNode);
        break;
      case "expr_list":
        this.visitExprList(exprNode as SqlExprListNode);
        break;
      case "window":
        this.visitWindow(exprNode as SqlWindowNode);
        break;
      case "order_by":
        this.visitOrderBy(exprNode as SqlOrderByNode); // Add a new visitor method for order_by
        break;
      default:
        throw new Error(`Unknown node type: ${exprNode.type}`);
    }
  }

  visitSelect(node: SqlSelectNode): void {
    node.columns.forEach((col) => this.visit(col));
  }

  visitBinaryExpr(node: SqlBinaryExprNode): void {
    this.visit(node.left);
    this.visit(node.right);
  }

  visitAggrFunc(node: SqlAggrFuncNode): void {
    if (node.args) {
      this.visit(node.args);
    }
    if ((node as any).over) {
      this.visitWindow((node as any).over);
    }
  }

  visitFunction(node: SqlFunctionNode): void {
    if (node.args && (node.args as SqlExprListNode).value) {
      (node.args as SqlExprListNode).value.forEach((arg) => this.visit(arg));
    }
    if ((node as any).over) {
      this.visitWindow((node as any).over);
    }
  }

  visitColumnRef(node: SqlColumnRefNode): void {}

  visitNumber(node: SqlNumberNode): void {}

  visitString(node: SqlStringNode): void {}

  visitDoubleQuoteString(node: SqlDoubleQuoteStringNode): void {}

  visitSingleQuoteString(node: SqlSingleQuoteStringNode): void {}

  visitBool(node: SqlBoolNode): void {}

  visitExprList(node: SqlExprListNode): void {
    node.value.forEach((expr: SqlNode) => this.visit(expr));
  }

  visitWindow(node: SqlWindowNode): void {
    const windowSpec = node.as_window_specification.window_specification;

    if (windowSpec.orderby) {
      windowSpec.orderby.forEach((order) => this.visit(order));
    }
    if (windowSpec.partitionby) {
      windowSpec.partitionby.forEach((partition) => this.visit(partition));
    }
    if (windowSpec.window_frame_clause) {
      this.visit(windowSpec.window_frame_clause);
    }
  }

  visitOrderBy(node: SqlOrderByNode): void {
    this.visit(node.expr);
  }
}
