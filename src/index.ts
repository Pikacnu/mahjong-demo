// Main exports for the Mahjong Library Demo
export { MahjongTiles } from './lib/mahjong/tiles/index';
export { MahjongSuits } from './lib/mahjong/type';
export {
  YakuChecker,
  GroupType,
  WaitingType,
} from './lib/mahjong/typecheck/yaku';
export type { YakuInfo } from './lib/mahjong/typecheck/yaku';
export { MahjongYakuTypes } from './lib/mahjong/typecheck/index';
export { MahjongYakuCounter } from './lib/mahjong/score/yakuCounter';

// Re-export core functionality for easy access
export * from './lib/mahjong/tiles/index';
export * from './lib/mahjong/typecheck/index';
export * from './lib/mahjong/score/yakuCounter';
