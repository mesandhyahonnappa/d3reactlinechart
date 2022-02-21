/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { pointer, select } from 'd3-selection';
import {
  scaleTime,
  scaleLinear,
  ScaleLinear,
  ScaleTime,
  NumberValue
} from 'd3-scale';
import { Axis, axisBottom, AxisDomain, axisLeft } from 'd3-axis';
import { BrushSelection, brushX, D3BrushEvent } from 'd3-brush';
import { line } from 'd3-shape';
import { extent, min, max, bisector } from 'd3-array';
import './style/LineChart.css';
import { CLASSES, Annotation, Point } from './type/LineChart.type';
import {
  XAxisGrid,
  YAxisGrid,
  XAxis,
  YAxis,
  LineSeries,
  Annotations,
  Tooltip
} from './component';
import { MARGIN, DEFAULT_SIZE } from './constant/lineChart.constant';
import LineChartSurface from './component/LineChartSurface';
import { timeFormat } from 'd3-time-format';

import {
  drawAxis,
  drawGridLines,
  drawXAxisLabel,
  drawYAxisLabel
} from './util/linChartUtil';
import LineChartContextRangeSurface from './component/LineChartContextRangeSurface';

let resizeTimer: any;
let idleTimeout: any;

export interface LineChartProps {
  data: Point[];
  id?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  xScaleType?: 'LINEAR' | 'TIME';
  showAxis?: boolean;
  showGridLines?: boolean;
  annotations?: Annotation[];
  xAxisTickFormat?: (domainValue: NumberValue, index: number) => string;
  zoomEnabled?: boolean;
  tooltipEnabled?: boolean;
  tooltipUnit?: string;
  rangeEnabled?: boolean;
}
const LineChart: React.FC<LineChartProps> = ({
  id = 'chart',
  data: inputData,
  xAxisLabel = null,
  yAxisLabel = null,
  showAxis = true,
  xScaleType = 'LINEAR',
  showGridLines = false,
  annotations = [],
  xAxisTickFormat = null,
  zoomEnabled = false,
  tooltipEnabled = true,
  rangeEnabled = false,
  tooltipUnit = ''
}) => {
  const chartRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState(inputData);
  const [size, setSize] =
    useState<{
      width: number;
      chartHeight: number;
      rangeContextHeight: number;
    } | null>(null);

  const xScale = useRef<
    ScaleTime<number, number, never> | ScaleLinear<number, number, never>
  >(scaleTime<number>().range([0, DEFAULT_SIZE.width]).nice());
  const yScale = useRef<ScaleLinear<number, number, never>>(
    scaleLinear().range([DEFAULT_SIZE.chartHeight, 0])
  );

  const xScaleOnContextRange = useRef<
    ScaleTime<number, number, never> | ScaleLinear<number, number, never>
  >(scaleTime<number>().range([0, DEFAULT_SIZE.width]).nice());
  const yScaleOnContextRange = useRef<ScaleLinear<number, number, never>>(
    scaleLinear().range([DEFAULT_SIZE.rangeContextHeight, 0])
  );

  const xAxis = useRef<Axis<NumberValue> | Axis<AxisDomain>>(
    (xAxisTickFormat &&
      axisBottom(xScale.current).tickFormat(xAxisTickFormat)) ||
      axisBottom(xScale.current)
  );

  const xAxisOnContextRange = useRef<Axis<NumberValue> | Axis<AxisDomain>>(
    (xAxisTickFormat &&
      axisBottom(xScaleOnContextRange.current).tickFormat(xAxisTickFormat)) ||
      axisBottom(xScaleOnContextRange.current)
  );

  const yAxis = useRef<Axis<NumberValue>>(axisLeft(yScale.current).ticks(6));

  const xAxisGrid = useRef<Axis<NumberValue> | Axis<AxisDomain>>(
    axisBottom(xScale.current).tickFormat(() => '')
  );
  const yAxisGrid = useRef<Axis<NumberValue>>(
    axisLeft(yScale.current).tickFormat(() => '')
  );
  const tooltipDot = useRef<any>();
  const tooltipDiv = useRef<any>();
  const zoomTooltipSurface = useRef<any>();

  const inZoomMode = useRef(false);
  const brush = useRef<any>();
  const brushContextRange = useRef<any>();
  const prevZoomExtent = useRef<any>();
  const panX1 = useRef(0);
  const panX2 = useRef(0);

  useLayoutEffect(() => {
    setDimensions();

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        setDimensions();
      }, 250);
    });
  }, []);

  const setDimensions = () => {
    const width =
      Math.floor(
        chartRef.current?.parentElement?.offsetWidth || DEFAULT_SIZE.width
      ) -
      MARGIN.LEFT -
      MARGIN.RIGHT;
    const height =
      Math.floor(
        chartRef.current?.parentElement?.offsetHeight ||
          DEFAULT_SIZE.chartHeight
      ) -
      (rangeEnabled ? DEFAULT_SIZE.rangeContextHeight : 0) -
      (rangeEnabled ? 2 * MARGIN.TOP : MARGIN.TOP) -
      (rangeEnabled ? 2 * MARGIN.BOTTOM : MARGIN.BOTTOM);
    console.log('height', height);
    setSize({
      width,
      chartHeight: height,
      rangeContextHeight: rangeEnabled ? DEFAULT_SIZE.rangeContextHeight : 0
    });
  };

  // on size change update svg dimensions and redefine the scale
  useEffect(() => {
    if (!size) return;
    if (size) {
      // Set SVG height and width
      select(chartRef.current)
        .attr('width', size.width + MARGIN.LEFT + MARGIN.RIGHT)
        .attr(
          'height',
          size.chartHeight +
            size.rangeContextHeight +
            (rangeEnabled ? MARGIN.TOP * 2 : MARGIN.TOP) +
            (rangeEnabled ? MARGIN.BOTTOM * 2 : MARGIN.BOTTOM)
        );

      select(chartRef.current)
        .select(`.${CLASSES.LINE_CHART_CONTAINER}`)
        .selectAll('defs')
        .remove();
      select(chartRef.current)
        .select(`.${CLASSES.LINE_CHART_CONTAINER}`)
        .selectAll('#clip')
        .remove();
      select(chartRef.current)
        .select(`.${CLASSES.LINE_CHART_RANGE_CONTEXT}`)
        .selectAll('#clipRangeContext')
        .remove();
      select(chartRef.current)
        .select(`.${CLASSES.CLIP_PATH_GROUP}`)
        .selectAll(`.${CLASSES.BRUSH}`)
        .remove();
      select(chartRef.current)
        .select(`.${CLASSES.CLIP_RANGE_CONTEXT_PATH_GROUP}`)
        .selectAll(`.${CLASSES.BRUSH_RANGE_CONTEXT}`)
        .remove();
      select(chartRef.current)
        .select(`.${CLASSES.LINE_CHART_CONTAINER}`)
        .selectAll(`.${CLASSES.TOOLTIP_LAYER}`)
        .remove();

      select(chartRef.current)
        .select(`.${CLASSES.LINE_CHART_CONTAINER}`)
        .append('defs')
        .append('svg:clipPath')
        .attr('id', 'clip')
        .append('svg:rect')
        .attr('width', size.width)
        .attr('height', size.chartHeight)
        .attr('x', 0)
        .attr('y', 0);

      zoomTooltipSurface.current = select(chartRef.current)
        .select(`.${CLASSES.LINE_CHART_CONTAINER}`)
        .append('rect')
        .attr('class', CLASSES.TOOLTIP_LAYER)
        .attr('width', size?.width)
        .attr('height', size?.chartHeight)
        .style('opacity', 0);

      if (tooltipEnabled) {
        tooltipDiv.current = select(`.${CLASSES.TOOLTIP}`);

        select(`.${CLASSES.LINE_CHART_CONTAINER}`).selectAll('circle').remove();

        tooltipDot.current = select(`.${CLASSES.LINE_CHART_CONTAINER}`)
          .append('circle')
          .attr('r', 5)
          .attr('fill', '#FFF')
          .attr('stroke', '#06b6d4')
          .attr('stroke-width', 1)
          .style('opacity', 0)
          .style('pointer-events', 'none');
      }

      if (xScaleType === 'TIME') {
        xScale.current = scaleTime<number>().range([0, size.width]).nice();
      } else {
        xScale.current = scaleLinear<number>().range([0, size.width]);
      }
      yScale.current = scaleLinear().range([size.chartHeight, 0]);

      if (rangeEnabled) {
        if (xScaleType === 'TIME') {
          xScaleOnContextRange.current = scaleTime<number>()
            .range([0, size.width])
            .nice();
        } else {
          xScaleOnContextRange.current = scaleLinear<number>().range([
            0,
            size.width
          ]);
        }
        yScaleOnContextRange.current = scaleLinear().range([
          size.rangeContextHeight,
          0
        ]);
      }

      if (rangeEnabled) {
        brushContextRange.current = brushX<Point[]>().extent([
          [0, 0],
          [size.width, size.rangeContextHeight]
        ]);

        select(chartRef.current)
          .select(`.${CLASSES.CLIP_RANGE_CONTEXT_PATH_GROUP}`)
          .append('g')
          .attr('class', CLASSES.BRUSH_RANGE_CONTEXT)
          .call(brushContextRange.current);

        select(chartRef.current)
          .select(`.${CLASSES.BRUSH_RANGE_CONTEXT}`)
          .call(
            brushContextRange.current.move,
            xScaleOnContextRange.current.range()
          );
      }

      if (zoomEnabled) {
        brush.current = brushX<Point[]>().extent([
          [0, 0],
          [size.width, size.chartHeight]
        ]);

        select(chartRef.current)
          .select(`.${CLASSES.CLIP_PATH_GROUP}`)
          .append('g')
          .attr('class', 'brush')
          .call(brush.current);
      }

      //define axis
      xAxis.current =
        (xAxisTickFormat &&
          axisBottom(xScale.current).tickFormat(xAxisTickFormat)) ||
        axisBottom(xScale.current);

      yAxis.current = axisLeft(yScale.current).ticks(6);
      if (rangeEnabled) {
        xAxisOnContextRange.current =
          (xAxisTickFormat &&
            axisBottom(xScaleOnContextRange.current).tickFormat(
              xAxisTickFormat
            )) ||
          axisBottom(xScaleOnContextRange.current);
      }

      xAxisGrid.current = axisBottom(xScale.current)
        .tickFormat(() => '')
        .tickSize(-size.chartHeight);
      yAxisGrid.current = axisLeft(yScale.current)
        .tickFormat(() => '')
        .tickSize(-size.width)
        .ticks(6);

      yAxisLabel &&
        chartRef.current &&
        drawYAxisLabel(chartRef.current, yAxisLabel, {
          height: size.chartHeight,
          width: size.width
        });
      xAxisLabel &&
        chartRef.current &&
        drawXAxisLabel(chartRef.current, xAxisLabel, {
          height: size.chartHeight,
          width: size.width
        });
    }
  }, [size]);

  useEffect(() => {
    if (!size) return;
    if (size) {
      setData(inputData);
      if (!inZoomMode.current) {
        redraw(inputData);
      }
    }
  }, [size, inputData]);

  const buildAndDrawLine = (data: Point[]) => {
    const lineGenerator = line<Point>()
      .x((d) => xScale.current(d.x))
      .y((d) => yScale.current(d.y));
    select(chartRef.current)
      .select<SVGPathElement>(`.${CLASSES.CHART_PATH}`)
      .datum(data)
      .join(
        (enter) =>
          enter
            .append('path')
            .attr('d', (d) => lineGenerator(d))
            .attr('fill', 'none'),
        (update) => update,
        (exit) => exit.remove()
      )
      .attr('d', (d) => lineGenerator(d))
      .attr('fill', 'none')
      .attr('stroke-dashoffset', 0);
  };

  const buildAndDrawContextRangeLine = (data: Point[]) => {
    const lineGenerator = line<Point>()
      .x((d) => xScaleOnContextRange.current(d.x))
      .y((d) => yScaleOnContextRange.current(d.y));
    select(chartRef.current)
      .select<SVGPathElement>(`.${CLASSES.CHART_RANGE_CONTEXT_PATH}`)
      .datum(data)
      .join(
        (enter) =>
          enter
            .append('path')
            .attr('d', (d) => lineGenerator(d))
            .attr('fill', 'none'),
        (update) => update,
        (exit) => exit.remove()
      )
      .attr('d', (d) => lineGenerator(d))
      .attr('fill', 'none')
      .attr('stroke-dashoffset', 0);
  };

  const adjustXScale = (data: Point[]) => {
    const [minX, maxX] = extent(data, (d) => d.x);

    xScale.current?.domain([minX || 0, maxX || 0]);

    if (rangeEnabled) {
      xScaleOnContextRange.current?.domain([minX || 0, maxX || 0]);
    }
  };
  const adjustYScale = (data: Point[]) => {
    const yArray = data.map((d) => d.y);
    const minY = min<number>(yArray);
    const maxY = max<number>(yArray);
    yScale.current?.domain([minY || 0, maxY || 0 * 1.005]);
    if (rangeEnabled) {
      yScaleOnContextRange.current?.domain([minY || 0, maxY || 0 * 1.005]);
    }
  };

  const drawAnnotations = (annotations: Annotation[]) => {
    if (!annotations.length) {
      return;
    }
    const annotationGroup = select(chartRef.current).select(
      `.${CLASSES.ANNOTATION_GROUP}`
    );
    annotationGroup.selectAll('*').remove();

    annotations.forEach((annotation: Annotation) => {
      select(chartRef.current)
        .select(`.${CLASSES.ANNOTATION_GROUP}`)
        .append('circle')
        .attr('class', CLASSES.ANNOTATION_POINT)
        .attr('cx', xScale.current(annotation.x))
        .attr('cy', yScale.current(annotation.y))
        .attr('fill', annotation.color || 'red')
        .attr('r', 4);

      select(chartRef.current)
        .select(`.${CLASSES.ANNOTATION_GROUP}`)
        .append('text')
        .attr('class', CLASSES.ANNOTATION_TEXT)
        .attr('x', xScale.current(annotation.x))
        .attr('y', yScale.current(annotation.y))
        .attr('fill', annotation.color || 'red')
        .attr('dy', annotation.textYOffset || 15)
        .attr('dx', annotation.textXOffset || 5)
        .text(annotation.note.title);

      if (annotation.note.label) {
        select(chartRef.current)
          .select(`.${CLASSES.ANNOTATION_GROUP}`)
          .append('text')
          .attr('class', CLASSES.ANNOTATION_LABEL)
          .attr('x', xScale.current(annotation.x))
          .attr('y', yScale.current(annotation.y))
          .attr('fill', annotation.color || 'red')
          .attr('dy', annotation.textYOffset ? annotation.textYOffset + 15 : 30)
          .attr('dx', annotation.textXOffset || 5)
          .text(annotation.note.label);
      }
    });
  };

  const onRangeSelectionZoom = (event: D3BrushEvent<Point[]>) => {
    const zoomExtent: BrushSelection | null = event.selection;
    const rangeExtent = event.selection || xScaleOnContextRange.current.range();
    inZoomMode.current = true;
    if (!zoomExtent) {
      idleTimeout = setTimeout(idled, 360);
      return idleTimeout;
    } else {
      prevZoomExtent.current = zoomExtent;

      xScale.current?.domain([
        xScaleOnContextRange.current.invert(
          (rangeExtent as [number, number])[0]
        ),
        xScaleOnContextRange.current.invert(
          (rangeExtent as [number, number])[1]
        )
      ]);

      if (size) {
        showGridLines &&
          chartRef.current &&
          drawGridLines(
            chartRef.current,
            xAxisGrid.current,
            yAxisGrid.current,
            {
              height: size.chartHeight,
              width: size.width
            }
          );
      }
      if (zoomEnabled) {
        select(chartRef.current)
          .select(`.${CLASSES.BRUSH}`)
          .call(brush.current.move, null);
      }
    }

    select(chartRef.current)
      .select<SVGGElement>(`.${CLASSES.X_AXIS_GROUP}`)
      .transition()
      .duration(1000)
      .call(xAxis.current);
    buildAndDrawLine(data);
  };

  const onSelectionZoom = (event: D3BrushEvent<Point[]>) => {
    const zoomExtent: BrushSelection | null = event.selection;
    inZoomMode.current = true;
    if (!zoomExtent) {
      idleTimeout = setTimeout(idled, 360);
      return idleTimeout;
    } else {
      prevZoomExtent.current = zoomExtent;

      xScale.current?.domain([
        xScale.current.invert((zoomExtent as [number, number])[0]),
        xScale.current.invert((zoomExtent as [number, number])[1])
      ]);
      if (size) {
        showGridLines &&
          chartRef.current &&
          drawGridLines(
            chartRef.current,
            xAxisGrid.current,
            yAxisGrid.current,
            {
              height: size.chartHeight,
              width: size.width
            }
          );
      }
      select(chartRef.current)
        .select(`.${CLASSES.BRUSH}`)
        .call(brush.current.move, null);
      rangeEnabled &&
        select(chartRef.current)
          .select(`.${CLASSES.BRUSH_RANGE_CONTEXT}`)
          .call(brushContextRange.current.move, zoomExtent);
    }

    select(chartRef.current)
      .select<SVGGElement>(`.${CLASSES.X_AXIS_GROUP}`)
      .transition()
      .duration(1000)
      .call(xAxis.current);
    buildAndDrawLine(data);
  };
  const idled = () => {
    idleTimeout = null;
  };

  const resetSelection = () => {
    inZoomMode.current = false;

    rangeEnabled &&
      select(chartRef.current)
        .select(`.${CLASSES.BRUSH_RANGE_CONTEXT}`)
        .call(
          brushContextRange.current.move,
          xScaleOnContextRange.current.range()
        );
    adjustXScale(data);
    select(chartRef.current)
      .select<SVGGElement>(`.${CLASSES.X_AXIS_GROUP}`)
      .call(xAxis.current);
    buildAndDrawLine(data);
  };

  const tooltip = () => {
    if (size) {
      zoomTooltipSurface.current
        .on('touchmouse mousemove', function (event: any) {
          const mousePos = pointer(event);
          console.log(mousePos);
          const xDataValue = xScale.current.invert(mousePos[0]);
          const bisectorFunction = bisector((d: Point) => d.x).center;

          const index = bisectorFunction(data, xDataValue);
          const currentDataPoint = data[index];
          if (currentDataPoint) {
            tooltipDot.current
              .style('opacity', 1)
              .attr('cx', xScale.current(currentDataPoint.x))
              .attr('cy', yScale.current(currentDataPoint.y))
              .raise();

            tooltipDiv.current
              .style('display', 'block')
              .style('left', xScale.current(currentDataPoint.x) + 'px')
              .style('top', yScale.current(currentDataPoint.y) + 'px');

            tooltipDiv.current.select(`.${CLASSES.TOOLTIP_X}`).text(() => {
              if (xScaleType === 'TIME') {
                return (
                  timeFormat('%Y-%m-%d %I:%M:%S')(currentDataPoint.x as Date) +
                  ', '
                );
              } else {
                return currentDataPoint.x + ', ';
              }
            });

            const yValue =
              tooltipUnit === '$'
                ? tooltipUnit + ' ' + currentDataPoint.y
                : currentDataPoint.y + ' ' + tooltipUnit;
            tooltipDiv.current.select(`.${CLASSES.TOOLTIP_Y}`).text(yValue);
          }
        })
        .on('mouseleave', function () {
          tooltipDot.current.style('opacity', 0);

          tooltipDiv.current
            .style('display', 'none')
            .style('top', '0px')
            .style('left', '0px');
          tooltipDiv.current.select(`.${CLASSES.TOOLTIP_X}`).text('');
          tooltipDiv.current.select(`.${CLASSES.TOOLTIP_Y}`).text('');
        });
    }
  };

  const panned = (event: any) => {
    if (size) {
      if (inZoomMode.current && event.shiftKey && panX1.current) {
        panX2.current = event.clientX;

        let xScaleOrig:
          | ScaleTime<number, number, never>
          | ScaleLinear<number, number, never>;

        if (xScaleType === 'TIME') {
          xScaleOrig = scaleTime<number>()
            .range([0, size?.width || 0])
            .nice();
        } else {
          xScaleOrig = scaleLinear<number>().range([0, size?.width || 0]);
        }

        const [minX, maxX] = extent(data, (d) => d.x);

        xScaleOrig.domain([minX || 0, maxX || 0]);
        const x1DataValue = xScaleOrig.invert(prevZoomExtent.current[0]);
        const x2DataValue = xScaleOrig.invert(prevZoomExtent.current[1]);

        const x1PanValue = xScale.current.invert(panX1.current);
        const x2PanValue = xScale.current.invert(panX2.current);
        let differencePanXValue: any;
        let panDomainX1: any;
        let panDomainX2: any;
        if (panX2.current - panX1.current > 0) {
          // Mouse Moved Right => Subtract the difference to extent

          if (xScaleType === 'TIME') {
            differencePanXValue =
              Date.parse(x2PanValue.toString()) -
              Date.parse(x1PanValue.toString());

            panDomainX1 =
              Date.parse(x1DataValue.toString()) - differencePanXValue;
            panDomainX2 =
              Date.parse(x2DataValue.toString()) - differencePanXValue;
          } else {
            differencePanXValue =
              (x2PanValue as number) - (x1PanValue as number);

            panDomainX1 = (x1DataValue as number) - differencePanXValue;
            panDomainX2 = (x2DataValue as number) - differencePanXValue;
          }

          const newExtent = [
            xScaleOrig(panDomainX1) > 0 ? xScaleOrig(panDomainX1) : 0,
            xScaleOrig(panDomainX2)
          ];

          resetSelection();
          zoomEnabled &&
            select(chartRef.current)
              .select(`.${CLASSES.BRUSH}`)
              .call(brush.current.move, newExtent);

          rangeEnabled &&
            select(chartRef.current)
              .select(`.${CLASSES.BRUSH_RANGE_CONTEXT}`)
              .call(brushContextRange.current.move, newExtent);

          showGridLines &&
            chartRef.current &&
            drawGridLines(
              chartRef.current,
              xAxisGrid.current,
              yAxisGrid.current,
              {
                height: size.chartHeight,
                width: size.width
              }
            );
        } else {
          // Mouse Moved Left => Add the difference to extent
          if (xScaleType === 'TIME') {
            differencePanXValue =
              Date.parse(x1PanValue.toString()) -
              Date.parse(x2PanValue.toString());

            panDomainX1 =
              Date.parse(x1DataValue.toString()) + differencePanXValue;
            panDomainX2 =
              Date.parse(x2DataValue.toString()) + differencePanXValue;
          } else {
            differencePanXValue =
              (x1PanValue as number) - (x2PanValue as number);

            panDomainX1 = (x1DataValue as number) + differencePanXValue;
            panDomainX2 = (x2DataValue as number) + differencePanXValue;
          }

          const newExtent = [
            xScaleOrig(panDomainX1),
            xScaleOrig(panDomainX2) <= size.width
              ? xScaleOrig(panDomainX2)
              : size?.width || DEFAULT_SIZE.width
          ];

          resetSelection();
          select(chartRef.current)
            .select(`.${CLASSES.BRUSH}`)
            .call(brush.current.move, newExtent);

          rangeEnabled &&
            select(chartRef.current)
              .select(`.${CLASSES.BRUSH_RANGE_CONTEXT}`)
              .call(brushContextRange.current.move, newExtent);

          showGridLines &&
            chartRef.current &&
            drawGridLines(
              chartRef.current,
              xAxisGrid.current,
              yAxisGrid.current,
              {
                height: size.chartHeight,
                width: size.width
              }
            );
        }
        panX1.current = panX2.current = 0;
      }
    }
  };

  //TODO: enable pan when rangeSelector is on
  const setZoomEvents = () => {
    select(chartRef.current)
      .select(`.${CLASSES.TOOLTIP_LAYER}`)
      .on('dblclick', resetSelection);
    select(chartRef.current)
      .select(`.${CLASSES.TOOLTIP_LAYER}`)
      .on('mousedown', function (event) {
        // Pressing shift key with mouse down, will pan the zoomed area
        if (inZoomMode.current && event.shiftKey) {
          panX1.current = event.clientX;
        } else {
          if (!event.shiftKey) {
            const brushElm = select(`.${CLASSES.BRUSH} > .overlay`).node();
            const newEvent = new MouseEvent('mousedown', {
              view: window,
              bubbles: true,
              cancelable: true,
              screenX: event.screenX,
              screenY: event.screenY,
              clientX: event.clientX,
              clientY: event.clientY
            });

            brushElm && (brushElm as SVGGElement).dispatchEvent(newEvent);
          }
        }
      })
      .on('mouseup', panned);
  };

  const redraw = (data: Point[]) => {
    if (size) {
      tooltipEnabled && tooltip();

      if (rangeEnabled) {
        select(chartRef.current)
          .select(`.${CLASSES.BRUSH_RANGE_CONTEXT} > .overlay`)
          .style('cursor', 'default');
        brushContextRange.current.on('end', onRangeSelectionZoom);

        if (!zoomEnabled) {
          select(chartRef.current)
            .select(`.${CLASSES.CLIP_PATH_GROUP}`)
            .on('dblclick', resetSelection);

          select(chartRef.current)
            .select(`.${CLASSES.TOOLTIP_LAYER}`)
            .on('mousedown', function (event) {
              // Pressing shift key with mouse down, will pan the zoomed area
              if (inZoomMode.current && event.shiftKey) {
                panX1.current = event.clientX;
              }
            })
            .on('mouseup', panned);
        }
      }

      if (zoomEnabled) {
        setZoomEvents();
        select(chartRef.current)
          .select(`.${CLASSES.BRUSH} > .overlay`)
          .style('cursor', 'default');
        brush.current.on('end', onSelectionZoom);
      }

      if (zoomEnabled || rangeEnabled || tooltipEnabled) {
        select(chartRef.current)
          .select(`.${CLASSES.TOOLTIP_LAYER}`)
          .on('dblclick', resetSelection);
        select(chartRef.current)
          .select(`.${CLASSES.CLIP_PATH_GROUP}`)
          .on('dblclick', resetSelection);
      }

      adjustXScale(data);
      adjustYScale(data);

      showAxis &&
        chartRef.current &&
        drawAxis(chartRef.current, xAxis.current, yAxis.current, {
          height: size.chartHeight,
          width: size.width
        });

      rangeEnabled &&
        chartRef.current &&
        select<SVGGElement, unknown>(chartRef.current)
          .select<SVGGElement>(`.${CLASSES.X_AXIS_RANGE_CONTEXT_GROUP}`)
          .attr('transform', `translate(0, ${size.rangeContextHeight})`)
          .call(xAxisOnContextRange.current);

      showGridLines &&
        chartRef.current &&
        drawGridLines(chartRef.current, xAxisGrid.current, yAxisGrid.current, {
          height: size.chartHeight,
          width: size.width
        });
      drawAnnotations(annotations);
      buildAndDrawLine(data);
      rangeEnabled && buildAndDrawContextRangeLine(data);
    }
  };

  return (
    <>
      <Tooltip />
      <svg id={id} ref={chartRef} className={CLASSES.CHART_SVG}>
        <LineChartSurface>
          {showGridLines && (
            <>
              <XAxisGrid />
              <YAxisGrid />
            </>
          )}
          {showAxis && <XAxis />}
          {showAxis && <YAxis />}
          <g clipPath="url(#clip)" className={CLASSES.CLIP_PATH_GROUP}>
            <LineSeries />
          </g>

          {annotations.length && <Annotations />}
        </LineChartSurface>
        {rangeEnabled && (
          <LineChartContextRangeSurface size={size}>
            <g
              clipPath="url(#clipRangeContext)"
              className={CLASSES.CLIP_RANGE_CONTEXT_PATH_GROUP}
            >
              <path className={CLASSES.CHART_RANGE_CONTEXT_PATH}></path>
            </g>
            <g className={CLASSES.X_AXIS_RANGE_CONTEXT_GROUP}></g>
          </LineChartContextRangeSurface>
        )}
      </svg>
    </>
  );
};

export default LineChart;
