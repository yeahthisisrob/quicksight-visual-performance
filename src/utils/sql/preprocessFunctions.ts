// utils/preprocessFunctions.ts
import {
  getFunctionCategoryKey,
  getStandardFunctionName,
  functionCategories,
} from "./functionCategories";

const addBackticks = (arg: string): string => `\`${arg.trim()}\``;
const addSingleQuotes = (arg: string): string => "${arg.trim()}";

export const preprocessRankFunction = (
  funcName: string,
  args: string,
): { processedFunc: string } => {
  // Helper function to split the arguments correctly
  const splitArguments = (argString: string): string[] => {
    const result = [];
    let current = "";
    let openParens = 0;
    let openBrackets = 0;

    for (const char of argString) {
      if (char === "(") {
        openParens += 1;
      } else if (char === ")") {
        openParens -= 1;
      } else if (char === "[") {
        openBrackets += 1;
      } else if (char === "]") {
        openBrackets -= 1;
      } else if (char === "," && openParens === 0 && openBrackets === 0) {
        result.push(current.trim());
        current = "";
        continue;
      }
      current += char;
    }
    result.push(current.trim());

    return result;
  };

  const [sortOrder, partition = "", level = ""] = splitArguments(args);

  const cleanList = (list: string): string =>
    list
      .slice(1, -1) // Remove outer brackets
      .split(/,(?![^\(]*\))/)
      .map((item) => item.trim())
      .join(", ");

  const sortOrderList = sortOrder.trim() === "[]" ? "" : cleanList(sortOrder);

  const partitionList = partition.trim() === "[]" ? "" : cleanList(partition);

  const partitionClause = partitionList ? ` PARTITION BY ${partitionList}` : "";
  const orderByClause = sortOrderList ? ` ORDER BY ${sortOrderList}` : "";
  const overClause =
    partitionClause || orderByClause
      ? ` OVER (${partitionClause}${orderByClause})`
      : " OVER ()"; // Include OVER clause only if necessary

  return { processedFunc: `${funcName}()${overClause}` };
};

export const preprocessLACAFunc = (
  funcName: string,
  args: string,
): { processedFunc: string } => {
  const [measure, partitions] = args
    .split(/,(?![^\(]*\))/)
    .map((arg) => arg.trim());

  const standardFuncName = getStandardFunctionName(funcName) || funcName;
  const func = getFunctionCategoryKey(standardFuncName) || funcName;

  let processedFunc = `${func}(${measure})`;

  if (partitions && partitions.startsWith("[") && partitions.endsWith("]")) {
    const lacFunc =
      Object.entries(functionCategories).find(
        ([key, value]) =>
          value.standardFunction.toLowerCase() ===
            standardFuncName.toLowerCase() && value.isLAC,
      )?.[0] || func;

    const partitionList = partitions
      .slice(1, -1) // Remove square brackets
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p)
      .join(", ");
    const partitionClause = partitionList
      ? `PARTITION BY ${partitionList}`
      : "";
    processedFunc = `${lacFunc}(${measure}) OVER (${partitionClause})`;
  }

  return { processedFunc };
};

export const preprocessOverFunction = (
  funcName: string,
  args: string,
): { processedFunc: string } => {
  const [measure, partitions = "", level = ""] = args
    .split(/,(?![^\(]*\))/)
    .map((arg) => arg.trim()); // Split by comma not inside parentheses

  const partitionList =
    partitions.trim() === "[]"
      ? ""
      : partitions
          .slice(1, -1) // Remove the outer square brackets
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p)
          .join(", ");

  const partitionClause = partitionList ? `PARTITION BY ${partitionList}` : "";
  const levelClause = level ? ` ${addBackticks(level)}` : "";

  return {
    processedFunc: `${funcName}(${measure}) OVER (${partitionClause})`,
  };
};

export const preprocessDefaultFunction = (
  funcName: string,
  args: string,
): { processedFunc: string } => {
  const allArgs = args
    .split(/,(?![^\(]*\))/)
    .map((arg) => arg.trim())
    .join(", "); // Split by comma not inside parentheses
  return { processedFunc: `${funcName}(${allArgs})` };
};

// New functions to handle `in` and `notin`
export const preprocessInNotInFunction = (
  funcName: string,
  args: string,
): { processedFunc: string } => {
  const [column, values, inclusive] = args
    .split(/,(?![^\(]*\))/)
    .map((arg) => arg.trim());

  const cleanedValues = values
    .slice(1, -1) // Remove outer brackets
    .split(/,(?![^\(]*\))/)
    .map((value) => value.trim())
    .map(addBackticks)
    .join(", ");

  const processedFunc = `${funcName.toUpperCase()}(${column})`;

  return { processedFunc };
};

export const preprocessIfelseFunction = (
  funcName: string,
  args: string,
): { processedFunc: string } => {
  const parseIfElse = (args: string): string => {
    const argumentsArray = args.split(/,(?![^\(]*\))/).map((arg) => arg.trim());

    const processNestedIfElse = (
      argsArray: string[],
      index: number,
    ): string => {
      if (index >= argsArray.length - 1) {
        return argsArray[index] || "NULL";
      }

      const condition = argsArray[index];
      const thenExpression = argsArray[index + 1];
      const elseExpression = processNestedIfElse(argsArray, index + 2);

      return `ifelse(${condition}, ${thenExpression}, ${elseExpression})`;
    };

    return processNestedIfElse(argumentsArray, 0);
  };

  const processedFunc = parseIfElse(args);

  return { processedFunc };
};
