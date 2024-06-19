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
  getDataSourceData,
  getHeaderData,
  getCalculatedColumns,
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
  const dataSourceData = getDataSourceData(apiMessages);
  const headerData = getHeaderData(apiMessages);
  const dataSourceOverlays = getCalculatedColumns(apiMessages);

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

    const datasetCalculatedFields =
      dataSourceData.get(dataSourceId)?.calculatedColumns || [];
    datasetCalculatedFields.forEach((field: any) => {
      const expression: CalculatedField = {
        alias: field.name,
        userAlias: dataSourceOverlays.get(field.name)?.name || field.name,
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

    const parsedExpressions: { [key: string]: Expression } = {};

    // First Pass: Parse expressions and populate parsedExpressions map
    const calculatedFieldAliases = new Set(
      allExpressions
        .filter((expr) => expr.type === "calculatedField")
        .map((expr) => expr.alias),
    );

    allExpressions.forEach((expression) => {
      if (
        (["field"].includes(expression.type) &&
          calculatedFieldAliases.has(expression.alias)) ||
        (["metric", "conditionalFormattingMetric"].includes(expression.type) &&
          (expression as Metric).aggregation === "CUSTOM")
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

      if (expression.isParsed && expression.parsedExpression) {
        parsedExpressions[expression.alias] = expression;
      }
    });

    // Second Pass: Calculate costs and depths
    let totalCost = 0;
    Object.values(parsedExpressions).forEach((expression) => {
      const expressionVisitor = new ExpressionVisitor(
        Object.values(parsedExpressions),
        parameterMap,
      );
      expressionVisitor.visit(expression.parsedExpression);
      const expressionCost = expressionVisitor.totalCost;
      const maxDepth = expressionVisitor.getMaxDepth
        ? expressionVisitor.getMaxDepth()
        : 0;
      expression.cost = expressionCost;
      expression.maxDepth = maxDepth;

      totalCost += expressionCost;
    });

    // Third Pass: Assign costs and depths to metrics and conditional formatting metrics
    allExpressions.forEach((expression) => {
      expression.userAlias =
        dataSourceOverlays.get(expression.alias)?.name || expression.alias;
      if (["metric", "conditionalFormattingMetric"].includes(expression.type)) {
        const calculatedField = parsedExpressions[expression.alias];
        if (calculatedField) {
          expression.cost = calculatedField.cost;
          expression.maxDepth = calculatedField.maxDepth;
        }
      }
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

    const dataSourceDataEntry = dataSourceData.get(dataSourceId);
    const dataSourceName = dataSourceDataEntry?.name || dataSourceId;
    const dataSourceType = dataSourceDataEntry?.databaseType
      ? dataSourceDataEntry.databaseType
      : dataSourceDataEntry?.sourceType || "Unknown";
    const uniquedataSourceId = sheetId + "_" + dataSourceId;

    const dataSourceNode = hierarchy.addNode(
      [typeKey, explorationId, sheetId],
      uniquedataSourceId,
      {
        ...initializeNodeData(uniquedataSourceId),
        dataSourceId,
        dataSourceName,
        dataSourceType, // Ensure dataSourceType is assigned here
      },
    );

    const visualNode = hierarchy.addNode(
      [typeKey, explorationId, sheetId, uniquedataSourceId],
      visualId,
      {
        ...initializeNodeData(visualId),
        visualId,
        visualType,
        visualName: visualNames.get(visualId) || visualId,
      },
    );

    const tags: { [key: string]: boolean } = {
      highCost: totalCost > 150,
      parsingError,
    };

    const sortedTags = sortTagsByPriority(tags);

    const requestNode = hierarchy.addNode(
      [typeKey, explorationId, sheetId, uniquedataSourceId, visualId],
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
        dataSourceId,
        visualId,
        visualType,
        dashboardName: dashboardNames.get(dashboardId) || dashboardId,
        sheetName: sheetNames.get(sheetId) || sheetId,
        dataSourceName,
        dataSourceType, // Ensure dataSourceType is assigned here
        visualName: visualNames.get(visualId) || visualId,
        analysisName: analysisNames.get(analysisId) || analysisId,
        expressions: [...allExpressions],
        userAgent: headerData.userAgent,
        origin: headerData.origin,
        requestId: requestId,
        cost: totalCost,
      },
    );

    if (requestNode) {
      const requestParameterMap = requestNode.data.parameterMap;
      const parameters = Object.keys(requestParameterMap)
        .map((paramId) => parameterData.get(paramId))
        .filter((param) => param !== undefined);
      requestNode.data.parameters = parameters;
    }

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

      const associatedFilters = scopedFilterGroups.flatMap((group) =>
        group.filterIds
          .map((filterId: string) => filters.get(filterId))
          .filter(Boolean),
      );

      requestNode.data.filters = associatedFilters;
    }

    expressions.push(...allExpressions);
    Object.assign(parameterMap, extractedParameterMap);
    fields.push(...extractedFields);

    dashboardCount = dashboardIds.size;
    analysisCount = analysisIds.size;
    sheetCount = sheetIds.size;
    visualCount = visualIds.size;
    requestCount = requestIds.size;

    if (
      !requestNode ||
      !visualNode ||
      !sheetNode ||
      !dataSourceNode ||
      !explorationNode
    )
      return;
  });

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
    longDuration: 1,
    parsingError: 3,
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
    return;
  }

  node.children.forEach((child) => {
    calculateGroupMetrics(child);
  });

  const durations: number[] = [];
  const requestCounts: number[] = [];
  let hasError = node.data.__hasError;
  let parsedExpressionCount = node.data.parsedExpressionCount || 0;
  let highCostFunctionCount = node.data.highCostFunctionCount || 0;
  let tags = { ...node.data.tags };
  let totalCost = node.data.cost || 0;

  let startTime: number | null = null;
  let endTime: number | null = null;
  let origin: string | null = node.data.origin || null;
  let userAgent: string | null = node.data.userAgent || null;

  node.children.forEach((child) => {
    durations.push(child.data.duration);
    requestCounts.push(child.data.requestCount);

    parsedExpressionCount += child.data.parsedExpressionCount || 0;
    highCostFunctionCount += child.data.highCostFunctionCount || 0;
    totalCost += child.data.cost || 0;

    if (child.data.__hasError) hasError = true;

    Object.keys(child.data.tags).forEach((tag) => {
      if (child.data.tags[tag]) {
        tags[tag] = true;
      }
    });

    if (child.data.errorCode) {
      hasError = true;
    }

    if (startTime === null || child.data.startTime < startTime) {
      startTime = child.data.startTime;
    }
    if (endTime === null || child.data.endTime > endTime) {
      endTime = child.data.endTime;
    }
    if (child.data.origin) {
      origin = child.data.origin;
    }
    if (child.data.userAgent) {
      userAgent = child.data.userAgent;
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
  node.data.cost = totalCost;

  if (tags.highCost || highCostFunctionCount > 2) {
    tags.highCost = true;
  }

  node.data.tags = sortTagsByPriority(tags);

  if (startTime !== null) {
    node.data.startTime = startTime;
  }
  if (endTime !== null) {
    node.data.endTime = endTime;
  }
  if (origin !== null) {
    node.data.origin = origin;
  }
  if (userAgent !== null) {
    node.data.userAgent = userAgent;
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
