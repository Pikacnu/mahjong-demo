import { describe, it, expect } from 'bun:test';
import { Checker, MahjongSimpleUnits } from './index';
import { MahjongTiles } from '../tiles';
import { MahjongSuits } from '../type';

// filepath: src/lib/mahjong/typecheck/index.test.ts

// Helper to create tiles
function tile(suit: MahjongSuits, number: number, isRed = false) {
  return new MahjongTiles({ suits: suit, number, isRed });
}

describe('Checker', () => {
  it('should initialize units correctly', () => {
    const checker = new Checker([]);
    expect(checker['units'][MahjongSimpleUnits.Shuntsu]).toEqual([]);
    expect(checker['units'][MahjongSimpleUnits.Koutsu]).toEqual([]);
    expect(checker['units'][MahjongSimpleUnits.Toitsu]).toEqual([]);
    expect(checker['units'][MahjongSimpleUnits.Kantsu]).toEqual([]);
  });

  it('should detect shuntsu (sequence)', () => {
    const tiles = [tile(MahjongSuits.MAN, 1), tile(MahjongSuits.MAN, 2), tile(MahjongSuits.MAN, 3)];
    const checker = new Checker(tiles);
    const result = checker.checkUnitsByOrder([MahjongSimpleUnits.Shuntsu]);
    expect(result[MahjongSimpleUnits.Shuntsu]).toHaveLength(1);
    expect(result[MahjongSimpleUnits.Shuntsu][0].map(t => t.getNumber())).toEqual([1, 2, 3]);
  });

  it('should detect koutsu (triplet)', () => {
    const tiles = [tile(MahjongSuits.PIN, 5), tile(MahjongSuits.PIN, 5), tile(MahjongSuits.PIN, 5)];
    const checker = new Checker(tiles);
    const result = checker.checkUnitsByOrder([MahjongSimpleUnits.Koutsu]);
    expect(result[MahjongSimpleUnits.Koutsu]).toHaveLength(1);
    expect(result[MahjongSimpleUnits.Koutsu][0].map(t => t.getNumber())).toEqual([5, 5, 5]);
  });

  it('should detect toitsu (pair)', () => {
    const tiles = [tile(MahjongSuits.SOU, 7), tile(MahjongSuits.SOU, 7)];
    const checker = new Checker(tiles);
    const result = checker.checkUnitsByOrder([MahjongSimpleUnits.Toitsu]);
    expect(result[MahjongSimpleUnits.Toitsu]).toHaveLength(1);
    expect(result[MahjongSimpleUnits.Toitsu][0].map(t => t.getNumber())).toEqual([7, 7]);
  });

  it('should detect kantsu (quad)', () => {
    const tiles = [
      tile(MahjongSuits.MAN, 9),
      tile(MahjongSuits.MAN, 9),
      tile(MahjongSuits.MAN, 9),
      tile(MahjongSuits.MAN, 9),
    ];
    const checker = new Checker(tiles);
    const result = checker.checkUnitsByOrder([MahjongSimpleUnits.Kantsu]);
    expect(result[MahjongSimpleUnits.Kantsu]).toHaveLength(1);
    expect(result[MahjongSimpleUnits.Kantsu][0].map(t => t.getNumber())).toEqual([9, 9, 9, 9]);
  });

  it('should handle mixed units and custom order', () => {
    const tiles = [
      tile(MahjongSuits.MAN, 1),
      tile(MahjongSuits.MAN, 2),
      tile(MahjongSuits.MAN, 3),
      tile(MahjongSuits.PIN, 5),
      tile(MahjongSuits.PIN, 5),
      tile(MahjongSuits.PIN, 5),
      tile(MahjongSuits.SOU, 7),
      tile(MahjongSuits.SOU, 7),
      tile(MahjongSuits.MAN, 9),
      tile(MahjongSuits.MAN, 9),
      tile(MahjongSuits.MAN, 9),
      tile(MahjongSuits.MAN, 9),
    ];
    const checker = new Checker(tiles);
    const result = checker.checkUnitsByOrder([
      MahjongSimpleUnits.Kantsu,
      MahjongSimpleUnits.Koutsu,
      MahjongSimpleUnits.Toitsu,
      MahjongSimpleUnits.Shuntsu,
    ]);
    expect(Array.isArray(result[MahjongSimpleUnits.Kantsu])).toBe(true);
    expect(result[MahjongSimpleUnits.Kantsu][0]?.map(t => t.getNumber())).toEqual([9, 9, 9, 9]);
    expect(Array.isArray(result[MahjongSimpleUnits.Shuntsu])).toBe(true);
    expect(result[MahjongSimpleUnits.Shuntsu][0]?.map(t => t.getNumber())).toEqual([1, 2, 3]);
    expect(Array.isArray(result[MahjongSimpleUnits.Koutsu])).toBe(true);
    expect(result[MahjongSimpleUnits.Koutsu][0]?.map(t => t.getNumber())).toEqual([5, 5, 5]);
    expect(Array.isArray(result[MahjongSimpleUnits.Toitsu])).toBe(true);
    expect(result[MahjongSimpleUnits.Toitsu][0]?.map(t => t.getNumber())).toEqual([7, 7]);
  });

  it('should return empty units for insufficient tiles', () => {
    const checker = new Checker([tile(MahjongSuits.MAN, 1)]);
    const result = checker.checkUnitsByOrder();
    expect(result[MahjongSimpleUnits.Shuntsu]).toEqual([]);
    expect(result[MahjongSimpleUnits.Koutsu]).toEqual([]);
    expect(result[MahjongSimpleUnits.Toitsu]).toEqual([]);
    expect(result[MahjongSimpleUnits.Kantsu]).toEqual([]);
  });

  it('should throw error for invalid unit type', () => {
    const checker = new Checker([]);
    expect(() => checker['checkUnit']('invalid' as unknown as MahjongSimpleUnits, [])).toThrow(
      'Invalid unit type'
    );
  });

  it('sortBySuit should group tiles by suit', () => {
    const tiles = [
      tile(MahjongSuits.MAN, 1),
      tile(MahjongSuits.PIN, 2),
      tile(MahjongSuits.MAN, 3),
      tile(MahjongSuits.PIN, 4),
    ];
    const checker = new Checker(tiles);
    const grouped = checker['sortBySuit'](tiles);
    expect(grouped.get(MahjongSuits.MAN)).toHaveLength(2);
    expect(grouped.get(MahjongSuits.PIN)).toHaveLength(2);
  });
});
