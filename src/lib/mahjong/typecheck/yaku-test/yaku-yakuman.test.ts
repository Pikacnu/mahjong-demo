import { describe, it, expect } from 'bun:test';
import { MahjongYakuTypes } from '../index';
import { MahjongSuits } from '../../type';
import { MahjongTiles } from '../../tiles/index';
import { CheckTilesGroup, GroupType, YakuChecker, YakuInfo } from '../yaku';
import '../register'; // 確保註冊代碼被執行

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

/**
 * 高番役 (High Value Yaku) 測試
 * 包含六番役和役滿的測試
 */
describe('高番役 (High Value Yaku) Tests', () => {
  describe('六番役 (6 Han Yaku)', () => {
    describe('清一色 (Chinitsu)', () => {
      it('should succeed with all tiles from one suit', () => {
        const tiles = [
          // All man tiles
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 4, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 5, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 6, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 7, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 8, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 9, isRed: false }),
        ];

        const info: YakuInfo = {};

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();

        expect(results.has(MahjongYakuTypes.Chinitsu)).toBe(true);
      });

      it('should succeed with all pin tiles', () => {
        const tiles = [
          // All pin tiles
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 3, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 4, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
        ];

        const info: YakuInfo = {};

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();

        expect(results.has(MahjongYakuTypes.Chinitsu)).toBe(true);
      });

      it('should fail with mixed suits', () => {
        const tiles = [
          // Mixed suits
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
        ];

        const info: YakuInfo = {};

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();

        expect(results.has(MahjongYakuTypes.Chinitsu)).toBe(false);
      });

      it('should fail with honor tiles', () => {
        const tiles = [
          // Man tiles with honor tiles
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
        ];

        const info: YakuInfo = {};

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();

        expect(results.has(MahjongYakuTypes.Chinitsu)).toBe(false);
      });
    });
  });

  describe('役滿 (Yakuman)', () => {
    describe('大三元 (Daisangen)', () => {
      it('should succeed with all three dragon koutsu', () => {
        const tiles = [
          // White dragon koutsu
          new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 1, isRed: false }),
          // Green dragon koutsu
          new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 2, isRed: false }),
          // Red dragon koutsu
          new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 3, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 3, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 3, isRed: false }),
          // Additional group
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          // Head pair
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
        ];

        const info: YakuInfo = {};

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();

        expect(results.has(MahjongYakuTypes.Daisangen)).toBe(true);
      });

      it('should fail with only two dragon koutsu', () => {
        const tiles = [
          // White dragon koutsu
          new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 1, isRed: false }),
          // Green dragon koutsu
          new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 2, isRed: false }),
          // Non-dragon koutsu instead of red dragon
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        ];

        const info: YakuInfo = {};

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();

        expect(results.has(MahjongYakuTypes.Daisangen)).toBe(false);
      });
    });

    describe('四暗刻 (Suuankou)', () => {
      it('should succeed with four concealed koutsu', () => {
        const tiles = [
          // First concealed koutsu: 1 man
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          // Second concealed koutsu: 2 pin
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
          // Third concealed koutsu: 3 sou
          new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
          // Fourth concealed koutsu: East wind
          new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
          // Head pair: 5 man
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 5, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 5, isRed: false }),
        ];

        const info: YakuInfo = {
          isConcealed: true,
        };

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();

        expect(results.has(MahjongYakuTypes.Suuankou)).toBe(true);
      });

      it('should fail with open hand', () => {
        const tiles = [
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        ];

        const info: YakuInfo = {
          isConcealed: false,
        };

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();

        expect(results.has(MahjongYakuTypes.Suuankou)).toBe(false);
      });

      it('should fail with only three koutsu', () => {
        const tiles = [
          // Only three koutsu
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
          // Shuntsu instead of fourth koutsu
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 4, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 5, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 6, isRed: false }),
        ];

        const info: YakuInfo = {
          isConcealed: true,
        };

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();

        expect(results.has(MahjongYakuTypes.Suuankou)).toBe(false);
      });
    });

    describe('字一色 (Tsuuiisou)', () => {
      it('should succeed with only honor tiles', () => {
        const tiles = [
          // Wind tiles
          new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.WIND, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.WIND, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.WIND, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.WIND, number: 3, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.WIND, number: 3, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.WIND, number: 3, isRed: false }),
          // Dragon tiles
          new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 2, isRed: false }),
        ];

        const info: YakuInfo = {};

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();

        expect(results.has(MahjongYakuTypes.Tsuuiisou)).toBe(true);
      });

      it('should fail with number tiles', () => {
        const tiles = [
          // Number tiles (not allowed)
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
          // Honor tiles
          new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 1, isRed: false }),
        ];

        const info: YakuInfo = {};

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();

        expect(results.has(MahjongYakuTypes.Tsuuiisou)).toBe(false);
      });
    });

    describe('清老頭 (Chinroutou)', () => {
      it('should succeed with only terminal tiles', () => {
        const tiles = [
          // Terminal tiles only
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 9, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 9, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 9, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.SOU, number: 9, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.SOU, number: 9, isRed: false }),
        ];

        const info: YakuInfo = {};

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();

        expect(results.has(MahjongYakuTypes.Chinroutou)).toBe(true);
      });

      it('should fail with middle numbers', () => {
        const tiles = [
          // Terminal tiles
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 9, isRed: false }),
          // Middle number (not allowed)
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 5, isRed: false }),
        ];

        const info: YakuInfo = {};

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();

        expect(results.has(MahjongYakuTypes.Chinroutou)).toBe(false);
      });

      it('should fail with honor tiles', () => {
        const tiles = [
          // Terminal tiles
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 9, isRed: false }),
          // Honor tiles (not allowed)
          new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 1, isRed: false }),
        ];

        const info: YakuInfo = {};

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();

        expect(results.has(MahjongYakuTypes.Chinroutou)).toBe(false);
      });
    });

    describe('國士無雙 (KokushiMusou)', () => {
      it('should succeed with all thirteen terminals and honors', () => {
        const tiles = [
          // All required tiles for Kokushi
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 9, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 9, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.SOU, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.SOU, number: 9, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.WIND, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.WIND, number: 3, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.WIND, number: 4, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 3, isRed: false }),
          // Pair of one of the above
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        ];

        const info: YakuInfo = {
          isConcealed: true,
        };

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();

        expect(results.has(MahjongYakuTypes.KokushiMusou)).toBe(true);
      });

      it('should fail with middle number tiles', () => {
        const tiles = [
          // Some required tiles
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 9, isRed: false }),
          // Middle number (not allowed)
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 5, isRed: false }),
        ];

        const info: YakuInfo = {
          isConcealed: true,
        };

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();

        expect(results.has(MahjongYakuTypes.KokushiMusou)).toBe(false);
      });

      it('should fail when hand is open', () => {
        const tiles = [
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 9, isRed: false }),
        ];

        const info: YakuInfo = {
          isConcealed: false,
        };

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();

        expect(results.has(MahjongYakuTypes.KokushiMusou)).toBe(false);
      });
    });

    describe('天和 (Tenhou)', () => {
      it('should succeed when all conditions are met', () => {
        const tiles = [
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
        ];

        const info: YakuInfo = {
          isFirstRound: true,
          isTsumo: true,
          isConcealed: true,
        };

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();

        expect(results.has(MahjongYakuTypes.Tenhou)).toBe(true);
      });

      it('should fail when not first round', () => {
        const tiles = [
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
        ];

        const info: YakuInfo = {
          isFirstRound: false,
          isTsumo: true,
          isConcealed: true,
        };

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();

        expect(results.has(MahjongYakuTypes.Tenhou)).toBe(false);
      });

      it('should fail when not tsumo', () => {
        const tiles = [
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
        ];

        const info: YakuInfo = {
          isFirstRound: true,
          isTsumo: false,
          isConcealed: true,
        };

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();

        expect(results.has(MahjongYakuTypes.Tenhou)).toBe(false);
      });

      it('should fail when not concealed', () => {
        const tiles = [
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
        ];

        const info: YakuInfo = {
          isFirstRound: true,
          isTsumo: false,
          isConcealed: false,
        };

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();

        expect(results.has(MahjongYakuTypes.Tenhou)).toBe(false);
      });
    });

    describe('地和 (Chihou)', () => {
      it('should succeed when all conditions are met', () => {
        const tiles = [
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
        ];

        const info: YakuInfo = {
          isFirstRound: true,
          isTsumo: true,
          isConcealed: true,
        };

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();

        expect(results.has(MahjongYakuTypes.Chihou)).toBe(true);
      });

      it('should fail when conditions are not met', () => {
        const tiles = [
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
        ];

        const info: YakuInfo = {
          isFirstRound: false,
          isTsumo: false,
          isConcealed: false,
        };

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();

        expect(results.has(MahjongYakuTypes.Chihou)).toBe(false);
      });
    });
  });
});
