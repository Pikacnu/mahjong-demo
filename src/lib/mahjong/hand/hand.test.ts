import { describe, it, expect } from 'bun:test';
import { MahjongTiles } from '../tiles';
import { MahjongSuits } from '../type';
import { MahjongHand } from '.';

describe('MahjongHand', () => {
  it('should create a valid hand', () => {
    const tiles = [
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
    ];
    const hand = new MahjongHand(tiles);
    expect(hand).toBeInstanceOf(MahjongHand);
  });

  it('should throw if hand has more than 14 tiles', () => {
    const tiles = Array.from(
      { length: 15 },
      (_, i) => new MahjongTiles({ suits: MahjongSuits.MAN, number: (i % 9) + 1, isRed: false })
    );
    expect(() => new MahjongHand(tiles)).toThrow('Invalid Mahjong tiles');
  });

  it('should throw if hand has invalid tile', () => {
    const tiles = [
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
      { getSuit: () => MahjongSuits.WIND, getNumber: () => 5, isRedTile: () => false },
    ];
    expect(() => new MahjongHand(tiles as MahjongTiles[])).toThrow('Invalid Mahjong tiles');
  });

  it('isVaildTiles returns false for empty hand', () => {
    expect(MahjongHand.isVaildTiles([])).toBe(false);
  });

  it('sort should order tiles by suit and number', () => {
    const tiles = [
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 3, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
    ];
    const hand = new MahjongHand(tiles);
    hand.sort();
    expect(hand['tiles'][0].getSuit()).toBe(MahjongSuits.MAN);
    expect(hand['tiles'][0].getNumber()).toBe(1);
    expect(hand['tiles'][1].getNumber()).toBe(2);
    expect(hand['tiles'][2].getSuit()).toBe(MahjongSuits.PIN);
  });
});
