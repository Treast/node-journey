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

const numberColumns = Math.floor((WIDTH - GAP * 2) / (SIZE * 11));
const numberRows = Math.floor((HEIGHT - GAP * 2) / (SIZE * 11));
const gapLeft = Math.floor(WIDTH - GAP * 2 - SIZE * 11 * numberColumns) / 2 + GAP;
const gapTop = Math.floor(HEIGHT - GAP * 2 - SIZE * 11 * numberRows) / 2 + GAP;
console.log(numberColumns, GAP, SIZE, gapLeft);

const patterns = [
  [0, 0, 1, 0, 1, 1, 1, 1, 1],
  [1, 1, 1, 0, 0, 0, 1, 1, 1],
  [1, 1, 1, 1, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 0, 0, 1, 0, 1],
  [1, 1, 1, 0, 0, 1, 1, 1, 1],
  [1, 1, 1, 0, 0, 1, 0, 1, 1],
];

let previousPattern = null;
let previousRotate = null;

const drawPattern = (x, y, sameAsBefore = false) => {
  ctx.save();
  ctx.translate(x, y);
  const rotation = Math.floor(Math.random() * 4);
  let pattern = null;
  if (sameAsBefore && Math.random() < 1 / 3) {
    pattern = previousPattern;
    ctx.rotate(previousRotate);
  } else {
    pattern = patterns[Math.floor(Math.random() * patterns.length)];
    ctx.rotate((Math.PI * rotation) / 2);
  }
  previousPattern = pattern;
  previousRotate = (Math.PI * rotation) / 2;
  pattern.forEach((value, index) => {
    const pX = index % 3;
    const pY = Math.floor(index / 3);
    if (value == 1) {
      ctx.fillRect(pX * SIZE - SIZE * 1.5, pY * SIZE - SIZE * 1.5, SIZE, SIZE);
    }
  });
  ctx.restore();
};

const drawCanvas = () => {
  return new Promise((resolve) => {
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = '#000';

    for (let x = 0; x < numberColumns; x += 1) {
      for (let y = 0; y < numberRows; y += 1) {
        const positionX = gapLeft + x * SIZE * 11 + SIZE * 3;
        const positionY = gapTop + y * SIZE * 11 + SIZE * 3;
        drawPattern(positionX, positionY);
        drawPattern(positionX + SIZE * 4, positionY, true);
        drawPattern(positionX, positionY + SIZE * 4);
        drawPattern(positionX + SIZE * 4, positionY + SIZE * 4, true);
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
