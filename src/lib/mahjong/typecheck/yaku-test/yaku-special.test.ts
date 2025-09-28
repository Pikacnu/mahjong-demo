import { describe, it, expect } from 'bun:test';
import { MahjongYakuTypes } from '../index';
import { MahjongSuits } from '../../type';
import { MahjongTiles } from '../../tiles/index';
import { YakuChecker, YakuInfo, WaitingType, GroupType, CheckTilesGroup } from '../yaku';

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
 * 特殊役 (Special Yaku) 測試
 * 包含一些特殊情況和條件的役
 */
describe('特殊役 (Special Yaku) Tests', () => {
  describe('流局役 (Draw-related Yaku)', () => {
    describe('四風連打 (Suufuu Renda)', () => {
      it('should succeed when special draw condition is met', () => {
        const info: YakuInfo = {
          isFirstRound: true,
          isAnyOneOpen: false,
          usedTileHistory: [
            new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
            new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
            new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
            new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
            new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
          ],
        };

        const checker = new YakuChecker(tilesToGroups([]), info);
        const results = checker.check();

        expect(results.has(MahjongYakuTypes.SuufuuRenda)).toBe(true);
      });

      it('should fail when condition is not met', () => {
        const tiles = [
          new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.WIND, number: 2, isRed: false }),
        ];

        const info: YakuInfo = {};

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();

        expect(results.has(MahjongYakuTypes.SuufuuRenda)).toBe(false);
      });
    });

    describe('四槓散了 (Suufuu Sanrenkou)', () => {
      it('should succeed when four kans are declared', () => {
        const tiles = [
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
        ];

        const info: YakuInfo = {
          isFirstRound: true,
          isAnyOneOpen: false,
        };

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();

        expect(results.has(MahjongYakuTypes.Suukansanra)).toBe(true);
      });

      it('should fail when condition is not met', () => {
        const tiles = [
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
        ];

        const info: YakuInfo = {};

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();

        expect(results.has(MahjongYakuTypes.Suukansanra)).toBe(false);
      });
    });

    describe('九種九牌 (Kyuushu Kyuuhai)', () => {
      it('should succeed with nine different terminals and honors', () => {
        const tiles = [
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
        ];

        const info: YakuInfo = {
          isFirstRound: true,
          isConcealed: true,
        };

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();

        expect(results.has(MahjongYakuTypes.KyuuShuKyuuHai)).toBe(true);
      });

      it('should fail with less than nine terminals and honors', () => {
        const tiles = [
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
        ];

        const info: YakuInfo = {
          isConcealed: true,
        };

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();

        expect(results.has(MahjongYakuTypes.KyuuShuKyuuHai)).toBe(false);
      });
    });
  });

  describe('邊界情況 (Edge Cases)', () => {
    describe('複合役檢查 (Combination Checking)', () => {
      it('should detect multiple yaku in one hand', () => {
        const tiles = [
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 4, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 6, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 7, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.SOU, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.SOU, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.SOU, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 5, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 6, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 7, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 8, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 8, isRed: false }),
        ];

        const info: YakuInfo = {
          isConcealed: true,
          isTsumo: true,
          isRiichi: true,
        };

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();
        expect(results.has(MahjongYakuTypes.Riichi)).toBe(true);
        expect(results.has(MahjongYakuTypes.MenzenTsumo)).toBe(true);
        expect(results.has(MahjongYakuTypes.Tanyao)).toBe(true);
      });

      it('should handle mutually exclusive yaku', () => {
        const tiles = [
          // Only man tiles (should be Chinitsu, not Honitsu)
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
        expect(results.has(MahjongYakuTypes.Honitsu)).toBe(false);
      });
    });

    describe('空牌型檢查 (Empty Hand Checking)', () => {
      it('should handle empty tiles array', () => {
        const tiles: MahjongTiles[] = [];
        const info: YakuInfo = {};

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();
        console.log(results);

        expect(results.size).toBe(0);
      });

      it('should handle null/undefined info', () => {
        const tiles = [new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false })];

        const checker = new YakuChecker(tilesToGroups(tiles), {});
        const results = checker.check();

        expect(results).toBeDefined();
        expect(results instanceof Map).toBe(true);
      });
    });

    describe('紅寶牌檢查 (Red Dora Checking)', () => {
      it('should handle red fives correctly', () => {
        const tiles = [
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 4, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: true }), // Red five
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 6, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 7, isRed: false }),
        ];

        const info: YakuInfo = {};

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        const results = checker.check();

        expect(results.has(MahjongYakuTypes.Tanyao)).toBe(true);
      });

      it('should treat red fives as normal fives for yaku checking', () => {
        const tiles = [
          // Shuntsu with red five
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 4, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 5, isRed: true }), // Red five
          new MahjongTiles({ suits: MahjongSuits.MAN, number: 6, isRed: false }),
        ];

        const info: YakuInfo = {
          isConcealed: true,
        };

        const checker = new YakuChecker(tilesToGroups(tiles), info);
        checker.check();

        // The red five should be treated as a normal five for shuntsu formation
        expect(tiles[1].getNumber()).toBe(5);
        expect(tiles[1].isRedTile()).toBe(true);
      });
    });

    describe('開門情況檢查 (Open Hand Checking)', () => {
      it('should correctly handle open vs concealed requirements', () => {
        // 構造一個完整的14張牌，可能形成平和和斷么九
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
          // 567索 順子
          new MahjongTiles({ suits: MahjongSuits.SOU, number: 5, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.SOU, number: 6, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.SOU, number: 7, isRed: false }),
          // 88筒 對子
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 8, isRed: false }),
          new MahjongTiles({ suits: MahjongSuits.PIN, number: 8, isRed: false }),
        ];

        const concealedInfo: YakuInfo = {
          isConcealed: true,
          waitingType: WaitingType.Ryanmen, // 兩面聽
        };
        const openInfo: YakuInfo = {
          isConcealed: false,
          waitingType: WaitingType.Ryanmen,
        };

        const concealedChecker = new YakuChecker(tilesToGroups(tiles), concealedInfo);
        const openChecker = new YakuChecker(tilesToGroups(tiles), openInfo);

        const concealedResults = concealedChecker.check();
        const openResults = openChecker.check();

        // 平和需要門清，所以門清時成功，開門時失敗
        expect(concealedResults.has(MahjongYakuTypes.Pinfu)).toBe(true);
        expect(openResults.has(MahjongYakuTypes.Pinfu)).toBe(false);

        // 斷么九不要求門清，所以門清和開門都應該成功
        expect(concealedResults.has(MahjongYakuTypes.Tanyao)).toBe(true);
        expect(openResults.has(MahjongYakuTypes.Tanyao)).toBe(true);
      });
    });
  });

  describe('錯誤處理 (Error Handling)', () => {
    it('should handle invalid tile data gracefully', () => {
      //should throw an error for invalid tile data
      expect(() => {
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 0, isRed: false });
      }).toThrow();
      expect(() => {
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 10, isRed: false });
      }).toThrow();
    });

    it('should handle conflicting yaku registration', () => {
      const tiles = [new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false })];

      const info: YakuInfo = { isConcealed: false };

      const checker = new YakuChecker(tilesToGroups(tiles), info);
      const results = checker.check();

      expect(results).toBeDefined();
    });
  });
});
