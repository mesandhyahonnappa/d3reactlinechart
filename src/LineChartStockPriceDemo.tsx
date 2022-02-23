import React, { useState } from 'react';
import LineChart from './components/LineChart/LineChart';
import { getStockPriceSeries } from './data/getStockPriceSeries';
import { Container, Grid } from '@material-ui/core';

function LineChartStockPriceDemo() {
  const [data] = useState(getStockPriceSeries());
  //const [data] = useState(DATA);

  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <h1>Line Chart React Component - Using D3</h1>
          <h2>A high performant rich interactive line chart</h2>
          <h4>Features</h4>
          <ul>
            <li>Supports rendering a high volume of data.</li>
            <li>Zoom - Select a box area to zoom into the details</li>
            <li>Multiple levels of zoom</li>
            <li>Double click on the chart to zoom out.</li>
            <li>
              Panning - On zoom, press [Ctrl + Shift] and drag left or right to
              see the details, respectively.
            </li>
            <li>
              Range viewer - A panoramic view, create a window/range, drag left
              and right to view the details on chart.
            </li>
          </ul>
        </Grid>
        <Grid item xs={12}>
          <div style={{ height: 600, position: 'relative' }}>
            <LineChart
              id={'GC'}
              data={data}
              xAxisLabel="Time"
              yAxisLabel="Stock Price"
              xScaleType="TIME"
              showAxis={true}
              showGridLines={true}
              tooltipEnabled={true}
              tooltipUnit="$"
              zoomEnabled={true}
              rangeEnabled={true}
            ></LineChart>
          </div>
        </Grid>
      </Grid>
    </Container>
  );
}
export default LineChartStockPriceDemo;
