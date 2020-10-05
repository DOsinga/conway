/// <reference path="World.ts" />

let world: World;

let INPUT_WIDTH : number|undefined;

var sketch = (p: p5) => {
  const CELLS_PER_SIDE = (typeof INPUT_WIDTH == 'undefined') ? 30: INPUT_WIDTH;

  const testWorld = (
          '     ' +
          ' 12  ' +
          ' 202 ' +
          '  1  ' +
          '     '
  );

  p.setup = function () {
    p.createCanvas(720, 720);
    const cellCount = Math.round(CELLS_PER_SIDE * CELLS_PER_SIDE / 3);
    const hash = window.location.hash.substr(1);
    const colors = [
      p.color('red'),
      p.color(58, 78, 180), // blue
      p.color('green'),
      p.color('yellow'),
      p.color('indigo'),
      p.color('orange'),
      p.color('violet')
    ];
    world = new World(
        CELLS_PER_SIDE,
        CELLS_PER_SIDE,
        cellCount,
        hash,
        colors);
    window.location.hash = world.hash;

    p.frameRate(60);
  };

  var ticks = 0;

  p.draw = function () {
    const side = p.min(p.width, p.height);
    const cell_size = side / CELLS_PER_SIDE;
    const x_offs = (p.width - side + cell_size) / 2;
    const y_offs = (p.height - side + cell_size) / 2;

    const cellsMoved = world.tick(false);
    p.background(51);
    p.noStroke();

    for (let cell of world.cells) {
      p.fill(world.colorForCell(cell));
      // Normally we draw each cell onese, but if they are about to move out of the draw
      // them again at the other side. Potentially one cell could appear 4 times that way
      for (let xt = 0; xt < 2; xt++) {
        for (let yt = 0; yt < 2; yt++) {
          let x = cell.curX;
          let y = cell.curY;
          if (xt === 1) {
            if (x > world.width - 1) {
              x  -= world.width;
            } else if (x < 0) {
              x += world.width;
            } else {
              continue
            }
          }
          if (yt === 1) {
            if (y > world.height - 1) {
              y -= world.height;
            } else if (y < 0) {
              y += world.height;
            } else {
              continue
            }
          }
          p.circle(x_offs + x * cell_size,
              y_offs + y * cell_size,
              cell_size * 0.7);
        }
      }
    }
  }
};

const container = window.document.getElementById('container');
new p5(sketch, container);

window.onhashchange = function() {
  const hash = window.location.hash.substr(1);
    world = new World(
      world.width,
      world.height,
      world.cells.length,
      hash,
      world.colors);

};
