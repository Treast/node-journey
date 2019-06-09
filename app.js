const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const defaults = {
  width: 800,
  height: 800,
  size: 5,
  gap: 30,
};

const args = require('curlew.js').init(defaults);

const WIDTH = parseInt(args.width);
const HEIGHT = parseInt(args.height);
const SIZE = parseInt(args.size);
const GAP = parseInt(args.gap);

const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext('2d');

const numberColumns = (WIDTH - GAP * 2) / (SIZE * 4);
const numberRows = (HEIGHT - GAP * 2) / (SIZE * 4);
const gapLeft = Math.floor((WIDTH - GAP * 2 - SIZE * 4 * numberColumns) / 2) + GAP;
const gapTop = Math.floor((HEIGHT - GAP * 2 - SIZE * 4 * numberRows) / 2) + GAP;
console.log(numberColumns, numberRows);

const patterns = [
  [0, 0, 1, 0, 1, 1, 1, 1, 1],
  [1, 1, 1, 0, 0, 0, 1, 1, 1],
  [1, 1, 1, 1, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 0, 0, 1, 0, 1],
  [1, 1, 1, 0, 0, 1, 1, 1, 1],
  [1, 1, 1, 0, 0, 1, 0, 1, 1],
];

const drawCanvas = () => {
  return new Promise((resolve) => {
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = '#000';

    for (let x = 0; x < numberColumns; x += 1) {
      for (let y = 0; y < numberRows; y += 1) {
        const positionX = gapLeft + x * SIZE * 4 + SIZE * 2;
        const positionY = gapTop + y * SIZE * 4 + SIZE * 2;
        ctx.save();
        ctx.translate(positionX, positionY);
        const rotation = Math.floor(Math.random() * 4);
        ctx.rotate((Math.PI * rotation) / 2);
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        pattern.forEach((value, index) => {
          const pX = index % 3;
          const pY = Math.floor(index / 3);
          if (value == 1) {
            ctx.fillRect(pX * SIZE - SIZE * 1.5, pY * SIZE - SIZE * 1.5, SIZE, SIZE);
          }
        });
        // ctx.fillStyle = 'red';
        // ctx.fillRect(0, 0, 3, 3);
        ctx.restore();
      }
    }
    resolve();
  });
};

const outputImage = () => {
  return new Promise((resolve) => {
    const out = fs.createWriteStream(path.resolve(__dirname, 'dist', `${new Date().getTime()}.png`));
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', () => {
      resolve();
    });
  });
};

const run = async () => {
  await drawCanvas().then(() => outputImage());
};

run();
