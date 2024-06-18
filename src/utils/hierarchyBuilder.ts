import {
  WebSocketMessage,
  APIMessage,
  Expression,
  Metric,
  initializeNodeData,
  CalculatedField,
} from "../types/interfaces";
import {
  getStartVisDetails,
  extractRawDataFromMessage,
} from "./parsers/websocketMessageParser";
import { TreeMap, TreeNode, NodeData } from "./requestHierarchyTree";
import { NA_DURATION, DEFAULT_REQUEST_COUNT } from "../constants/constants";
import {
  getSheetNames,
  getDashboardNames,
  getVisualNames,
  getAnalysisNames,
  getParameterData,
  getFilterGroups,
  getFilters,
  getDataSourceData, // Import the function
} from "./parsers/apiOperationParser";
import { parseSQL } from "./sql/customParser";
import { ExpressionVisitor } from "./sql/visitors/expressionVisitor";

export const buildHierarchy = (
  groupedMessages: Map<string, WebSocketMessage[]>,
  apiMessages: Map<string, APIMessage>,
): {
  hierarchy: TreeMap<NodeData>;
  expressions: Expression[];
  parameterMap: { [key: string]: string };
  fields: any[];
  counts: {
    dashboardCount: number;
    analysisCount: number;
    sheetCount: number;
    visualCount: number;
    requestCount: number;
  };
} => {
  const hierarchy = new TreeMap<NodeData>("Explorations", initializeNodeData());
  const expressions: Expression[] = [];
  const parameterMap: { [key: string]: string } = {};
  const fields: any[] = [];

  const dashboardIds = new Set<string>();
  const analysisIds = new Set<string>();
  const sheetIds = new Set<string>();
  const visualIds = new Set<string>();
  const requestIds = new Set<string>();

  const sheetNames = getSheetNames(apiMessages);
  const dashboardNames = getDashboardNames(apiMessages);
  const visualNames = getVisualNames(apiMessages);
  const analysisNames = getAnalysisNames(apiMessages);
  const parameterData = getParameterData(apiMessages);
  const filterGroups = getFilterGroups(apiMessages);
  const filters = getFilters(apiMessages);
  const dataSourceData = getDataSourceData(apiMessages); // Retrieve the data source data

  let dashboardCount = 0;
  let analysisCount = 0;
  let sheetCount = 0;
  let visualCount = 0;
  let requestCount = 0;

  const requestDurations: { requestId: string; duration: number }[] = [];

  groupedMessages.forEach((messages, requestId) => {
    const {
      dashboardId,
      analysisId,
      sheetId,
      visualId,
      visualType,
      startTime,
      endTime,
      duration,
      errorCode,
      internalMessage,
      dataSourceId,
    } = getStartVisDetails(messages);

    const {
      fieldMap: extractedFieldMap,
      calculatedFieldMap: extractedCalculatedFieldMap,
      parameterMap: extractedParameterMap,
      filterExpressions: extractedFilterExpressions,
      conditionalFormattingMetrics: extractedConditionalFormattingMetrics,
      calculatedFields: extractedCalculatedFields,
      metrics: extractedMetrics,
      fields: extractedFields,
      aliasToFuncMap,
      isTotals,
      isComputationsOnly,
      isEnableOtherBucket,
    } = extractRawDataFromMessage(messages);

    // Add dataset calculated fields to the extracted calculated fields
    const datasetCalculatedFields =
      dataSourceData.get(dataSourceId)?.calculatedColumns || [];
    datasetCalculatedFields.forEach((field: any) => {
      const expression: CalculatedField = {
        alias: field.name,
        parsedExpression: null,
        cost: 0,
        type: "calculatedField",
        expression: field.expression,
        dataSetCalculation: true,
        preProcessed:
          field.aggregate === false && field.analysisOnlyCalculation === false,
      };
      extractedCalculatedFields.push(expression);
    });

    const allExpressions = [
      ...Object.values(aliasToFuncMap),
      ...extractedFilterExpressions,
      ...extractedCalculatedFields,
      ...extractedConditionalFormattingMetrics,
      ...extractedFields,
      ...extractedMetrics,
    ];

    // Mark expressions used in query generation
    allExpressions.forEach((expression) => {
      // Skip parsing for Metrics with CUSTOM aggregation
      if (
        ["metric", "conditionalFormattingMetric"].includes(expression.type) &&
        (expression as Metric).aggregation === "CUSTOM"
      ) {
        expression.isParsed = false;
        expression.usedInQueryGen = true;
        return;
      }

      if (!(expression as CalculatedField).preProcessed) {
        try {
          const { parsedExpression } = parseSQL(expression.expression);
          expression.parsedExpression = parsedExpression;
          expression.isParsed = true;
        } catch (error) {
          expression.isParsed = false;
          expression.hasError = true;
          expression.parsingError =
            error instanceof Error ? error.message : String(error);
        }
      }

      if (
        expression.type === "filterExpression" ||
        expression.type === "metric" ||
        expression.type === "field" ||
        expression.type === "conditionalFormattingMetric"
      ) {
        expression.usedInQueryGen = true;
      }
    });

    let totalCost = 0;
    allExpressions.forEach((expression) => {
      if (!expression.isParsed || !expression.parsedExpression) {
        return;
      }
      const expressionVisitor = new ExpressionVisitor(
        allExpressions,
        parameterMap,
      );
      expressionVisitor.visit(expression.parsedExpression);
      const isAggregation = expressionVisitor.isAggregation;
      const isStringFunction = expressionVisitor.isStringFunction;
      const expressionCost = expressionVisitor.totalCost;
      expression.cost = expressionCost;
    });

    totalCost = allExpressions.reduce((sum, expr) => sum + (expr.cost ?? 0), 0);
    const parsingError = allExpressions.some((expr) => expr.hasError);
    const parsedExpressionCount = allExpressions.filter(
      (expr) => expr.isParsed && expr.usedInQueryGen,
    ).length;
    const typeKey = dashboardId ? "Dashboards" : "Analyses";
    const explorationId = dashboardId || analysisId;

    if (!explorationId || !sheetId || !visualId) return;

    if (dashboardId) dashboardIds.add(dashboardId);
    if (analysisId) analysisIds.add(analysisId);
    sheetIds.add(sheetId);
    visualIds.add(visualId);
    requestIds.add(requestId);

    if (duration !== NA_DURATION) {
      requestDurations.push({ requestId, duration: parseFloat(duration) });
    }

    // Add nodes to the hierarchy
    const dashboardNode = hierarchy.addNode([], typeKey, {
      ...initializeNodeData(typeKey),
      dashboardId,
      dashboardName: dashboardNames.get(dashboardId) || dashboardId,
    });

    const explorationNode = hierarchy.addNode([typeKey], explorationId, {
      ...initializeNodeData(explorationId),
      dashboardId,
      dashboardName: dashboardNames.get(dashboardId) || dashboardId,
      analysisId,
      analysisName: analysisNames.get(analysisId) || analysisId,
    });

    const sheetNode = hierarchy.addNode([typeKey, explorationId], sheetId, {
      ...initializeNodeData(sheetId),
      sheetId,
      sheetName: sheetNames.get(sheetId) || sheetId,
    });

    const visualNode = hierarchy.addNode(
      [typeKey, explorationId, sheetId],
      visualId,
      {
        ...initializeNodeData(visualId),
        visualId,
        visualType,
        visualName: visualNames.get(visualId) || visualId,
      },
    );

    const tags: { [key: string]: boolean } = {
      highCost: totalCost > 50,
      parsingError,
    };

    // Sort tags by priority before adding the request node
    const sortedTags = sortTagsByPriority(tags);

    const requestNode = hierarchy.addNode(
      [typeKey, explorationId, sheetId, visualId],
      requestId,
      {
        ...initializeNodeData(),
        __hasError: !!errorCode,
        duration: duration !== NA_DURATION ? parseFloat(duration) : 0,
        startTime: startTime,
        endTime: endTime,
        requestCount: DEFAULT_REQUEST_COUNT,
        errorCode,
        internalMessage,
        parsedExpressionCount,
        highCostFunctionCount: tags.highCost ? 1 : 0,
        tags: sortedTags,
        badges: {
          isTotals,
          isComputationsOnly,
          isEnableOtherBucket: !isEnableOtherBucket,
          // Add more badges here
        },
        fieldMap: { ...extractedFieldMap },
        calculatedFieldMap: { ...extractedCalculatedFieldMap },
        parameterMap: { ...extractedParameterMap },
        filterExpressions: [...extractedFilterExpressions],
        calculatedFields: [...extractedCalculatedFields],
        metrics: [...extractedMetrics],
        fields: [...extractedFields],
        messages: [...messages],
        dashboardId,
        analysisId,
        sheetId,
        visualId,
        visualType,
        dashboardName: dashboardNames.get(dashboardId) || dashboardId,
        sheetName: sheetNames.get(sheetId) || sheetId,
        visualName: visualNames.get(visualId) || visualId,
        analysisName: analysisNames.get(analysisId) || analysisId,
        expressions: [...allExpressions],
      },
    );

    // Add parameters to the request node
    if (requestNode) {
      const requestParameterMap = requestNode.data.parameterMap;
      const parameters = Object.keys(requestParameterMap)
        .map((paramId) => parameterData.get(paramId))
        .filter((param) => param !== undefined); // Filter out undefined values
      requestNode.data.parameters = parameters;
    }

    // Add filters and filter groups to the request node
    if (requestNode) {
      const scopedFilterGroups = Array.from(filterGroups.values()).filter(
        (group) => {
          return group.scopeToVisualIds?.some((scopeId: string) => {
            const scopeIdParts = scopeId.split("_");
            const scopeIdSuffix = scopeIdParts[scopeIdParts.length - 1];
            return scopeIdSuffix === visualId;
          });
        },
      );

      const associatedFilters = scopedFilterGroups.flatMap(
        (group) =>
          group.filterIds
            .map((filterId: string) => filters.get(filterId))
            .filter(Boolean), // Remove null values
      );

      requestNode.data.filters = associatedFilters;
    }

    // Merge extracted data from messages
    expressions.push(...allExpressions);
    Object.assign(parameterMap, extractedParameterMap);
    fields.push(...extractedFields);

    dashboardCount = dashboardIds.size;
    analysisCount = analysisIds.size;
    sheetCount = sheetIds.size;
    visualCount = visualIds.size;
    requestCount = requestIds.size;

    if (!requestNode || !visualNode || !sheetNode || !explorationNode) return;
  });

  // Identify long durations at the request level
  if (requestDurations.length > 0) {
    const mean =
      requestDurations.reduce((sum, { duration }) => sum + duration, 0) /
      requestDurations.length;
    const stdDev = Math.sqrt(
      requestDurations.reduce(
        (sum, { duration }) => sum + Math.pow(duration - mean, 2),
        0,
      ) / requestDurations.length,
    );
    requestDurations.forEach(({ requestId, duration }) => {
      if (duration > mean + 3 * stdDev) {
        const pathToRequest = hierarchy.findPathToRequestId(
          hierarchy.root,
          requestId,
          [],
        );
        const requestNode = hierarchy.findNode(pathToRequest);
        if (requestNode) {
          requestNode.data.tags.longDuration = true;
        }
      }
    });
  }

  // Calculate group metrics
  calculateGroupMetrics(hierarchy.root);

  return {
    hierarchy,
    expressions,
    parameterMap,
    fields,
    counts: {
      dashboardCount,
      analysisCount,
      sheetCount,
      visualCount,
      requestCount,
    },
  };
};

const sortTagsByPriority = (tags: { [key: string]: boolean }) => {
  const priorities: { [key: string]: number } = {
    highCost: 2,
    longDuration: 3,
    parsingError: 1,
  };
  return Object.keys(tags)
    .filter((tag) => tags[tag])
    .sort((a, b) => (priorities[a] || 999) - (priorities[b] || 999))
    .reduce(
      (sortedTags, key) => {
        sortedTags[key] = tags[key];
        return sortedTags;
      },
      {} as typeof tags,
    );
};

const calculateGroupMetrics = (node: TreeNode<NodeData>) => {
  if (node.children.size === 0) {
    // If the node has no children, retain its current error state and duration
    return;
  }

  node.children.forEach((child) => {
    calculateGroupMetrics(child);
  });

  const durations: number[] = [];
  const requestCounts: number[] = [];
  let hasError = node.data.__hasError; // Retain the error state of the current node
  let parsedExpressionCount = node.data.parsedExpressionCount || 0;
  let highCostFunctionCount = node.data.highCostFunctionCount || 0;
  let tags = { ...node.data.tags };

  // Initialize startTime and endTime to the values of the first child
  let startTime: number | null = null;
  let endTime: number | null = null;

  node.children.forEach((child) => {
    durations.push(child.data.duration);
    requestCounts.push(child.data.requestCount);

    parsedExpressionCount += child.data.parsedExpressionCount || 0;
    highCostFunctionCount += child.data.highCostFunctionCount || 0;

    if (child.data.__hasError) hasError = true;

    // Propagate tags up the tree
    Object.keys(child.data.tags).forEach((tag) => {
      if (child.data.tags[tag]) {
        tags[tag] = true;
      }
    });

    // Propagate error status up the tree
    if (child.data.errorCode) {
      hasError = true;
    }

    // Update startTime and endTime to be the min and max of all children
    if (startTime === null || child.data.startTime < startTime) {
      startTime = child.data.startTime;
    }
    if (endTime === null || child.data.endTime > endTime) {
      endTime = child.data.endTime;
    }
  });

  if (durations.length > 0) {
    node.data.duration = durations.reduce((sum, duration) => sum + duration, 0);
  }

  if (requestCounts.length > 0) {
    node.data.requestCount = requestCounts.reduce(
      (sum, count) => sum + count,
      0,
    );
  }

  node.data.__hasError = hasError;
  node.data.parsedExpressionCount = parsedExpressionCount;
  node.data.highCostFunctionCount = highCostFunctionCount;

  // If any child has a highCost tag, set it on the current node
  if (tags.highCost || highCostFunctionCount > 2) {
    tags.highCost = true;
  }

  // Sort tags by priority before assigning back to node.data.tags
  node.data.tags = sortTagsByPriority(tags);

  // Set the node's startTime and endTime to the calculated values
  if (startTime !== null) {
    node.data.startTime = startTime;
  }
  if (endTime !== null) {
    node.data.endTime = endTime;
  }
};

export const filterHierarchyByRequestId = (
  hierarchy: TreeMap<NodeData>,
  requestId: string,
): TreeMap<NodeData> | null => {
  const findRequestNode = (
    node: TreeNode<NodeData>,
  ): TreeNode<NodeData> | null => {
    if (node.key === requestId) {
      return node;
    }
    const childrenArray = Array.from(node.children.values());
    for (const child of childrenArray) {
      const result = findRequestNode(child);
      if (result) {
        return result;
      }
    }
    return null;
  };

  const requestNode = findRequestNode(hierarchy.root);
  if (!requestNode) return null;

  const filteredHierarchy = new TreeMap<NodeData>("root", initializeNodeData());
  filteredHierarchy.root = requestNode;
  return filteredHierarchy;
};
