// utils/graphUtils.ts
import { Node, Link, Expression } from "../types/interfaces";
import { ExpressionVisitor } from "./sql/visitors/expressionVisitor";

export const transformToGraphData = (
  expression: any,
): { nodes: Node[]; links: Link[] } => {
  const nodes: Node[] = [];
  const links: Link[] = [];

  const processNode = (node: any): string => {
    if (node && typeof node === "object") {
      const nodeId = `${node.type}-${Math.random().toString(36).substring(7)}`;
      nodes.push({ id: nodeId, label: node.type });
      if (node.left) {
        const leftNodeId = processNode(node.left);
        links.push({ source: nodeId, target: leftNodeId });
      }
      if (node.right) {
        const rightNodeId = processNode(node.right);
        links.push({ source: nodeId, target: rightNodeId });
      }
      return nodeId;
    }
    return "";
  };

  processNode(expression);

  return { nodes, links };
};

export const getDependencyChain = (
  expression: Expression,
  parameterMap: { [key: string]: string },
  expressions: Expression[] = [],
) => {
  if (!expression.isParsed || !expression.parsedExpression) {
    return [];
  }

  const dependencyVisitor = new ExpressionVisitor(expressions, parameterMap);
  console.log("expression.parsedExpression", expression.parsedExpression);
  dependencyVisitor.visit(expression.parsedExpression);

  const dependencies = dependencyVisitor.getDependencies();
  console.log("dependencies " + JSON.stringify(dependencies));
  const chain = [];

  if (expression.type === "calculatedField") {
    chain.push({
      alias: expression.alias,
      expression: expression.expression,
      type: "calculatedField",
      level: 0,
      cost: expression.cost || 0,
      docLink: dependencies.find((dep) => dep.alias === expression.alias)
        ?.docLink,
    });
  }

  dependencies.forEach((dep) => {
    chain.push({
      alias: dep.alias,
      expression: dep.expression,
      type: dep.type,
      level: dep.level + 1,
      cost: dep.cost,
      docLink: dep.docLink,
    });
  });

  return chain;
};
