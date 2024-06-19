const BASE_URL = "https://docs.aws.amazon.com/quicksight/latest/user/";

import { functionCategories } from "../utils/sql/functionCategories";

const docLinks: { [key: string]: string } = {};

// Generate docLinks from functionCategories
Object.values(functionCategories).forEach(({ standardFunction }) => {
  docLinks[standardFunction] = `${BASE_URL}${standardFunction}-function.html`;
});

export const getDocLink = (functionName: string): string | undefined => {
  const normalizedFunctionName = functionName.toLowerCase();
  const normalizedDocLinks: { [key: string]: string } = {};

  // Convert docLinks keys to lowercase
  for (const key in docLinks) {
    if (docLinks.hasOwnProperty(key)) {
      normalizedDocLinks[key.toLowerCase()] = docLinks[key];
    }
  }

  return normalizedDocLinks[normalizedFunctionName];
};

export default docLinks;
