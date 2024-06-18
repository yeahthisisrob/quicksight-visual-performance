// types/interfaces.ts
export interface WebSocketMessage {
  type: string;
  time: number;
  opcode: number;
  data: string;
}

export interface APIMessage {
  type: string;
  request: {
    method: string;
    url: string;
    queryString: Array<{ name: string; value: string }>;
  };
  response?: {
    status: number;
    statusText: string;
    httpVersion: string;
    headers: { name: string; value: string }[];
    cookies: { name: string; value: string }[];
    content: {
      size: number;
      mimeType: string;
      text: string;
    };
    redirectURL: string;
    headersSize: number;
    bodySize: number;
    _transferSize: number;
    _error: any;
  };
}

export interface Expression {
  alias: string;
  expression: string;
  parsedExpression: any;
  type: string;
  cost?: number;
  isParsed?: boolean;
  hasError?: boolean;
  parsingError?: string;
  usedInQueryGen?: boolean;
  category?: string;
}

export interface Field extends Expression {
  name?: string;
  limit?: number;
  sort?: {
    name: string | null;
    dir: string;
    metric: {
      name: string;
      func: string;
    };
  } | null;
  chartContext?: string;
  offset?: number;
  partitioned?: boolean;
}

export interface CalculatedField extends Expression {
  category?: string;
  dataSetCalculation?: boolean;
  preProcessed?: boolean;
}

export interface Metric extends Expression {
  chartContext: string;
  category?: string;
  aggregation?: string;
}

export interface Hierarchy {
  [key: string]: any;
}

export interface ErrorMessage {
  errorCode: string;
  internalMessage: string;
}

export interface Node {
  id: string;
  label: string;
}

export interface Link {
  source: string;
  target: string;
}

export interface HarWebSocketMessage {
  type: string;
  time: number;
  opcode: number;
  data: string;
}

export interface HarRequest {
  method: string;
  url: string;
  queryString: Array<{ name: string; value: string }>;
}

export interface HarResponse {
  status: number;
  statusText: string;
  httpVersion: string;
  headers: { name: string; value: string }[];
  cookies: { name: string; value: string }[];
  content: {
    size: number;
    mimeType: string;
    text: string;
  };
  redirectURL: string;
  headersSize: number;
  bodySize: number;
  _transferSize: number;
  _error: any;
}

export interface HarEntry {
  _priority: string;
  _resourceType: string;
  startedDateTime: string;
  _webSocketMessages?: HarWebSocketMessage[];
  request?: HarRequest;
  response?: HarResponse;
}

export interface HarLog {
  entries: HarEntry[];
}

export interface NodeData {
  __hasError: boolean;
  __type: string;
  duration: number;
  startTime: number;
  endTime: number;
  requestCount: number;
  errorCode?: string;
  internalMessage?: string;
  parsedExpressionCount: number;
  highCostFunctionCount: number;
  tags: { [key: string]: boolean };
  badges: { [key: string]: boolean };
  fieldMap: { [key: string]: Expression };
  calculatedFieldMap: { [key: string]: Expression };
  parameterMap: { [key: string]: string };
  filterExpressions: Expression[];
  conditionalFormattingMetrics: Metric[];
  calculatedFields: CalculatedField[];
  metrics: Metric[];
  fields: any[];
  messages: WebSocketMessage[];
  dashboardId?: string;
  analysisId?: string;
  sheetId?: string;
  visualId?: string;
  visualType?: string;
  dashboardName?: string;
  sheetName?: string;
  visualName?: string;
  analysisName?: string;
  expressions?: Expression[];
  parameters?: {
    // New field for parameters
    parameterId: string;
    name: string;
    defaultValue: string;
    defaultValueList: string[] | null;
    dynamicDefaultValue: {
      dataSourceId: string;
      groupColumnId: string | null;
      multiValueEnabled: boolean;
      userColumnId: string;
      valueColumnId: string;
    } | null;
    expressionDefault: string | null;
    mappedDatasetParameters: string | null;
    multiValueEnabled: boolean;
    parameterType: string;
    type: string;
    valueWhenUnset: string;
  }[];
  filters?: {
    aggregateSheetControlsMetadata: any;
    aggregation: string;
    aggregationParameters: any;
    columnId: string;
    columnName: string | null;
    enabled: boolean;
    exactValueParameterId: string | null;
    filterId: string;
    filterType: string;
    inverse: boolean;
    matchNull: boolean;
    noopFilter: boolean;
    nullFilter: string;
    parameterIds: string[] | null;
    parameterMode: boolean;
    preparedDataSourceId: string;
    scope: string | null;
    scopeToVisualIds: string[] | null;
    sheetControlId: string | null;
    values: any[];
  }[];
}

export const initializeNodeData = (type: string = ""): NodeData => ({
  __hasError: false,
  __type: type,
  duration: 0,
  startTime: 0,
  endTime: 0,
  requestCount: 0,
  parsedExpressionCount: 0,
  highCostFunctionCount: 0,
  tags: {},
  badges: {},
  fieldMap: {},
  calculatedFieldMap: {},
  parameterMap: {},
  filterExpressions: [],
  conditionalFormattingMetrics: [],
  calculatedFields: [],
  metrics: [],
  fields: [],
  messages: [],
  dashboardId: "",
  analysisId: "",
  sheetId: "",
  visualId: "",
  visualType: "",
  dashboardName: "",
  sheetName: "",
  visualName: "",
  analysisName: "",
  expressions: [],
  parameters: [],
  filters: [],
});

export interface APIOperationResponse {
  operation: string;
  sheetId?: string;
  sheetName?: string;
  preparedDataSourceId?: string;
  dashboardId?: string;
  dashboardName?: string;
  visuals?: { visualId: string; visualName: string }[];
  analysisId?: string;
  analysisName?: string;
  sheetIds?: string[];
  parameters?: {
    parameterId: string;
    name: string;
    defaultValue: string;
    defaultValueList: string[] | null;
    dynamicDefaultValue: {
      dataSourceId: string;
      groupColumnId: string | null;
      multiValueEnabled: boolean;
      userColumnId: string;
      valueColumnId: string;
    } | null;
    expressionDefault: string | null;
    mappedDatasetParameters: string | null;
    multiValueEnabled: boolean;
    parameterType: string;
    type: string;
    valueWhenUnset: string;
  }[];
  filters?: {
    aggregateSheetControlsMetadata: any;
    aggregation: string;
    aggregationParameters: any;
    columnId: string;
    columnName: string | null;
    enabled: boolean;
    exactValueParameterId: string | null;
    filterId: string;
    filterType: string;
    inverse: boolean;
    matchNull: boolean;
    noopFilter: boolean;
    nullFilter: string;
    parameterIds: string[] | null;
    parameterMode: boolean;
    preparedDataSourceId: string;
    scope: string | null;
    scopeToVisualIds: string[] | null;
    sheetControlId: string | null;
    values: any[];
  }[];
  filterGroups?: {
    columnMappings: { [key: string]: any };
    crossDataset: any;
    enabled: boolean;
    filterGroupId: string;
    filterIds: string[];
    isExplorationFilterGroup: boolean;
    preparedDataSourceId: string;
    scope: string;
    scopeConfiguration: any;
    scopeToVisualIds: string[];
    sheetId: string;
  }[];
  preparedDataSource?: {
    calculatedColumns: {
      aggregate: boolean;
      analysisOnlyCalculation: boolean;
      columnId: string;
      dataType: string;
      expression: string;
      name: string;
    }[];
    dataPrepFilterList: {
      alias: string;
      filter: {
        aggregateSheetControlsMetadata: any;
        aggregation: string | null;
        aggregationParameters: any;
        columnId: string | null;
        columnName: string | null;
        enabled: boolean;
        filterId: string | null;
        filterType: string;
        inclusive: boolean;
        inverse: boolean;
        matchNull: boolean;
        noopFilter: boolean;
        nullFilter: string | null;
        parameterIds: string[] | null;
        parameterMode: boolean;
        preparedDataSourceId: string | null;
        rangeMaximum: number | null;
        rangeMaximumParameterId: string | null;
        rangeMinimum: number | null;
        rangeMinimumParameterId: string | null;
        scope: string | null;
        scopeToVisualIds: string[] | null;
        sheetControlId: string | null;
      };
    }[];
    datasetParameters: {
      analysisId: string | null;
      dashboardId: string | null;
      datasetId: string | null;
      defaultValue: string;
      defaultValueList: string[] | null;
      dynamicDefaultValue: any | null;
      expressionDefault: string | null;
      logicalTableId: string | null;
      mappedDatasetParameters: string | null;
      multiValueEnabled: boolean;
      name: string;
      overridden: boolean;
      parameterConsumers: any | null;
      parameterId: string;
      parameterType: string;
      type: string;
      valueWhenUnset: string | null;
      version: number | null;
    }[];
    databaseType: string | null;
    lastUpdated: number;
    name: string;
    preparedDataSourceId: string;
    sourceType: string;
  };
}
