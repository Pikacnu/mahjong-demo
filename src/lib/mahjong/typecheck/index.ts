import { MahjongTiles } from '../tiles';
import { MahjongSuits } from '../type';

export enum MahjongSimpleUnits {
  /*順子*/
  Shuntsu,
  /*刻子*/
  Koutsu,
  /* 順子 or 槓子 */
  Ippatsu,
  /*對子*/
  Toitsu,
  /*槓子*/
  Kantsu,
  /*兩面搭子 */
  RyanmenTatsu,
}

type Units = {
  [keyof in MahjongSimpleUnits]: MahjongTiles[][];
};

export enum MahjongYakuTypes {
  /** 立直 */
  Riichi = 'riichi',
  /** 門前清自摸和 */
  MenzenTsumo = 'menzen_tsumo',
  /** 一發 */
  Ippatsu = 'ippatsu',
  /** 槍槓 */
  Chankan = 'chankan',
  /** 平和 */
  Pinfu = 'pinfu',
  /** 自風 */
  Jihai = 'jihai',
  /** 場風 */
  Bakaze = 'bakaze',
  /** 海底摸月 */
  HaiteiTsumo = 'haitei_tsumo',
  /** 河底撈魚 */
  HouteiRaoyui = 'houtei_raoyui',
  /** 嶺上牌 */
  Rinsyan = 'rinsyan',
  /** 三元牌 */
  SanGenPai = 'san_gen_pai',
  /** 一杯口 */
  Iipeikou = 'iipeikou',
  /** 斷么九 */
  Tanyao = 'tanyao',
  /** 役牌 */
  Yakuhai = 'yakuhai',
  /** 兩立直 */
  DoubleRiichi = 'double_riichi',
  /** 三色同順 */
  SanshokuDoujun = 'sanshoku_doujun',
  /** 一氣通貫 */
  Ikkitsuukan = 'ikkitsuukan',
  /** 對對和 */
  Toitoihou = 'toitoihou',
  /** 三暗刻 */
  Sanankou = 'sanankou',
  /** 三色同刻 */
  SanshokuDoukou = 'sanshoku_doukou',
  /** 三槓子 */
  Sankantsu = 'sankantsu',
  /** 三元牌 */
  Sanzen = 'sanzen',
  /** 小三元 */
  Shousangen = 'shousangen',
  /** 混全帶么九 */
  Chanta = 'chantaiyouku',
  /** 七對子 */
  Chiitoitsu = 'chiitoitsu',
  /** 純全帶么九 */
  Junchantaiyouku = 'junchantaiyouku',
  /** 混一色 */
  Honitsu = 'honitsu',
  /** 二杯口 */
  Ryanpeikou = 'ryanpeikou',
  /** 清一色 */
  Chinitsu = 'chinitsu',
  /** 流局滿貫 */
  RyuukyokuMankan = 'ryuukyoku_mankan',
  /** 混老頭 */
  Honroutou = 'honroutou',
  /** 九蓮寶燈 */
  ChuurenPoutou = 'chuuren_poutou',
  /** 國士無雙 */
  KokushiMusou = 'kokushi_musou',
  /** 四暗刻 */
  Suuankou = 'suuankou',
  /** 大三元 */
  Daisangen = 'daisangen',
  /** 字一色 */
  Tsuuiisou = 'tsuuiisou',
  /** 綠一色 */
  Ryuuuiisou = 'ryuuuiisou',
  /** 清老頭 */
  Chinroutou = 'chinroutou',
  /** 四槓子 */
  Suukantsu = 'suukantsu',
  /** 小四喜 */
  Shousuushi = 'shousuushi',
  /** 大四喜 */
  Daisuushi = 'daisuushi',
  /** 四暗刻単騎 */
  SuuankouTanki = 'suuankou_tanki',
  /** 天和 */
  Tenhou = 'tenhou',
  /** 地和 */
  Chihou = 'chihou',
  /** 人和 */
  Renhou = 'renhou',
  /** 國士無雙十三面 */
  KokushiMusouJyuusanmen = 'KokushiMusouJyuusanmen',
  /** 純正九蓮寶燈 */
  JyunseiChuurenPoutou = 'JyunseiChuurenPoutou',
  /** 四風連打 */
  SuufuuRenda = 'SuufuuRenda',
  /** 四槓散了 */
  Suukansanra = 'Suukansanra',
  /** 九種九牌 */
  KyuuShuKyuuHai = 'KyuuShuKyuuHai',
}

export class Checker {
  private tiles: MahjongTiles[];
  private units: Units;
  private tileCountMap: Map<string, number> = new Map();

  constructor(tiles: MahjongTiles[]) {
    this.tiles = tiles;
    this.units = {
      [MahjongSimpleUnits.Shuntsu]: [],
      [MahjongSimpleUnits.Koutsu]: [],
      [MahjongSimpleUnits.Toitsu]: [],
      [MahjongSimpleUnits.Kantsu]: [],
      [MahjongSimpleUnits.RyanmenTatsu]: [],
      [MahjongSimpleUnits.Ippatsu]: [],
    };
    this.tileCountMap = this.createTileCountMap(tiles);
  }

  checkUnitsByOrder(order?: MahjongSimpleUnits[]) {
    if (!order || order.length === 0) {
      order = [
        MahjongSimpleUnits.Shuntsu,
        MahjongSimpleUnits.Kantsu,
        MahjongSimpleUnits.Koutsu,
        MahjongSimpleUnits.Toitsu,
        MahjongSimpleUnits.RyanmenTatsu,
        //MahjongSimpleUnits.Ippatsu,
      ];
    }

    let remainingTiles = [...this.tiles];
    for (const unit of order) {
      const foundUnit = this.checkUnit(unit, remainingTiles);
      if (foundUnit) {
        this.units[unit].push(...foundUnit);
        remainingTiles = remainingTiles.filter(tile => !foundUnit.flat().includes(tile));
      }
    }

    this.units[MahjongSimpleUnits.Ippatsu] = [
      ...this.units[MahjongSimpleUnits.Shuntsu],
      ...this.units[MahjongSimpleUnits.Koutsu],
    ];

    return this.units;
  }

  private checkUnit(unit: MahjongSimpleUnits, tiles: MahjongTiles[]) {
    switch (unit) {
      case MahjongSimpleUnits.Shuntsu:
        return this.checkShuntsu(tiles);
      case MahjongSimpleUnits.Koutsu:
        return this.checkKoutsu(tiles);
      case MahjongSimpleUnits.Toitsu:
        return this.checkToitsu(tiles);
      case MahjongSimpleUnits.Kantsu:
        return this.checkKantsu(tiles);
      case MahjongSimpleUnits.RyanmenTatsu:
        return this.checkRyanmenTatsu(tiles);
      case MahjongSimpleUnits.Ippatsu:
        // Ippatsu is handled separately in checkUnitsByOrder as a combination
        return undefined;
      default:
        throw new Error('Invalid unit type');
    }
  }

  private sortBySuit(tiles: MahjongTiles[]): Map<MahjongTiles['suits'], MahjongTiles[]> {
    return tiles
      .filter(tile => tile != null)
      .reduce((acc, tile) => {
        const suit = tile.getSuit();
        if (!acc.has(suit)) {
          acc.set(suit, []);
        }
        acc.get(suit)!.push(tile);
        return acc;
      }, new Map<MahjongTiles['suits'], MahjongTiles[]>());
  }

  private createTileCountMap(tiles: MahjongTiles[]): Map<string, number> {
    this.tileCountMap.clear();
    tiles.forEach(tile => {
      const key = `${tile.getSuit()}-${tile.getNumber()}`;
      this.tileCountMap.set(key, (this.tileCountMap.get(key) ?? 0) + 1);
    });
    return this.tileCountMap;
  }

  private checkShuntsu(tiles: MahjongTiles[]): Array<Array<MahjongTiles>> | undefined {
    if (tiles.length < 3) return;
    const result = [];
    const tileSortedBySuits = this.sortBySuit(tiles);

    const checkSuits = [MahjongSuits.MAN, MahjongSuits.PIN, MahjongSuits.SOU];
    const tileMinNumberMap: Map<MahjongTiles['suits'], number> = new Map();
    const tileMaxNumberMap: Map<MahjongTiles['suits'], number> = new Map();
    tileSortedBySuits.forEach((tiles, suit) => {
      const numbers = tiles.map(tile => tile.getNumber());
      tileMinNumberMap.set(suit, Math.min(...numbers));
      tileMaxNumberMap.set(suit, Math.max(...numbers));
    });
    this.createTileCountMap(tiles);

    for (const suit of checkSuits) {
      const minNumber = tileMinNumberMap.get(suit) ?? -Infinity;
      const maxNumber = tileMaxNumberMap.get(suit) ?? Infinity;
      if (minNumber === -Infinity || maxNumber === Infinity) continue;
      for (let number = minNumber; number <= maxNumber - 2; number++) {
        const keys = Array.from({ length: 3 }, (_, i) => `${suit}-${number + i}`);
        const count = Math.min(...keys.map(key => this.tileCountMap.get(key) ?? 0));
        if (count === 0) continue;
        keys.forEach(key => {
          this.tileCountMap.set(key, (this.tileCountMap.get(key) ?? 0) - count);
        });
        //make sure all same Number shuntsu are found
        for (let i = 0; i < count; i++) {
          const targetTiles = keys.map(key => {
            const [s, n] = key.split('-');
            const tile = tiles.find(
              t => t.getSuit() === Number(s) && t.getNumber() === parseInt(n)
            );
            if (!tile) {
              console.log(count);
              throw new Error('Tile not found');
            }
            // Decrease the count in the map
            return tile;
          });
          result.push(targetTiles);
        }
      }
    }

    return result.length > 0 ? result : undefined;
  }
  private checkKoutsu(tiles: MahjongTiles[]): Array<Array<MahjongTiles>> | undefined {
    if (tiles.length < 3) return;
    const result = [];
    const sortedBySuit = this.sortBySuit(tiles);

    for (const [, tiles] of sortedBySuit) {
      if (tiles.length >= 3) {
        tiles.sort((a, b) => a.getNumber() - b.getNumber());
        for (const tile of tiles) {
          if (
            tile.getNumber() === tiles[tiles.indexOf(tile) + 1]?.getNumber() &&
            tile.getNumber() === tiles[tiles.indexOf(tile) + 2]?.getNumber()
          ) {
            result.push([tile, tiles[tiles.indexOf(tile) + 1], tiles[tiles.indexOf(tile) + 2]]);
          }
        }
      }
    }
    return result.length > 0 ? result : undefined;
  }
  private checkToitsu(tiles: MahjongTiles[]): Array<Array<MahjongTiles>> | undefined {
    if (tiles.length < 2) return;
    const result = [];
    const sortedBySuit = this.sortBySuit(tiles);

    for (const [, tiles] of sortedBySuit) {
      if (tiles.length >= 2) {
        tiles.sort((a, b) => a.getNumber() - b.getNumber());
        for (let i = 0; i <= tiles.length - 2; i += 2) {
          if (tiles[i + 1].getNumber() === tiles[i].getNumber()) {
            result.push([tiles[i], tiles[i + 1]]);
          }
        }
      }
    }
    return result.length > 0 ? result : undefined;
  }
  private checkKantsu(tiles: MahjongTiles[]): Array<Array<MahjongTiles>> | undefined {
    if (tiles.length < 4) return;
    const result = [];
    const sortedBySuit = this.sortBySuit(tiles);
    for (const [, tiles] of sortedBySuit) {
      if (tiles.length >= 4) {
        tiles.sort((a, b) => a.getNumber() - b.getNumber());
        for (let i = 0; i <= tiles.length - 4; i++) {
          if (
            tiles[i + 1].getNumber() === tiles[i].getNumber() &&
            tiles[i + 2].getNumber() === tiles[i].getNumber() &&
            tiles[i + 3].getNumber() === tiles[i].getNumber()
          ) {
            result.push([tiles[i], tiles[i + 1], tiles[i + 2], tiles[i + 3]]);
          }
        }
      }
    }
    return result.length > 0 ? result : undefined;
  }
  private checkRyanmenTatsu(tiles: MahjongTiles[]): Array<Array<MahjongTiles>> | undefined {
    if (tiles.length < 2) return;
    const result = [];
    const sortedBySuit = this.sortBySuit(tiles);
    for (const [, tiles] of sortedBySuit) {
      const availableTiles = tiles.filter(tile => tile.getNumber() <= 2 && tile.getNumber() <= 8);
      if (availableTiles.length >= 2) {
        tiles.sort((a, b) => a.getNumber() - b.getNumber());
        for (let i = 0; i <= tiles.length - 2; i += 2) {
          if (tiles[i].getNumber() + 1 === tiles[i + 1].getNumber() + 1) {
            result.push([tiles[i], tiles[i + 1]]);
          }
        }
      }
    }
    return result.length > 0 ? result : undefined;
  }
}
