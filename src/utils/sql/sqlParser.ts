// sqlParser.ts
import { customParser, parseSQL } from "./customParser";

const customParsers: {
  [key: string]: (node: any, parent: any, graph: any) => void;
} = {};

export const registerCustomParser = (
  nodeType: string,
  parserFunction: (node: any, parent: any, graph: any) => void,
) => {
  customParsers[nodeType] = parserFunction;
};

const processNode = (node: any, parent: any, graph: any) => {
  if (node && typeof node === "object") {
    const nodeId = `${node.type}-${Math.random().toString(36).substring(7)}`;
    graph.nodes.push({ id: nodeId, label: node.type });
    if (parent) {
      graph.links.push({ source: parent.id, target: nodeId });
    }
    if (customParsers[node.type]) {
      customParsers[node.type](node, { id: nodeId }, graph);
    } else {
      Object.keys(node).forEach((key) => {
        processNode(node[key], { id: nodeId }, graph);
      });
    }
  }
};

export const generateGraphData = (ast: any) => {
  const graph = { nodes: [], links: [] };
  processNode(ast, null, graph);
  return graph;
};

export { customParser, parseSQL };
