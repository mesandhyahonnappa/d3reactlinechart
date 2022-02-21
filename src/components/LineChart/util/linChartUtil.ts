import { Axis, AxisDomain } from 'd3-axis';
import { NumberValue } from 'd3-scale';
import { select } from 'd3-selection';
import { CLASSES } from '../type/LineChart.type';

export const drawYAxisLabel = (
  chartRef: SVGSVGElement,
  label: string,
  size: { height: number; width: number }
) => {
  select(chartRef)
    .select(`.${CLASSES.Y_AXIS_GROUP}`)
    .append('text')
    .attr('class', CLASSES.Y_AXIS_TITLE)
    .attr('transform', 'rotate(-90)')
    .attr('y', -30)
    .attr('x', -(size.height / 2))
    .style('text-anchor', 'middle')
    .text(label);
};

export const drawXAxisLabel = (
  chartRef: SVGSVGElement,
  label: string,
  size: { height: number; width: number }
) => {
  select(chartRef).select(`.${CLASSES.X_AXIS_TITLE}`).remove();

  select(chartRef)
    .select(`.${CLASSES.X_AXIS_GROUP}`)
    .append('text')
    .attr('class', CLASSES.X_AXIS_TITLE)
    .attr('x', size.width / 2)
    .attr('y', 40)
    .text(label);
};

export const drawAxis = (
  chartRef: SVGSVGElement,
  xAxis: Axis<NumberValue> | Axis<AxisDomain>,
  yAxis: Axis<NumberValue>,
  size: { height: number; width: number }
) => {
  select<SVGGElement, unknown>(chartRef)
    .select<SVGGElement>(`.${CLASSES.X_AXIS_GROUP}`)
    .attr('transform', `translate(0, ${size.height})`)
    .call(xAxis);
  select<SVGGElement, unknown>(chartRef)
    .select<SVGGElement>(`.${CLASSES.Y_AXIS_GROUP}`)
    .call(yAxis);
};

export const drawGridLines = (
  chartRef: SVGSVGElement,
  xAxisGrid: Axis<NumberValue> | Axis<AxisDomain>,
  yAxisGrid: Axis<NumberValue>,
  size: { height: number; width: number }
) => {
  select(chartRef)
    .select<SVGGElement>(`.${CLASSES.X_AXIS_GRID}`)
    .attr('transform', `translate(0, ${size.height})`)
    .call(xAxisGrid);
  select(chartRef)
    .select<SVGGElement>(`.${CLASSES.Y_AXIS_GRID}`)
    .call(yAxisGrid);
};
