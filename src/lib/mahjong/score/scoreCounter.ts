//import { MahjongTiles } from '../tiles';
import { MahjongYakuTypes } from '../typecheck';
import { WaitingType } from '../typecheck/yaku';

export type MahjongScoreCountResult = {
  dealer: number; // 莊家分數
  nonDealer: number; // 閒家分數
  ronScore: number; // 榮和分數
};

export class MahjongScoreCounter {
  //private tiles: MahjongTiles[] = []; // 牌面數字
  private hanCount: number; // 番數
  private waitingType: WaitingType;
  private isTsumo: boolean;
  private isMenzen: boolean = true; // 默認為門前清
  private ronType?: MahjongYakuTypes; // 主要役種
  private yakuList: MahjongYakuTypes[] = []; // 役種列表

  constructor({
    ronType,
    //tiles = [],
    isMenzen = true, // 是否門前清
    hanCount = 0,
    waitingType = WaitingType.Any,
    isTsumo = false,
    yakuList = [],
  }: {
    ronType?: MahjongYakuTypes; // 主要役種
    hanCount: number; // 番數
    //tiles?: MahjongTiles[];
    waitingType?: WaitingType; // 等待類型
    isTsumo?: boolean; // 是否自摸
    isMenzen?: boolean; // 是否門前清
    yakuList?: MahjongYakuTypes[]; // 役種列表
  }) {
    //this.tiles = tiles;
    this.hanCount = hanCount;
    this.waitingType = waitingType;
    this.isTsumo = isTsumo;
    this.isMenzen = isMenzen;
    this.ronType = ronType;
    this.yakuList = yakuList;
  }

  public count() {
    //如果番數大於等於5
    if (this.hanCount >= 5) {
      const Han = this.hanCount;
      let result: MahjongScoreCountResult;
      switch (true) {
        case Han >= 13:
          result = { nonDealer: 8000, dealer: 16000, ronScore: 32000 };
          break;
        case Han >= 11:
          result = { nonDealer: 6000, dealer: 12000, ronScore: 24000 };
          break;
        case Han >= 8:
          result = { nonDealer: 4000, dealer: 8000, ronScore: 16000 };
          break;
        case Han >= 6:
          result = { nonDealer: 3000, dealer: 6000, ronScore: 12000 };
          break;
        case Han >= 5:
          result = { nonDealer: 2000, dealer: 4000, ronScore: 8000 };
          break;
        default:
          result = { nonDealer: 2000, dealer: 4000, ronScore: 8000 };
          break;
      }
      return result;
    }

    // 使用 calculateFu 方法來計算符數
    const fu = this.calculateFu();
    const han = this.hanCount;

    // 根據番數和符數計算分數
    const result = this.calculateScoreByHanFu(han, fu);

    return result;
  }

  private calculateScoreByHanFu(han: number, fu: number): MahjongScoreCountResult {
    // 基本點數計算公式：fu × 2^(han+2)
    let baseScore = fu * Math.pow(2, han + 2);

    // 限制最大基本點數為2000點（滿貫以下）
    if (baseScore > 2000) {
      baseScore = 2000;
    }

    let ronScore: number;
    let dealerScore: number;
    let nonDealerScore: number;
    // 麻將分數對照表 [符數, 1番, 2番, 3番, 4番] (榮和分數)
    const ronScoreTable = [
      [20, 0, 1300, 2600, 5200], // 20符 (平和自摸時)
      [25, 0, 1600, 3200, 6400], // 25符 (七對子)
      [30, 1000, 2000, 3900, 7700], // 30符
      [40, 1300, 2600, 5200, 8000], // 40符
      [50, 1600, 3200, 6400, 8000], // 50符
      [60, 2000, 3900, 7700, 8000], // 60符
      [70, 2300, 4500, 8000, 8000], // 70符
      [80, 2600, 5200, 8000, 8000], // 80符
      [90, 2900, 5800, 8000, 8000], // 90符
      [100, 3200, 6400, 8000, 8000], // 100符
      [110, 3600, 7100, 8000, 8000], // 110符
    ];

    // 自摸分數對照表 [符數, [1番非莊/莊], [2番非莊/莊], [3番非莊/莊], [4番非莊/莊]]
    const tsumoScoreTable = [
      [20, [0, 0], [400, 700], [700, 1300], [1300, 2600]], // 20符
      [25, [0, 0], [400, 800], [800, 1600], [1600, 3200]], // 25符
      [30, [300, 500], [500, 1000], [1000, 2000], [2000, 3900]], // 30符
      [40, [400, 700], [700, 1300], [1300, 2600], [2000, 4000]], // 40符
      [50, [400, 800], [800, 1600], [1600, 3200], [2000, 4000]], // 50符
      [60, [500, 1000], [1000, 2000], [2000, 3900], [2000, 4000]], // 60符
      [70, [600, 1200], [1200, 2300], [2000, 4000], [2000, 4000]], // 70符
      [80, [700, 1300], [1300, 2600], [2000, 4000], [2000, 4000]], // 80符
      [90, [800, 1500], [1500, 2900], [2000, 4000], [2000, 4000]], // 90符
      [100, [800, 1600], [1600, 3200], [2000, 4000], [2000, 4000]], // 100符
      [110, [900, 1800], [1800, 3600], [2000, 4000], [2000, 4000]], // 110符
    ];

    if (han >= 5) {
      // 滿貫以上
      ronScore = 8000;
      nonDealerScore = 2000;
      dealerScore = 4000;
    } else {
      const scoreRow = this.isTsumo
        ? tsumoScoreTable.find(row => row[0] === fu)
        : ronScoreTable.find(row => row[0] === fu);

      if (scoreRow) {
        if (this.isTsumo) {
          const scores = scoreRow[han] as [number, number];
          nonDealerScore = scores[0];
          dealerScore = scores[1];
          ronScore = nonDealerScore * 2 + dealerScore;
        } else {
          ronScore = scoreRow[han] as number;
          nonDealerScore = 0;
          dealerScore = 0;
        }
      } else {
        // 使用公式計算
        nonDealerScore = this.isTsumo ? Math.ceil(baseScore / 4 / 100) * 100 : 0;
        dealerScore = this.isTsumo ? Math.ceil(baseScore / 2 / 100) * 100 : 0;
        ronScore = this.isTsumo
          ? nonDealerScore * 2 + dealerScore
          : Math.ceil((baseScore * 4) / 100) * 100;
      }
    }

    return {
      nonDealer: nonDealerScore,
      dealer: dealerScore,
      ronScore: ronScore,
    };
  }

  // 新增計算符數的方法
  public calculateFu(): number {
    let fu = 20; // 基本符

    // 檢查是否為平和
    const hasPinfu =
      this.yakuList.includes(MahjongYakuTypes.Pinfu) || this.ronType === MahjongYakuTypes.Pinfu;

    // 檢查是否為七對子
    const hasChiitoitsu =
      this.yakuList.includes(MahjongYakuTypes.Chiitoitsu) ||
      this.ronType === MahjongYakuTypes.Chiitoitsu;

    // 七對子固定25符
    if (hasChiitoitsu) {
      return 25;
    }

    // 平和的特殊處理
    if (hasPinfu) {
      if (this.isTsumo) {
        return 20; // 平和自摸20符
      } else {
        return 30; // 平和榮和30符
      }
    }

    // 非平和的符數計算
    if (!hasPinfu) {
      // 等待形符數
      switch (this.waitingType) {
        case WaitingType.Kanchan: // 嵌張
          fu += 2;
          break;
        case WaitingType.Penchan: // 邊張
          fu += 2;
          break;
        case WaitingType.Shanpon: // 雙碰
          fu += 2;
          break;
      }

      // 自摸符
      if (this.isTsumo) {
        fu += 2; // 門前清自摸2符
      }

      // 榮和符（非門前清榮和）
      if (!this.isTsumo && !this.isMenzen) {
        fu += 10;
      }
    }

    // 副露時最大30符的限制
    if (!this.isMenzen && fu > 30) {
      fu = 30;
    }

    // 符數無條件進位到10
    return Math.ceil(fu / 10) * 10;
  }
}
