import { MahjongHand } from '../hand';
import { type Table } from '../table';
import { type PlayerAction, PlayerActionType, type TableHandledAction } from '../table/actions';
import { MahjongTiles } from '../tiles';
import { MahjongSuits } from '../type';
import { CheckTilesGroup, GroupType, YakuChecker, YakuInfo } from '../typecheck/yaku';

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
//import { YakuChecker } from '../typecheck/yaku';

export type PlayerArgument = {
  playerName: string;
  playerId: string;
  playerScore?: number; // Optional, default is 35000
  selfWind: Wind;
};

export enum Wind {
  EAST = 'EAST',
  SOUTH = 'SOUTH',
  WEST = 'WEST',
  NORTH = 'NORTH',
}

export const WindToTile: Record<
  Wind,
  {
    suit: MahjongSuits;
    number: number;
  }
> = {
  [Wind.EAST]: { suit: MahjongSuits.WIND, number: 1 },
  [Wind.SOUTH]: { suit: MahjongSuits.WIND, number: 2 },
  [Wind.WEST]: { suit: MahjongSuits.WIND, number: 3 },
  [Wind.NORTH]: { suit: MahjongSuits.WIND, number: 4 },
};

export type UseTile =
  | { index: number; tile?: never }
  | { tile: { suit: MahjongSuits; number: number }; index?: never };

// Chii / Pon / Kan Data saved in currentUsedAction
export type MeldData = {
  type: PlayerActionType.Chii | PlayerActionType.Pon | PlayerActionType.Kan;
  tiles: MahjongTiles[];
  isOpen?: boolean; // Only for Kan, Others are always open
};

export class Player {
  private playerName: string;
  private playerId: string;
  private playerScore: number;
  private playerHand: MahjongHand;
  private selfWind: Wind;
  private currentTable: Table | null = null;
  private currentUsedAction: TableHandledAction[] = [];
  private currentAvailableActions: PlayerActionType[] = [];
  private isMyTurn: boolean = false;
  private currentYakuInfo: YakuInfo = {
    isConcealed: true,
    isFuro: false,
    isFirstRound: false,
    isTsumo: false,
    isRiichi: false,
  };

  public playerAcceptTilesForAction: MahjongTiles[] = [];

  constructor({ playerName, playerId, playerScore, selfWind }: PlayerArgument) {
    this.playerName = playerName;
    this.playerId = playerId;
    this.playerScore = playerScore ?? 35000;
    this.playerHand = new MahjongHand([]);
    this.selfWind = selfWind;
    this.isMyTurn = false;
  }
  get name() {
    return this.playerName;
  }
  get id() {
    return this.playerId;
  }
  get score() {
    return this.playerScore;
  }
  get hand() {
    return this.playerHand;
  }
  get wind() {
    return this.selfWind;
  }
  get isRiichi() {
    return this.currentYakuInfo.isRiichi || false;
  }
  set isRiichi(value: boolean) {
    this.currentYakuInfo.isRiichi = value;
  }
  get meldTiles(): MeldData[] {
    return (
      this.currentUsedAction.filter(a => {
        return (
          [PlayerActionType.Chii, PlayerActionType.Pon, PlayerActionType.Kan].includes(a.type) &&
          a.payload != null &&
          typeof a.payload === 'object' &&
          'tiles' in a.payload
        );
      }) as {
        type: PlayerActionType.Chii | PlayerActionType.Pon | PlayerActionType.Kan;
        payload: { tiles: MahjongTiles[]; isOpen?: boolean };
      }[]
    ).map(a => ({
      type: a.type,
      tiles: a.payload.tiles,
      isOpen: a.payload.isOpen ?? true,
    }));
  }
  setTiles = (tiles: MahjongTiles[]) => {
    this.playerHand = new MahjongHand(tiles);
  };
  addTile = (tile: MahjongTiles) => {
    this.playerHand.add(tile);
  };
  markCurrentPlayerTurn = (table: Table) => {
    if (this.isRiichi) {
      // Riichi Special Rule Detection
      // Implement Later
    } else {
      this.currentTable = table;
      this.isMyTurn = true;
    }
  };
  useAction = (action: PlayerAction) => {
    if (!this.isMyTurn) {
      throw new Error("It's not your turn");
    }
    const currentUsedActionTypes = this.currentUsedAction.map(a => a.type);
    if (this.currentAvailableActions.filter(a => currentUsedActionTypes.includes(a)).length === 0) {
      this.isMyTurn = false;
      this.currentTable?.playerFinishTurn(this.currentUsedAction);
      this.currentTable = null;
    }
    let isEndTurn = false;
    switch (action.type) {
      case PlayerActionType.DiscardTile: {
        const { index, tile: tileData } = action.payload;
        if (!tileData || !index) {
          throw new Error('Tile and index are required for DrawTile action');
        }
        const tile = Number.isInteger(index) ? this.hand.use(index) : tileData;
        this.currentUsedAction.push({
          type: PlayerActionType.DiscardTile,
          payload: { tile },
        });
        break;
      }
      case PlayerActionType.RIICHI: {
        this.currentUsedAction.push({ type: PlayerActionType.RIICHI, payload: undefined });
        isEndTurn = true;
        this.isRiichi = true;
        break;
      }
      case PlayerActionType.Chii: {
        const { tiles } = action.payload;
        if (!tiles || tiles.length !== 2) {
          throw new Error('Two tiles are required for Chii action');
        }
        const lastDiscardTile = this.currentTable?.roundInfo?.lastDiscardTile;
        if (!lastDiscardTile) {
          throw new Error('No tile to Chii');
        }
        const testTiles = [lastDiscardTile, ...tiles].sort((a, b) => {
          if (a.getSuit() !== b.getSuit()) {
            return a.getSuit() - b.getSuit();
          }
          return a.getNumber() - b.getNumber();
        });
        if (
          testTiles.every(
            (tile, index) =>
              tile.getSuit() === testTiles[0].getSuit() &&
              tile.getNumber() === testTiles[0].getNumber() + index
          )
        ) {
          throw new Error('Invalid tiles for Chii');
        }
        tiles.forEach(tile => this.hand.use({ suit: tile.getSuit(), number: tile.getNumber() }));
        this.currentUsedAction.push({ type: PlayerActionType.Chii, payload: { tiles } });
        isEndTurn = true;
        this.currentYakuInfo.isConcealed = false;
        this.currentYakuInfo.isFuro = true;
        break;
      }
      case PlayerActionType.Pon: {
        const { tiles } = action.payload;
        if (!tiles || tiles.length !== 2) {
          throw new Error('Two tiles are required for Pon action');
        }
        const lastDiscardTile = this.currentTable?.roundInfo?.lastDiscardTile;
        if (!lastDiscardTile) {
          throw new Error('No tile to Pon');
        }
        if (
          !tiles.every(
            tile =>
              tile.getSuit() === lastDiscardTile.getSuit() &&
              tile.getNumber() === lastDiscardTile.getNumber()
          )
        ) {
          throw new Error('Invalid tiles for Pon');
        }
        tiles.forEach(tile => this.hand.use({ suit: tile.getSuit(), number: tile.getNumber() }));
        this.currentUsedAction.push({ type: PlayerActionType.Pon, payload: { tiles } });
        isEndTurn = true;
        this.currentYakuInfo.isConcealed = false;
        this.currentYakuInfo.isFuro = true;
        break;
      }
      case PlayerActionType.Kan: {
        const { tiles } = action.payload;
        if (!tiles || (tiles.length !== 3 && tiles.length !== 4)) {
          throw new Error('three or four tiles are required for Kan action');
        }
        const isOpen = tiles.length === 3;
        if (isOpen) {
          const lastDiscardTile = this.currentTable?.roundInfo?.lastDiscardTile;
          if (!lastDiscardTile) {
            throw new Error('No tile to Kan');
          }
          if (
            !tiles.every(
              tile =>
                tile.getSuit() === lastDiscardTile.getSuit() &&
                tile.getNumber() === lastDiscardTile.getNumber()
            )
          ) {
            throw new Error('Invalid tiles for Kan');
          }
        } else {
          const firstTile = tiles[0];
          if (
            !tiles.every(
              tile =>
                firstTile.getSuit() === tile.getSuit() && firstTile.getNumber() === tile.getNumber()
            )
          ) {
            throw new Error('Invalid tiles for Kan');
          }
        }
        tiles.forEach(tile => this.hand.use({ suit: tile.getSuit(), number: tile.getNumber() }));
        this.currentUsedAction.push({ type: PlayerActionType.Kan, payload: { tiles, isOpen } });
        if (isOpen) {
          this.currentYakuInfo.isConcealed = false;
          this.currentYakuInfo.isFuro = true;
        }
        isEndTurn = true;
        break;
      }
      case PlayerActionType.Ron: {
        // Just Check is Player Have Yaku And Not In Furiten
        const TableRoundInfo = this.currentTable?.roundInfo;
        const check = new YakuChecker(tilesToGroups(this.playerHand.allTiles), {
          ...this.currentYakuInfo,
          ...TableRoundInfo,
          previousHandTiles: [TableRoundInfo?.lastDiscardTile],
          usedTileHistory: this.hand.getUsedTiles(),
          selfWind: this.selfWind,
        } as YakuInfo);
        const checkResult = check.check();
        if (checkResult.size === 0) {
          throw new Error('No Yaku, cannot Ron');
        }
        this.currentUsedAction.push({ type: PlayerActionType.Ron, payload: undefined });
        isEndTurn = true;
        break;
      }
      case PlayerActionType.Tsumo: {
        // Just Check is Player Have Yaku
        const TableRoundInfo = this.currentTable?.roundInfo;
        const check = new YakuChecker(tilesToGroups(this.playerHand.allTiles), {
          ...this.currentYakuInfo,
          ...TableRoundInfo,
          previousHandTiles: [TableRoundInfo?.lastDiscardTile],
          usedTileHistory: this.hand.getUsedTiles(),
          selfWind: this.selfWind,
          isTsumo: true,
        } as YakuInfo);
        const checkResult = check.check();
        if (checkResult.size === 0) {
          throw new Error('No Yaku, cannot Tsumo');
        }
        this.currentUsedAction.push({ type: PlayerActionType.Tsumo, payload: undefined });
        isEndTurn = true;
        break;
      }
      default: {
        throw new Error('Invalid action');
      }
    }
    if (isEndTurn) {
      this.isMyTurn = false;
      this.currentTable?.playerFinishTurn(this.currentUsedAction);
      this.currentTable = null;
      //Implement Check Function To make sure it can call when Player Can Act
      this.playerAcceptTilesForAction = [];
    }
  };
  /*
  useTile = ({ index, tile }: UseTile) => {
    if (index === undefined && tile === undefined) {
      throw new Error('Either index or tile must be provided');
    }
    if (typeof index === 'number') {
      if (index < 0 || index >= this.playerHand.length) {
        throw new Error('Invalid tile index');
      }
    }
    if (tile) {
      if (!tile.suit || !tile.number) {
        throw new Error('Tile must have a suit and number');
      }
      this.playerHand.use(tile);
      //this.useTileFunction?.(tile);
    }
  };*/
}
