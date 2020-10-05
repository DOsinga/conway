class Cell {
  type: number;
  x: number;
  y: number;
  nextX: number;
  nextY: number;
  curX: number;
  curY: number;
}

const TEMP_DECAY = 0.002;

class World {
  DIRECTIONS = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ];
  DIRECTIONS_MEDIUM = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1]
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

  colors : any[];
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

  constructor(width: number, height: number, cell_count: number|string, hash: string, colors: any[]) {
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
    if(typeof cell_count == 'number'){
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
    } else {
      this.temperature = 0;
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          const type = cell_count.charCodeAt(x + y * width) - 48;
          if (type >= 0 && type < this.colorCount) {
            const c = {type: type,
              x:x, nextX: x, curX: x,
              y:y, nextY: y, curY: y};
            this.grid[x][y] = c;
            this.cells.push(c);
          }
        }
      }
    }

  }

  public colorForCell(cell: Cell) {
    return this.colors[cell.type];
  }

  private gridMod(x: number, y: number, value?: Cell) {
    x = (x + this.width) % this.width;
    y = (y + this.height) % this.height;
    if (value !== undefined) {
      this.grid[x][y] = value;
    }
    return this.grid[x][y];
  }

  neighbors(x: number, y: number, src: number[][]) {
    return src.map(el => [x + el[0], y + el[1]]);
  }

  openAt(x: number, y: number) {
    return this.neighbors(x, y, this.DIRECTIONS).filter(p => this.gridMod(p[0],p[1]) == null);
  }

  cellsAround(x: number, y: number, src: number[][]) {
    const xy = this.neighbors(x, y, src);
    return xy.map(p => this.gridMod(p[0], p[1]));
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

  public tick(skipInterpolation = false) {
    this.temperature *= (1 - TEMP_DECAY);
    if (this.temperature < TEMP_DECAY * 10) {
      this.temperature = 0;
    }
    this.ticksLeftInIteration -= 1;
    const fraction = this.ticksLeftInIteration / this.iterationTicks;
    let cellsMoved = -1;
    for (let cell of this.cells) {
      if (this.ticksLeftInIteration === 0 || skipInterpolation) {
        cell.nextX = cell.curX = cell.x = (cell.nextX + this.width) % this.width;
        cell.nextY = cell.curY = cell.y = (cell.nextY + this.height) % this.height;
        const open = this.openAt(cell.x, cell.y);
        if (open.length > 0) {
          let nextX = cell.x;
          let nextY = cell.y;
          this.gridMod(cell.nextX, cell.nextY, null);
          open.unshift([cell.x, cell.y]);
          let hiScore = 0;
          for(const [x, y] of open) {
            const score = this.scorePositionForCell(x, y, cell);
            if (score > hiScore) {
              hiScore = score;
              nextX = x;
              nextY = y;
            }
          }
          if (nextX != cell.x || nextY != cell.y) {
            cellsMoved = cellsMoved == -1 ? 1 : cellsMoved + 1;
          }
          cell.nextX = nextX;
          cell.nextY = nextY;
          this.gridMod(cell.nextX, cell.nextY, cell);
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
    return cellsMoved;
  }

  private scorePositionForCell(x: number, y: number, cell: Cell) {
    if (this.colorCount == 1) {
      let count = 0;
      for (const other of this.cellsAround(x, y, this.DIRECTIONS_MEDIUM)) {
        if (other !== null) {
          count += 1;
        }
      }
      if (count == 2) {
        return 3;
      } else if (count == 3) {
        return 2;
      } else if (count == 1) {
        return 0;
      }
      return 0
    } else {
      const aroundNear = this.cellsAround(x, y, this.DIRECTIONS);
      const aroundFar = this.cellsAround(x, y, this.DIRECTIONS_FAR);
      return this.scoreGenes(aroundNear, cell) + this.scoreGenes(aroundFar, cell) * this.temperature;
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
