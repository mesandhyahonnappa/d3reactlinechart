import React, { ReactNode } from 'react';
import { MARGIN } from '../constant/lineChart.constant';
import { CLASSES } from '../type/LineChart.type';

interface LineChartSurfaceProps {
  children?: ReactNode;
}
const LineChartSurface: React.FC<LineChartSurfaceProps> = ({ children }) => {
  return (
    <g
      className={CLASSES.LINE_CHART_CONTAINER}
      transform={`translate(${MARGIN.LEFT}, ${MARGIN.TOP})`}
    >
      {children}
    </g>
  );
};

export default LineChartSurface;
