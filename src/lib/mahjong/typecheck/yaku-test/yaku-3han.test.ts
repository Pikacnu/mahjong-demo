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

/**
 * 三番役 (3 Han Yaku) 測試
 * 包含所有價值三番的役種測試
 */
describe('三番役 (3 Han Yaku) Tests', () => {
  // Note: register.ts is imported and configurations are already loaded
  // No need to manually register yaku requirements

  describe('二盃口 (Ryanpeikou)', () => {
    it('should succeed with two pairs of identical shuntsu', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),

        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),

        new MahjongTiles({ suits: MahjongSuits.PIN, number: 4, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 6, isRed: false }),

        new MahjongTiles({ suits: MahjongSuits.PIN, number: 4, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 6, isRed: false }),

        new MahjongTiles({ suits: MahjongSuits.SOU, number: 7, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 7, isRed: false }),
      ];

      const info: YakuInfo = {
        isConcealed: true,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();
      console.log(JSON.stringify(checker.getUnits()[0]));

      expect(results.has(MahjongYakuTypes.Ryanpeikou)).toBe(true);
    });

    it('should fail with only one pair of identical shuntsu', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 4, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 6, isRed: false }),
      ];

      const info: YakuInfo = {
        isConcealed: true,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();
      console.log(JSON.stringify(results.get(MahjongYakuTypes.Ryanpeikou)?.[0]));

      expect(results.has(MahjongYakuTypes.Ryanpeikou)).toBe(false);
    });

    it('should fail when hand is open', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
      ];

      const info: YakuInfo = {
        isConcealed: false,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Ryanpeikou)).toBe(false);
    });
  });

  describe('混一色 (Honitsu)', () => {
    it('should succeed with one suit plus honors', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 4, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 5, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 1, isRed: false }),
      ];

      const info: YakuInfo = {};

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Honitsu)).toBe(true);
    });

    it('should fail with multiple number suits', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 4, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 6, isRed: false }),
      ];

      const info: YakuInfo = {};

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Honitsu)).toBe(false);
    });
  });

  describe('純全帶么九 (Junchantaiyouku)', () => {
    it('should succeed with only terminals in all groups', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 7, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 8, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 9, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 9, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 9, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 9, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 9, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 9, isRed: false }),
      ];

      const info: YakuInfo = {};

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Junchantaiyouku)).toBe(true);
    });

    it('should fail with honor tiles', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
      ];

      const info: YakuInfo = {};

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Junchantaiyouku)).toBe(false);
    });

    it('should fail with middle numbers', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 4, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 5, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 6, isRed: false }),
      ];

      const info: YakuInfo = {};

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Junchantaiyouku)).toBe(false);
    });
  });

  describe('三色同順 (SanshokuDoujun)', () => {
    it('should succeed with same number shuntsu in three suits', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 4, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 5, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 6, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 4, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 6, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 4, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 5, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 6, isRed: false }),
      ];

      const info: YakuInfo = {};

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.SanshokuDoujun)).toBe(true);
    });

    it('should fail with different sequences', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 4, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 6, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 7, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 8, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 9, isRed: false }),
      ];

      const info: YakuInfo = {};

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.SanshokuDoujun)).toBe(false);
    });

    it('should fail with koutsu instead of shuntsu', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 4, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 4, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 4, isRed: false }),
      ];

      const info: YakuInfo = {};

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.SanshokuDoujun)).toBe(false);
    });
  });

  describe('一氣通貫 (Ikkitsuukan)', () => {
    it('should succeed with 1-9 sequence in same suit', () => {
      const tiles = [
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

      expect(results.has(MahjongYakuTypes.Ikkitsuukan)).toBe(true);
    });

    it('should fail with mixed suits', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 4, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 6, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 7, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 8, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 9, isRed: false }),
      ];

      const info: YakuInfo = {};

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Ikkitsuukan)).toBe(false);
    });

    it('should fail with incomplete sequence', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 4, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 5, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 6, isRed: false }),
      ];

      const info: YakuInfo = {};

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Ikkitsuukan)).toBe(false);
    });
  });
});
