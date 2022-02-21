import React from 'react';
import { CLASSES } from '../type/LineChart.type';

const Tooltip = () => {
  return (
    <div className={CLASSES.TOOLTIP}>
      <span className={CLASSES.TOOLTIP_X}></span>
      <span className={CLASSES.TOOLTIP_Y}></span>
    </div>
  );
};

export default Tooltip;
