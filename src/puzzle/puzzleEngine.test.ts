import { describe, expect, it } from 'vitest';
import { PuzzleEngine } from './puzzleEngine';

describe('PuzzleEngine', () => {
  it('swaps occupied cells without an empty sentinel', () => {
    const puzzle = new PuzzleEngine(3, [1, 0, 2, 3, 4, 5, 6, 7, 8]);
    expect(puzzle.swap(0, 1)).toBe(true);
    expect(puzzle.state).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(puzzle.isSolved()).toBe(true);
  });

  it('rejects invalid or same-cell swaps', () => {
    const puzzle = new PuzzleEngine(3);
    expect(puzzle.swap(-1, 0)).toBe(false);
    expect(puzzle.swap(0, 9)).toBe(false);
    expect(puzzle.swap(3, 3)).toBe(false);
  });

  it('reshuffles without starting solved', () => {
    const puzzle = new PuzzleEngine(3);
    let calls = 0;
    puzzle.reshuffle(() => (calls++ === 0 ? 0 : 0.5));
    expect(puzzle.isSolved()).toBe(false);
    expect(new Set(puzzle.state).size).toBe(9);
  });
});
