import {
  SqlNode,
  SqlFunctionNode,
  SqlColumnRefNode,
  SqlExprListNode,
  SqlBinaryExprNode,
  SqlWindowNode,
  SqlAggrFuncNode,
  SqlOrderByNode,
} from "../sqlNodes";
import { BaseSqlVisitor } from "./sqlVisitor";
import { Expression } from "../../../types/interfaces";
import { getDocLink } from "../../docLinks";

interface Dependency {
  alias: string;
  expression: string;
  type: string;
  cost: number;
  level: number;
  docLink?: string; // Add documentation link field
}

export class DependencyVisitor extends BaseSqlVisitor {
  private dependencies: Dependency[] = [];
  private expressions: Expression[];
  private parameterMap: { [key: string]: string };
  private seenIds = new Set<string>();
  private seenAliases = new Set<string>();
  private currentLevel: number = 0;

  constructor(
    expressions: Expression[],
    parameterMap: { [key: string]: string },
  ) {
    super();
    this.expressions = expressions;
    this.parameterMap = parameterMap;
  }

  getDependencies(): Dependency[] {
    return this.dependencies;
  }

  visitFunction(node: SqlFunctionNode): void {
    console.log(
      `Visiting function: ${node.name}, currentLevel: ${this.currentLevel}`,
    );
    this.extractFunctionDependency(node);
    this.currentLevel++;
    super.visitFunction(node);
    this.currentLevel--;
  }

  visitAggrFunc(node: SqlAggrFuncNode): void {
    console.log(
      `Visiting aggregation function: ${node.name}, currentLevel: ${this.currentLevel}`,
    );
    this.extractAggrFuncDependency(node);
    this.currentLevel++;
    super.visitAggrFunc(node);
    this.currentLevel--;
  }

  visitColumnRef(node: SqlColumnRefNode): void {
    console.log(
      `Visiting column reference: ${node.column}, currentLevel: ${this.currentLevel}`,
    );
    if (typeof node.column === "string") {
      this.extractColumnRefDependency(node);
    }
  }

  visitExprList(node: SqlExprListNode): void {
    console.log(`Visiting expression list, currentLevel: ${this.currentLevel}`);
    super.visitExprList(node);
  }

  visitBinaryExpr(node: SqlBinaryExprNode): void {
    console.log(
      `Visiting binary expression: ${node.operator}, currentLevel: ${this.currentLevel}`,
    );
    super.visitBinaryExpr(node);
  }

  visitWindow(node: SqlWindowNode): void {
    console.log(
      `Visiting window specification, currentLevel: ${this.currentLevel}`,
    );
    const windowSpec = node.as_window_specification.window_specification;

    if (windowSpec.orderby) {
      windowSpec.orderby.forEach((order) => {
        super.visitOrderBy(order as SqlOrderByNode);
        console.log(
          `Visiting order by element, currentLevel: ${this.currentLevel}`,
        );
        // Extract dependency for each order by element
        if (order.type === "aggr_func" || order.type === "function") {
          this.extractFunctionDependency(order as SqlFunctionNode);
        } else if (order.type === "column_ref") {
          this.extractColumnRefDependency(order as SqlColumnRefNode);
        }
      });
    }

    if (windowSpec.partitionby) {
      windowSpec.partitionby.forEach((partition) => {
        this.visit(partition);
        // Extract dependency for each partition by element
        if (partition.type === "column_ref") {
          this.extractColumnRefDependency(partition as SqlColumnRefNode);
        }
      });
    }

    if (windowSpec.window_frame_clause) {
      this.visit(windowSpec.window_frame_clause);
    }
  }

  visitOrderBy(node: SqlOrderByNode): void {
    console.log(
      `Visiting order by element: ${node.expr}, order: ${node.order}, currentLevel: ${this.currentLevel}`,
    );
    this.currentLevel++;
    super.visitOrderBy(node);
    this.currentLevel--;
  }

  private extractFunctionDependency(node: SqlFunctionNode): void {
    const alias = node.name;
    const uniqueId = node.id ? node.id : alias;
    const docLink = getDocLink(alias);
    console.log(
      `Extracting dependency for function: ${alias}, uniqueId: ${uniqueId}, currentLevel: ${this.currentLevel}`,
    );

    if (!this.seenIds.has(uniqueId)) {
      this.seenIds.add(uniqueId);
      this.dependencies.push({
        alias: alias,
        expression: "",
        type: "function",
        cost: 0,
        level: this.currentLevel,
        docLink: docLink,
      });
    }
  }

  private extractAggrFuncDependency(node: SqlAggrFuncNode): void {
    const alias = node.name;
    const uniqueId = node.id ? node.id : alias;
    const docLink = getDocLink(alias);
    console.log(
      `Extracting dependency for aggregation function: ${alias}, uniqueId: ${uniqueId}, currentLevel: ${this.currentLevel}`,
    );

    if (!this.seenIds.has(uniqueId)) {
      this.seenIds.add(uniqueId);
      this.dependencies.push({
        alias: alias,
        expression: "",
        type: "aggr_func",
        cost: 0,
        level: this.currentLevel,
        docLink: docLink,
      });
    }
  }

  private extractColumnRefDependency(node: SqlColumnRefNode): void {
    const alias = node.column;
    console.log(
      `Extracting dependency for column reference: ${alias}, currentLevel: ${this.currentLevel}`,
    );

    if (!this.seenAliases.has(alias)) {
      this.seenAliases.add(alias);
      if (this.parameterMap[alias]) {
        this.dependencies.push({
          alias: alias,
          expression: this.parameterMap[alias],
          type: "parameter",
          cost: 1,
          level: this.currentLevel,
        });
      } else {
        const calculatedField = this.expressions.find(
          (expr) => expr.alias === alias && expr.type === "calculatedField",
        );
        if (calculatedField) {
          console.log(`Found calculated field: ${calculatedField.alias}`);
          this.dependencies.push({
            alias: alias,
            expression: calculatedField.expression,
            type: "calculatedField",
            cost: calculatedField.cost ?? 0,
            level: this.currentLevel,
          });
          this.currentLevel++;
          this.visit(calculatedField.parsedExpression);
          this.currentLevel--;
        } else {
          const field = this.expressions.find(
            (expr) => expr.alias === alias && expr.type === "field",
          );
          if (field) {
            console.log(`Found field: ${field.alias}`);
            this.dependencies.push({
              alias: alias,
              expression: field.expression,
              type: "field",
              cost: field.cost ?? 0,
              level: this.currentLevel,
            });
          } else {
            console.log(`Adding unknown field: ${alias}`);
            this.dependencies.push({
              alias: alias,
              expression: "",
              type: "field",
              cost: 0,
              level: this.currentLevel,
            });
          }
        }
      }
    }
  }

  private isFunctionOrAggrFunc(
    node: SqlNode,
  ): node is SqlFunctionNode | SqlAggrFuncNode {
    return node.type === "function" || node.type === "aggr_func";
  }

  private formatExpression(node: SqlNode): string {
    if (node.type === "column_ref") {
      return `{${(node as SqlColumnRefNode).table}.${(node as SqlColumnRefNode).column}}`;
    }
    if (this.isFunctionOrAggrFunc(node)) {
      const args = (node as SqlFunctionNode | SqlAggrFuncNode).args;
      if (args && (args as SqlExprListNode).value) {
        const formattedArgs = (args as SqlExprListNode).value
          .map((arg) => this.formatExpression(arg))
          .join(", ");
        return `${(node as SqlFunctionNode | SqlAggrFuncNode).name}(${formattedArgs})`;
      } else if (args && args.type === "column_ref") {
        return `{${(args as SqlColumnRefNode).table}.${(args as SqlColumnRefNode).column}}`;
      } else if (args && args.type === "aggr_func") {
        return this.formatExpression(args);
      }
    }
    return "";
  }
}
