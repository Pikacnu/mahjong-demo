import { describe, it, expect } from 'bun:test';
import { MahjongYakuTypes } from '../index';
import { MahjongSuits } from '../../type';
import { MahjongTiles } from '../../tiles/index';
import { CheckTilesGroup, GroupType, YakuChecker, YakuInfo } from '../yaku';

// Helper function to convert MahjongTiles[] to CheckTilesGroup[]
function tilesToGroups(tiles: MahjongTiles[]): CheckTilesGroup[] {
  return [
    {
      type: GroupType.None,
      tiles: tiles,
      isOpen: false,
    },
  ];
}
import '../register'; // Import register.ts to use its yaku configurations

describe('斷么九 (Tanyao) 額外測試', () => {
  it('should succeed with complete 14-tile tanyao hand', () => {
    const tiles = [
      // 234萬 順子
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 4, isRed: false }),
      // 567筒 順子
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 6, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 7, isRed: false }),
      // 234索 順子
      new MahjongTiles({ suits: MahjongSuits.SOU, number: 2, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.SOU, number: 4, isRed: false }),
      // 888萬 刻子
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 8, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 8, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 8, isRed: false }),
      // 55筒 對子
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
    ];

    const info: YakuInfo = {};
    const checker = new YakuChecker(tilesToGroups(tiles), info);
    const results = checker.check();

    expect(results.has(MahjongYakuTypes.Tanyao)).toBe(true);
  });

  it('should fail with one terminal tile (1萬)', () => {
    const tiles = [
      // 123萬 順子 (包含1，應該失敗)
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
      // 567筒 順子
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 6, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 7, isRed: false }),
      // 234索 順子
      new MahjongTiles({ suits: MahjongSuits.SOU, number: 2, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.SOU, number: 4, isRed: false }),
      // 888萬 刻子
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 8, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 8, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 8, isRed: false }),
      // 55筒 對子
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
    ];

    const info: YakuInfo = {};
    const checker = new YakuChecker(tilesToGroups(tiles), info);
    const results = checker.check();

    expect(results.has(MahjongYakuTypes.Tanyao)).toBe(false);
  });

  it('should fail with one terminal tile (9索)', () => {
    const tiles = [
      // 234萬 順子
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 4, isRed: false }),
      // 567筒 順子
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 6, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 7, isRed: false }),
      // 789索 順子 (包含9，應該失敗)
      new MahjongTiles({ suits: MahjongSuits.SOU, number: 7, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.SOU, number: 8, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.SOU, number: 9, isRed: false }),
      // 888萬 刻子
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 8, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 8, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 8, isRed: false }),
      // 55筒 對子
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
    ];

    const info: YakuInfo = {};
    const checker = new YakuChecker(tilesToGroups(tiles), info);
    const results = checker.check();

    expect(results.has(MahjongYakuTypes.Tanyao)).toBe(false);
  });

  it('should fail with wind tiles', () => {
    const tiles = [
      // 234萬 順子
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 4, isRed: false }),
      // 567筒 順子
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 6, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 7, isRed: false }),
      // 234索 順子
      new MahjongTiles({ suits: MahjongSuits.SOU, number: 2, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.SOU, number: 4, isRed: false }),
      // 東東東 刻子 (字牌，應該失敗)
      new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
      // 55筒 對子
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
    ];

    const info: YakuInfo = {};
    const checker = new YakuChecker(tilesToGroups(tiles), info);
    const results = checker.check();

    expect(results.has(MahjongYakuTypes.Tanyao)).toBe(false);
  });

  it('should fail with dragon tiles', () => {
    const tiles = [
      // 234萬 順子
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 4, isRed: false }),
      // 567筒 順子
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 6, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 7, isRed: false }),
      // 234索 順子
      new MahjongTiles({ suits: MahjongSuits.SOU, number: 2, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.SOU, number: 4, isRed: false }),
      // 白白白 刻子 (三元牌，應該失敗)
      new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 1, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 1, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 1, isRed: false }),
      // 55筒 對子
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
    ];

    const info: YakuInfo = {};
    const checker = new YakuChecker(tilesToGroups(tiles), info);
    const results = checker.check();

    expect(results.has(MahjongYakuTypes.Tanyao)).toBe(false);
  });

  it('should succeed with red five tiles (treat as normal 5)', () => {
    const tiles = [
      // 234萬 順子
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 4, isRed: false }),
      // 567筒 順子 (包含紅五筒)
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: true }),
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 6, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 7, isRed: false }),
      // 234索 順子
      new MahjongTiles({ suits: MahjongSuits.SOU, number: 2, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.SOU, number: 4, isRed: false }),
      // 888萬 刻子
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 8, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 8, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 8, isRed: false }),
      // 55筒 對子
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
    ];

    const info: YakuInfo = {};
    const checker = new YakuChecker(tilesToGroups(tiles), info);
    const results = checker.check();

    expect(results.has(MahjongYakuTypes.Tanyao)).toBe(true);
  });
});
