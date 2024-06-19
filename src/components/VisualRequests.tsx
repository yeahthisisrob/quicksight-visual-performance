import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Chip,
  ListItemButton,
  Popover,
  Tooltip,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowRight } from "@mui/icons-material";
import Icon from "@mdi/react";
import { chartIcons, dataSourceIcons } from "../constants/icons";
import { NodeData } from "../types/interfaces";
import { hierarchyLevels, DEFAULT_REQUEST_COUNT } from "../constants/constants";
import { TreeMap, TreeNode } from "../utils/requestHierarchyTree";
import Badge from "./Badge";
import { badgeConfig } from "../constants/badgeConfig";

interface VisualRequestsProps {
  hierarchy: TreeMap<NodeData>;
  selectedCid: string | null;
  onCidClick: (cid: string, level?: number) => void;
  highlightedRequestId: string | null;
  aggLevel: "Dashboard/Analysis" | "Sheet" | "DataSet" | "Visual" | "Request";
  onAggLevelChange: (
    newAggLevel:
      | "Dashboard/Analysis"
      | "Sheet"
      | "DataSet"
      | "Visual"
      | "Request",
  ) => void;
}

const VisualRequests: React.FC<VisualRequestsProps> = ({
  hierarchy,
  selectedCid,
  onCidClick,
  highlightedRequestId,
  aggLevel,
  onAggLevelChange,
}) => {
  const [open, setOpen] = useState<{ [key: string]: boolean }>({
    Dashboards: true,
    Analyses: true,
  });

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [extraTags, setExtraTags] = useState<string[]>([]);

  useEffect(() => {
    if (highlightedRequestId) {
      const newOpenState: { [key: string]: boolean } = {
        Dashboards: true,
        Analyses: true,
      };
      const pathToHighlight = findPathToRequestId(
        hierarchy.root,
        highlightedRequestId,
      );
      pathToHighlight.forEach((key) => {
        newOpenState[key] = true;
      });
      setOpen(newOpenState);
    }
  }, [highlightedRequestId, hierarchy]);

  const findPathToRequestId = (
    node: TreeNode<NodeData>,
    requestId: string,
    path: string[] = [],
  ): string[] => {
    if (node.key === requestId) {
      return path;
    }
    for (const [childKey, childNode] of node.children) {
      const result = findPathToRequestId(childNode, requestId, [
        ...path,
        `${node.key}_${childKey}`,
      ]);
      if (result.length > 0) {
        return result;
      }
    }
    return [];
  };

  const handleToggle = (key: string) => {
    setOpen((prevOpen) => ({ ...prevOpen, [key]: !prevOpen[key] }));
  };

  const handleTagHover = (
    event: React.MouseEvent<HTMLElement>,
    tags: string[],
  ) => {
    setAnchorEl(event.currentTarget);
    setExtraTags(tags);
  };

  const handleTagClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    tags: string[],
  ) => {
    setAnchorEl(event.currentTarget);
    setExtraTags(tags);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const renderError = (errorCode?: string, internalMessage?: string) => (
    <Tooltip title={internalMessage || ""}>
      <Chip label={errorCode || "Unknown Error"} color="error" size="small" />
    </Tooltip>
  );

  const renderTags = (tags: { [key: string]: boolean }) => {
    const tagKeys = Object.keys(tags).filter((tag) => tags[tag]);
    const displayedTags = tagKeys.slice(0, 1);
    const extraTags = tagKeys.slice(1);

    return (
      <>
        {displayedTags.map((tag) => (
          <Chip
            key={tag}
            label={tag.toUpperCase()}
            color="info"
            size="small"
            sx={{ mr: 0.5 }}
          />
        ))}
        {extraTags.length > 0 && (
          <Chip
            label={`+${extraTags.length} tags`}
            color="default"
            size="small"
            sx={{ mr: 0.5 }}
            onMouseEnter={(event) => handleTagHover(event, extraTags)}
          />
        )}
      </>
    );
  };

  const renderBadges = (badges: { [key: string]: boolean }) => {
    return Object.keys(badges)
      .filter((badge) => badges[badge])
      .map((badge) => (
        <Badge
          key={badge}
          text={badgeConfig[badge].text}
          color={badgeConfig[badge].color}
        />
      ));
  };

  const renderHierarchy = (
    node: TreeNode<NodeData>,
    level: number,
  ): React.ReactElement[] => {
    const elements: React.ReactElement[] = [];

    const sortedChildren = Array.from(node.children.values()).sort((a, b) => {
      const durationA =
        a.data.startTime !== undefined && a.data.endTime !== undefined
          ? a.data.endTime - a.data.startTime
          : 0;
      const durationB =
        b.data.startTime !== undefined && b.data.endTime !== undefined
          ? b.data.endTime - b.data.startTime
          : 0;
      return durationB - durationA;
    });

    sortedChildren.forEach((childNode) => {
      const { key, data } = childNode;
      const currentKey = `${node.key}_${key}`;
      let icon: React.ReactNode;
      let labelPrefix: string = "";

      const hasError = data.__hasError;
      const duration = data.duration;
      const startTime = data.startTime;
      const endTime = data.endTime;
      const requestCount = data.requestCount || DEFAULT_REQUEST_COUNT;
      const cost = data.cost;
      const status = hasError ? "ERROR" : "OK";

      switch (level) {
        case hierarchyLevels.Dashboards:
        case hierarchyLevels.Analyses:
          icon = (
            <Icon
              path={chartIcons.default}
              size={1}
              style={{ color: "#9e9e9e", marginRight: "8px" }}
            />
          );
          labelPrefix = "";
          break;
        case hierarchyLevels.DashboardId:
        case hierarchyLevels.AnalysisId:
          if (data.dashboardId) {
            icon = (
              <Icon
                path={chartIcons.default}
                size={1}
                style={{ color: "#9e9e9e", marginRight: "8px" }}
              />
            );
            labelPrefix = "Dashboard";
          } else if (data.analysisId) {
            icon = (
              <Icon
                path={chartIcons.default}
                size={1}
                style={{ color: "#9e9e9e", marginRight: "8px" }}
              />
            );
            labelPrefix = "Analysis";
          }
          break;
        case hierarchyLevels.SheetId:
          icon = (
            <Icon
              path={chartIcons.default}
              size={1}
              style={{ color: "#9e9e9e", marginRight: "8px" }}
            />
          );
          labelPrefix = "Sheet";
          break;
        case hierarchyLevels.DataSourceId:
          const dataSourceType = data.dataSourceType;
          icon = (
            <Tooltip title={dataSourceType || "Unknown"} arrow>
              <div style={{ display: "inline-block" }}>
                <Icon
                  path={dataSourceIcons.default}
                  size={1}
                  style={{ color: "#9e9e9e", marginRight: "8px" }}
                />
              </div>
            </Tooltip>
          );
          labelPrefix = "Dataset";
          break;
        case hierarchyLevels.VisualId:
          const visualType = data.visualType || "default";
          icon = (
            <Icon
              path={chartIcons[visualType] || chartIcons.default}
              size={1}
              style={{
                color: "#9e9e9e",
                marginRight: "8px",
                transform: visualType.includes("HORIZONTAL")
                  ? "rotate(90deg)"
                  : "none",
              }}
            />
          );
          labelPrefix = "Visual";
          break;
        case hierarchyLevels.RequestId:
          icon = (
            <Icon
              path={chartIcons.default}
              size={1}
              style={{ color: "#9e9e9e", marginRight: "8px" }}
            />
          );
          labelPrefix = "Request";
          break;
        default:
          return elements;
      }

      const name =
        level === hierarchyLevels.RequestId
          ? key
          : data.sheetName ||
            data.dashboardName ||
            data.analysisName ||
            data.dataSourceName ||
            data.visualName ||
            key;

      const actualDuration =
        startTime !== undefined && endTime !== undefined
          ? ((endTime - startTime) / 1000).toFixed(2)
          : "N/A";

      elements.push(
        <React.Fragment key={currentKey}>
          <TableRow>
            <TableCell
              sx={{ pl: level * 2, display: "flex", alignItems: "center" }}
            >
              {level === hierarchyLevels.RequestId ? (
                <ListItemButton
                  selected={selectedCid === key}
                  onClick={() => {
                    onCidClick(key);
                    onAggLevelChange(
                      level === hierarchyLevels.DashboardId
                        ? "Dashboard/Analysis"
                        : level === hierarchyLevels.SheetId
                          ? "Sheet"
                          : level === hierarchyLevels.DataSourceId
                            ? "DataSet"
                            : level === hierarchyLevels.VisualId
                              ? "Visual"
                              : "Request",
                    );
                  }}
                  sx={{ flex: 1 }}
                >
                  <div style={{ width: "12px" }} />
                  {icon}
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{ flex: 1 }}
                  >{`${labelPrefix}: ${name}`}</Typography>
                  {renderBadges(data.badges)}
                  {status === "ERROR" &&
                    renderError(data.errorCode, data.internalMessage)}
                </ListItemButton>
              ) : (
                <ListItemButton
                  selected={selectedCid === key}
                  onClick={() => {
                    onCidClick(key);
                    onAggLevelChange(
                      level === hierarchyLevels.DashboardId
                        ? "Dashboard/Analysis"
                        : level === hierarchyLevels.SheetId
                          ? "Sheet"
                          : level === hierarchyLevels.DataSourceId
                            ? "DataSet"
                            : level === hierarchyLevels.VisualId
                              ? "Visual"
                              : "Request",
                    );
                  }}
                  sx={{ flex: 1 }}
                >
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(currentKey);
                    }}
                  >
                    {open[currentKey] ? (
                      <KeyboardArrowDown fontSize="small" />
                    ) : (
                      <KeyboardArrowRight fontSize="small" />
                    )}
                  </IconButton>
                  {icon}
                  <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                    {level === hierarchyLevels.Dashboards ||
                    level === hierarchyLevels.Analyses
                      ? key
                      : `${labelPrefix}: ${name}`}
                  </Typography>
                </ListItemButton>
              )}
            </TableCell>
            <TableCell align="center">
              <Chip
                label={status}
                color={status === "ERROR" ? "error" : "success"}
                size="small"
              />
            </TableCell>
            <TableCell align="center">{renderTags(data.tags)}</TableCell>
            <TableCell align="center">
              {startTime !== undefined && startTime !== Infinity
                ? new Date(startTime).toLocaleString()
                : "N/A"}
            </TableCell>
            <TableCell align="center">
              {endTime !== undefined && endTime !== 0
                ? new Date(endTime).toLocaleString()
                : "N/A"}
            </TableCell>
            <TableCell align="center">{actualDuration}s</TableCell>
            <TableCell align="center">
              {typeof duration === "number" ? duration.toFixed(2) : "N/A"}s
            </TableCell>
            <TableCell align="center">{requestCount}</TableCell>
            <TableCell align="center">{cost || "N/A"}</TableCell>
          </TableRow>
          {open[currentKey] && renderHierarchy(childNode, level + 1)}
        </React.Fragment>,
      );
    });

    return elements;
  };

  return (
    <Box p={2} sx={{ overflowY: "auto" }}>
      <TableContainer>
        <Table
          size="small"
          sx={{ "& th": { position: "sticky", top: 0, zIndex: 1 } }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Requests</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Tags</TableCell>
              <TableCell align="center">Start Time</TableCell>
              <TableCell align="center">End Time</TableCell>
              <TableCell align="center">Actual Duration</TableCell>
              <TableCell align="center">Sequential Duration</TableCell>
              <TableCell align="center">Request Count</TableCell>
              <TableCell align="center">Cost</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{renderHierarchy(hierarchy.root, 0)}</TableBody>
        </Table>
      </TableContainer>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Box p={2}>
          {extraTags.map((tag) => (
            <Chip
              key={tag}
              label={tag.toUpperCase()}
              color="info"
              size="small"
              sx={{ mr: 0.5 }}
            />
          ))}
        </Box>
      </Popover>
    </Box>
  );
};

export default VisualRequests;
