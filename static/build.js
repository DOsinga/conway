var Cell = (function () {
    function Cell() {
    }
    return Cell;
}());
var World = (function () {
    function World(width, height, cell_count) {
        this.colors = [
            color('red'),
            color('orange'),
            color('yellow'),
            color('green'),
            color(38, 58, 150),
            color('indigo'),
            color('violet')
        ];
        this.colorCount = this.colors.length;
        this.width = width;
        this.height = height;
        for (var x = 0; x < width; x++) {
            this.grid[x] = [];
            for (var y = 0; y < height; y++) {
                this.grid[x][y] = null;
            }
        }
        this.cells = [];
        for (var i = 0; i < cell_count; i++) {
            while (true) {
                var x = Math.floor(Math.random() * width);
                var y = Math.floor(Math.random() * height);
                if (this.grid[x][y] === null) {
                    var c = { color: Math.floor(Math.random() * this.colorCount),
                        curX: x,
                        curY: y };
                    this.grid[x][y] = c;
                    this.cells.push(c);
                    break;
                }
            }
        }
    }
    return World;
}());
var frame = 0;
var CELLS_PER_SIDE = 10;
var world = new World(CELLS_PER_SIDE, CELLS_PER_SIDE, 10);
function setup() {
    createCanvas(windowWidth, windowHeight);
}
function draw() {
    frame += 1;
    background(51);
    var side = min(width, height);
    var cell_size = side / CELLS_PER_SIDE;
    var x_offs = (width - side + cell_size) / 2;
    var y_offs = (height - side + cell_size) / 2;
    noStroke();
    console.log(world);
    for (var _i = 0, _a = world.cells; _i < _a.length; _i++) {
        var cell = _a[_i];
        fill(cell.color);
        circle(x_offs + cell.curX * cell_size, y_offs + cell.curY * cell_size, cell_size * 0.9);
    }
}
//# sourceMappingURL=build.js.map
