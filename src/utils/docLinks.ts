// utils/docLinks.ts
const BASE_URL = "https://docs.aws.amazon.com/quicksight/latest/user/";

const docLinks: { [key: string]: string } = {
  sum: `${BASE_URL}sum-function.html`,
  sumIf: `${BASE_URL}sumIf-function.html`,
  minOver: `${BASE_URL}minOver-function.html`,
  maxOver: `${BASE_URL}maxOver-function.html`,
  avgOver: `${BASE_URL}avgOver-function.html`,
  countOver: `${BASE_URL}countOver-function.html`,
  distinctCountOver: `${BASE_URL}distinctCountOver-function.html`,
  addDateTime: `${BASE_URL}addDateTime-function.html`,
  addWorkDays: `${BASE_URL}addWorkDays-function.html`,
  dateDiff: `${BASE_URL}dateDiff-function.html`,
  ceil: `${BASE_URL}ceil-function.html`,
  floor: `${BASE_URL}floor-function.html`,
  round: `${BASE_URL}round-function.html`,
  contains: `${BASE_URL}contains-function.html`,
  locate: `${BASE_URL}locate-function.html`,
  windowSum: `${BASE_URL}windowSum-function.html`,
  difference: `${BASE_URL}difference-function.html`,
  lag: `${BASE_URL}lag-function.html`,
  lead: `${BASE_URL}lead-function.html`,
  percentDifference: `${BASE_URL}percentDifference-function.html`,
  percentileOver: `${BASE_URL}percentileOver-function.html`,
  percentileContOver: `${BASE_URL}percentileContOver-function.html`,
  percentileDiscOver: `${BASE_URL}percentileDiscOver-function.html`,
  percentOfTotal: `${BASE_URL}percentOfTotal-function.html`,
  periodOverPeriodDifference: `${BASE_URL}periodOverPeriodDifference-function.html`,
  periodOverPeriodLastValue: `${BASE_URL}periodOverPeriodLastValue-function.html`,
  periodOverPeriodPercentDifference: `${BASE_URL}periodOverPeriodPercentDifference-function.html`,
  periodToDateAvgOverTime: `${BASE_URL}periodToDateAvgOverTime-function.html`,
  periodToDateCountOverTime: `${BASE_URL}periodToDateCountOverTime-function.html`,
  periodToDateMaxOverTime: `${BASE_URL}periodToDateMaxOverTime-function.html`,
  periodToDateMinOverTime: `${BASE_URL}periodToDateMinOverTime-function.html`,
  periodToDateSumOverTime: `${BASE_URL}periodToDateSumOverTime-function.html`,
  stdevOver: `${BASE_URL}stdevOver-function.html`,
  stdevpOver: `${BASE_URL}stdevpOver-function.html`,
  varOver: `${BASE_URL}varOver-function.html`,
  varpOver: `${BASE_URL}varpOver-function.html`,
  denseRank: `${BASE_URL}denseRank-function.html`,
  rank: `${BASE_URL}rank-function.html`,
  percentileRank: `${BASE_URL}percentileRank-function.html`,
  runningAvg: `${BASE_URL}runningAvg-function.html`,
  runningCount: `${BASE_URL}runningCount-function.html`,
  runningMax: `${BASE_URL}runningMax-function.html`,
  runningMin: `${BASE_URL}runningMin-function.html`,
  runningSum: `${BASE_URL}runningSum-function.html`,
  firstValue: `${BASE_URL}firstValue-function.html`,
  lastValue: `${BASE_URL}lastValue-function.html`,
  windowAvg: `${BASE_URL}windowAvg-function.html`,
  windowCount: `${BASE_URL}windowCount-function.html`,
  windowMax: `${BASE_URL}windowMax-function.html`,
  windowMin: `${BASE_URL}windowMin-function.html`,
  Concat: `${BASE_URL}/concat-function.html`,
  toString: `${BASE_URL}/toString-function.html`,
};

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
