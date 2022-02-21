import React, { ReactNode } from 'react';
import { DEFAULT_SIZE, MARGIN } from '../constant/lineChart.constant';
import { CLASSES } from '../type/LineChart.type';

interface LineChartContextRangeSurfaceProps {
  size: {
    width: number;
    chartHeight: number;
    rangeContextHeight: number;
  } | null;
  children?: ReactNode;
}
const LineChartContextRangeSurface: React.FC<LineChartContextRangeSurfaceProps> =
  ({ size, children }) => {
    const getChartHeight = () => {
      if (size) {
        return size.chartHeight;
      } else {
        return DEFAULT_SIZE.chartHeight;
      }
    };

    return (
      <g
        className={CLASSES.LINE_CHART_RANGE_CONTEXT}
        transform={`translate(${MARGIN.LEFT}, ${
          MARGIN.TOP * 3 + getChartHeight()
        })`}
      >
        {children}
      </g>
    );
  };

export default LineChartContextRangeSurface;
