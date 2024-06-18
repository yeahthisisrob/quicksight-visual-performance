// utils/harAnalyzer.ts
import {
  HarWebSocketMessage,
  HarRequest,
  HarResponse,
  HarEntry,
  HarLog,
  WebSocketMessage,
  APIMessage,
} from "../types/interfaces";
import { buildHierarchy } from "./hierarchyBuilder";
import { groupMessagesByCid } from "./parsers/websocketMessageParser";

export const analyzeHarFile = async (
  file: File | { log: HarLog },
  updateProgress: (step: number) => void,
): Promise<{
  wsMessages: Map<string, WebSocketMessage>;
  apiMessages: Map<string, APIMessage>;
  hierarchy: any;
  counts: {
    dashboardCount: number;
    analysisCount: number;
    sheetCount: number;
    visualCount: number;
    requestCount: number;
  };
}> => {
  return new Promise((resolve, reject) => {
    const categorizeMessages = (messages: any[]) => {
      const wsMessages = new Map<string, WebSocketMessage>();
      const apiMessages = new Map<string, APIMessage>();

      messages.forEach((msg, index) => {
        if (msg.type === "api") {
          apiMessages.set(`API Message ${index + 1}`, msg as APIMessage);
        } else if (msg.type === "metadata") {
          apiMessages.set(`Document Metadata ${index + 1}`, msg as APIMessage);
        } else {
          wsMessages.set(`Message ${index + 1}`, msg as WebSocketMessage);
        }
      });

      return { wsMessages, apiMessages };
    };

    const processFile = (fileContent: any) => {
      const messages = fileContent.log.entries.flatMap((entry: HarEntry) => {
        const wsMessages =
          entry._webSocketMessages?.map((msg: HarWebSocketMessage) => ({
            type: msg.type,
            name: `Message at ${entry.startedDateTime}`,
            time: msg.time,
            opcode: msg.opcode,
            data: msg.data,
          })) || [];

        const isOperationApiCall = entry.request?.queryString.some(
          (q) => q.name === "Operation",
        );

        const apiMessages = isOperationApiCall
          ? [
              {
                type: "api",
                name: `API call at ${entry.startedDateTime}`,
                request: entry.request,
                response: entry.response || undefined,
              },
            ]
          : [];

        // Check if it's a metadata document
        const isMetadataDocument =
          entry._priority === "VeryHigh" &&
          entry._resourceType === "document" &&
          entry.response &&
          entry.response.content &&
          entry.response.content.text &&
          entry.response.content.text.includes("page-type-metadata");

        if (isMetadataDocument) {
          apiMessages.push({
            type: "metadata",
            name: `Metadata document at ${entry.startedDateTime}`,
            request: entry.request,
            response: entry.response || undefined,
          });
        }

        return [...wsMessages, ...apiMessages];
      });

      const { wsMessages, apiMessages } = categorizeMessages(messages);
      updateProgress(0); // Parsing WebSocket messages done

      const groupedMessages = groupMessagesByCid(wsMessages);
      updateProgress(1); // Parsing API messages done

      let { hierarchy, counts } = buildHierarchy(groupedMessages, apiMessages);
      updateProgress(2); // Parsing Metadata documents done

      return { wsMessages, apiMessages, hierarchy, counts };
    };

    if (typeof file === "object" && "log" in file) {
      try {
        const result = processFile(file);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string) as { log: HarLog };
          const result = processFile(data);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsText(file);
    }
  });
};
