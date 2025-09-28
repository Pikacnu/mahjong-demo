import { describe, it, expect } from 'bun:test';
import { MahjongYakuTypes } from '../index';
import { MahjongSuits } from '../../type';
import { MahjongTiles } from '../../tiles/index';
import { CheckTilesGroup, GroupType, YakuChecker, type YakuInfo } from '../yaku';

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

/**
 * 二番役 (2 Han Yaku) 測試
 * 包含所有價值二番的役種測試
 */
describe('二番役 (2 Han Yaku) Tests', () => {
  // Note: register.ts is imported and configurations are already loaded
  // No need to manually register yaku requirements

  describe('兩立直 (DoubleRiichi)', () => {
    it('should succeed when reach, concealed and first round are true', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
      ];

      const info: YakuInfo = {
        isRiichi: true,
        isConcealed: true,
        isFirstRound: true,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.DoubleRiichi)).toBe(true);
    });

    it('should fail when not first round', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
      ];

      const info: YakuInfo = {
        isRiichi: true,
        isConcealed: true,
        isFirstRound: false,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.DoubleRiichi)).toBe(false);
    });
  });

  describe('三色同刻 (SanshokuDoukou)', () => {
    it('should succeed with same number koutsu in three suits', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
      ];

      const info: YakuInfo = {};

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.SanshokuDoukou)).toBe(true);
    });

    it('should fail with different numbers', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
      ];

      const info: YakuInfo = {};

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.SanshokuDoukou)).toBe(false);
    });
  });

  describe('三槓子 (Sankantsu)', () => {
    it('should succeed with three kantsu', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
      ];

      const info: YakuInfo = {};

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Sankantsu)).toBe(true);
    });

    it('should fail with only two kantsu', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
      ];

      const info: YakuInfo = {};

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Sankantsu)).toBe(false);
    });
  });

  describe('對對和 (Toitoihou)', () => {
    it('should succeed with four koutsu and one toitsu', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 4, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 4, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 4, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
      ];

      const info: YakuInfo = {};

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Toitoihou)).toBe(true);
    });

    it('should succeed with two koutsu and two kantsu', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 4, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 4, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 4, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 4, isRed: false }),
      ];

      const info: YakuInfo = {};

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Toitoihou)).toBe(true);
    });

    it('should fail with shuntsu', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
      ];

      const info: YakuInfo = {};

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Toitoihou)).toBe(false);
    });
  });

  describe('三暗刻 (Sanankou)', () => {
    it('should succeed with three concealed koutsu', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
      ];

      const info: YakuInfo = {
        isConcealed: true,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Sanankou)).toBe(true);
    });

    it('should fail when hand is open', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
      ];

      const info: YakuInfo = {
        isFuro: true,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Sanankou)).toBe(false);
    });
  });

  describe('小三元 (Shousangen)', () => {
    it('should succeed with two dragon koutsu and one dragon toitsu', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 3, isRed: false }),
      ];

      const info: YakuInfo = {};

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Shousangen)).toBe(true);
    });

    it('should fail without required dragon combinations', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
      ];

      const info: YakuInfo = {};

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Shousangen)).toBe(false);
    });
  });

  describe('混老頭 (Honroutou)', () => {
    it('should succeed with only terminals and honors', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 9, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 9, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 9, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 9, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 9, isRed: false }),
      ];

      const info: YakuInfo = {};

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Honroutou)).toBe(true);
    });

    it('should fail with middle numbers', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 5, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 5, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 5, isRed: false }),
      ];

      const info: YakuInfo = {};

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Honroutou)).toBe(false);
    });
  });

  describe('七對子 (Chiitoitsu)', () => {
    it('should succeed with seven unique pairs', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 4, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 4, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 6, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 6, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 7, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 7, isRed: false }),
      ];

      const info: YakuInfo = {
        isConcealed: true,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Chiitoitsu)).toBe(true);
    });

    it('should fail with triplets instead of pairs', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
      ];

      const info: YakuInfo = {
        isConcealed: true,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Chiitoitsu)).toBe(false);
    });

    it('should fail when hand is open', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
      ];

      const info: YakuInfo = {
        isConcealed: false,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Chiitoitsu)).toBe(false);
    });
  });

  describe('混全帶么九 (Chanta)', () => {
    it('should succeed with terminals and honors in all groups', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 7, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 8, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 9, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 9, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 9, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 9, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
      ];

      const info: YakuInfo = {};

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Chanta)).toBe(true);
    });

    it('should fail with middle numbers only', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 4, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 5, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 6, isRed: false }),
      ];

      const info: YakuInfo = {};

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Chanta)).toBe(false);
    });
  });
});
