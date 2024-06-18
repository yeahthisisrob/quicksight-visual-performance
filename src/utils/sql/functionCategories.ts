// functionCategories.ts
export const functionCategories: {
  [key: string]: { standardFunction: string; category: string; cost: number };
} = {
  // Aggregate Functions
  'AVG': { standardFunction: 'avg', category: 'Aggregate Functions', cost: 5 },
  'COUNT': { standardFunction: 'count', category: 'Aggregate Functions', cost: 3 },
  'COUNT_DISTINCT': { standardFunction: 'countDistinct', category: 'Aggregate Functions', cost: 7 },
  'MAX': { standardFunction: 'max', category: 'Aggregate Functions', cost: 4 },
  'MEDIAN': { standardFunction: 'median', category: 'Aggregate Functions', cost: 6 },
  'MIN': { standardFunction: 'min', category: 'Aggregate Functions', cost: 4 },
  'PERCENTILE_DISC': { standardFunction: 'percentileDisc', category: 'Aggregate Functions', cost: 8 },
  'PERCENTILE_CONT': { standardFunction: 'percentileCont', category: 'Aggregate Functions', cost: 8 },
  'SUM': { standardFunction: 'sum', category: 'Aggregate Functions', cost: 5 },
  'STDEV': { standardFunction: 'stdev', category: 'Aggregate Functions', cost: 6 },
  'STDEVP': { standardFunction: 'stdevp', category: 'Aggregate Functions', cost: 6 },
  'VAR': { standardFunction: 'var', category: 'Aggregate Functions', cost: 6 },
  'VARP': { standardFunction: 'varp', category: 'Aggregate Functions', cost: 6 },

  // _LACA Suffix Functions
  'AVG_LACA': { standardFunction: 'avg', category: 'Aggregate Functions', cost: 7 },
  'COUNT_LACA': { standardFunction: 'count', category: 'Aggregate Functions', cost: 7 },
  'COUNT_DISTINCT_LACA': { standardFunction: 'countDistinct', category: 'Aggregate Functions', cost: 7 },
  'MAX_LACA': { standardFunction: 'max', category: 'Aggregate Functions', cost: 7 },
  'MEDIAN_LACA': { standardFunction: 'median', category: 'Aggregate Functions', cost: 7 },
  'MIN_LACA': { standardFunction: 'min', category: 'Aggregate Functions', cost: 7 },
  'PERCENTILE_DISC_LACA': { standardFunction: 'percentileDisc', category: 'Aggregate Functions', cost: 7 },
  'PERCENTILE_CONT_LACA': { standardFunction: 'percentileCont', category: 'Aggregate Functions', cost: 7 },
  'SUM_LACA': { standardFunction: 'sum', category: 'Aggregate Functions', cost: 7 },
  'STDEV_LACA': { standardFunction: 'stdev', category: 'Aggregate Functions', cost: 7 },
  'STDEVP_LACA': { standardFunction: 'stdevp', category: 'Aggregate Functions', cost: 7 },
  'VAR_LACA': { standardFunction: 'var', category: 'Aggregate Functions', cost: 7 },
  'VARP_LACA': { standardFunction: 'varp', category: 'Aggregate Functions', cost: 7 },

  // Conditional Functions
  'COALESCE': { standardFunction: 'coalesce', category: 'Conditional Functions', cost: 2 },
  'IFELSE': { standardFunction: 'ifelse', category: 'Conditional Functions', cost: 2 },
  'IN': { standardFunction: 'in', category: 'Conditional Functions', cost: 3 },
  'ISNOTNULL': { standardFunction: 'isNotNull', category: 'Conditional Functions', cost: 1 },
  'ISNULL': { standardFunction: 'isNull', category: 'Conditional Functions', cost: 1 },
  'NOTIN': { standardFunction: 'notIn', category: 'Conditional Functions', cost: 3 },
  'NULLIF': { standardFunction: 'nullIf', category: 'Conditional Functions', cost: 2 },
  'SWITCH': { standardFunction: 'switch', category: 'Conditional Functions', cost: 3 },

  // Date Functions
  'ADDDATETIME': { standardFunction: 'addDateTime', category: 'Date Functions', cost: 4 },
  'ADDWORKDAYS': { standardFunction: 'addWorkDays', category: 'Date Functions', cost: 4 },
  'DATEDIFF': { standardFunction: 'dateDiff', category: 'Date Functions', cost: 4 },
  'EPOCHDATE': { standardFunction: 'epochDate', category: 'Date Functions', cost: 3 },
  'EXTRACT': { standardFunction: 'extract', category: 'Date Functions', cost: 3 },
  'FORMATDATE': { standardFunction: 'formatDate', category: 'Date Functions', cost: 3 },
  'ISWORKDAY': { standardFunction: 'isWorkDay', category: 'Date Functions', cost: 3 },
  'NETWORKDAYS': { standardFunction: 'netWorkDays', category: 'Date Functions', cost: 4 },
  'NOW': { standardFunction: 'now', category: 'Date Functions', cost: 2 },
  'TRUNCDATE': { standardFunction: 'truncDate', category: 'Date Functions', cost: 3 },

  // Numeric Functions
  'CEIL': { standardFunction: 'ceil', category: 'Numeric Functions', cost: 2 },
  'DECIMALTOINT': { standardFunction: 'decimalToInt', category: 'Numeric Functions', cost: 2 },
  'FLOOR': { standardFunction: 'floor', category: 'Numeric Functions', cost: 2 },
  'INTTODECIMAL': { standardFunction: 'intToDecimal', category: 'Numeric Functions', cost: 2 },
  'ROUND': { standardFunction: 'round', category: 'Numeric Functions', cost: 2 },

  // Mathematical Functions
  'ABS': { standardFunction: 'abs', category: 'Mathematical Functions', cost: 2 },
  'EXP': { standardFunction: 'exp', category: 'Mathematical Functions', cost: 3 },
  'LN': { standardFunction: 'ln', category: 'Mathematical Functions', cost: 3 },
  'LOG': { standardFunction: 'log', category: 'Mathematical Functions', cost: 3 },
  'MOD': { standardFunction: 'mod', category: 'Mathematical Functions', cost: 2 },
  'SQRT': { standardFunction: 'sqrt', category: 'Mathematical Functions', cost: 3 },

  // String Functions
  'CONCAT': { standardFunction: 'concat', category: 'String Functions', cost: 2 },
  'CONTAINS': { standardFunction: 'contains', category: 'String Functions', cost: 3 },
  'ENDSWITH': { standardFunction: 'endsWith', category: 'String Functions', cost: 2 },
  'LEFT': { standardFunction: 'left', category: 'String Functions', cost: 2 },
  'LOCATE': { standardFunction: 'locate', category: 'String Functions', cost: 2 },
  'LTRIM': { standardFunction: 'ltrim', category: 'String Functions', cost: 2 },
  'PARSEDATE': { standardFunction: 'parseDate', category: 'String Functions', cost: 3 },
  'PARSEDECIMAL': { standardFunction: 'parseDecimal', category: 'String Functions', cost: 3 },
  'PARSEINT': { standardFunction: 'parseInt', category: 'String Functions', cost: 3 },
  'PARSEJSON': { standardFunction: 'parseJson', category: 'String Functions', cost: 4 },
  'REPLACE': { standardFunction: 'replace', category: 'String Functions', cost: 2 },
  'RIGHT': { standardFunction: 'right', category: 'String Functions', cost: 2 },
  'RTRIM': { standardFunction: 'rtrim', category: 'String Functions', cost: 2 },
  'SPLIT': { standardFunction: 'split', category: 'String Functions', cost: 2 },
  'STARTSWITH': { standardFunction: 'startsWith', category: 'String Functions', cost: 2 },
  'STRLEN': { standardFunction: 'strlen', category: 'String Functions', cost: 2 },
  'SUBSTRING': { standardFunction: 'substring', category: 'String Functions', cost: 2 },
  'TOLOWER': { standardFunction: 'toLower', category: 'String Functions', cost: 1 },
  'TOSTRING': { standardFunction: 'toString', category: 'String Functions', cost: 1 },
  'TOUPPER': { standardFunction: 'toUpper', category: 'String Functions', cost: 1 },
  'TRIM': { standardFunction: 'trim', category: 'String Functions', cost: 2 },

  // Table Calculation Functions
  'DIFFERENCE': { standardFunction: 'difference', category: 'Table Calculation Functions', cost: 5 },
  'LAG': { standardFunction: 'lag', category: 'Table Calculation Functions', cost: 5 },
  'LEAD': { standardFunction: 'lead', category: 'Table Calculation Functions', cost: 5 },
  'PERCENT_DIFFERENCE': { standardFunction: 'percentDifference', category: 'Table Calculation Functions', cost: 5 },
  'AVG_OVER': { standardFunction: 'avgOver', category: 'Table Calculation Functions', cost: 7 },
  'COUNT_OVER': { standardFunction: 'countOver', category: 'Table Calculation Functions', cost: 7 },
  'DISTINCT_COUNT_OVER': { standardFunction: 'distinctCountOver', category: 'Table Calculation Functions', cost: 7 },
  'MAX_OVER': { standardFunction: 'maxOver', category: 'Table Calculation Functions', cost: 7 },
  'MIN_OVER': { standardFunction: 'minOver', category: 'Table Calculation Functions', cost: 7 },
  'PERCENTILE_OVER': { standardFunction: 'percentileOver', category: 'Table Calculation Functions', cost: 8 },
  'PERCENTILE_CONT_OVER': { standardFunction: 'percentileContOver', category: 'Table Calculation Functions', cost: 8 },
  'PERCENTILE_DISC_OVER': { standardFunction: 'percentileDiscOver', category: 'Table Calculation Functions', cost: 8 },
  'SUM_OVER': { standardFunction: 'sumOver', category: 'Table Calculation Functions', cost: 7 },
  'STDEV_OVER': { standardFunction: 'stdevOver', category: 'Table Calculation Functions', cost: 8 },
  'STDEVP_OVER': { standardFunction: 'stdevpOver', category: 'Table Calculation Functions', cost: 8 },
  'VAR_OVER': { standardFunction: 'varOver', category: 'Table Calculation Functions', cost: 8 },
  'VARP_OVER': { standardFunction: 'varpOver', category: 'Table Calculation Functions', cost: 8 },
  'DENSERANK': { standardFunction: 'denseRank', category: 'Table Calculation Functions', cost: 6 },
  'RANK': { standardFunction: 'rank', category: 'Table Calculation Functions', cost: 6 },
  'PERCENTILERANK': { standardFunction: 'percentileRank', category: 'Table Calculation Functions', cost: 6 },
  'RUNNINGAVG': { standardFunction: 'runningAvg', category: 'Table Calculation Functions', cost: 7 },
  'RUNNINGCOUNT': { standardFunction: 'runningCount', category: 'Table Calculation Functions', cost: 7 },
  'RUNNINGMAX': { standardFunction: 'runningMax', category: 'Table Calculation Functions', cost: 7 },
  'RUNNINGMIN': { standardFunction: 'runningMin', category: 'Table Calculation Functions', cost: 7 },
  'RUNNINGSUM': { standardFunction: 'runningSum', category: 'Table Calculation Functions', cost: 7 },
  'FIRSTVALUE': { standardFunction: 'firstValue', category: 'Table Calculation Functions', cost: 6 },
  'LASTVALUE': { standardFunction: 'lastValue', category: 'Table Calculation Functions', cost: 6 },
  'WINDOWAVG': { standardFunction: 'windowAvg', category: 'Table Calculation Functions', cost: 8 },
  'WINDOWCOUNT': { standardFunction: 'windowCount', category: 'Table Calculation Functions', cost: 8 },
  'WINDOWMAX': { standardFunction: 'windowMax', category: 'Table Calculation Functions', cost: 8 },
  'WINDOWMIN': { standardFunction: 'windowMin', category: 'Table Calculation Functions', cost: 8 },
  'WINDOWSUM': { standardFunction: 'windowSum', category: 'Table Calculation Functions', cost: 8 },
};

export const getFunctionCategoryAndCost = (
  func: string,
): { category: string; cost: number } => {
  const functionName = func.split("(")[0].toUpperCase(); // Ensure case insensitivity
  const lowerCaseCategories = Object.keys(functionCategories).reduce(
    (acc, key) => {
      acc[key.toUpperCase()] = functionCategories[key];
      return acc;
    },
    {} as { [key: string]: { category: string; cost: number } },
  );

  return (
    lowerCaseCategories[functionName] || {
      category: "Unknown Category",
      cost: 1,
    }
  );
};

const lacFunctions = [
  "AVG",
  "COUNT",
  "COUNT_DISTINCT",
  "MAX",
  "MEDIAN",
  "MIN",
  "PERCENTILE_DISC",
  "PERCENTILE_CONT",
  "STDEV",
  "STDEVP",
  "SUM",
  "VAR",
  "VARP",
  "AVG_LACA",
  "COUNT_LACA",
  "COUNT_DISTINCT_LACA",
  "MAX_LACA",
  "MEDIAN_LACA",
  "MIN_LACA",
  "PERCENTILE_DISC_LACA",
  "PERCENTILE_CONT_LACA",
  "STDEV_LACA",
  "STDEVP_LACA",
  "SUM_LACA",
  "VAR_LACA",
  "VARP_LACA",
];

export const isLACFunction = (funcName: string): boolean => {
  return lacFunctions.includes(funcName.toUpperCase());
};

export const getStandardFunctionName = (funcName: string): string | undefined => {
  const lowerCaseFuncName = funcName.toLowerCase();
  const entry = Object.values(functionCategories).find(
    (entry) => entry.standardFunction.toLowerCase() === lowerCaseFuncName
  );
  return entry ? entry.standardFunction : undefined;
};



export type FunctionCategoryKeys = keyof typeof functionCategories;
