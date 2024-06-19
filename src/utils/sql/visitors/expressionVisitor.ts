import {
  SqlNode,
  SqlAggrFuncNode,
  SqlFunctionNode,
  SqlBinaryExprNode,
  SqlExprListNode,
  SqlColumnRefNode,
  SqlWindowNode,
  SqlOrderByNode,
} from "../sqlNodes";
import { BaseSqlVisitor } from "./sqlVisitor";
import {
  functionCategories,
  getStandardFunctionName,
} from "../functionCategories";
import { Expression } from "../../../types/interfaces";
import { getDocLink } from "../../docLinks";
import { v4 as uuidv4 } from "uuid"; // Add uuid for generating unique IDs

interface Dependency {
  id: string;
  alias: string;
  expression: string;
  type: string;
  cost: number;
  level: number;
  docLink?: string;
}

export class ExpressionVisitor extends BaseSqlVisitor {
  private _isAggregation: boolean = false;
  private _isStringFunction: boolean = false;
  private _totalCost: number = 0;
  private dependencies: Dependency[] = [];
  private expressions: Expression[];
  private parameterMap: { [key: string]: string };
  private currentLevel: number = 0;
  private maxDepth: number = 0;

  constructor(
    expressions: Expression[],
    parameterMap: { [key: string]: string },
  ) {
    super();
    this.expressions = expressions;
    this.parameterMap = parameterMap;
  }

  get isAggregation(): boolean {
    return this._isAggregation;
  }

  get isStringFunction(): boolean {
    return this._isStringFunction;
  }

  get totalCost(): number {
    return this._totalCost;
  }

  getDependencies(): Dependency[] {
    return this.dependencies;
  }

  getMaxDepth(): number {
    return this.maxDepth;
  }

  private increaseDepth(): void {
    this.currentLevel++;
    if (this.currentLevel > this.maxDepth) {
      this.maxDepth = this.currentLevel;
    }
  }

  private decreaseDepth(): void {
    this.currentLevel--;
  }

  private getFunctionCostAndCategory(name: string): {
    cost: number;
    category: string;
  } {
    let cost = functionCategories[name]?.cost || 1;
    let category = functionCategories[name]?.category || "";

    return { cost, category };
  }

  visitAggrFunc(node: SqlAggrFuncNode): void {
    this._isAggregation = true;
    const { cost } = this.getFunctionCostAndCategory(node.name);
    this._totalCost += cost;
    this.extractAggrFuncDependency(node);
    this.increaseDepth();
    super.visitAggrFunc(node);
    this.decreaseDepth();
  }

  visitFunction(node: SqlFunctionNode): void {
    const { cost, category } = this.getFunctionCostAndCategory(node.name);

    if (category === "String Functions") {
      this._isStringFunction = true;
    }
    if (
      ["Aggregate Functions", "Table Calculation Functions"].includes(category)
    ) {
      if (
        node.name.endsWith("Over") ||
        node.name.startsWith("window") ||
        node.name.startsWith("running")
      ) {
        this._isAggregation = true;
      }
    }
    this._totalCost += cost;
    this.extractFunctionDependency(node);
    this.increaseDepth();
    super.visitFunction(node);
    this.decreaseDepth();
  }

  visitColumnRef(node: SqlColumnRefNode): void {
    if (typeof node.column === "string") {
      this.extractColumnRefDependency(node);
    }
  }

  visitExprList(node: SqlExprListNode): void {
    super.visitExprList(node);
  }

  visitBinaryExpr(node: SqlBinaryExprNode): void {
    super.visitBinaryExpr(node);
  }

  visitWindow(node: SqlWindowNode): void {
    const windowSpec = node.as_window_specification.window_specification;

    if (windowSpec.orderby) {
      windowSpec.orderby.forEach((order) => {
        this.visitOrderBy(order as SqlOrderByNode);
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
    this.increaseDepth();
    super.visitOrderBy(node);
    this.decreaseDepth();
  }

  private extractFunctionDependency(node: SqlFunctionNode): void {
    const standardFuncName = getStandardFunctionName(node.name) || node.name;
    const alias = standardFuncName;
    const uniqueId = node.id ? node.id : uuidv4(); // Generate a unique ID
    const docLink = getDocLink(alias);
    const { cost } = this.getFunctionCostAndCategory(node.name);

    this.dependencies.push({
      id: uniqueId,
      alias: alias,
      expression: "",
      type: "function",
      cost: cost,
      level: this.currentLevel,
      docLink: docLink,
    });
  }

  private extractAggrFuncDependency(node: SqlAggrFuncNode): void {
    const standardFuncName = getStandardFunctionName(node.name) || node.name;
    const alias = standardFuncName;
    const uniqueId = node.id ? node.id : uuidv4(); // Generate a unique ID
    const docLink = getDocLink(alias);
    const { cost } = this.getFunctionCostAndCategory(node.name);

    this.dependencies.push({
      id: uniqueId,
      alias: alias,
      expression: "",
      type: "aggr_func",
      cost: cost,
      level: this.currentLevel,
      docLink: docLink,
    });
  }

  private extractColumnRefDependency(node: SqlColumnRefNode): void {
    const alias = node.column;
    const uniqueId = node.id ? node.id : uuidv4(); // Generate a unique ID

    if (this.parameterMap[alias]) {
      this.dependencies.push({
        id: uniqueId,
        alias: alias,
        expression: this.parameterMap[alias],
        type: "parameter",
        cost: 0,
        level: this.currentLevel,
      });
    } else {
      const calculatedField = this.expressions.find(
        (expr) => expr.alias === alias && expr.type === "calculatedField",
      );
      if (calculatedField) {
        if (!calculatedField.parsedExpression) {
          // Handle the parsing error
          this.dependencies.push({
            id: uniqueId,
            alias: alias,
            expression: calculatedField.expression,
            type: "calculatedField",
            cost: calculatedField.cost ?? 0,
            level: this.currentLevel,
          });
          return;
        }

        this.dependencies.push({
          id: uniqueId,
          alias: alias,
          expression: calculatedField.expression,
          type: "calculatedField",
          cost: calculatedField.cost ?? 0,
          level: this.currentLevel,
        });
        this.increaseDepth();
        this.visit(calculatedField.parsedExpression);
        this.decreaseDepth();
      } else {
        const field = this.expressions.find(
          (expr) => expr.alias === alias && expr.type === "field",
        );
        if (field) {
          this.dependencies.push({
            id: uniqueId,
            alias: alias,
            expression: field.expression,
            type: "field",
            cost: field.cost ?? 0,
            level: this.currentLevel,
          });
        } else {
          this.dependencies.push({
            id: uniqueId,
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
