class Cell {
  type: number;
  x: number;
  y: number;
  nextX: number;
  nextY: number;
  curX: number;
  curY: number;
}

class World {
  DIRECTIONS = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ];
  DIRECTIONS_FAR = [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
    [2, 0],
    [0, 2],
    [-2, 0],
    [0, -2],
  ];


  TICKS_PER_STEP = 25;

  static HASH_CHARS = '!@ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  colors : p5.Color[];
  width: number;
  height: number;
  grid : Cell[][];
  cells: Cell[];
  colorGenes: number[][];
  colorCount : number;
  ticksLeftInIteration: number = 1;
  iterationTicks: number = 1;
  hash: string;
  temperature: number;

  constructor(width: number, height: number, cell_count: number, hash: string, colors: p5.Color[]) {
    this.width = width;
    this.height = height;
    this.colors = colors;
    this.grid = [];
    this.temperature = 5.0;
    for (let x = 0; x < width; x++) {
      this.grid[x] = [];
      for (let y = 0; y < height; y++) {
        this.grid[x][y] = null;
      }
    }

    if (hash) {
      this.hash = hash;
      this.colorCount = Math.floor(Math.sqrt(hash.length));
    } else {
      this.colorCount = this.colors.length;
      let chars: string[] = new Array(this.colorCount * (this.colorCount + 1));
      for (let i = 0; i < chars.length; i++) {
        chars[i] = World.HASH_CHARS[Math.round(World.HASH_CHARS.length * Math.random())];
      }
      this.hash = chars.join('');
    }
    this.colorGenes = this.hashToGenes(this.hash);

    this.cells = [];
    for (let i = 0; i < cell_count; i++) {
      while (true) {
        const x = Math.floor(Math.random() * width);
        const y = Math.floor( Math.random() * height);
        if (this.grid[x][y] === null) {
          const c = {type: Math.floor(Math.random() * this.colorCount),
            x:x, nextX: x, curX: x,
            y:y, nextY: y, curY: y};
          this.grid[x][y] = c;
          this.cells.push(c);
          break;
        }
      }
    }

  }

  public colorForCell(cell: Cell) {
    return this.colors[cell.type];
  }

  private coordInRange(x1: number, y1: number) {
    return x1 >= 0 && x1 < this.width && y1 >= 0 && y1 < this.height;
  }

  neighbors(x: number, y: number, near: boolean) {
    let res : [number, number][] = [];
    const src = near ? this.DIRECTIONS : this.DIRECTIONS_FAR;
    for (const [dx, dy] of src) {
      const x1 = x + dx;
      const y1 = y + dy;
      if (this.coordInRange(x1, y1)) {
        res.push([x1, y1])
      }
    }
    return res;
  }

  openAt(x: number, y: number) {
    return this.neighbors(x, y, true).filter(p => this.grid[p[0]][p[1]] == null);
  }

  cellsAround(x: number, y: number, near: boolean) {
    const xy = this.neighbors(x, y, near);
    return xy.map(p => this.grid[p[0]][p[1]]);
  }

  private static scoreClustering(around: Cell[], cell: Cell) {
    let score = Math.random() * 1.5;
    for (const other of around) {
      if (other == null) {
        score += 0.5
      } else if (other.type == cell.type) {
        score += 1;
      } else {
        score -= 1;
      }
    }
    return score;
  }

  private scoreGenes(around: Cell[], cell: Cell) {
    let score = Math.random() * this.temperature;
    const genes = this.colorGenes[cell.type];
    for (const other of around) {
      if (other == null) {
        score += genes[0];
      } else {
        score += genes[1 + other.type];
      }
    }
    return score;
  }

  public tick() {
    this.temperature *= 0.999;
    if (this.temperature < 0.01) {
      this.temperature = 0;
    }
    this.ticksLeftInIteration -= 1;
    const fraction = this.ticksLeftInIteration / this.iterationTicks;
    for (let cell of this.cells) {
      if (this.ticksLeftInIteration === 0) {
        cell.curX = cell.x = cell.nextX;
        cell.curY = cell.y = cell.nextY;
        const open = this.openAt(cell.x, cell.y);
        if (open.length > 0) {
          let nextX = cell.x;
          let nextY = cell.y;
          this.grid[cell.nextX][cell.nextY] = null;
          open.unshift([cell.x, cell.y]);
          let hiScore = 0;
          for(const [x, y] of open) {
            const around_near = this.cellsAround(x, y, true);
            const around_far = this.cellsAround(x, y, false);
            const score = this.scoreGenes(around_near, cell) + this.scoreGenes(around_far, cell) * this.temperature;
            if (score > hiScore) {
              hiScore = score;
              if (nextX != x && nextY != y) {
                const xxx = nextX;
              }
              nextX = x;
              nextY = y;
            }
          }
          cell.nextX = nextX;
          cell.nextY = nextY;
          this.grid[cell.nextX][cell.nextY] = cell;
        }
      } else {
        cell.curX = cell.x * fraction + cell.nextX * (1 - fraction);
        cell.curY = cell.y * fraction + cell.nextY * (1 - fraction);
      }
    }
    if (this.ticksLeftInIteration === 0) {
      this.iterationTicks = Math.round(this.TICKS_PER_STEP / (1 + this.temperature));
      this.ticksLeftInIteration = this.iterationTicks;
    }
  }

  private hashToGenes(hash: string) {
    function chrToNum(ch: string) {
      const num = World.HASH_CHARS.indexOf(ch) / World.HASH_CHARS.length;
      return (num - 0.25);
    }

    function strToNums(chunk: string) {
      return chunk.split('').map(chrToNum);
    }

    let res = [];
    const geneLen = this.colorCount + 1;
    for (let i = 0; i < this.colorCount; i ++) {
      const chunk = hash.substr(i * geneLen, geneLen);
      res[i] = strToNums(chunk);
    }
    return res;
  }
}
