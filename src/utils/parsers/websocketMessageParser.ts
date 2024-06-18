// utils/websocketMessageParser.ts
import {
  WebSocketMessage,
  CalculatedField,
  Metric,
  Expression,
  Field,
  NodeData,
  initializeNodeData,
} from "../../types/interfaces";
import {
  UNKNOWN_ERROR_CODE,
  UNKNOWN_INTERNAL_MESSAGE,
  NOT_DIRTY_DATA_STATUS,
  START_VIS_TYPE,
  DURATION_ERROR,
} from "../../constants/constants";

/**
 * Groups WebSocket messages by CID.
 *
 * @param messages - Map of WebSocket messages.
 * @returns Map of grouped messages by CID.
 */
export const groupMessagesByCid = (
  messages: Map<string, WebSocketMessage>,
  selectedCid?: string,
): Map<string, WebSocketMessage[]> => {
  const groupedMessages = new Map<string, WebSocketMessage[]>();
  messages.forEach((message) => {
    const data = JSON.parse(message.data);
    const cids = Array.isArray(data.cids)
      ? data.cids
      : data.cid
        ? [data.cid]
        : [];

    if (selectedCid && !cids.includes(selectedCid)) {
      return;
    }

    cids.forEach((cid: string) => {
      if (!groupedMessages.has(cid)) {
        groupedMessages.set(cid, []);
      }
      groupedMessages.get(cid)!.push(message);
    });
  });
  return groupedMessages;
};

export const getStartVisDetails = (messages: WebSocketMessage[]): any => {
  const startVis = messages.find(
    (msg) => JSON.parse(msg.data).type === START_VIS_TYPE,
  );
  const stopVis = messages.find(
    (msg) => JSON.parse(msg.data).status === NOT_DIRTY_DATA_STATUS,
  );

  let errorCode: string | undefined;
  let internalMessage: string | undefined;
  let stopTime = stopVis ? stopVis.time : undefined;

  // Check for error messages
  messages.forEach((message) => {
    const data = JSON.parse(message.data);
    if (data.error || data.errorCodeHierarchyPrimitiveModel) {
      errorCode =
        data.errorCodeHierarchyPrimitiveModel?.[0]?.name || UNKNOWN_ERROR_CODE;
      internalMessage = data.internalMessage || UNKNOWN_INTERNAL_MESSAGE;
      // Consider error message as stop time if no other stop time is available
      if (!stopTime) {
        stopTime = message.time;
      }
    }
  });

  if (startVis) {
    const data = JSON.parse(startVis.data);
    const dashboardOrAnalysisId =
      data.request.dashboardId || data.request.analysisId || "";
    const parseId = (id: string | null) =>
      id ? id.replace(`${dashboardOrAnalysisId}_`, "") : "";

    const duration =
      startVis && stopTime
        ? (stopTime - startVis.time).toFixed(2)
        : DURATION_ERROR;

    return {
      analysisId: data.request.analysisId || "",
      dashboardId: data.request.dashboardId || "",
      sheetId: parseId(data.request.sheetId),
      visualId: parseId(data.request.visualId),
      requestId: data.cid,
      visualType: data.request.visualType || "",
      startTime: (startVis.time ?? 0) * 1000,
      endTime: stopTime ? (stopTime ?? 0) * 1000 : 0,
      duration,
      errorCode,
      internalMessage,
      dataSourceId: data.request.streamSourceId || "", // Added dataSourceId
    };
  }

  return null;
};

export const extractRawDataFromMessage = (messages: WebSocketMessage[]) => {
  const fieldMap: { [key: string]: Expression } = {};
  const calculatedFieldMap: { [key: string]: Expression } = {};
  const parameterMap: { [key: string]: string } = {};
  const filterExpressions: Expression[] = [];
  const conditionalFormattingMetrics: Metric[] = [];
  const calculatedFields: CalculatedField[] = [];
  const metrics: Metric[] = [];
  const fields: Expression[] = [];
  const aliasToFuncMap: { [key: string]: Expression } = {};
  let isTotals = false;
  let isComputationsOnly = false;
  let isEnableOtherBucket = true;

  messages.forEach((message) => {
    const data = JSON.parse(message.data);
    if (data.request && data.request.computationsOnly) {
      isComputationsOnly = true;
    }
    if (data.request && data.request.cfg) {
      const {
        group,
        parameters,
        calculatedFields: calcFields,
        filterExpressions: filters,
      } = data.request.cfg;

      if (parameters) {
        Object.keys(parameters).forEach((paramKey) => {
          parameterMap[paramKey] = parameters[paramKey];
        });
      }
      if (calcFields) {
        calcFields.forEach((field: any) => {
          const expression: Expression = {
            alias: field.alias,
            parsedExpression: null,
            cost: 0,
            type: "calculatedField",
            expression: field.func,
          };
          aliasToFuncMap[field.alias] = expression;
        });
      }
      if (group && group.fields) {
        group.fields.forEach((field: any) => {
          if (field.enableOtherBucket === false) {
            isEnableOtherBucket = false;
          }
          const fieldExpression: Field = {
            alias: field.name,
            name: field.name,
            limit: field.limit,
            sort: field.sort,
            chartContext: field.chartContext,
            offset: field.offset,
            partitioned: field.partitioned,
            parsedExpression: null,
            cost: 0,
            type: "field",
            expression: "{" + field.name + "}",
          };
          fields.push(fieldExpression);
        });
      }
      if (filters) {
        filters.forEach((filter: string, index: number) => {
          const expression: Expression = {
            alias: `Filter ${index + 1}`,
            parsedExpression: null,
            cost: 0,
            type: "filterExpression",
            expression: filter,
          };
          filterExpressions.push(expression);
        });
      }
      if (group && group.metrics) {
        group.metrics.forEach((metric: any) => {
          const { name, func, chartContext, totalFields } = metric;
          // TODO fix this
          const category = "";
          if (totalFields) {
            isTotals = true;
          }
          const metricExpression: Metric = {
            alias: name,
            chartContext,
            category,
            parsedExpression: null,
            cost: 0,
            type: "metric",
            aggregation: func,
            expression: func + "({" + name + "})",
          };
          metrics.push(metricExpression);
        });
      }
      if (group && group.conditionalFormattingMetrics) {
        group.conditionalFormattingMetrics.forEach((metric: any) => {
          const { name, func, chartContext } = metric;
          // TODO: fix this
          const category = "";
          const metricExpression: Metric = {
            alias: name,
            chartContext,
            category,
            parsedExpression: null,
            cost: 0,
            type: "conditionalFormattingMetric",
            aggregation: func,
            expression: func + "({" + name + "})",
          };
          conditionalFormattingMetrics.push(metricExpression);
        });
      }
    }
  });

  return {
    fieldMap,
    calculatedFieldMap,
    parameterMap,
    filterExpressions,
    conditionalFormattingMetrics,
    calculatedFields,
    metrics,
    fields,
    aliasToFuncMap, // Include this for later use
    isTotals,
    isComputationsOnly,
    isEnableOtherBucket,
  };
};
