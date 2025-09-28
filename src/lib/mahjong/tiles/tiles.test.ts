import { MahjongSuits } from '../type';
import { describe, it, expect } from 'bun:test';
import { MahjongTiles } from '.';

// MahjongTiles tests
describe('MahjongTiles', () => {
  it('should create a valid MAN tile', () => {
    const tile = new MahjongTiles({ suits: MahjongSuits.MAN, number: 5, isRed: false });
    expect(tile.getSuit()).toBe(MahjongSuits.MAN);
    expect(tile.getNumber()).toBe(5);
    expect(tile.isRedTile()).toBe(false);
  });

  it('should create a red PIN tile', () => {
    const tile = new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: true });
    expect(tile.isRedTile()).toBe(true);
  });

  it('should throw if suits is not defined', () => {
    expect(() => new MahjongTiles({ number: 1, isRed: false })).toThrow('Suits must be defined');
  });

  it('should throw if number is not defined', () => {
    expect(() => new MahjongTiles({ suits: MahjongSuits.MAN, isRed: false })).toThrow(
      'Invalid tile number'
    );
  });

  it('should throw if number is invalid for WIND', () => {
    expect(() => new MahjongTiles({ suits: MahjongSuits.WIND, number: 5, isRed: false })).toThrow(
      'Invalid tile number'
    );
  });

  it('should throw if number is invalid for DRAGON', () => {
    expect(() => new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 4, isRed: false })).toThrow(
      'Invalid tile number'
    );
  });

  it('should allow valid WIND and DRAGON numbers', () => {
    expect(
      () => new MahjongTiles({ suits: MahjongSuits.WIND, number: 4, isRed: false })
    ).not.toThrow();
    expect(
      () => new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 3, isRed: false })
    ).not.toThrow();
  });

  it('checkVaildTilesNumber returns correct values', () => {
    expect(MahjongTiles.checkVaildTilesNumber(MahjongSuits.MAN, 5)).toBe(true);
    expect(MahjongTiles.checkVaildTilesNumber(MahjongSuits.WIND, 4)).toBe(true);
    expect(MahjongTiles.checkVaildTilesNumber(MahjongSuits.WIND, 5)).toBe(false);
    expect(MahjongTiles.checkVaildTilesNumber(MahjongSuits.DRAGON, 3)).toBe(true);
    expect(MahjongTiles.checkVaildTilesNumber(MahjongSuits.DRAGON, 4)).toBe(false);
    expect(MahjongTiles.checkVaildTilesNumber(MahjongSuits.MAN, 0)).toBe(false);
    expect(MahjongTiles.checkVaildTilesNumber(MahjongSuits.MAN, 10)).toBe(false);
  });
});
