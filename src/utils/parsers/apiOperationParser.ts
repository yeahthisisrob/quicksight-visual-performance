// utils/parsers/apiOperationParser.ts
import { APIMessage, APIOperationResponse } from "../../types/interfaces";
import * as he from "he";

export const apiMessageParser = (
  apiMessage: APIMessage,
): APIOperationResponse | null => {
  try {
    const { request, response } = apiMessage;
    let dashboardId;
    let dashboardName;
    let parameters;
    let filterGroups;
    let filters;
    let preparedDataSourceResults;
    let preparedDataSourceOverlays;

    if (!request || !request.queryString) {
      console.error("Request or query string missing in API message.");
      return null;
    }

    const operationQueryParam = request.queryString.find(
      (param) => param.name === "Operation",
    );

    if (!operationQueryParam) {
      if (
        response &&
        response.content &&
        response.content.mimeType === "text/html"
      ) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(response.content.text, "text/html");

        // Find the div element by its id
        const divElement = doc.getElementById("page-type-metadata");

        // Decode HTML entities
        if (divElement) {
          const decodedString = he.decode(divElement.textContent || "");
          try {
            const data = JSON.parse(decodedString);
            dashboardId = data.dashboardMetadata.dashboard.dashboardId;
            dashboardName = data.dashboardMetadata.dashboard.dashboardName;
            parameters = data.dashboardMetadata.parameters;
            filters = data.dashboardMetadata.filters;
            filterGroups = data.dashboardMetadata.filterGroups;
            preparedDataSourceResults =
              data.dashboardMetadata.preparedDataSourceResults;
            preparedDataSourceOverlays =
              data.dashboardMetadata.preparedDataSourceOverlays;
          } catch (error) {
            console.error("Error parsing JSON:", error);
          }
        }

        return {
          operation: "Document",
          dashboardId,
          dashboardName,
          parameters,
          filterGroups,
          filters,
          preparedDataSourceResults,
          preparedDataSourceOverlays,
        };
      }
    } else {
      if (response && response.content && response.content.text) {
        const responseData = JSON.parse(response.content.text);

        let sheetId = responseData.sheet?.sheetId || "";
        const sheetName = responseData.sheet?.name || "";
        const preparedDataSourceId =
          responseData.sheet?.preparedDataSourceId || "";
        const dashboardId = responseData.dashboard?.dashboardId || "";
        const dashboardName = responseData.dashboard?.dashboardName || "";

        const visuals =
          responseData.visuals?.map((visual: any) => {
            let visualId = visual.visualId || "";
            if (visualId.includes("_")) {
              const parts = visualId.split("_");
              visualId = parts[1] || "";
            }
            return {
              visualId,
              visualName: visual.name || "",
            };
          }) || [];

        if (sheetId.includes("_")) {
          const parts = sheetId.split("_");
          if (
            operationQueryParam.value === "GetSheetForDashboard" ||
            operationQueryParam.value === "GetSheet"
          ) {
            sheetId = parts[1] || "";
          }
        }

        // Handle GetAnalysis operation
        if (operationQueryParam.value === "GetAnalysis") {
          const analysisId = responseData.analysis?.analysisId || "";
          const analysisName = responseData.analysis?.name || "";
          const sheetIds = responseData.sheetIds || [];
          return {
            operation: operationQueryParam.value,
            analysisId,
            analysisName,
            sheetIds,
          };
        }

        // Handle ListParametersInAnalysis operation
        if (operationQueryParam.value === "ListParametersInAnalysis") {
          const parameters = responseData.parameters?.map((param: any) => ({
            parameterId: param.parameterId,
            name: param.name,
            defaultValue: param.defaultValue,
            defaultValueList: param.defaultValueList,
            dynamicDefaultValue: param.dynamicDefaultValue,
            expressionDefault: param.expressionDefault,
            mappedDatasetParameters: param.mappedDatasetParameters,
            multiValueEnabled: param.multiValueEnabled,
            parameterType: param.parameterType,
            type: param.type,
            valueWhenUnset: param.valueWhenUnset,
          }));
          return {
            operation: operationQueryParam.value,
            analysisId: responseData.parameters[0]?.analysisId || "",
            parameters,
          };
        }

        // Handle ListFiltersInSheet operation
        if (operationQueryParam.value === "ListFiltersInSheet") {
          const filterGroups = responseData.filterGroups?.map((group: any) => ({
            filterGroupId: group.filterGroupId,
            columnMappings: group.columnMappings,
            crossDataset: group.crossDataset,
            enabled: group.enabled,
            filterIds: group.filterIds,
            isExplorationFilterGroup: group.isExplorationFilterGroup,
            preparedDataSourceId: group.preparedDataSourceId,
            scope: group.scope,
            scopeConfiguration: group.scopeConfiguration,
            scopeToVisualIds: group.scopeToVisualIds,
            sheetId: group.sheetId,
          }));
          const filters = responseData.filters?.map((filter: any) => ({
            filterId: filter.filterId,
            columnId: filter.columnId,
            columnName: filter.columnName,
            enabled: filter.enabled,
            filterType: filter.filterType,
            exactValueParameterId: filter.exactValueParameterId,
            inverse: filter.inverse,
            matchNull: filter.matchNull,
            noopFilter: filter.noopFilter,
            nullFilter: filter.nullFilter,
            parameterIds: filter.parameterIds,
            parameterMode: filter.parameterMode,
            preparedDataSourceId: filter.preparedDataSourceId,
            scope: filter.scope,
            scopeToVisualIds: filter.scopeToVisualIds,
            sheetControlId: filter.sheetControlId,
            values: filter.values,
          }));
          return {
            operation: operationQueryParam.value,
            sheetId,
            filterGroups,
            filters,
          };
        }

        // Handle GetPreparedDataSourceForDashboard and GetPreparedDataSourceForAnalysis operations
        if (
          operationQueryParam.value === "GetPreparedDataSourceForDashboard" ||
          operationQueryParam.value === "GetPreparedDataSourceForAnalysis"
        ) {
          const preparedDataSource = {
            calculatedColumns:
              responseData.preparedDataSource.dataPrepInstruction
                .dataPrepConfiguration.calculatedColumns,
            dataPrepFilterList:
              responseData.preparedDataSource.dataPrepInstruction
                .dataPrepConfiguration.dataPrepFilterList,
            datasetParameters:
              responseData.preparedDataSource.dataPrepInstruction
                .dataPrepConfiguration.datasetParameters,
            databaseType: responseData.preparedDataSource.databaseType,
            lastUpdated: responseData.preparedDataSource.lastUpdated,
            name: responseData.preparedDataSource.name,
            preparedDataSourceId:
              responseData.preparedDataSource.preparedDataSourceId,
            sourceType: responseData.preparedDataSource.sourceType,
          };
          return {
            operation: operationQueryParam.value,
            preparedDataSource,
          };
        }

        // Handle ListPreparedDataSourceOverlays operation
        if (operationQueryParam.value === "ListPreparedDataSourceOverlays") {
          const preparedDataSourceOverlays =
            responseData.preparedDataSourceOverlays?.map((overlay: any) => ({
              calculatedColumns: overlay.calculatedColumns,
              columns: overlay.columns,
              overlayId: overlay.overlayId,
              parameters: overlay.parameters,
              preparedDataSourceId: overlay.preparedDataSourceId,
            }));
          return {
            operation: operationQueryParam.value,
            preparedDataSourceOverlays,
          };
        }

        return {
          operation: operationQueryParam.value,
          sheetId,
          sheetName,
          preparedDataSourceId,
          dashboardId,
          dashboardName,
          visuals,
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error parsing API message:", error);
    return null;
  }
};

export const getSheetNames = (apiMessages: Map<string, APIMessage>) => {
  const sheetNames = new Map<string, string>();
  apiMessages.forEach((apiMessage) => {
    const parsedResponse = apiMessageParser(apiMessage);
    if (
      parsedResponse &&
      (parsedResponse.operation === "GetSheet" ||
        parsedResponse.operation === "GetSheetForDashboard") &&
      parsedResponse.sheetId &&
      parsedResponse.sheetName
    ) {
      sheetNames.set(parsedResponse.sheetId, parsedResponse.sheetName);
    }
  });
  return sheetNames;
};

export const getDashboardNames = (apiMessages: Map<string, APIMessage>) => {
  const dashboardNames = new Map<string, string>();
  apiMessages.forEach((apiMessage) => {
    const parsedResponse = apiMessageParser(apiMessage);
    if (
      parsedResponse &&
      parsedResponse.operation === "Document" &&
      parsedResponse.dashboardId &&
      parsedResponse.dashboardName
    ) {
      dashboardNames.set(
        parsedResponse.dashboardId,
        parsedResponse.dashboardName,
      );
    }
  });
  return dashboardNames;
};

export const getVisualNames = (apiMessages: Map<string, APIMessage>) => {
  const visualNames = new Map<string, string>();
  apiMessages.forEach((apiMessage) => {
    const parsedResponse = apiMessageParser(apiMessage);
    if (parsedResponse && parsedResponse.visuals) {
      parsedResponse.visuals.forEach((visual) => {
        if (visual.visualId && visual.visualName) {
          visualNames.set(visual.visualId, visual.visualName);
        }
      });
    }
  });
  return visualNames;
};

export const getAnalysisNames = (apiMessages: Map<string, APIMessage>) => {
  const analysisNames = new Map<string, string>();
  apiMessages.forEach((apiMessage) => {
    const parsedResponse = apiMessageParser(apiMessage);
    if (
      parsedResponse &&
      parsedResponse.operation === "GetAnalysis" &&
      parsedResponse.analysisId &&
      parsedResponse.analysisName
    ) {
      analysisNames.set(parsedResponse.analysisId, parsedResponse.analysisName);
    }
  });
  return analysisNames;
};

export const getSheetIdsForAnalysis = (
  apiMessages: Map<string, APIMessage>,
) => {
  const sheetIdsForAnalysis = new Map<string, string[]>();
  apiMessages.forEach((apiMessage) => {
    const parsedResponse = apiMessageParser(apiMessage);
    if (
      parsedResponse &&
      parsedResponse.operation === "GetAnalysis" &&
      parsedResponse.analysisId &&
      parsedResponse.sheetIds
    ) {
      sheetIdsForAnalysis.set(
        parsedResponse.analysisId,
        parsedResponse.sheetIds,
      );
    }
  });
  return sheetIdsForAnalysis;
};

export const getParameterData = (apiMessages: Map<string, APIMessage>) => {
  const parameterData = new Map<string, any>();
  apiMessages.forEach((apiMessage) => {
    const parsedResponse = apiMessageParser(apiMessage);
    if (parsedResponse && parsedResponse.parameters) {
      parsedResponse.parameters.forEach((param: any) => {
        parameterData.set(param.parameterId, param);
      });
    }
  });
  return parameterData;
};

export const getFilterGroups = (apiMessages: Map<string, APIMessage>) => {
  const filterGroups = new Map<string, any>();
  apiMessages.forEach((apiMessage) => {
    const parsedResponse = apiMessageParser(apiMessage);
    if (parsedResponse && parsedResponse.filterGroups) {
      parsedResponse.filterGroups.forEach((group: any) => {
        filterGroups.set(group.filterGroupId, group);
      });
    }
  });
  return filterGroups;
};

export const getFilters = (apiMessages: Map<string, APIMessage>) => {
  const filters = new Map<string, any>();
  apiMessages.forEach((apiMessage) => {
    const parsedResponse = apiMessageParser(apiMessage);
    if (parsedResponse && parsedResponse.filters) {
      parsedResponse.filters.forEach((filter: any) => {
        filters.set(filter.filterId, filter);
      });
    }
  });
  return filters;
};

export const getDataSourceData = (apiMessages: Map<string, APIMessage>) => {
  const dataSourceData = new Map<string, any>();
  apiMessages.forEach((apiMessage) => {
    const parsedResponse = apiMessageParser(apiMessage);
    if (parsedResponse && parsedResponse.preparedDataSource) {
      const dataSourceId =
        parsedResponse.preparedDataSource.preparedDataSourceId;
      if (dataSourceId) {
        dataSourceData.set(dataSourceId, {
          calculatedColumns:
            parsedResponse.preparedDataSource.calculatedColumns,
          dataPrepFilterList:
            parsedResponse.preparedDataSource.dataPrepFilterList,
          datasetParameters:
            parsedResponse.preparedDataSource.datasetParameters,
          databaseType: parsedResponse.preparedDataSource.databaseType,
          lastUpdated: parsedResponse.preparedDataSource.lastUpdated,
          name: parsedResponse.preparedDataSource.name,
          preparedDataSourceId:
            parsedResponse.preparedDataSource.preparedDataSourceId,
          sourceType: parsedResponse.preparedDataSource.sourceType,
        });
      }
    }
    if (parsedResponse && parsedResponse.preparedDataSourceResults) {
      parsedResponse.preparedDataSourceResults.forEach((dataSource: any) => {
        const dataSourceId = dataSource.preparedDataSource.preparedDataSourceId;
        if (dataSourceId) {
          dataSourceData.set(dataSourceId, {
            calculatedColumns:
              dataSource.preparedDataSource.dataPrepConfig.columns,
            dataPrepFilterList:
              dataSource.preparedDataSource.dataPrepConfig.dataPrepFilterList,
            datasetParameters:
              dataSource.preparedDataSource.dataPrepConfig.datasetParameters,
            databaseType: dataSource.preparedDataSource.databaseType,
            lastUpdated: dataSource.preparedDataSource.lastUpdated,
            name: dataSource.preparedDataSource.name,
            preparedDataSourceId:
              dataSource.preparedDataSource.preparedDataSourceId,
            sourceType: dataSource.preparedDataSource.sourceType,
          });
        }
      });
    }
  });
  return dataSourceData;
};

// Function to get data source data by name
export const getDataSourceDataByName = (
  apiMessages: Map<string, APIMessage>,
) => {
  const dataSourceData = new Map<string, any>();
  apiMessages.forEach((apiMessage) => {
    const parsedResponse = apiMessageParser(apiMessage);
    if (parsedResponse && parsedResponse.preparedDataSource) {
      const dataSourceName = parsedResponse.preparedDataSource.name;
      if (dataSourceName) {
        dataSourceData.set(dataSourceName, {
          calculatedColumns:
            parsedResponse.preparedDataSource.calculatedColumns,
          dataPrepFilterList:
            parsedResponse.preparedDataSource.dataPrepFilterList,
          datasetParameters:
            parsedResponse.preparedDataSource.datasetParameters,
          databaseType: parsedResponse.preparedDataSource.databaseType,
          lastUpdated: parsedResponse.preparedDataSource.lastUpdated,
          name: dataSourceName,
          preparedDataSourceId:
            parsedResponse.preparedDataSource.preparedDataSourceId,
          sourceType: parsedResponse.preparedDataSource.sourceType,
        });
      }
    }
    if (parsedResponse && parsedResponse.preparedDataSourceResults) {
      parsedResponse.preparedDataSourceResults.forEach((dataSource: any) => {
        const dataSourceName = dataSource.preparedDataSource.name;
        if (dataSourceName) {
          dataSourceData.set(dataSourceName, {
            calculatedColumns:
              dataSource.preparedDataSource.dataPrepConfig.columns,
            dataPrepFilterList:
              dataSource.preparedDataSource.dataPrepConfig.dataPrepFilterList,
            datasetParameters:
              dataSource.preparedDataSource.dataPrepConfig.datasetParameters,
            databaseType: dataSource.preparedDataSource.databaseType,
            lastUpdated: dataSource.preparedDataSource.lastUpdated,
            name: dataSourceName,
            preparedDataSourceId:
              dataSource.preparedDataSource.preparedDataSourceId,
            sourceType: dataSource.preparedDataSource.sourceType,
          });
        }
      });
    }
  });
  return dataSourceData;
};

export const getHeaderData = (apiMessages: Map<string, APIMessage>) => {
  let userAgent: string | undefined = undefined;
  let origin: string | undefined = undefined;

  for (const apiMessage of apiMessages.values()) {
    const { request } = apiMessage;

    if (request && request.headers) {
      const userAgentHeader = request.headers.find(
        (header) => header.name.toLowerCase() === "user-agent",
      );
      const originHeader = request.headers.find(
        (header) => header.name.toLowerCase() === "origin",
      );

      userAgent = userAgentHeader ? userAgentHeader.value : undefined;
      origin = originHeader ? originHeader.value : undefined;

      // Stop searching if both headers are found
      if (userAgent && origin) {
        break;
      }
    }
  }

  return { userAgent, origin };
};

// Function to extract calculated columns by columnId
export const getCalculatedColumns = (apiMessages: Map<string, APIMessage>) => {
  const calculatedColumns = new Map<string, any>();

  apiMessages.forEach((apiMessage) => {
    const parsedResponse = apiMessageParser(apiMessage);

    if (parsedResponse && parsedResponse.preparedDataSourceOverlays) {
      parsedResponse.preparedDataSourceOverlays.forEach((overlay: any) => {
        if (overlay.calculatedColumns) {
          overlay.calculatedColumns.forEach((column: any) => {
            if (column.columnId) {
              calculatedColumns.set(column.columnId, {
                name: column.name,
                role: column.role,
              });
            }
          });
        }
      });
    }
  });

  return calculatedColumns;
};
