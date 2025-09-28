import { MahjongSuits, ValueError } from '../type';

export class MahjongTiles {
  private suits: MahjongSuits;
  private number: number;
  private isRed: boolean;
  constructor({
    suits,
    number,
    isRed = false,
  }: {
    suits?: MahjongSuits;
    number?: number;
    isRed?: boolean;
  }) {
    if (suits === undefined) throw new Error('Suits must be defined');
    if (number === undefined || !MahjongTiles.checkVaildTilesNumber(suits, number))
      throw new ValueError('Invalid tile number');
    this.suits = suits;
    this.number = number;
    this.isRed = isRed;
  }
  public static checkVaildTilesNumber(suits: MahjongSuits, number?: number): boolean {
    if (!number) return false;
    if (number < 1 || number > 9) return false;
    switch (suits) {
      case MahjongSuits.WIND: {
        return number <= 4; // 東, 南, 西, 北
      }
      case MahjongSuits.DRAGON: {
        return number <= 3; // 中, 發, 白
      }
    }
    return true;
  }
  getSuit() {
    return this.suits;
  }
  getNumber() {
    return this.number;
  }
  isRedTile() {
    return this.isRed;
  }
  isEqual(
    tile: MahjongTiles,
    options: {
      ignoreRed?: boolean;
      ignoreSuit?: boolean;
      ignoreNumber?: boolean;
    } = { ignoreRed: false, ignoreSuit: false, ignoreNumber: false }
  ): boolean {
    return (
      (options.ignoreSuit || this.suits === tile.getSuit()) &&
      (options.ignoreNumber || this.number === tile.getNumber()) &&
      (options.ignoreRed || this.isRed === tile.isRedTile())
    );
  }
}

export const allTiles: MahjongTiles[] = [
  [MahjongSuits.MAN, MahjongSuits.PIN, MahjongSuits.SOU, MahjongSuits.WIND, MahjongSuits.DRAGON],
  [9, 9, 9, 4, 3],
].flatMap(([suit]) => new MahjongTiles({ suits: suit, number: 5, isRed: true }));
