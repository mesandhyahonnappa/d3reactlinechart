export function getStockPriceSeries() {
  let curEndDate = Date.UTC(2022, 2, 21, 0, 0, 0);
  let n = 2000;
  const priceRange = (min: number, max: number): number => {
    return Number((Math.random() * (max - min) + min).toFixed(2)); //The maximum is exclusive and the minimum is inclusive
  };
  let arr = [],
    x = curEndDate - n * 36e5,
    i = 0,
    a = 0,
    b = 0,
    c = 0,
    spike;
  for (i = 0; i < n; i = i + 1) {
    if (i % 100 === 0) {
      a = 2 * Math.random();
    }
    if (i % 1000 === 0) {
      b = 2 * Math.random();
    }
    if (i % 10000 === 0) {
      c = 2 * Math.random();
    }
    spike = 3;
    arr.push({
      x,
      y: Number(
        (
          (2 * Math.sin(i / 100) + a + b + c + spike + Math.random()) *
          priceRange(30, 100)
        ).toFixed(2)
      )
    });
    x = x + 1 * 1000 * 60 * 60;
  }
  return arr;
}
