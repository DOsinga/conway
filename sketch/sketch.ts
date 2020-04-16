/// <reference path="World.ts" />

var sketch = (p: p5) => {
  const CELLS_PER_SIDE = 80;

  let world: World;

  p.setup = function () {
    p.createCanvas(720, 720);
    const cellCount = Math.round(CELLS_PER_SIDE * CELLS_PER_SIDE / 3);
    const hash = window.location.hash.substr(1);
    const colors = [
      p.color('red'),
      p.color('orange'),
      p.color('yellow'),
      p.color('green'),
      p.color(38, 58, 150), // blue
      p.color('indigo'),
      p.color('violet')
    ];
    world = new World(
        CELLS_PER_SIDE,
        CELLS_PER_SIDE,
        cellCount,
        hash,
        colors);
    window.location.hash = world.hash;
  };

  p.draw = function () {
    world.tick();
    p.background(51);

    const side = p.min(p.width, p.height);
    const cell_size = side / CELLS_PER_SIDE;
    const x_offs = (p.width - side + cell_size) / 2;
    const y_offs = (p.height - side + cell_size) / 2;

    p.noStroke();

    for (let cell of world.cells) {
      p.fill(world.colorForCell(cell));
      p.circle(x_offs + cell.curX * cell_size,
          y_offs + cell.curY * cell_size,
          cell_size * 0.7);
    }
  }
};

const container = window.document.getElementById('container');
new p5(sketch, container);
