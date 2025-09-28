import { MahjongTiles } from '../tiles';
import { MahjongSuits, ValueError } from '../type';

export type TileSearchArg = {
  suit: MahjongSuits;
  number: number;
};

export class MahjongHand {
  private tiles: MahjongTiles[];
  private usedTiles: MahjongTiles[] = [];

  constructor(tiles: MahjongTiles[]) {
    if (!MahjongHand.isVaildTiles(tiles)) {
      throw new ValueError('Invalid Mahjong tiles');
    }
    this.tiles = tiles;
  }
  public static isVaildTiles(tiles: MahjongTiles[]): boolean {
    if (tiles.length < 1 || tiles.length > 14) return false;
    for (const tile of tiles) {
      if (!MahjongTiles.checkVaildTilesNumber(tile.getSuit(), tile.getNumber())) {
        return false;
      }
    }
    return true;
  }

  sort() {
    this.tiles = this.tiles.sort((a, b) => {
      if (a.getSuit() !== b.getSuit()) {
        return a.getSuit() - b.getSuit();
      }
      return a.getNumber() - b.getNumber();
    });
  }

  add(tile: MahjongTiles) {
    this.tiles.push(tile);
  }

  use(index: number): MahjongTiles;
  use(tile: TileSearchArg): MahjongTiles;
  use(arg: number | TileSearchArg): MahjongTiles {
    if (typeof arg === 'number') {
      const tile = this.tiles.splice(arg, 1)[0];
      if (!tile) {
        throw new Error('Invalid tile index');
      }
      this.usedTiles.push(tile);
      return tile;
    } else {
      const index = this.tiles.findIndex(
        t => t.getSuit() === arg.suit && t.getNumber() === arg.number
      );
      if (index === -1) {
        throw new Error('Tile not found in hand');
      }
      const tile = this.tiles.splice(index, 1)[0];
      if (!tile) {
        throw new Error('Invalid tile index');
      }
      this.usedTiles.push(tile);
      return tile;
    }
  }

  getUsedTiles() {
    return this.usedTiles;
  }

  get length() {
    return this.tiles.length;
  }

  get allTiles() {
    return this.tiles;
  }
}
