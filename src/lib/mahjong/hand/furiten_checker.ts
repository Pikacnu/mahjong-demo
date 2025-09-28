import { MahjongHand } from '.';
import { MahjongTiles } from '../tiles';
export enum FuritenType {
  DISCARD = 'discard', // 打牌振聽
  SAME_TURN = 'same_turn', // 同巡振聽
  RIICHI = 'riichi', // 立直振聽
}

export type FuritenCheckResult = {
  isFuriten: boolean;
  furitenType: FuritenType[] | null;
  furitenTiles: Array<MahjongTiles>;
};

export class FuritenChecker {
  private isFuriten: boolean = false;
  private isRiichi: boolean = false;
  private isWaiting: boolean = true;

  private furitenType: FuritenType[] = [];

  private furitenTiles: Array<MahjongTiles> = [];
  private useTileAfterRiichi: Set<string> = new Set(); // 立直後使用過的牌

  private currentRoundDiscardedTiles: Set<string> = new Set(); // 本巡所有人打出的牌
  private hand: MahjongHand;

  constructor(hand: MahjongHand) {
    this.hand = hand;
  }

  get isInFuriten(): FuritenCheckResult {
    return {
      isFuriten: this.isFuriten,
      furitenType: this.furitenType,
      furitenTiles: this.furitenTiles,
    };
  }

  get furiten() {
    return;
  }

  setRiichi(isRiichi: boolean) {
    this.isRiichi = isRiichi;
  }

  setIsWait(value: boolean) {
    this.isWaiting = value;
  }

  // 記錄其他人打出的牌(用於同巡振聽檢查，包含吃碰槓與丟牌)
  discardTiles(tiles: Array<MahjongTiles>) {
    tiles.forEach(tile => {
      this.currentRoundDiscardedTiles.add(`${tile.getSuit()}-${tile.getNumber()}`);
      if (this.isRiichi) this.useTileAfterRiichi.add(`${tile.getSuit()}-${tile.getNumber()}`);
    });
  }

  private check(waitingTiles: MahjongTiles[]): boolean {
    if (!this.isWaiting) return false;

    // 重置狀態 - 清除之前的檢查結果
    this.furitenType = [];
    this.furitenTiles = [];
    this.isFuriten = false;

    const useTileSet = new Set<string>();
    this.hand.getUsedTiles().forEach(tile => {
      useTileSet.add(`${tile.getSuit()}-${tile.getNumber()}`);
    });

    // 檢查捨牌振聽
    const discardFuritenTiles = waitingTiles.filter(t =>
      useTileSet.has(`${t.getSuit()}-${t.getNumber()}`)
    );
    if (discardFuritenTiles.length > 0) {
      this.isFuriten = true;
      this.furitenTiles = discardFuritenTiles.map(
        t =>
          new MahjongTiles({
            suits: t.getSuit(),
            number: t.getNumber(),
          })
      );
      this.furitenType.push(FuritenType.DISCARD);
    }

    // 檢查同巡振聽
    if (
      this.isWaiting &&
      waitingTiles.some(t => this.currentRoundDiscardedTiles.has(`${t.getSuit()}-${t.getNumber()}`))
    ) {
      this.isFuriten = true;
      this.furitenType.push(FuritenType.SAME_TURN);
    }

    // 檢查立直振聽
    if (
      this.isRiichi &&
      waitingTiles.some(t => this.useTileAfterRiichi.has(`${t.getSuit()}-${t.getNumber()}`))
    ) {
      this.isFuriten = true;
      this.furitenType.push(FuritenType.RIICHI);
    }

    // 如果沒有振聽，清除本巡記錄（但這個行為可能需要重新考慮）
    if (!this.isFuriten) {
      this.currentRoundDiscardedTiles.clear();
    }

    return this.isFuriten;
  }

  checkFuriten(waitingTiles: MahjongTiles[]): FuritenCheckResult {
    this.check(waitingTiles);
    return {
      isFuriten: this.isFuriten,
      furitenType: this.furitenType.length > 0 ? this.furitenType : null,
      furitenTiles: this.furitenTiles,
    };
  }

  clear() {
    this.isFuriten = false;
    this.furitenType = [];
    this.furitenTiles = [];
    this.currentRoundDiscardedTiles.clear();
    this.useTileAfterRiichi.clear();
  }
}
