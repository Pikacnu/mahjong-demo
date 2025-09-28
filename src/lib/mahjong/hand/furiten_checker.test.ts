import { describe, it, expect, beforeEach } from 'bun:test';
import { MahjongTiles } from '../tiles';
import { MahjongSuits } from '../type';
import { MahjongHand } from '.';
import { FuritenChecker, FuritenType } from './furiten_checker';

describe('FuritenChecker', () => {
  let hand: MahjongHand;
  let furitenChecker: FuritenChecker;

  // 輔助函數：創建牌
  const createTile = (suit: MahjongSuits, number: number, isRed = false) =>
    new MahjongTiles({ suits: suit, number, isRed });

  // 輔助函數：創建等聽牌組
  const createWaitingTiles = (tiles: Array<{ suit: MahjongSuits; number: number }>) =>
    tiles.map(t => createTile(t.suit, t.number));

  beforeEach(() => {
    // 創建基本手牌
    const tiles = [
      createTile(MahjongSuits.MAN, 1),
      createTile(MahjongSuits.MAN, 2),
      createTile(MahjongSuits.MAN, 3),
      createTile(MahjongSuits.PIN, 4),
      createTile(MahjongSuits.PIN, 5),
      createTile(MahjongSuits.PIN, 6),
      createTile(MahjongSuits.SOU, 7),
      createTile(MahjongSuits.SOU, 8),
      createTile(MahjongSuits.SOU, 9),
      createTile(MahjongSuits.WIND, 1),
      createTile(MahjongSuits.WIND, 1),
      createTile(MahjongSuits.DRAGON, 1),
      createTile(MahjongSuits.DRAGON, 1),
    ];
    hand = new MahjongHand(tiles);
    furitenChecker = new FuritenChecker(hand);
  });

  describe('基本功能測試', () => {
    it('應該正確初始化振聽檢查器', () => {
      expect(furitenChecker).toBeInstanceOf(FuritenChecker);
      const result = furitenChecker.isInFuriten;
      expect(result.isFuriten).toBe(false);
      expect(result.furitenType).toEqual([]);
      expect(result.furitenTiles).toEqual([]);
    });

    it('應該能設置立直狀態', () => {
      furitenChecker.setRiichi(true);
      // 立直狀態本身不應該立即造成振聽
      const waitingTiles = createWaitingTiles([{ suit: MahjongSuits.MAN, number: 4 }]);
      const result = furitenChecker.checkFuriten(waitingTiles);
      expect(result.isFuriten).toBe(false);
    });

    it('應該能設置等聽狀態', () => {
      furitenChecker.setIsWait(false);
      const waitingTiles = createWaitingTiles([{ suit: MahjongSuits.MAN, number: 4 }]);
      const result = furitenChecker.checkFuriten(waitingTiles);
      expect(result.isFuriten).toBe(false); // 不等聽時不會振聽
    });
  });

  describe('捨牌振聽 (DISCARD)', () => {
    it('應該檢測出基本捨牌振聽', () => {
      // 使用一張牌 (相當於丟棄)
      hand.use(0); // 丟棄 1m
      furitenChecker.setIsWait(true);

      // 等聽包含已丟棄的牌
      const waitingTiles = createWaitingTiles([
        { suit: MahjongSuits.MAN, number: 1 }, // 已丟棄
        { suit: MahjongSuits.MAN, number: 4 },
      ]);

      const result = furitenChecker.checkFuriten(waitingTiles);
      expect(result.isFuriten).toBe(true);
      expect(result.furitenType).toContain(FuritenType.DISCARD);
      expect(result.furitenTiles).toHaveLength(1);
      expect(result.furitenTiles[0].getSuit()).toBe(MahjongSuits.MAN);
      expect(result.furitenTiles[0].getNumber()).toBe(1);
    });

    it('應該檢測出多張捨牌振聽', () => {
      // 丟棄多張牌
      hand.use(0); // 1m
      hand.use(0); // 2m (因為前一張被移除，索引變化)

      const waitingTiles = createWaitingTiles([
        { suit: MahjongSuits.MAN, number: 1 },
        { suit: MahjongSuits.MAN, number: 2 },
        { suit: MahjongSuits.PIN, number: 7 },
      ]);

      const result = furitenChecker.checkFuriten(waitingTiles);
      expect(result.isFuriten).toBe(true);
      expect(result.furitenType).toContain(FuritenType.DISCARD);
      expect(result.furitenTiles).toHaveLength(2);
    });

    it('不應該對未丟棄的等聽牌產生捨牌振聽', () => {
      // 丟棄一張不在等聽範圍的牌
      hand.use(0); // 1m

      const waitingTiles = createWaitingTiles([
        { suit: MahjongSuits.PIN, number: 7 },
        { suit: MahjongSuits.SOU, number: 6 },
      ]);

      const result = furitenChecker.checkFuriten(waitingTiles);
      expect(result.isFuriten).toBe(false);
      expect(result.furitenType).toBe(null);
    });

    it('應該處理不同花色的捨牌振聽', () => {
      // 丟棄不同花色的牌
      hand.use({ suit: MahjongSuits.WIND, number: 1 }); // 東風
      hand.use({ suit: MahjongSuits.DRAGON, number: 1 }); // 白板

      const waitingTiles = createWaitingTiles([
        { suit: MahjongSuits.WIND, number: 1 },
        { suit: MahjongSuits.DRAGON, number: 1 },
        { suit: MahjongSuits.MAN, number: 4 },
      ]);

      const result = furitenChecker.checkFuriten(waitingTiles);
      expect(result.isFuriten).toBe(true);
      expect(result.furitenType).toContain(FuritenType.DISCARD);
      expect(result.furitenTiles).toHaveLength(2);
    });
  });

  describe('同巡振聽 (SAME_TURN)', () => {
    it('應該檢測基本同巡振聽', () => {
      furitenChecker.setIsWait(true);

      // 模擬其他玩家在本巡打出的牌
      const discardedTiles = [createTile(MahjongSuits.MAN, 4)];
      furitenChecker.discardTiles(discardedTiles);

      // 等聽包含本巡其他人丟棄的牌
      const waitingTiles = createWaitingTiles([
        { suit: MahjongSuits.MAN, number: 4 },
        { suit: MahjongSuits.PIN, number: 7 },
      ]);

      const result = furitenChecker.checkFuriten(waitingTiles);
      expect(result.isFuriten).toBe(true);
      expect(result.furitenType).toContain(FuritenType.SAME_TURN);
    });

    it('應該處理多張同巡振聽牌', () => {
      furitenChecker.setIsWait(true);

      // 本巡多人丟牌
      const discardedTiles = [
        createTile(MahjongSuits.MAN, 4),
        createTile(MahjongSuits.PIN, 7),
        createTile(MahjongSuits.SOU, 1),
      ];
      furitenChecker.discardTiles(discardedTiles);

      const waitingTiles = createWaitingTiles([
        { suit: MahjongSuits.MAN, number: 4 },
        { suit: MahjongSuits.PIN, number: 7 },
      ]);

      const result = furitenChecker.checkFuriten(waitingTiles);
      expect(result.isFuriten).toBe(true);
      expect(result.furitenType).toContain(FuritenType.SAME_TURN);
    });

    it('不應該對非本巡丟棄的牌產生同巡振聽', () => {
      furitenChecker.setIsWait(true);

      // 模擬上一巡的丟牌 (通過clear重置)
      const oldDiscardedTiles = [createTile(MahjongSuits.MAN, 4)];
      furitenChecker.discardTiles(oldDiscardedTiles);
      furitenChecker.clear(); // 清除同巡記錄

      const waitingTiles = createWaitingTiles([{ suit: MahjongSuits.MAN, number: 4 }]);

      const result = furitenChecker.checkFuriten(waitingTiles);
      expect(result.isFuriten).toBe(false);
    });

    it('不等聽時不應該產生同巡振聽', () => {
      furitenChecker.setIsWait(false);

      const discardedTiles = [createTile(MahjongSuits.MAN, 4)];
      furitenChecker.discardTiles(discardedTiles);

      const waitingTiles = createWaitingTiles([{ suit: MahjongSuits.MAN, number: 4 }]);

      const result = furitenChecker.checkFuriten(waitingTiles);
      expect(result.isFuriten).toBe(false);
    });
  });

  describe('立直振聽 (RIICHI)', () => {
    it('應該檢測基本立直振聽', () => {
      furitenChecker.setRiichi(true);
      furitenChecker.setIsWait(true);

      // 立直後其他人打出等聽牌
      const riichiDiscardedTiles = [createTile(MahjongSuits.MAN, 4)];
      furitenChecker.discardTiles(riichiDiscardedTiles);

      const waitingTiles = createWaitingTiles([
        { suit: MahjongSuits.MAN, number: 4 },
        { suit: MahjongSuits.PIN, number: 7 },
      ]);

      const result = furitenChecker.checkFuriten(waitingTiles);
      expect(result.isFuriten).toBe(true);
      expect(result.furitenType).toContain(FuritenType.RIICHI);
    });

    it('非立直狀態不應該產生立直振聽', () => {
      furitenChecker.setRiichi(false);
      furitenChecker.setIsWait(true);

      const discardedTiles = [createTile(MahjongSuits.MAN, 4)];
      furitenChecker.discardTiles(discardedTiles);

      const waitingTiles = createWaitingTiles([{ suit: MahjongSuits.MAN, number: 4 }]);

      const result = furitenChecker.checkFuriten(waitingTiles);
      expect(result.isFuriten).toBe(true);
      expect(result.furitenType).toContain(FuritenType.SAME_TURN); // 應該是同巡振聽
      expect(result.furitenType).not.toContain(FuritenType.RIICHI);
    });

    it('立直前的丟牌不應該造成立直振聽', () => {
      // 先記錄丟牌，再立直
      const preRiichiTiles = [createTile(MahjongSuits.MAN, 4)];
      furitenChecker.discardTiles(preRiichiTiles);

      furitenChecker.setRiichi(true);
      furitenChecker.setIsWait(true);

      const waitingTiles = createWaitingTiles([{ suit: MahjongSuits.MAN, number: 4 }]);

      const result = furitenChecker.checkFuriten(waitingTiles);
      // 應該是同巡振聽，不是立直振聽
      expect(result.isFuriten).toBe(true);
      expect(result.furitenType).toContain(FuritenType.SAME_TURN);
      expect(result.furitenType).not.toContain(FuritenType.RIICHI);
    });
  });

  describe('複合振聽狀況', () => {
    it('應該同時檢測捨牌振聽和同巡振聽', () => {
      // 自己丟過的牌
      hand.use(0); // 1m

      // 本巡其他人也丟了等聽牌
      furitenChecker.discardTiles([createTile(MahjongSuits.PIN, 7)]);
      furitenChecker.setIsWait(true);

      const waitingTiles = createWaitingTiles([
        { suit: MahjongSuits.MAN, number: 1 }, // 捨牌振聽
        { suit: MahjongSuits.PIN, number: 7 }, // 同巡振聽
      ]);

      const result = furitenChecker.checkFuriten(waitingTiles);
      expect(result.isFuriten).toBe(true);
      expect(result.furitenType).toContain(FuritenType.DISCARD);
      expect(result.furitenType).toContain(FuritenType.SAME_TURN);
    });

    it('應該同時檢測所有三種振聽', () => {
      // 捨牌振聽
      hand.use(0); // 1m

      // 立直
      furitenChecker.setRiichi(true);
      furitenChecker.setIsWait(true);

      // 立直後和本巡的丟牌
      furitenChecker.discardTiles([
        createTile(MahjongSuits.PIN, 7), // 同巡+立直振聽
      ]);

      const waitingTiles = createWaitingTiles([
        { suit: MahjongSuits.MAN, number: 1 }, // 捨牌振聽
        { suit: MahjongSuits.PIN, number: 7 }, // 同巡+立直振聽
      ]);

      const result = furitenChecker.checkFuriten(waitingTiles);
      expect(result.isFuriten).toBe(true);
      expect(result.furitenType).toContain(FuritenType.DISCARD);
      expect(result.furitenType).toContain(FuritenType.SAME_TURN);
      expect(result.furitenType).toContain(FuritenType.RIICHI);
    });

    it('捨牌振聽應該優先被檢測 (短路邏輯)', () => {
      // 設置捨牌振聽
      hand.use(0); // 1m

      // 同時設置其他振聽條件
      furitenChecker.setRiichi(true);
      furitenChecker.discardTiles([createTile(MahjongSuits.PIN, 7)]);
      furitenChecker.setIsWait(true);

      const waitingTiles = createWaitingTiles([
        { suit: MahjongSuits.MAN, number: 1 }, // 捨牌振聽 (應該先被檢測)
        { suit: MahjongSuits.PIN, number: 7 },
      ]);

      const result = furitenChecker.checkFuriten(waitingTiles);
      expect(result.isFuriten).toBe(true);
      expect(result.furitenType).toContain(FuritenType.DISCARD);
      expect(result.furitenTiles).toHaveLength(1);
      expect(result.furitenTiles[0].getSuit()).toBe(MahjongSuits.MAN);
      expect(result.furitenTiles[0].getNumber()).toBe(1);
    });
  });

  describe('邊界條件測試', () => {
    it('空等聽牌列表不應該產生振聽', () => {
      hand.use(0); // 丟牌
      furitenChecker.setIsWait(true);

      const result = furitenChecker.checkFuriten([]);
      expect(result.isFuriten).toBe(false);
    });

    it('應該處理相同牌的多次丟棄', () => {
      // 丟棄相同的牌多次 (理論上不應該發生，但要測試健壯性)
      hand.use(0); // 1m
      hand.use({ suit: MahjongSuits.MAN, number: 2 }); // 2m

      const waitingTiles = createWaitingTiles([
        { suit: MahjongSuits.MAN, number: 1 },
        { suit: MahjongSuits.MAN, number: 2 },
      ]);

      const result = furitenChecker.checkFuriten(waitingTiles);
      expect(result.isFuriten).toBe(true);
      expect(result.furitenType).toContain(FuritenType.DISCARD);
    });

    it('應該正確處理字牌的振聽', () => {
      // 丟棄字牌
      hand.use({ suit: MahjongSuits.WIND, number: 1 }); // 東風
      hand.use({ suit: MahjongSuits.DRAGON, number: 1 }); // 白板

      const waitingTiles = createWaitingTiles([
        { suit: MahjongSuits.WIND, number: 1 },
        { suit: MahjongSuits.DRAGON, number: 1 },
      ]);

      const result = furitenChecker.checkFuriten(waitingTiles);
      expect(result.isFuriten).toBe(true);
      expect(result.furitenTiles).toHaveLength(2);
    });

    it('清除功能應該重置所有狀態', () => {
      // 設置各種振聽狀態
      hand.use(0);
      furitenChecker.setRiichi(true);
      furitenChecker.discardTiles([createTile(MahjongSuits.PIN, 7)]);

      const waitingTiles = createWaitingTiles([{ suit: MahjongSuits.MAN, number: 1 }]);

      // 驗證振聽存在
      let result = furitenChecker.checkFuriten(waitingTiles);
      expect(result.isFuriten).toBe(true);

      // 清除並重新檢測
      furitenChecker.clear();
      result = furitenChecker.checkFuriten(waitingTiles);
      expect(result.isFuriten).toBe(true); // 捨牌振聽依然存在 (因為捨牌記錄在hand中)
      expect(result.furitenType).toContain(FuritenType.DISCARD);
      expect(result.furitenType).not.toContain(FuritenType.SAME_TURN);
      expect(result.furitenType).not.toContain(FuritenType.RIICHI);
    });
  });

  describe('實際遊戲場景測試', () => {
    it('多面聽的捨牌振聽場景', () => {
      // 創建多面聽手牌：123m 234p 567s 東東 白白，聽 1/4/7m
      const multiWaitTiles = [
        createTile(MahjongSuits.MAN, 1),
        createTile(MahjongSuits.MAN, 2),
        createTile(MahjongSuits.MAN, 3),
        createTile(MahjongSuits.PIN, 2),
        createTile(MahjongSuits.PIN, 3),
        createTile(MahjongSuits.PIN, 4),
        createTile(MahjongSuits.SOU, 5),
        createTile(MahjongSuits.SOU, 6),
        createTile(MahjongSuits.SOU, 7),
        createTile(MahjongSuits.WIND, 1),
        createTile(MahjongSuits.WIND, 1),
        createTile(MahjongSuits.DRAGON, 1),
        createTile(MahjongSuits.DRAGON, 1),
      ];

      const multiWaitHand = new MahjongHand(multiWaitTiles);
      const multiWaitChecker = new FuritenChecker(multiWaitHand);

      // 曾經丟過7m
      multiWaitHand.use({ suit: MahjongSuits.SOU, number: 7 });

      const waitingTiles = createWaitingTiles([
        { suit: MahjongSuits.MAN, number: 1 },
        { suit: MahjongSuits.MAN, number: 4 },
        { suit: MahjongSuits.SOU, number: 7 }, // 已丟棄
      ]);

      const result = multiWaitChecker.checkFuriten(waitingTiles);
      expect(result.isFuriten).toBe(true);
      expect(result.furitenType).toContain(FuritenType.DISCARD);
    });

    it('立直後的複雜振聽場景', () => {
      furitenChecker.setRiichi(true);
      furitenChecker.setIsWait(true);

      // 立直後的多輪丟牌
      furitenChecker.discardTiles([createTile(MahjongSuits.MAN, 4)]); // 第一輪
      furitenChecker.discardTiles([createTile(MahjongSuits.PIN, 7)]); // 第二輪

      const waitingTiles = createWaitingTiles([
        { suit: MahjongSuits.MAN, number: 4 },
        { suit: MahjongSuits.PIN, number: 7 },
        { suit: MahjongSuits.SOU, number: 1 },
      ]);

      const result = furitenChecker.checkFuriten(waitingTiles);
      expect(result.isFuriten).toBe(true);
      expect(result.furitenType).toContain(FuritenType.RIICHI);
      expect(result.furitenType).toContain(FuritenType.SAME_TURN);
    });

    it('非等聽狀態的各種測試', () => {
      furitenChecker.setIsWait(false);

      // 設置各種可能的振聽條件
      hand.use(0);
      furitenChecker.setRiichi(true);
      furitenChecker.discardTiles([createTile(MahjongSuits.PIN, 7)]);

      const waitingTiles = createWaitingTiles([
        { suit: MahjongSuits.MAN, number: 1 },
        { suit: MahjongSuits.PIN, number: 7 },
      ]);

      const result = furitenChecker.checkFuriten(waitingTiles);
      expect(result.isFuriten).toBe(false); // 非等聽狀態不會振聽
    });
  });

  describe('性能和健壯性測試', () => {
    it('應該處理大量等聽牌', () => {
      const manyWaitingTiles = [];
      for (let suit = 0; suit <= 2; suit++) {
        for (let num = 1; num <= 9; num++) {
          manyWaitingTiles.push({ suit: suit as MahjongSuits, number: num });
        }
      }

      const waitingTiles = createWaitingTiles(manyWaitingTiles);
      const result = furitenChecker.checkFuriten(waitingTiles);
      expect(result.isFuriten).toBe(false); // 沒有丟過牌，應該不振聽
    });

    it('應該正確處理重複檢查', () => {
      hand.use(0); // 丟1m
      const waitingTiles = createWaitingTiles([{ suit: MahjongSuits.MAN, number: 1 }]);

      // 多次檢查應該得到一致結果
      const result1 = furitenChecker.checkFuriten(waitingTiles);
      const result2 = furitenChecker.checkFuriten(waitingTiles);
      const result3 = furitenChecker.checkFuriten(waitingTiles);

      expect(result1.isFuriten).toBe(result2.isFuriten);
      expect(result2.isFuriten).toBe(result3.isFuriten);
      expect(result1.furitenType).toEqual(result2.furitenType);
      expect(result2.furitenType).toEqual(result3.furitenType);
    });
  });

  describe('進階場景測試', () => {
    it('應該處理純字牌等聽的振聽', () => {
      // 創建只有字牌的手牌
      const honorTiles = [
        createTile(MahjongSuits.WIND, 1), // 東
        createTile(MahjongSuits.WIND, 1),
        createTile(MahjongSuits.WIND, 2), // 南
        createTile(MahjongSuits.WIND, 2),
        createTile(MahjongSuits.WIND, 3), // 西
        createTile(MahjongSuits.WIND, 3),
        createTile(MahjongSuits.DRAGON, 1), // 白
        createTile(MahjongSuits.DRAGON, 1),
        createTile(MahjongSuits.DRAGON, 2), // 發
        createTile(MahjongSuits.DRAGON, 2),
        createTile(MahjongSuits.DRAGON, 3), // 中
        createTile(MahjongSuits.DRAGON, 3),
        createTile(MahjongSuits.WIND, 4), // 北
      ];

      const honorHand = new MahjongHand(honorTiles);
      const honorChecker = new FuritenChecker(honorHand);

      // 丟棄北風
      honorHand.use({ suit: MahjongSuits.WIND, number: 4 });

      const waitingTiles = createWaitingTiles([
        { suit: MahjongSuits.WIND, number: 4 }, // 等聽北風
      ]);

      const result = honorChecker.checkFuriten(waitingTiles);
      expect(result.isFuriten).toBe(true);
      expect(result.furitenType).toContain(FuritenType.DISCARD);
    });

    it('應該處理混合花色多面聽的複雜振聽', () => {
      // 模擬13面聽（國士無雙型）
      const kokushiTiles = [
        createTile(MahjongSuits.MAN, 1),
        createTile(MahjongSuits.MAN, 9),
        createTile(MahjongSuits.PIN, 1),
        createTile(MahjongSuits.PIN, 9),
        createTile(MahjongSuits.SOU, 1),
        createTile(MahjongSuits.SOU, 9),
        createTile(MahjongSuits.WIND, 1),
        createTile(MahjongSuits.WIND, 2),
        createTile(MahjongSuits.WIND, 3),
        createTile(MahjongSuits.WIND, 4),
        createTile(MahjongSuits.DRAGON, 1),
        createTile(MahjongSuits.DRAGON, 2),
        createTile(MahjongSuits.DRAGON, 3),
      ];

      const kokushiHand = new MahjongHand(kokushiTiles);
      const kokushiChecker = new FuritenChecker(kokushiHand);

      // 丟過其中一張
      kokushiHand.use({ suit: MahjongSuits.MAN, number: 1 });

      // 13面聽
      const waitingTiles = createWaitingTiles([
        { suit: MahjongSuits.MAN, number: 1 },
        { suit: MahjongSuits.MAN, number: 9 },
        { suit: MahjongSuits.PIN, number: 1 },
        { suit: MahjongSuits.PIN, number: 9 },
        { suit: MahjongSuits.SOU, number: 1 },
        { suit: MahjongSuits.SOU, number: 9 },
        { suit: MahjongSuits.WIND, number: 1 },
        { suit: MahjongSuits.WIND, number: 2 },
        { suit: MahjongSuits.WIND, number: 3 },
        { suit: MahjongSuits.WIND, number: 4 },
        { suit: MahjongSuits.DRAGON, number: 1 },
        { suit: MahjongSuits.DRAGON, number: 2 },
        { suit: MahjongSuits.DRAGON, number: 3 },
      ]);

      const result = kokushiChecker.checkFuriten(waitingTiles);
      expect(result.isFuriten).toBe(true);
      expect(result.furitenType).toContain(FuritenType.DISCARD);
      expect(result.furitenTiles).toHaveLength(1);
      expect(result.furitenTiles[0].getSuit()).toBe(MahjongSuits.MAN);
      expect(result.furitenTiles[0].getNumber()).toBe(1);
    });

    it('應該處理立直狀態變更的情況', () => {
      furitenChecker.setIsWait(true);

      // 先不立直，記錄丟牌
      furitenChecker.discardTiles([createTile(MahjongSuits.MAN, 4)]);

      // 再立直
      furitenChecker.setRiichi(true);

      // 立直後又有丟牌
      furitenChecker.discardTiles([createTile(MahjongSuits.PIN, 7)]);

      const waitingTiles = createWaitingTiles([
        { suit: MahjongSuits.MAN, number: 4 }, // 立直前的丟牌 -> 同巡振聽
        { suit: MahjongSuits.PIN, number: 7 }, // 立直後的丟牌 -> 立直振聽+同巡振聽
      ]);

      const result = furitenChecker.checkFuriten(waitingTiles);
      expect(result.isFuriten).toBe(true);
      expect(result.furitenType).toContain(FuritenType.SAME_TURN);
      expect(result.furitenType).toContain(FuritenType.RIICHI);
    });

    it('應該處理等聽狀態的切換', () => {
      hand.use(0); // 丟1m

      // 設為不等聽
      furitenChecker.setIsWait(false);
      const waitingTiles = createWaitingTiles([{ suit: MahjongSuits.MAN, number: 1 }]);

      let result = furitenChecker.checkFuriten(waitingTiles);
      expect(result.isFuriten).toBe(false); // 不等聽時不振聽

      // 切換為等聽
      furitenChecker.setIsWait(true);
      result = furitenChecker.checkFuriten(waitingTiles);
      expect(result.isFuriten).toBe(true); // 等聽時振聽
      expect(result.furitenType).toContain(FuritenType.DISCARD);
    });

    it('應該正確處理極端邊界數值', () => {
      // 測試數字牌的邊界值
      const extremeTiles = [
        createTile(MahjongSuits.MAN, 1), // 最小
        createTile(MahjongSuits.PIN, 9), // 最大
        createTile(MahjongSuits.SOU, 5), // 中間
        createTile(MahjongSuits.WIND, 1), // 字牌最小
        createTile(MahjongSuits.DRAGON, 3), // 字牌最大
      ];

      extremeTiles.forEach(tile => {
        const singleTileHand = new MahjongHand([tile, ...hand.allTiles.slice(1, 13)]);
        const singleChecker = new FuritenChecker(singleTileHand);

        singleTileHand.use(0); // 丟棄第一張牌
        const waitingTiles = [tile];

        const result = singleChecker.checkFuriten(waitingTiles);
        expect(result.isFuriten).toBe(true);
        expect(result.furitenType).toContain(FuritenType.DISCARD);
      });
    });
  });
});
