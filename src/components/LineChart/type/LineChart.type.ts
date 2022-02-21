export enum CLASSES {
  BRUSH = 'brush',
  BRUSH_RANGE_CONTEXT = 'brushRangeContext',
  TOOLTIP = 'tooltip',
  TOOLTIP_X = 'tooltip-x',
  TOOLTIP_Y = 'tooltip-y',
  TOOLTIP_LAYER = 'tooltip-layer',
  CHART_AREA = 'chart-area',
  CHART_SVG = 'chart-svg',
  CLIP_PATH_GROUP = 'clip-path-group',
  CLIP_RANGE_CONTEXT_PATH_GROUP = 'clip-range-context-path-group',
  LINE_CHART_CONTAINER = 'line-chart-container',
  LINE_CHART_RANGE_CONTEXT = 'line-chart-range-context',
  X_AXIS_GROUP = 'x-axis-group',
  Y_AXIS_GROUP = 'y-axis-group',
  X_AXIS_RANGE_CONTEXT_GROUP = 'x-axis-range-context-group',
  X_AXIS_GRID = 'x-axis-grid',
  Y_AXIS_GRID = 'y-axis-grid',
  X_AXIS_TITLE = 'x-axis-title',
  Y_AXIS_TITLE = 'y-axis-title',
  CHART_PATH = 'chart-path',
  CHART_RANGE_CONTEXT_PATH = 'chart-range-context-path',
  ANNOTATION_GROUP = 'annotations-group',
  ANNOTATION_TEXT = 'annotation-text',
  ANNOTATION_LABEL = 'annotation-label',
  ANNOTATION_POINT = 'annotation-point'
}

export type Point = {
  x: number | Date;
  y: number;
};

export type Annotation = {
  note: {
    title: string;
    label?: string;
  };
  x: any;
  y: number;
  textXOffset?: number;
  textYOffset?: number;
  color?: string;
};
