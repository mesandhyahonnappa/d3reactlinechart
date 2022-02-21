import React, { useState } from 'react';
import LineChart from './components/LineChart/LineChart';
import { getStockPriceSeries } from './data/getStockPriceSeries';
import { Container, Grid } from '@material-ui/core';

function LineChartStockPriceDemo() {
  const [data] = useState(getStockPriceSeries());

  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <div style={{ height: 600, marginTop: '8rem', position: 'relative' }}>
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
