export type GridSize = 3 | 4;

export class PuzzleEngine {
  readonly gridSize: GridSize;
  readonly tileCount: number;
  private tiles: number[];

  constructor(gridSize: GridSize, tiles?: number[]) {
    this.gridSize = gridSize;
    this.tileCount = gridSize * gridSize;
    this.tiles = tiles ? [...tiles] : solvedTiles(this.tileCount);
  }

  get state(): readonly number[] {
    return this.tiles;
  }

  swap(from: number, to: number): boolean {
    if (!this.isValidIndex(from) || !this.isValidIndex(to) || from === to) return false;
    [this.tiles[from], this.tiles[to]] = [this.tiles[to], this.tiles[from]];
    return true;
  }

  reshuffle(random: () => number = Math.random): void {
    do {
      fisherYates(this.tiles, random);
    } while (this.isSolved());
  }

  isSolved(): boolean {
    return this.tiles.every((tile, index) => tile === index);
  }

  reset(): void {
    this.tiles = solvedTiles(this.tileCount);
    this.reshuffle();
  }

  private isValidIndex(index: number): boolean {
    return Number.isInteger(index) && index >= 0 && index < this.tileCount;
  }
}

function solvedTiles(tileCount: number): number[] {
  return Array.from({ length: tileCount }, (_, index) => index);
}

function fisherYates(tiles: number[], random: () => number): void {
  for (let index = tiles.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [tiles[index], tiles[swapIndex]] = [tiles[swapIndex], tiles[index]];
  }
}
