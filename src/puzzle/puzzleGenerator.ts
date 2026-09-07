import type { GridSize } from './puzzleEngine';

export type PuzzleSource = HTMLCanvasElement | ImageBitmap | HTMLImageElement;

export type TileSheet = {
  source: PuzzleSource;
  gridSize: GridSize;
  tilePixels: number;
  sourcePixels: number;
  sourceWidth: number;
  sourceHeight: number;
};

export function createTileSheet(source: PuzzleSource, gridSize: GridSize): TileSheet {
  const sourceWidth = 'naturalWidth' in source ? source.naturalWidth : source.width;
  const sourceHeight = 'naturalHeight' in source ? source.naturalHeight : source.height;
  const sourcePixels = Math.min(sourceWidth, sourceHeight);
  return { source, gridSize, tilePixels: sourcePixels / gridSize, sourcePixels, sourceWidth, sourceHeight };
}

export function drawTile(context: CanvasRenderingContext2D, sheet: TileSheet, tileIndex: number, destination: { x: number; y: number; size: number }): void {
  const row = Math.floor(tileIndex / sheet.gridSize);
  const column = tileIndex % sheet.gridSize;
  const cropOffsetX = (sheet.sourceWidth - sheet.sourcePixels) / 2;
  const cropOffsetY = (sheet.sourceHeight - sheet.sourcePixels) / 2;
  context.drawImage(
    sheet.source,
    cropOffsetX + column * sheet.tilePixels,
    cropOffsetY + row * sheet.tilePixels,
    sheet.tilePixels,
    sheet.tilePixels,
    destination.x,
    destination.y,
    destination.size,
    destination.size,
  );
}
