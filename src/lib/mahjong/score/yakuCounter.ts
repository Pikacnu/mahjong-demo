import { MahjongYakuTypes } from '../typecheck';

export type YakuCountRule = {
  // 是否附露(減番)
  isRevealedMinusOne?: boolean;
  // 飜數
  han: number;
  // 是否役滿
  isYakuman?: boolean;
  // 是否雙倍役滿
  isDoubleYakuman?: boolean;
};

export class MahjongYakuCounter {
  private registerYakus: Record<MahjongYakuTypes, YakuCountRule> = {} as Record<
    MahjongYakuTypes,
    YakuCountRule
  >;
  private static yakuCounter: MahjongYakuCounter;
  constructor() {
    this.initializeYakuRules();
  }
  public getInstance() {
    if (!MahjongYakuCounter.yakuCounter) {
      MahjongYakuCounter.yakuCounter = new MahjongYakuCounter();
    }
    return MahjongYakuCounter.yakuCounter;
  }

  public registerYaku(yakuType: MahjongYakuTypes, rule: YakuCountRule) {
    this.registerYakus[yakuType] = rule;
  }

  public getYakuCount(yakuType: MahjongYakuTypes): YakuCountRule | undefined {
    return this.registerYakus[yakuType];
  }

  public getAllYakus(): Record<MahjongYakuTypes, YakuCountRule> {
    return this.registerYakus;
  }

  public clear() {
    this.registerYakus = {} as Record<MahjongYakuTypes, YakuCountRule>;
  }

  public getHanCount(yakuType: MahjongYakuTypes[]): number {
    return yakuType.reduce((total, type) => {
      const rule = this.getYakuCount(type);
      return total + (rule?.han || 0) + (rule?.isRevealedMinusOne ? -1 : 0);
    }, 0);
  }

  // 初始化役種番數設定
  private initializeYakuRules() {
    // ------------一番------------
    this.registerYaku(MahjongYakuTypes.Riichi, { han: 1 });
    this.registerYaku(MahjongYakuTypes.Tanyao, { han: 1 });
    this.registerYaku(MahjongYakuTypes.MenzenTsumo, { han: 1 });
    this.registerYaku(MahjongYakuTypes.Jihai, { han: 1 });
    this.registerYaku(MahjongYakuTypes.Bakaze, { han: 1 });
    this.registerYaku(MahjongYakuTypes.Sanzen, { han: 1 });
    this.registerYaku(MahjongYakuTypes.Pinfu, { han: 1 });
    this.registerYaku(MahjongYakuTypes.Iipeikou, { han: 1 });
    this.registerYaku(MahjongYakuTypes.Ippatsu, { han: 1 });
    this.registerYaku(MahjongYakuTypes.Chankan, { han: 1 });
    this.registerYaku(MahjongYakuTypes.Rinsyan, { han: 1 });
    this.registerYaku(MahjongYakuTypes.HaiteiTsumo, { han: 1 });
    this.registerYaku(MahjongYakuTypes.HouteiRaoyui, { han: 1 });

    // ------------二番------------
    this.registerYaku(MahjongYakuTypes.DoubleRiichi, { han: 2 });
    this.registerYaku(MahjongYakuTypes.SanshokuDoukou, { han: 2, isRevealedMinusOne: true });
    this.registerYaku(MahjongYakuTypes.Sankantsu, { han: 2 });
    this.registerYaku(MahjongYakuTypes.Toitoihou, { han: 2 });
    this.registerYaku(MahjongYakuTypes.Sanankou, { han: 2 });
    this.registerYaku(MahjongYakuTypes.Shousangen, { han: 2 });
    this.registerYaku(MahjongYakuTypes.Honroutou, { han: 2 });
    this.registerYaku(MahjongYakuTypes.Chiitoitsu, { han: 2 });
    this.registerYaku(MahjongYakuTypes.Chanta, { han: 2, isRevealedMinusOne: true });
    this.registerYaku(MahjongYakuTypes.Ikkitsuukan, { han: 2, isRevealedMinusOne: true });
    this.registerYaku(MahjongYakuTypes.SanshokuDoujun, { han: 2, isRevealedMinusOne: true });

    // ------------三番------------
    this.registerYaku(MahjongYakuTypes.Ryanpeikou, { han: 3 });
    this.registerYaku(MahjongYakuTypes.Honitsu, { han: 3, isRevealedMinusOne: true });
    this.registerYaku(MahjongYakuTypes.Junchantaiyouku, { han: 3, isRevealedMinusOne: true });

    // ------------六番------------
    this.registerYaku(MahjongYakuTypes.Chinitsu, { han: 6, isRevealedMinusOne: true });

    // ------------滿貫------------
    this.registerYaku(MahjongYakuTypes.RyuukyokuMankan, { han: 5 }); // 流局滿貫

    // ------------役滿 (13番)------------
    this.registerYaku(MahjongYakuTypes.Tenhou, { han: 13, isYakuman: true });
    this.registerYaku(MahjongYakuTypes.Chihou, { han: 13, isYakuman: true });
    this.registerYaku(MahjongYakuTypes.Daisangen, { han: 13, isYakuman: true });
    this.registerYaku(MahjongYakuTypes.Suuankou, { han: 13, isYakuman: true });
    this.registerYaku(MahjongYakuTypes.Tsuuiisou, { han: 13, isYakuman: true });
    this.registerYaku(MahjongYakuTypes.Ryuuuiisou, { han: 13, isYakuman: true });
    this.registerYaku(MahjongYakuTypes.Chinroutou, { han: 13, isYakuman: true }); // 清老頭
    this.registerYaku(MahjongYakuTypes.KokushiMusou, { han: 13, isYakuman: true });
    this.registerYaku(MahjongYakuTypes.Shousuushi, { han: 13, isYakuman: true });
    this.registerYaku(MahjongYakuTypes.Suukantsu, { han: 13, isYakuman: true });
    this.registerYaku(MahjongYakuTypes.ChuurenPoutou, { han: 13, isYakuman: true });

    // ------------雙倍役滿 (26番)------------
    this.registerYaku(MahjongYakuTypes.SuuankouTanki, { han: 26, isDoubleYakuman: true });
    this.registerYaku(MahjongYakuTypes.KokushiMusouJyuusanmen, { han: 26, isDoubleYakuman: true });
    this.registerYaku(MahjongYakuTypes.JyunseiChuurenPoutou, { han: 26, isDoubleYakuman: true });
    this.registerYaku(MahjongYakuTypes.Daisuushi, { han: 26, isDoubleYakuman: true });

    // ------------特殊役 (流局役)------------
    this.registerYaku(MahjongYakuTypes.SuufuuRenda, { han: 0 }); // 流局
    this.registerYaku(MahjongYakuTypes.Suukansanra, { han: 0 }); // 流局
    this.registerYaku(MahjongYakuTypes.KyuuShuKyuuHai, { han: 0 }); // 流局
  }
}

const yakuCounter = new MahjongYakuCounter().getInstance();

export default yakuCounter;
