import {
  mdiChartBar,
  mdiChartPie,
  mdiChartLine,
  mdiChartScatterPlot,
  mdiTable,
  mdiTablePivot,
  mdiChartAreaspline,
  mdiChartBox,
  mdiLightbulb,
  mdiChartDonut,
  mdiChartSankey,
  mdiChartBarStacked,
  mdiEarth,
  mdiDatabaseOutline,
} from "@mdi/js";

import { siAmazons3 } from "simple-icons";

interface IconMap {
  [key: string]: string;
}

export const chartIcons: IconMap = {
  AREA_LINE_CHART: mdiChartAreaspline,
  BOX_PLOT: mdiChartBar,
  COMBO_CHART_CLUSTERED_BARS: mdiChartBar,
  COMBO_CHART_STACKED_BARS: mdiChartBar,
  DONUT: mdiChartDonut,
  FILLED_MAP: mdiEarth,
  FUNNEL_CHART: mdiChartBar,
  GUAGE: mdiChartBar,
  HEAT_MAP: mdiChartBar,
  HISTOGRAM: mdiChartBar,
  HORIZONTAL_100_STACKED_BARS: mdiChartBarStacked,
  HORIZONTAL_BARS: mdiChartBar,
  KPI: mdiChartBox,
  LINE_CHART: mdiChartLine,
  NARRATION: mdiLightbulb,
  PIE: mdiChartPie,
  PIVOT_TABLE: mdiTablePivot,
  POINTS_ON_MAP: mdiEarth,
  RADAR_CHART: mdiChartLine,
  SANKEY_DIAGRAM: mdiChartSankey,
  SCATTERPLOT: mdiChartScatterPlot,
  STACKED_AREA_LINE_CHART: mdiChartAreaspline,
  STACKED_BAR_CHART_HORIZONTAL: mdiChartBar,
  STACKED_BAR_CHART_VERTICAL: mdiChartBarStacked,
  TABLE: mdiTable,
  TREE_MAP: mdiChartBox,
  VERTICAL_100PCT_STACKED_BARS: mdiChartBar,
  VERTICAL_BARS: mdiChartBar,
  WATERFALL: mdiTable,
  WORD_CLOUD: mdiChartBox,
  default: mdiChartBox,
};

export const dataSourceIcons: IconMap = {
  S3_SOURCE: siAmazons3.path, // Amazon S3
  default: mdiDatabaseOutline,
};
