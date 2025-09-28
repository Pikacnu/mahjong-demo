import { describe, it, expect } from 'bun:test';
import { MahjongYakuTypes } from '../index';
import { MahjongSuits } from '../../type';
import { MahjongTiles } from '../../tiles/index';
import { CheckTilesGroup, GroupType, WaitingType, YakuChecker, YakuInfo } from '../yaku';

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
 * 一番役 (1 Han Yaku) 測試
 * 包含所有價值一番的役種測試
 */
describe('一番役 (1 Han Yaku) Tests', () => {
  // Note: register.ts is imported and configurations are already loaded
  // No need to manually register yaku requirements in beforeEach

  describe('立直 (Riichi)', () => {
    it('should succeed when reach and concealed are true', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
      ];

      const info: YakuInfo = {
        isRiichi: true,
        isConcealed: true,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Riichi)).toBe(true);
    });

    it('should fail when reach is false', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
      ];

      const info: YakuInfo = {
        isRiichi: false,
        isConcealed: true,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Riichi)).toBe(false);
    });

    it('should fail when concealed is false', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
      ];

      const info: YakuInfo = {
        isRiichi: true,
        isConcealed: false,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Riichi)).toBe(false);
    });

    it('should fail when both conditions are false', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
      ];

      const info: YakuInfo = {
        isRiichi: false,
        isConcealed: false,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Riichi)).toBe(false);
    });
  });

  describe('門前清自摸和 (MenzenTsumo)', () => {
    it('should succeed when concealed and tsumo are true', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
      ];

      const info: YakuInfo = {
        isConcealed: true,
        isTsumo: true,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.MenzenTsumo)).toBe(true);
    });

    it('should fail when concealed is false', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
      ];

      const info: YakuInfo = {
        isConcealed: false,
        isTsumo: true,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.MenzenTsumo)).toBe(false);
    });

    it('should fail when tsumo is false', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
      ];

      const info: YakuInfo = {
        isConcealed: true,
        isTsumo: false,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.MenzenTsumo)).toBe(false);
    });

    it('should fail when both conditions are false', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
      ];

      const info: YakuInfo = {
        isConcealed: false,
        isTsumo: false,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.MenzenTsumo)).toBe(false);
    });
  });

  describe('斷么九 (Tanyao)', () => {
    it('should succeed with all middle numbers (2-8)', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 8, isRed: false }),
      ];

      const info: YakuInfo = {};

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Tanyao)).toBe(true);
    });

    it('should fail with terminal numbers (1, 9)', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 9, isRed: false }),
      ];

      const info: YakuInfo = {};

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Tanyao)).toBe(false);
    });

    it('should fail with honor tiles', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.DRAGON, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 5, isRed: false }),
      ];

      const info: YakuInfo = {};

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Tanyao)).toBe(false);
    });
  });

  describe('自風 (Jihai)', () => {
    it('should succeed with jihai koutsu and matching info', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
      ];

      const info: YakuInfo = {
        jihai: new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Jihai)).toBe(true);
    });

    it('should fail without jihai info', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
      ];

      const info: YakuInfo = {};

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Jihai)).toBe(false);
    });

    it('should fail with empty jihai', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
      ];

      const info: YakuInfo = {
        jihai: undefined,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Jihai)).toBe(false);
    });
  });

  describe('場風 (Bakaze)', () => {
    it('should succeed with bakaze koutsu and matching info', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 2, isRed: false }),
      ];

      const info: YakuInfo = {
        bakaze: new MahjongTiles({ suits: MahjongSuits.WIND, number: 2, isRed: false }),
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Bakaze)).toBe(true);
    });

    it('should fail without bakaze info', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 2, isRed: false }),
      ];

      const info: YakuInfo = {};

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Bakaze)).toBe(false);
    });
  });

  describe('平和 (Pinfu)', () => {
    it('should succeed with all shuntsu and ryanmen wait', () => {
      const tiles = [
        // First shuntsu: 1-2-3 man
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
        // Second shuntsu: 4-5-6 pin
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 4, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 6, isRed: false }),
        // Third shuntsu: 7-8-9 sou
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 7, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 8, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 9, isRed: false }),
        // Fourth shuntsu: 2-3-4 man
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 4, isRed: false }),
        // Toitsu: 5-5 pin
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
      ];

      const info: YakuInfo = {
        isConcealed: true,
        waitingType: WaitingType.Ryanmen,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Pinfu)).toBe(true);
    });

    it('should fail with koutsu (triplet)', () => {
      const tiles = [
        // Koutsu instead of shuntsu
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
      ];

      const info: YakuInfo = {
        isConcealed: true,
        waitingType: WaitingType.Ryanmen,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Pinfu)).toBe(false);
    });

    it('should fail with non-ryanmen wait', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
      ];

      const info: YakuInfo = {
        isConcealed: true,
        waitingType: WaitingType.Tanki,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Pinfu)).toBe(false);
    });
  });

  describe('一盃口 (Iipeikou)', () => {
    it('should succeed with identical shuntsu', () => {
      // 使用散牌讓系統自動分析順子：兩個相同的123萬順子 + 其他牌組成和牌
      const tiles = [
        // Two identical 1-2-3 man sequences
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
        // Another sequence: 4-5-6 pin
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 4, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 6, isRed: false }),
        // Another sequence: 7-8-9 sou
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 7, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 8, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 9, isRed: false }),
        // Pair (雀頭): 7-7 pin
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 7, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 7, isRed: false }),
      ];

      const info: YakuInfo = {
        isConcealed: true,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Iipeikou)).toBe(true);
    });

    it('should fail with different shuntsu', () => {
      const tiles = [
        // First shuntsu: 1-2-3 man
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
        // Different shuntsu: 4-5-6 pin
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 4, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 6, isRed: false }),
      ];

      const info: YakuInfo = {
        isConcealed: true,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Iipeikou)).toBe(false);
    });
  });

  describe('海底摸月 (HaiteiTsumo)', () => {
    it('should succeed when both last round and tsumo are true', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
      ];

      const info: YakuInfo = {
        isLastRound: true,
        isTsumo: true,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.HaiteiTsumo)).toBe(true);
    });

    it('should fail when not last round', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
      ];

      const info: YakuInfo = {
        isLastRound: false,
        isTsumo: true,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.HaiteiTsumo)).toBe(false);
    });

    it('should fail when not tsumo', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
      ];

      const info: YakuInfo = {
        isLastRound: true,
        isTsumo: false,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.HaiteiTsumo)).toBe(false);
    });

    it('should fail when both conditions are false', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
      ];

      const info: YakuInfo = {
        isLastRound: false,
        isTsumo: false,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.HaiteiTsumo)).toBe(false);
    });
  });

  describe('河底撈魚 (HouteiRaoyui)', () => {
    it('should succeed when last round is true', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
      ];

      const info: YakuInfo = {
        isLastRound: true,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.HouteiRaoyui)).toBe(true);
    });

    it('should fail when not last round', () => {
      const tiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
      ];

      const info: YakuInfo = {
        isLastRound: false,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.HouteiRaoyui)).toBe(false);
    });
  });
});
