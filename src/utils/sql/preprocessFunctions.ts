// utils/preprocessFunctions.ts

const addBackticks = (arg: string): string => `\`${arg.trim()}\``;

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
  let processedFunc = `${funcName}(${measure})`;

  if (partitions && partitions.startsWith("[") && partitions.endsWith("]")) {
    const partitionList = partitions
      .slice(1, -1) // Remove square brackets
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p)
      .map(addBackticks)
      .join(", ");
    const partitionClause = partitionList ? `, ${partitionList}` : "";
    processedFunc = `${funcName}(${measure}${partitionClause})`;
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
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p)
          .map(addBackticks)
          .join(", ");
  const partitionClause = partitionList ? `PARTITION BY ${partitionList}` : "";
  const levelClause = level ? ` ${addBackticks(level)}` : "";
  return {
    processedFunc: `${funcName}(${measure}) OVER (${partitionClause}${levelClause ? " " + levelClause : ""})`,
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
