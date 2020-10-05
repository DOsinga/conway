import random
import time
from dataclasses import dataclass
from math import sqrt
from PIL import Image, ImageColor
import numpy as np


@dataclass
class Cell:
    type: int
    x: int
    y: int
    nextX: int
    nextY: int
    curX: int
    curY: int


class World:
    DIRECTIONS = [
        [1, 0],
        [0, 1],
        [-1, 0],
        [0, -1],
    ]

    DIRECTIONS_FAR = [
        [1, 1],
        [-1, 1],
        [1, -1],
        [-1, -1],
        [2, 0],
        [0, 2],
        [-2, 0],
        [0, -2],
    ]

    TICKS_PER_STEP = 25

    HASH_CHARS = '!@ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    def __init__(self, width, height, cell_count, hash):
        self.width = width
        self.height = height
        self.cellsMoved = 0
        self.grid = np.zeros((width, height), dtype=np.int)  # [[0 for y in range(height)] for x in range(width)]
        self.temperature = 5.0

        if hash:
            self.hash = hash
            self.colorCount = int(sqrt(len(hash)))
        else:
            self.colorCount = 7
            self.hash = ''.join(random.choice(World.HASH_CHARS) for _ in range(self.colorCount * (1 + self.colorCount)))
        self.colorGenes = np.asarray(self.hashToGenes(self.hash))

        self.cells = []
        for i in range(cell_count):
            while True:
                x = random.randrange(width)
                y = random.randrange(height)
                if not self.grid[x][y]:
                    cell = Cell(type=random.randrange(self.colorCount) + 1, x=x, y=y, nextX=x, nextY=y, curX=x, curY=y)
                    self.grid[x][y] = cell.type
                    self.cells.append(cell)
                    break

    def coordInRange(self, x1, y1):
        return x1 >= 0 and x1 < self.width and y1 >= 0 and y1 < self.height

    def neighbors_near(self, x, y):
        if x > 0:
            yield x - 1, y
        if x < self.width - 1:
            yield x + 1, y
        if y > 0:
            yield x, y - 1
        if y < self.height - 1:
            yield x, y + 1

    def neighbors_far(self, x, y):
        for dx, dy in self.DIRECTIONS_FAR:
            x1 = x + dx
            y1 = y + dy
            if self.coordInRange(x1, y1):
                yield x1, y1

    def openAt(self, x, y):
        for x, y in self.neighbors_near(x, y):
            if not self.grid[x, y]:
                yield x, y

    def cellsAround(self, x, y, near):
        gen = self.neighbors_near if near else self.neighbors_far
        for x, y in gen(x, y):
            yield self.grid[x, y]

    def scoreGenes(self, around, cell):
        score = random.random() * self.temperature
        genes = self.colorGenes[cell.type - 1]
        for other in around:
            score += genes[other]
        return score

    def score_for_xy(self, x, y, genes):
        # Calculate the neighbors coordinates and scores:
        m = np.asarray(
            [
                [x + dx, y + dy, v * 1000]
                for (dx, dy), v in zip(
                    World.DIRECTIONS + World.DIRECTIONS_FAR,
                    [1] * len(World.DIRECTIONS) + [self.temperature] * len(World.DIRECTIONS_FAR),
                )
            ],
            dtype=np.int,
        )
        # filter the coordinates that are out of bounds:
        m1 = m[(m[:, 0] >= 0) & (m[:, 0] < self.height) & (m[:, 1] >= 0) & (m[:, 1] < self.width)]
        # look up the neighbors themselves
        neighbors = self.grid[m1[:, 0], m1[:, 1]]
        # multiply by how much we like them, taking into account the weights
        neighbors_scores = genes[neighbors] * m1[:, 2] / 1000
        # add some random
        return neighbors_scores.sum() + random.random() * self.temperature

    def tick(self):
        self.temperature *= 0.999
        if self.temperature < 0.1:
            self.temperature = 0

        for cell in self.cells:
            cell.curX = cell.x = cell.nextX
            cell.curY = cell.y = cell.nextY
            open = [*self.openAt(cell.x, cell.y)]
            if open:
                nextX = cell.x
                nextY = cell.y
                self.grid[cell.nextX][cell.nextY] = 0
                open.insert(0, (nextX, nextY))
                hiScore = 0
                for x, y in open:
                    around_near = self.cellsAround(x, y, near=True)
                    score = self.scoreGenes(around_near, cell)
                    if self.temperature > 0:
                        around_far = self.cellsAround(x, y, near=False)
                        score += self.scoreGenes(around_far, cell) * self.temperature
                    if score > hiScore:
                        hiScore = score
                        nextX = x
                        nextY = y
                if nextX != cell.x and nextY != cell.y:
                    self.cellsMoved += 1

                cell.nextX = nextX
                cell.nextY = nextY
                self.grid[cell.nextX][cell.nextY] = cell.type

    def hashToGenes(self, hash: str):
        def char_to_num(ch):
            num = World.HASH_CHARS.find(ch) / len(World.HASH_CHARS)
            return num - 0.25

        def str_to_nums(chunk):
            return [char_to_num(ch) for ch in chunk]

        gene_len = self.colorCount + 1
        return [str_to_nums(hash[i : i + gene_len]) for i in range(0, self.colorCount * gene_len, gene_len)]

    def save_image(self, path):
        colors = [ImageColor.getrgb(c) for c in ('red', 'green', 'blue', 'yellow', 'brown', 'pink', 'lime')]
        img = Image.new('RGB', (self.width, self.height))
        for c in self.cells:
            img.putpixel((c.x, c.y), colors[c.type])
        img = img.resize((img.width * 8, img.height * 8), resample=Image.NEAREST)
        img.save(path)


if __name__ == '__main__':
    start = time.time()
    world_size = 20
    w = World(world_size, world_size, int(world_size * world_size / 3), hash='a9HHHHaH9HHHaHH9HHaHHH9HaHHHH9')
    while w.temperature > 1.0:
        print(w.temperature)
        w.tick()
    w.save_image('img.png')
    print()
    print(time.time() - start)
