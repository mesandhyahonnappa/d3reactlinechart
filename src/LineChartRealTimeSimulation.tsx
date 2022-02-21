import React, { useState } from 'react';
import LineChart from './components/LineChart/LineChart';
import DATA from './data/timeTemperatureData.json';

import { Container, Grid } from '@material-ui/core';

const dataSource = (data: { time: number; temperature: number }[]) => {
  // Filter only last 15 minutes data = last 900 Seconds
  const maxDateTime = data[data.length - 1].time;
  const lastFifteenMins = maxDateTime - 900;

  const splitIndex = data.findIndex((item) => item.time > lastFifteenMins);

  const filteredData = data.slice(splitIndex);

  return filteredData.map((item) => {
    const point = { x: new Date(item.time * 1000), y: item.temperature };
    return point;
  });
};

function LineChartRealTimeSimulation() {
  const [data, setData] = useState(dataSource(DATA.data.slice(0, 500)));

  // const [data] = useState(dataSource(DATA.data));
  const format = (d: any, index: number): string => {
    const firstDateTime: Date = new Date(DATA.data[0].time * 1000) as Date;
    const curDateTime: Date = new Date(d.toString());
    const minPast = parseInt(
      (
        (Math.abs(curDateTime.getTime() - firstDateTime.getTime()) /
          (1000 * 60)) %
        60
      ).toString()
    );
    if (minPast === 0) {
      return '';
    }
    return `${minPast}m`;
  };

  React.useEffect(() => {
    setTimeout(() => {
      setData(dataSource(DATA.data.slice(0, 500)));
    }, 2000);
    setTimeout(() => {
      setData(dataSource(DATA.data.slice(0, 1000)));
    }, 4000);
    setTimeout(() => {
      setData(dataSource(DATA.data.slice(0, 1500)));
    }, 6000);
    setTimeout(() => {
      setData(dataSource(DATA.data.slice(0, 2000)));
    }, 8000);
    setTimeout(() => {
      setData(dataSource(DATA.data.slice(0, 2500)));
    }, 10000);
    setTimeout(() => {
      setData(dataSource(DATA.data.slice(0, 3000)));
    }, 12000);
    setTimeout(() => {
      setData(dataSource(DATA.data));
    }, 14000);
  }, []);

  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <div style={{ height: 550, marginTop: '8rem', position: 'relative' }}>
            <LineChart
              id={'GC'}
              data={data}
              xAxisTickFormat={format}
              xAxisLabel="Time"
              yAxisLabel="Temperature"
              xScaleType="TIME"
              showAxis={true}
              showGridLines={true}
              tooltipEnabled={true}
              zoomEnabled={true}
              rangeEnabled={true}
            ></LineChart>
          </div>
        </Grid>
      </Grid>
    </Container>
  );
}
export default LineChartRealTimeSimulation;
