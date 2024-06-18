// utils/requestHierarchyTree.ts
import { NodeData, initializeNodeData } from "../types/interfaces";

class TreeNode<T extends NodeData> {
  key: string;
  data: T;
  children: Map<string, TreeNode<T>>;

  constructor(key: string, data: T) {
    this.key = key;
    this.data = data;
    this.children = new Map<string, TreeNode<T>>();
  }

  addChild(childKey: string, childData: T): TreeNode<T> {
    let childNode = this.children.get(childKey);
    if (!childNode) {
      childNode = new TreeNode(childKey, childData);
      this.children.set(childKey, childNode);
    }
    return childNode;
  }

  getChild(childKey: string): TreeNode<T> | undefined {
    return this.children.get(childKey);
  }
}

class TreeMap<T extends NodeData> {
  root: TreeNode<T>;

  constructor(rootKey: string, rootData: T) {
    this.root = new TreeNode(rootKey, rootData);
  }

  findPathToRequestId(
    node: TreeNode<T>,
    requestId: string,
    path: string[] = [],
  ): string[] {
    if (node.key === requestId) {
      return path;
    }
    for (const [childKey, childNode] of node.children) {
      const result = this.findPathToRequestId(childNode, requestId, [
        ...path,
        childKey,
      ]);
      if (result.length > 0) {
        return result;
      }
    }
    return [];
  }

  findNode(path: string[]): TreeNode<T> | undefined {
    let currentNode: TreeNode<T> | undefined = this.root;
    for (const key of path) {
      if (!currentNode) return undefined;
      currentNode = currentNode.getChild(key);
    }
    return currentNode;
  }

  addNode(path: string[], key: string, data: T): TreeNode<T> | undefined {
    let parentNode = this.findNode(path);
    if (!parentNode) {
      parentNode = this.root;
      for (const segment of path) {
        let childNode: TreeNode<T> | undefined = parentNode.getChild(segment);
        if (!childNode) {
          childNode = parentNode.addChild(segment, initializeNodeData() as T);
        }
        parentNode = childNode;
      }
    }
    if (parentNode) {
      return parentNode.addChild(key, data);
    }
    return undefined;
  }
}

export { TreeNode, TreeMap };
export type { NodeData };
