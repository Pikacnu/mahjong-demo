import { MeldData } from '../player';
import { PlayerActionType } from '../table/actions';
import { MahjongTiles } from '../tiles';
import { MahjongYakuTypes, MahjongSimpleUnits, Checker } from '../typecheck';
import { CheckTilesGroup, GroupType, YakuChecker, YakuInfo, WaitingType } from '../typecheck/yaku';
import { MahjongSuits } from '../type';

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

const PlayerActionTypeToGroupType: Record<MeldData['type'], GroupType> = {
  [PlayerActionType.Chii]: GroupType.Shuntsu,
  [PlayerActionType.Pon]: GroupType.Koutsu,
  [PlayerActionType.Kan]: GroupType.Kantsu,
};

/**
 * 等待牌資訊介面
 */
export interface WaitingInfo {
  /** 等待的牌 */
  waitingTiles: MahjongTiles[];
  /** 等待類型 */
  waitingType: WaitingType;
  /** 缺少的牌組資訊 */
  missingGroup: {
    type: GroupType;
    requiredTiles: MahjongTiles[];
  };
  /** 可能的役種 */
  yakuTypes: MahjongYakuTypes[];
  /** 是否為特殊牌型聽牌 */
  isSpecialForm?: boolean;
}

/**
 * 聽牌檢查結果
 */
export interface TenpaiResult {
  /** 是否為聽牌 */
  isTenpai: boolean;
  /** 等待資訊列表 */
  waitingInfos: WaitingInfo[];
  /** 特殊牌型聽牌 */
  specialForms: WaitingInfo[];
}

/**
 * 改進後的聽牌檢查器
 */
export class TenpaiChecker {
  /**
   * 主要聽牌檢查方法
   */
  public static check(
    handTiles: MahjongTiles[],
    meldTiles: MeldData[],
    info: YakuInfo
  ): TenpaiResult {
    // 檢查牌數是否正確 (13張手牌 + 副露組)
    const handTileCount = handTiles.length;
    const meldCount = meldTiles.length;
    const totalMeldTiles = meldCount * 3;

    // 聽牌應該是 13 張牌等待第 14 張
    if (handTileCount + totalMeldTiles !== 13) {
      return { isTenpai: false, waitingInfos: [], specialForms: [] };
    }

    const result: TenpaiResult = {
      isTenpai: false,
      waitingInfos: [],
      specialForms: [],
    };

    // 1. 檢查特殊牌型聽牌
    const specialForms = this.checkSpecialFormTenpai(handTiles, info);
    result.specialForms = specialForms;

    // 2. 檢查一般牌型聽牌
    const normalForms = this.checkNormalFormTenpai(handTiles, meldTiles, info);
    result.waitingInfos = normalForms;

    result.isTenpai = specialForms.length > 0 || normalForms.length > 0;

    return result;
  }

  /**
   * 檢查特殊牌型聽牌（國士無雙、七對子等）
   */
  private static checkSpecialFormTenpai(handTiles: MahjongTiles[], info: YakuInfo): WaitingInfo[] {
    const specialForms: WaitingInfo[] = [];

    // 檢查國士無雙聽牌
    const kokushiTenpai = this.checkKokushiTenpai(handTiles, info);
    if (kokushiTenpai) {
      specialForms.push(kokushiTenpai);
    }

    // 檢查七對子聽牌
    const chiitoitsuTenpai = this.checkChiitoitsuTenpai(handTiles, info);
    if (chiitoitsuTenpai) {
      specialForms.push(chiitoitsuTenpai);
    }

    return specialForms;
  }

  /**
   * 檢查一般牌型聽牌（順子、刻子組合）
   */
  private static checkNormalFormTenpai(
    handTiles: MahjongTiles[],
    meldTiles: MeldData[],
    info: YakuInfo
  ): WaitingInfo[] {
    const waitingInfos: WaitingInfo[] = [];

    // 使用 Checker 分析當前牌組
    const checker = new Checker(handTiles);
    const currentUnits = checker.checkUnitsByOrder();

    // 計算缺少的組合
    const totalGroups = this.countTotalGroups(currentUnits) + meldTiles.length;
    const needGroups = 4; // 需要 4 個面子

    const currentPairs = currentUnits[MahjongSimpleUnits.Toitsu].length;

    // 如果缺少 1 個面子或 1 個對子，則可能聽牌
    if (totalGroups === needGroups - 1 || (totalGroups === needGroups && currentPairs === 0)) {
      // 掃描可能的等待牌
      const possibleWaits = this.findPossibleWaits(handTiles, meldTiles, info);
      waitingInfos.push(...possibleWaits);
    }

    return waitingInfos;
  }

  /**
   * 檢查國士無雙聽牌
   */
  private static checkKokushiTenpai(handTiles: MahjongTiles[], info: YakuInfo): WaitingInfo | null {
    if (handTiles.length !== 13) return null;

    // 國士無雙需要的牌：1m, 9m, 1p, 9p, 1s, 9s, 東南西北白發中
    const requiredTiles = [
      // 萬子 1, 9
      { suit: MahjongSuits.MAN, number: 1 },
      { suit: MahjongSuits.MAN, number: 9 },
      // 餅子 1, 9
      { suit: MahjongSuits.PIN, number: 1 },
      { suit: MahjongSuits.PIN, number: 9 },
      // 索子 1, 9
      { suit: MahjongSuits.SOU, number: 1 },
      { suit: MahjongSuits.SOU, number: 9 },
      // 風牌
      { suit: MahjongSuits.WIND, number: 1 }, // 東
      { suit: MahjongSuits.WIND, number: 2 }, // 南
      { suit: MahjongSuits.WIND, number: 3 }, // 西
      { suit: MahjongSuits.WIND, number: 4 }, // 北
      // 三元牌
      { suit: MahjongSuits.DRAGON, number: 1 }, // 白
      { suit: MahjongSuits.DRAGON, number: 2 }, // 發
      { suit: MahjongSuits.DRAGON, number: 3 }, // 中
    ];

    // 快速檢查：是否只包含么九牌
    const hasNonTerminalHonor = handTiles.some(tile => {
      return !requiredTiles.some(
        req => req.suit === tile.getSuit() && req.number === tile.getNumber()
      );
    });

    if (hasNonTerminalHonor) return null;

    // 使用 YakuChecker 測試每個可能的等待牌
    const waitingInfos: WaitingInfo[] = [];
    const testedTiles = new Set<string>();

    for (const req of requiredTiles) {
      const candidateTile = new MahjongTiles({ suits: req.suit, number: req.number, isRed: false });
      const tileKey = `${req.suit}-${req.number}`;

      if (testedTiles.has(tileKey)) continue;
      testedTiles.add(tileKey);

      // 測試加上候選牌後是否可以和牌
      const testHand = [...handTiles, candidateTile];
      const testGroups: CheckTilesGroup[] = tilesToGroups(testHand);

      const yakuChecker = new YakuChecker(testGroups, info);
      const result = yakuChecker.check();

      // 檢查是否包含國士無雙役種
      if (result.has(MahjongYakuTypes.KokushiMusou)) {
        // 分析聽牌類型
        const waitingType = this.analyzeKokushiWaitingType(handTiles, candidateTile);

        waitingInfos.push({
          waitingTiles: [candidateTile],
          waitingType,
          missingGroup: {
            type: waitingType === WaitingType.Tanki ? GroupType.Koutsu : GroupType.Toitsu,
            requiredTiles: [candidateTile],
          },
          yakuTypes: Array.from(result.keys()),
          isSpecialForm: true,
        });
      }
    }

    // 返回第一個有效的聽牌資訊（國士無雙通常只有一種聽法）
    return waitingInfos.length > 0 ? waitingInfos[0] : null;
  }

  /**
   * 分析國士無雙的等待類型
   */
  private static analyzeKokushiWaitingType(
    handTiles: MahjongTiles[],
    waitingTile: MahjongTiles
  ): WaitingType {
    const tileCount = new Map<string, number>();

    for (const tile of handTiles) {
      const key = `${tile.getSuit()}-${tile.getNumber()}`;
      tileCount.set(key, (tileCount.get(key) || 0) + 1);
    }

    const waitKey = `${waitingTile.getSuit()}-${waitingTile.getNumber()}`;
    const waitCount = tileCount.get(waitKey) || 0;

    // 如果手牌中已有一張相同牌，是單騎聽
    if (waitCount === 1) {
      return WaitingType.Tanki;
    }

    // 否則是十三面聽
    return WaitingType.Any;
  }

  /**
   * 檢查七對子聽牌
   */
  private static checkChiitoitsuTenpai(
    handTiles: MahjongTiles[],
    info: YakuInfo
  ): WaitingInfo | null {
    if (handTiles.length !== 13) return null;
    if (!info.isConcealed) return null; // 七對子必須門清

    const tileCount = new Map<string, number>();
    const candidateTiles: MahjongTiles[] = [];

    // 統計每種牌的數量並找出候選牌
    for (const tile of handTiles) {
      const key = `${tile.getSuit()}-${tile.getNumber()}`;
      const count = (tileCount.get(key) || 0) + 1;
      tileCount.set(key, count);

      // 如果是單張牌，它就是候選等待牌
      if (count === 1) {
        candidateTiles.push(tile);
      } else if (count === 2) {
        // 移除已經成對的牌
        const index = candidateTiles.findIndex(
          t => t.getSuit() === tile.getSuit() && t.getNumber() === tile.getNumber()
        );
        if (index !== -1) {
          candidateTiles.splice(index, 1);
        }
      } else if (count > 2) {
        // 超過 2 張相同牌，不可能是七對子
        return null;
      }
    }

    // 快速檢查：七對子聽牌必須有且僅有一張單牌
    if (candidateTiles.length !== 1) return null;

    const waitingTile = candidateTiles[0];

    // 使用 YakuChecker 驗證
    const testHand = [...handTiles, waitingTile];
    const testGroups: CheckTilesGroup[] = tilesToGroups(testHand);

    const yakuChecker = new YakuChecker(testGroups, info);
    const result = yakuChecker.check();

    // 檢查是否包含七對子役種
    if (result.has(MahjongYakuTypes.Chiitoitsu)) {
      return {
        waitingTiles: [waitingTile],
        waitingType: WaitingType.Tanki,
        missingGroup: {
          type: GroupType.Toitsu,
          requiredTiles: [waitingTile],
        },
        yakuTypes: Array.from(result.keys()),
        isSpecialForm: true,
      };
    }

    return null;
  }

  /**
   * 尋找可能的等待牌
   */
  private static findPossibleWaits(
    handTiles: MahjongTiles[],
    meldTiles: MeldData[],
    info: YakuInfo
  ): WaitingInfo[] {
    const waitingInfos: WaitingInfo[] = [];
    const testedTiles = new Set<string>();

    // 智能搜索：只測試手牌周圍可能的牌
    const candidateTiles = this.generateCandidateTiles(handTiles);

    for (const candidateTile of candidateTiles) {
      const tileKey = `${candidateTile.getSuit()}-${candidateTile.getNumber()}`;
      if (testedTiles.has(tileKey)) continue;
      testedTiles.add(tileKey);

      // 測試加上這張牌後是否可以和牌
      const testHand = [...handTiles, candidateTile];
      const testGroups: CheckTilesGroup[] = [
        ...meldTiles.map(data => ({
          type: PlayerActionTypeToGroupType[data.type],
          tiles: data.tiles,
          isOpen: data.isOpen || false,
        })),
        ...tilesToGroups(testHand),
      ];

      const yakuChecker = new YakuChecker(testGroups, info);
      const result = yakuChecker.check();

      if (result.size > 0) {
        // 可以和牌，分析等待類型
        const waitingType = this.analyzeWaitingType(handTiles, candidateTile);

        waitingInfos.push({
          waitingTiles: [candidateTile],
          waitingType,
          missingGroup: {
            type: this.inferMissingGroupType(handTiles, candidateTile),
            requiredTiles: [candidateTile],
          },
          yakuTypes: Array.from(result.keys()),
          isSpecialForm: false,
        });
      }
    }

    return waitingInfos;
  }

  /**
   * 生成候選牌（智能搜索，避免暴力測試所有牌）
   */
  private static generateCandidateTiles(handTiles: MahjongTiles[]): MahjongTiles[] {
    const candidates = new Set<string>();
    const candidateTiles: MahjongTiles[] = [];

    for (const tile of handTiles) {
      const suit = tile.getSuit();
      const number = tile.getNumber();

      // 加入相同牌
      candidates.add(`${suit}-${number}`);

      // 對於數字牌，加入相鄰的牌
      if ([MahjongSuits.MAN, MahjongSuits.PIN, MahjongSuits.SOU].includes(suit)) {
        if (number > 1) candidates.add(`${suit}-${number - 1}`);
        if (number < 9) candidates.add(`${suit}-${number + 1}`);
        if (number > 2) candidates.add(`${suit}-${number - 2}`);
        if (number < 8) candidates.add(`${suit}-${number + 2}`);
      }
    }

    // 轉換為 MahjongTiles 物件
    for (const candidateKey of candidates) {
      const [suitStr, numberStr] = candidateKey.split('-');
      candidateTiles.push(
        new MahjongTiles({
          suits: suitStr as unknown as MahjongSuits,
          number: parseInt(numberStr),
          isRed: false,
        })
      );
    }

    return candidateTiles;
  }

  /**
   * 分析等待類型
   */
  private static analyzeWaitingType(
    handTiles: MahjongTiles[],
    waitingTile: MahjongTiles
  ): WaitingType {
    // 統計手牌
    const tileCount = new Map<string, number>();
    for (const tile of handTiles) {
      const key = `${tile.getSuit()}-${tile.getNumber()}`;
      tileCount.set(key, (tileCount.get(key) || 0) + 1);
    }

    const waitKey = `${waitingTile.getSuit()}-${waitingTile.getNumber()}`;
    const waitCount = tileCount.get(waitKey) || 0;

    // 單騎聽：手牌中已有一張相同牌
    if (waitCount === 1) {
      return WaitingType.Tanki;
    }

    // 雙碰聽：手牌中已有兩張相同牌
    if (waitCount === 2) {
      return WaitingType.Shanpon;
    }

    // 對於數字牌，檢查順子聽牌
    if ([MahjongSuits.MAN, MahjongSuits.PIN, MahjongSuits.SOU].includes(waitingTile.getSuit())) {
      const suit = waitingTile.getSuit();
      const number = waitingTile.getNumber();

      // 檢查兩面聽
      if (number >= 3 && number <= 7) {
        const prev2 = tileCount.get(`${suit}-${number - 2}`) || 0;
        const prev1 = tileCount.get(`${suit}-${number - 1}`) || 0;
        const next1 = tileCount.get(`${suit}-${number + 1}`) || 0;
        const next2 = tileCount.get(`${suit}-${number + 2}`) || 0;

        if ((prev2 > 0 && prev1 > 0) || (next1 > 0 && next2 > 0)) {
          return WaitingType.Ryanmen;
        }
      }

      // 檢查嵌張聽
      if (number >= 2 && number <= 8) {
        const prev1 = tileCount.get(`${suit}-${number - 1}`) || 0;
        const next1 = tileCount.get(`${suit}-${number + 1}`) || 0;
        if (prev1 > 0 && next1 > 0) {
          return WaitingType.Kanchan;
        }
      }

      // 檢查邊張聽
      if (number === 3 || number === 7) {
        const check1 =
          number === 3
            ? (tileCount.get(`${suit}-1`) || 0) && (tileCount.get(`${suit}-2`) || 0)
            : (tileCount.get(`${suit}-8`) || 0) && (tileCount.get(`${suit}-9`) || 0);
        if (check1) {
          return WaitingType.Penchan;
        }
      }
    }

    // 默認返回任意聽
    return WaitingType.Any;
  }

  /**
   * 推斷缺少的牌組類型
   */
  private static inferMissingGroupType(
    handTiles: MahjongTiles[],
    waitingTile: MahjongTiles
  ): GroupType {
    const tileCount = new Map<string, number>();
    for (const tile of handTiles) {
      const key = `${tile.getSuit()}-${tile.getNumber()}`;
      tileCount.set(key, (tileCount.get(key) || 0) + 1);
    }

    const waitKey = `${waitingTile.getSuit()}-${waitingTile.getNumber()}`;
    const waitCount = tileCount.get(waitKey) || 0;

    // 根據現有牌數判斷
    if (waitCount === 1) return GroupType.Toitsu;
    if (waitCount === 2) return GroupType.Koutsu;

    // 默認為順子
    return GroupType.Shuntsu;
  }

  /**
   * 計算總牌組數
   */
  private static countTotalGroups(units: Record<MahjongSimpleUnits, MahjongTiles[][]>): number {
    return (
      units[MahjongSimpleUnits.Shuntsu].length +
      units[MahjongSimpleUnits.Koutsu].length +
      units[MahjongSimpleUnits.Kantsu].length
    );
  }
}
