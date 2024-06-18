import React, { useRef } from "react";
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
import { NodeData, TreeNode, TreeMap } from "../utils/requestHierarchyTree";

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
}

const GanttChart: React.FC<GanttChartProps> = ({
  hierarchy,
  selectedCid,
  onBarClick,
  highlightedRequestId,
}) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  const chartData = {
    labels: [] as string[],
    datasets: [
      {
        label: "Request Duration",
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
  ) => {
    node.children.forEach((child) => {
      if (level === 4) {
        // Changed to level 4 to get request IDs
        const duration = (child.data.endTime - child.data.startTime) / 1000;
        data.push({
          key: child.key, // Use request ID directly
          duration,
        });
      }
      processNode(child, level + 1, data);
    });
  };

  const data: { key: string; duration: number }[] = [];
  processNode(hierarchy.root, 0, data);

  // Sort data by duration in descending order
  data.sort((a, b) => b.duration - a.duration);

  // Prepare chart data
  const blueColor = "#376284";
  data.forEach((item) => {
    chartData.labels.push(item.key);
    chartData.datasets[0].data.push(item.duration);
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
          display: false, // Remove grid lines
        },
        title: {
          display: true,
          text: "Duration (seconds)",
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
          label: (tooltipItem) => `Duration: ${tooltipItem.raw} seconds`,
        },
      },
      datalabels: {
        anchor: "end",
        align: "end",
        formatter: (value: number) => `${value.toFixed(2)}s`,
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

  return (
    <div
      ref={chartContainerRef}
      style={{
        height: `${Math.max(150, data.length * 25)}px`,
        overflowY: "auto",
      }}
    >
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default GanttChart;
