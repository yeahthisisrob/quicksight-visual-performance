import { TreeMap, TreeNode, NodeData } from "./requestHierarchyTree";

export const treeMapToObject = (treeMap: TreeMap<NodeData>): any => {
  const traverseNode = (node: TreeNode<NodeData>): any => {
    const obj: {
      key: string;
      data: NodeData;
      children: { [key: string]: any };
    } = {
      key: node.key,
      data: node.data,
      children: {},
    };
    node.children.forEach((childNode, childKey) => {
      obj.children[childKey] = traverseNode(childNode);
    });
    return obj;
  };
  return traverseNode(treeMap.root);
};

export const objectToTreeMap = (obj: any): TreeMap<NodeData> => {
  const traverseObject = (obj: any): TreeNode<NodeData> => {
    const node = new TreeNode<NodeData>(obj.key, obj.data);
    Object.entries(obj.children).forEach(([childKey, childValue]) => {
      node.children.set(childKey, traverseObject(childValue));
    });
    return node;
  };
  const treeMap = new TreeMap<NodeData>(obj.key, obj.data);
  treeMap.root = traverseObject(obj);
  return treeMap;
};

// Additional utility functions
export const getTimeDifference = (
  currentTimestamp: number,
  firstTimestamp: number | null,
): string => {
  if (firstTimestamp === null) {
    return "0 ms";
  }
  const difference = (currentTimestamp - firstTimestamp) * 1000;
  return `${difference.toFixed(0)} ms`;
};

export const getChipColor = (type: string) => {
  switch (type) {
    case "calculatedField":
      return "primary";
    case "field":
      return "secondary";
    case "parameter":
      return "default";
    default:
      return "error";
  }
};
