export class RandomSeriesGenerator {
  private last: number = 0;
  private i: number = 0;
  constructor() {
    this.last = 0;
    this.i = 0;
    this.reset();
  }
  reset() {
    this.i = 0;
    this.last = 0;
  }

  private getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }
  getRandomSeries(count: number) {
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < count; i++) {
      const next = this.getRandomInt(15, 25) - (Math.random() >= 0.5 ? 0.5 : 0);
      const point = { x: this.i++, y: next };
      points.push(point);
      this.last = next;
    }
    return points;
  }
}

// const dataProvider = new RandomSeriesGenerator(1);

// let data = dataProvider.getRandomSeries(10);

// console.log(data);

// data = dataProvider.getRandomSeries(5);
// console.log(data);
