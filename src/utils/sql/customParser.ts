// utils/customParser.ts
import { Parser } from "node-sql-parser";
import { SqlNode } from "./sqlNodes";
import { ExpressionVisitor } from "./visitors/expressionVisitor";
import {
  functionCategories,
  FunctionCategoryKeys,
  isLACFunction,
  getStandardFunctionName,
} from "./functionCategories";
import {
  preprocessRankFunction,
  preprocessLACAFunc,
  preprocessOverFunction,
  preprocessDefaultFunction,
} from "./preprocessFunctions";

const parser = new Parser();

const addBackticks = (arg: string): string => `\`${arg.trim()}\``;

// Pre-process SQL to replace custom functions with standard SQL syntax
const preprocessSQL = (sql: string): { sql: string } => {
  const regex = /(\w+)\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g;

  const processedSQL = sql.replace(
    regex,
    (match, funcName: string, args: string) => {
      const standardFuncName = getStandardFunctionName(funcName);
      let processedFunc;

      if (standardFuncName) {
        if (standardFuncName.toLowerCase().includes("rank")) {
          ({ processedFunc } = preprocessRankFunction(standardFuncName, args));
        } else if (isLACFunction(standardFuncName)) {
          ({ processedFunc } = preprocessLACAFunc(standardFuncName, args));
        } else if (standardFuncName.toLowerCase().endsWith("over")) {
          ({ processedFunc } = preprocessOverFunction(standardFuncName, args));
        } else {
          ({ processedFunc } = preprocessDefaultFunction(
            standardFuncName,
            args,
          ));
        }
      } else {
        ({ processedFunc } = preprocessDefaultFunction(funcName, args));
      }

      return processedFunc;
    },
  );

  return { sql: processedSQL };
};

// Post-process AST to replace specific node types
const postprocessAST = (ast: any): any => {
  const traverse = (node: any) => {
    if (
      (node.type === "function" || node.type === "aggr_func") &&
      node.name &&
      typeof node.name === "object" &&
      Array.isArray(node.name.name)
    ) {
      node.name = node.name.name[0].value;
    }
    for (const key in node) {
      if (typeof node[key] === "object" && node[key] !== null) {
        traverse(node[key]);
      }
    }
  };
  traverse(ast);
  return ast;
};

export const customParser = (sql: string): string => {
  // Replace parameters with standard SQL alias references
  let replacedSQL = sql.replace(/\$\{([^}]+)\}/g, (match, p1: string) =>
    addBackticks(p1),
  );

  // Replace curly braces with standard SQL table references
  replacedSQL = replacedSQL.replace(/\{([^}]+)\}/g, (match, p1: string) =>
    addBackticks(p1),
  );

  const { sql: processedSQL } = preprocessSQL(replacedSQL);

  // Wrap the expression in a placeholder SELECT statement with an alias and dummy table
  const wrappedSQL = `SELECT (${processedSQL}) AS expr FROM DUAL`;

  return wrappedSQL;
};

export const parseSQL = (sql: string): { parsedExpression: any } => {
  try {
    const customSQL = customParser(sql);

    const ast = parser.astify(customSQL) as any;

    const postprocessedAST = postprocessAST(ast);

    if (
      postprocessedAST &&
      postprocessedAST.type === "select" &&
      postprocessedAST.columns &&
      postprocessedAST.columns.length > 0 &&
      postprocessedAST.columns[0].expr
    ) {
      const expressionAST = postprocessedAST.columns[0].expr;

      return { parsedExpression: expressionAST };
    } else {
      console.error(
        "Unexpected AST structure:",
        JSON.stringify(postprocessedAST, null, 2),
      );
      throw new Error(`Unexpected AST structure for SQL: ${sql}`);
    }
  } catch (error: any) {
    console.error(`Error parsing SQL (${sql}):`, error.message);
    throw new Error(`Error parsing SQL (${sql}): ${error.message}`);
  }
};
