import React, { useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { ToggleButton, ToggleButtonGroup, Box } from "@mui/material";
import { NodeData, TreeNode, TreeMap } from "../utils/requestHierarchyTree";
import { hierarchyLevels } from "../constants/constants";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
);

interface GanttChartProps {
  hierarchy: TreeMap<NodeData>;
  selectedCid: string | null;
  onBarClick: (cid: string) => void;
  highlightedRequestId: string | null;
  aggLevel: "Dashboard/Analysis" | "Sheet" | "DataSet" | "Visual" | "Request"; // Add this line
  onAggLevelChange: (
    newAggLevel:
      | "Dashboard/Analysis"
      | "Sheet"
      | "DataSet"
      | "Visual"
      | "Request",
  ) => void; // Add this line
}

const GanttChart: React.FC<GanttChartProps> = ({
  hierarchy,
  selectedCid,
  onBarClick,
  highlightedRequestId,
  aggLevel,
  onAggLevelChange,
}) => {
  const [viewMode, setViewMode] = useState<"duration" | "cost">("duration");
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  const chartData = {
    labels: [] as string[],
    datasets: [
      {
        label: viewMode === "duration" ? "Request Duration" : "Request Cost",
        data: [] as number[],
        backgroundColor: [] as string[],
        borderColor: [] as string[],
        borderWidth: 1,
        barThickness: 15,
      },
    ],
  };

  const processNode = (
    node: TreeNode<NodeData>,
    level: number,
    data: any[],
    parentSheetName: string = "",
  ) => {
    node.children.forEach((child) => {
      let sheetName = parentSheetName;
      if (level === hierarchyLevels.SheetId) {
        sheetName = child.data.sheetName || child.key;
      }

      if (
        (aggLevel === "Dashboard/Analysis" &&
          level === hierarchyLevels.DashboardId) ||
        (aggLevel === "Sheet" && level === hierarchyLevels.SheetId) ||
        (aggLevel === "DataSet" && level === hierarchyLevels.DataSourceId) ||
        (aggLevel === "Visual" && level === hierarchyLevels.VisualId) ||
        (aggLevel === "Request" && level === hierarchyLevels.RequestId)
      ) {
        const duration = Math.max(
          (child.data.endTime - child.data.startTime) / 1000,
          0,
        );
        const label =
          aggLevel === "Visual"
            ? child.data.visualName || child.key
            : aggLevel === "Sheet"
              ? child.data.sheetName || child.key
              : aggLevel === "DataSet"
                ? `${sheetName}_${child.data.dataSourceName || child.key}`
                : aggLevel === "Dashboard/Analysis"
                  ? child.data.dashboardName ||
                    child.data.analysisName ||
                    child.key
                  : child.key;

        data.push({
          key: child.key,
          label: label,
          duration,
          cost: child.data.cost || 0,
        });
      }
      processNode(child, level + 1, data, sheetName);
    });
  };

  const data: { key: string; label: string; duration: number; cost: number }[] =
    [];
  processNode(hierarchy.root, 0, data);

  // Sort data by duration or cost in descending order
  data.sort((a, b) =>
    viewMode === "duration" ? b.duration - a.duration : b.cost - a.cost,
  );

  // Prepare chart data
  const blueColor = "#376284";
  data.forEach((item) => {
    chartData.labels.push(item.label);
    chartData.datasets[0].data.push(
      viewMode === "duration" ? item.duration : item.cost,
    );
    const color =
      item.key === selectedCid || item.key === highlightedRequestId
        ? "orange"
        : blueColor;
    chartData.datasets[0].backgroundColor.push(color);
    chartData.datasets[0].borderColor.push("steelblue");
  });

  const options: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: viewMode === "duration" ? "Duration (seconds)" : "Cost",
          align: "center",
        },
      },
      y: {
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: "Requests",
        },
        ticks: {
          autoSkip: false,
          font: {
            size: 12,
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) =>
            `${viewMode === "duration" ? "Duration" : "Cost"}: ${tooltipItem.raw} ${viewMode === "duration" ? "seconds" : ""}`,
        },
      },
      datalabels: {
        anchor: "end",
        align: "end",
        formatter: (value: number) =>
          `${value.toFixed(2)}${viewMode === "duration" ? "s" : ""}`,
        color: "black",
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const cid = data[index].key;
        onBarClick(cid);
      }
    },
  };

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: "duration" | "cost" | null,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const handleAggLevelChange = (
    event: React.MouseEvent<HTMLElement>,
    newAggLevel:
      | "Dashboard/Analysis"
      | "Sheet"
      | "DataSet"
      | "Visual"
      | "Request"
      | null,
  ) => {
    if (newAggLevel !== null) {
      onAggLevelChange(newAggLevel);
    }
  };

  return (
    <div>
      <Box display="flex" justifyContent="center" mb={2} p={0.5}>
        <ToggleButtonGroup
          value={aggLevel}
          exclusive
          onChange={handleAggLevelChange}
          aria-label="aggregation level"
          sx={{ mr: 2 }}
        >
          <ToggleButton
            value="Dashboard/Analysis"
            aria-label="Dashboard/Analysis"
          >
            Dashboard/Analysis
          </ToggleButton>
          <ToggleButton value="Sheet" aria-label="Sheet">
            Sheet
          </ToggleButton>
          <ToggleButton value="DataSet" aria-label="DataSet">
            DataSet
          </ToggleButton>
          <ToggleButton value="Visual" aria-label="Visual">
            Visual
          </ToggleButton>
          <ToggleButton value="Request" aria-label="Request">
            Request
          </ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="view mode"
        >
          <ToggleButton value="duration" aria-label="duration">
            Duration
          </ToggleButton>
          <ToggleButton value="cost" aria-label="cost">
            Cost
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <div
        ref={chartContainerRef}
        style={{
          height: `${Math.max(150, data.length * 25)}px`,
          overflowY: "auto",
          width: "100%",
          textAlign: "left",
        }}
      >
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default GanttChart;
