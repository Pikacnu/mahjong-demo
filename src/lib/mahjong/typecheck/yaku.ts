import { MahjongYakuTypes, MahjongSimpleUnits, Checker } from './index';
import { MahjongSuits } from '../type';
import { MahjongTiles } from '../tiles/index';

export enum WaitingType {
  /*兩面聽*/
  Ryanmen = 'ryanmen',
  /*槓嵌聽*/
  Kanchan = 'kanchan',
  /*邊張聽*/
  Penchan = 'penchan',
  /*雙碰聽*/
  Shanpon = 'shanpon',
  /*單騎聽*/
  Tanki = 'tanki',
  /*放銃*/
  Houju = 'houju',
  /* 任意聽*/
  Any = 'any',
}

export enum DynamicRequirementEntry {
  Jihai = 'jihai',
  Bakaze = 'bakaze',
}

type WithId<T> = T & { id: number };

type WithRegroupAble<T> = T & { canRegroup: boolean };

export interface Requirement {
  // Minimum Units
  minUnits?: Partial<Record<MahjongSimpleUnits, number>>;
  // This Will use as repeat count in
  // - Inside (Check each unit)
  unitRepeat?: number;
  // maxUnits?: Partial<Record<MahjongSimpleUnits, number>>;

  // For Custom Order
  customCheckUnitOrder?: MahjongSimpleUnits[];

  // Shouldn't Appear
  filteredNumbers?: number[];
  filteredSuits?: MahjongSuits[];

  // Need to Appear
  allowedSuits?: MahjongSuits[];
  allowedNumbers?: number[];
  allowedTiles?: MahjongTiles[];

  // Should Appear And Full of
  requiredTiles?: MahjongTiles[];
  requiredSuits?: MahjongSuits[];
  requiredNumbers?: number[];

  // Other Conditions
  requiredIttsuu?: boolean;
  isOpen?: boolean;
  dynamicRequirement?: DynamicRequirementEntry[];

  // Operate
  toIttsuu?: boolean;
  /** This Will use as repeat count in
   * - Outside (Check all requirement) */
  repeat?: number;
}

export interface RonRequirements {
  /** 和牌方式 */
  requires?: Requirement[];
  /** 必須門清 */
  requireConcealed?: boolean;
  /** 必須副露 */
  requireOpen?: boolean;
  /** 必須自摸 */
  requiredTsumo?: boolean;
  /** 必須同色 */
  requiredIttsuu?: boolean;
  /** 等待牌型 */
  waitingType?: WaitingType;
  /** 需要是最後一巡 */
  requiredLastRound?: boolean;
  /** 需要是第一巡 */
  requiredFirstRound?: boolean;
  /** Requirement 是 OR */
  isOr?: boolean;
  /** 和牌前一巡手牌(For 國士無雙) */
  requiredHandsTiles?: MahjongTiles[] | Requirement[];
  /** requires 相同條件重複 N 次 */
  repeat?: number;
  /** 特殊判定 */
  specialCondition?: (args: {
    tiles: MahjongTiles[];
    suits: Partial<Record<string, MahjongTiles[]>>;
    units: Record<MahjongSimpleUnits, MahjongTiles[][]>;
    tileGroups: CheckTilesGroup[];
    infos: YakuInfo;
  }) => boolean;
}

export class YakuRequirementRegistry {
  private static instance: YakuRequirementRegistry;
  private registry = new Map<MahjongYakuTypes, RonRequirements>();

  private constructor() {}

  public static getInstance(): YakuRequirementRegistry {
    if (!YakuRequirementRegistry.instance) {
      YakuRequirementRegistry.instance = new YakuRequirementRegistry();
    }
    return YakuRequirementRegistry.instance;
  }
  public register(
    ronType: MahjongYakuTypes,
    requirements: RonRequirements,
  ): void {
    this.registry.set(ronType, requirements);
  }
  public remove(ronType: MahjongYakuTypes): boolean {
    return this.registry.delete(ronType);
  }

  public has(ronType: MahjongYakuTypes): boolean {
    return this.registry.has(ronType);
  }

  public get(ronType: MahjongYakuTypes): RonRequirements | undefined {
    return this.registry.get(ronType);
  }

  public keys(): IterableIterator<MahjongYakuTypes> {
    return this.registry.keys();
  }

  public clear(): void {
    this.registry.clear();
  }
}

export const yakuRequirementRegistry = YakuRequirementRegistry.getInstance();

export type YakuInfo = {
  /** 是否門清 */
  isConcealed?: boolean;
  /** 是否副露 */
  isFuro?: boolean;
  /** 是否有任意一人副露 */
  isAnyOneOpen?: boolean;
  /** 是否立直 */
  isRiichi?: boolean;
  /** 是否自摸 */
  isTsumo?: boolean;
  /** 是否一色 */
  isIttsuu?: boolean;
  /** 是否為第一巡 */
  isFirstRound?: boolean;
  /** 是否為最後一巡 */
  isLastRound?: boolean;
  /** 自風 */
  jihai?: MahjongTiles;
  /** 場風 */
  bakaze?: MahjongTiles;
  /** 聽牌型態 */
  waitingType?: WaitingType;
  /** 和牌前一巡手牌(For 國士無雙) */
  previousHandTiles?: MahjongTiles[];
  /** 丟牌歷史(For 振聽) */
  usedTileHistory?: MahjongTiles[];
};

export enum GroupType {
  Shuntsu = 'shuntsu',
  Koutsu = 'koutsu',
  Kantsu = 'kantsu',
  Toitsu = 'toitsu',
  None = 'none',
}

export const SimpleUnitTypeToGroupType: Record<MahjongSimpleUnits, GroupType> =
  {
    [MahjongSimpleUnits.Shuntsu]: GroupType.Shuntsu,
    [MahjongSimpleUnits.Koutsu]: GroupType.Koutsu,
    [MahjongSimpleUnits.Toitsu]: GroupType.Toitsu,
    [MahjongSimpleUnits.Kantsu]: GroupType.Kantsu,
    [MahjongSimpleUnits.RyanmenTatsu]: GroupType.None,
    [MahjongSimpleUnits.Ippatsu]: GroupType.None,
  };

export type CheckTilesGroup = {
  type: GroupType;
  tiles: MahjongTiles[];
  isOpen?: boolean;
};

export class YakuChecker {
  private units: Record<MahjongSimpleUnits, MahjongTiles[][]> = {
    [MahjongSimpleUnits.Shuntsu]: [],
    [MahjongSimpleUnits.Koutsu]: [],
    [MahjongSimpleUnits.Toitsu]: [],
    [MahjongSimpleUnits.Kantsu]: [],
    [MahjongSimpleUnits.RyanmenTatsu]: [],
    [MahjongSimpleUnits.Ippatsu]: [],
  };
  private tileGroups: WithId<WithRegroupAble<CheckTilesGroup>>[];
  //private tiles: MahjongTiles[] = [];
  private yakuCheckSet: Set<MahjongYakuTypes> = new Set();
  private infos: YakuInfo = {};

  constructor(
    tileGroups: CheckTilesGroup[],
    infos: YakuInfo,
    yakuCheckSet?: Set<MahjongYakuTypes>,
  ) {
    this.tileGroups = tileGroups.map((g, i) => ({
      ...g,
      canRegroup: false,
      id: i,
    }));
    this.yakuCheckSet = yakuCheckSet || new Set(yakuRequirementRegistry.keys());
    this.infos = infos;
    this.initUnits();
  }

  public getUnits() {
    return this.units;
  }

  private initUnits() {
    const checker = new Checker(
      this.tileGroups
        .filter((g) => g.type === GroupType.None)
        .flatMap((g) => g.tiles),
    );
    this.units = checker.checkUnitsByOrder();
    const unitsToTileGroups = Object.entries(this.units)
      .filter(
        ([unitType, tiles]) =>
          tiles.length > 0 &&
          ![
            MahjongSimpleUnits.RyanmenTatsu,
            MahjongSimpleUnits.Ippatsu,
          ].includes(Number(unitType) as MahjongSimpleUnits),
      )
      .flatMap(([unitType, tiles], index) =>
        tiles.map((tileGroup) => ({
          type: SimpleUnitTypeToGroupType[
            Number(unitType) as MahjongSimpleUnits
          ],
          tiles: tileGroup,
          isOpen: false,
          id: this.tileGroups.length + index,
          canRegroup: true,
        })),
      );
    this.tileGroups = this.tileGroups.concat(unitsToTileGroups);
  }

  private sortBySuit(
    tiles: MahjongTiles[],
  ): Partial<Record<string, MahjongTiles[]>> {
    return tiles.reduce((acc, tile) => {
      const suit = tile.getSuit();
      if (!acc[suit]) {
        acc[suit] = [];
      }
      acc[suit].push(tile);
      return acc;
    }, {} as Partial<Record<string, MahjongTiles[]>>);
  }

  public check() {
    const results: Map<
      MahjongYakuTypes,
      WithId<WithRegroupAble<CheckTilesGroup>>[]
    > = new Map();
    for (const yakuType of this.yakuCheckSet) {
      if (yakuRequirementRegistry.has(yakuType)) {
        const result = this.checkYaku(yakuType);
        if (result !== false) {
          results.set(yakuType, result);
        }
      } else {
        throw new Error(`Yaku type ${yakuType} not registered`);
      }
    }
    return results;
  }

  private checkYaku(
    yakuType: MahjongYakuTypes,
  ): false | WithId<WithRegroupAble<CheckTilesGroup>>[] {
    const requirements = yakuRequirementRegistry.get(yakuType);
    if (!requirements) {
      throw new Error(`Yaku requirements for ${yakuType} not found`);
    }
    if (!Object.values(this.units).some((tiles) => tiles.length > 0))
      return false;
    const {
      requires,
      requireConcealed,
      requireOpen,
      requiredTsumo,
      requiredIttsuu,
      isOr,
      requiredHandsTiles,
      repeat,
      requiredFirstRound,
      requiredLastRound,
      waitingType,
      specialCondition,
    } = requirements;

    if (requiredIttsuu) {
      const firstTileSuit = this.tileGroups[0].tiles[0].getSuit();
      if (
        !this.tileGroups.every((g) =>
          g.tiles.every((t) => t.getSuit() === firstTileSuit),
        )
      ) {
        return false;
      }
    }
    if (requireConcealed && !this.infos.isConcealed) {
      return false;
    }
    if (requireOpen && !this.infos.isFuro) {
      return false;
    }
    if (requiredTsumo && !this.infos.isTsumo) {
      return false;
    }
    if (requiredFirstRound && !this.infos.isFirstRound) {
      return false;
    }
    if (requiredLastRound && !this.infos.isLastRound) {
      return false;
    }
    if (
      waitingType &&
      waitingType !== WaitingType.Any &&
      this.infos.waitingType !== waitingType
    ) {
      return false;
    }

    if (specialCondition !== undefined) {
      // 對於 specialCondition，只使用原始的牌組（canRegroup: false），不包括重新組織的牌
      const originalTiles = this.tileGroups
        .filter((g) => !g.canRegroup)
        .flatMap((g) => g.tiles);
      return specialCondition({
        tiles: originalTiles,
        units: this.units,
        suits: this.sortBySuit(originalTiles),
        infos: this.infos,
        tileGroups: this.tileGroups,
      })
        ? this.tileGroups
        : false;
    }

    let matchedTiles: WithId<WithRegroupAble<CheckTilesGroup>>[] = [];

    let isValid = true;

    if (requiredHandsTiles && Array.isArray(requiredHandsTiles)) {
      if (requiredHandsTiles[0] instanceof MahjongTiles) {
        // Need Implement
      }
      const isRequirement = (
        requirement: unknown,
      ): requirement is Requirement => {
        return typeof requirement === 'object' && requirement !== null;
      };
      const checkedRequiredHandsTiles = isRequirement(requiredHandsTiles)
        ? (requiredHandsTiles as Requirement[])
        : undefined;
      if (checkedRequiredHandsTiles) {
        for (const requirement of checkedRequiredHandsTiles) {
          const [valid] = this.checkRequirements(requirement, this.tileGroups);
          if (!valid) {
            isValid = false;
          }
        }
      }
    }

    if (!requires) {
      return isValid ? matchedTiles : false;
    }

    let requirementRepeatCount = 1;
    if (repeat && typeof repeat === 'number') {
      requirementRepeatCount = repeat;
    }
    if (!isValid) {
      return false;
    }

    let currentTileGroups: WithId<WithRegroupAble<CheckTilesGroup>>[] =
      this.tileGroups;

    for (let i = 0; i < requirementRepeatCount; i++) {
      if (!requires || requires.length === 0) {
        break;
      }
      if (isOr && requires && requires.length > 0) {
        let orResult = false;
        for (const requirement of requires) {
          const [valid, matched] = this.checkRequirements(
            requirement,
            currentTileGroups,
          );
          if (valid) {
            orResult = true;
            matchedTiles = matchedTiles.concat(matched);
            break; // Found one valid requirement, that's enough for OR
          }
        }
        isValid = isValid && orResult;
      } else {
        for (const requirement of requires || []) {
          const repeatCount = requirement.repeat || 1;
          for (let j = 0; j < repeatCount; j++) {
            const [valid, matched] = this.checkRequirements(
              requirement,
              currentTileGroups,
            );
            if (!valid) {
              isValid = false;
              break;
            }
            const tileGroupsNeedToRemove = matched.filter(
              (g) => g.id / 10000 < 1,
            );
            const tilesNeedToRemove = matched.filter((g) => g.id / 10000 >= 1);
            matchedTiles = matchedTiles.concat(tileGroupsNeedToRemove);
            currentTileGroups = currentTileGroups.filter(
              (g) => !tileGroupsNeedToRemove.includes(g),
            );
            if (tilesNeedToRemove.length > 0) {
              matchedTiles = matchedTiles.concat(tilesNeedToRemove);
              const canRegroupTileGroup = currentTileGroups.filter(
                (g) => g.canRegroup,
              );
              const flatenCanRegroupTiles = canRegroupTileGroup.flatMap(
                (g) => g.tiles,
              );
              for (const tile of tilesNeedToRemove.flatMap((g) => g.tiles)) {
                const tileIndex = flatenCanRegroupTiles.findIndex(
                  (t) => t && t.isEqual(tile),
                );
                if (tileIndex !== -1) {
                  flatenCanRegroupTiles[tileIndex] =
                    null as unknown as MahjongTiles;
                }
              }
              const newFlatenCanRegroupTiles = flatenCanRegroupTiles.filter(
                (t) => t !== null,
              );
              const newChecker = new Checker(newFlatenCanRegroupTiles);
              const newUnits = newChecker.checkUnitsByOrder();
              const newTileGroups = Object.entries(newUnits).filter(
                ([, tiles]) =>
                  tiles.length > 0 ||
                  ![
                    MahjongSimpleUnits.RyanmenTatsu,
                    MahjongSimpleUnits.Ippatsu,
                  ].includes(tiles as unknown as MahjongSimpleUnits),
              );
              currentTileGroups = currentTileGroups.filter(
                (g) => !g.canRegroup,
              );
              currentTileGroups = currentTileGroups.concat(
                newTileGroups.flatMap(([unitType, tiles], index) =>
                  tiles.map((tileGroup) => ({
                    type: SimpleUnitTypeToGroupType[
                      Number(unitType) as MahjongSimpleUnits
                    ],
                    tiles: tileGroup,
                    isOpen: false,
                    id: 10000 * (index + 1),
                    canRegroup: true,
                  })),
                ),
              );
            }
          }
          if (repeatCount > 1 && matchedTiles.length === 0) {
            isValid = false;
          }
          if (!isValid) break;
        }
      }
    }
    return isValid ? matchedTiles : false;
  }

  private checkRequirements(
    requirement: Requirement,
    tileGroups: WithId<WithRegroupAble<CheckTilesGroup>>[],
  ): [boolean, WithId<WithRegroupAble<CheckTilesGroup>>[]] {
    const matchedGroupIds: WithId<WithRegroupAble<CheckTilesGroup>>[] = [];
    const {
      minUnits,
      allowedSuits,
      allowedNumbers,
      allowedTiles,
      requiredTiles,
      requiredSuits,
      requiredNumbers,
      filteredNumbers,
      requiredIttsuu,
      customCheckUnitOrder,
      isOpen, // wait for implement
      unitRepeat,
      dynamicRequirement,
      toIttsuu,
    } = requirement;
    let isValid = true;

    let currentTileGroups = [...tileGroups];

    if (customCheckUnitOrder && customCheckUnitOrder.length > 0) {
      const reGroupableTileGroups = currentTileGroups.filter(
        (g) => g.canRegroup,
      );
      currentTileGroups = currentTileGroups.filter((g) => !g.canRegroup);
      const checker = new Checker(
        reGroupableTileGroups.flatMap((g) => g.tiles),
      );
      currentTileGroups = currentTileGroups.concat(
        Object.entries(checker.checkUnitsByOrder(customCheckUnitOrder)).flatMap(
          ([type, tiles], index) =>
            tiles.map((tileGroup) => ({
              type: SimpleUnitTypeToGroupType[
                Number(type) as MahjongSimpleUnits
              ],
              tiles: tileGroup,
              isOpen: false,
              id: 10000 * (index + 1),
              canRegroup: true,
            })),
        ),
      );
    }

    if (filteredNumbers) {
      const filteredGroup = currentTileGroups.filter((g) =>
        g.tiles.every((tile) => !filteredNumbers.includes(tile.getNumber())),
      );
      if (currentTileGroups.length !== filteredGroup.length) {
        isValid = false;
      }
      currentTileGroups = filteredGroup;
    }
    if (allowedSuits) {
      currentTileGroups = currentTileGroups.filter((g) =>
        g.tiles.every((tile) => allowedSuits.includes(tile.getSuit())),
      );
    }
    if (allowedNumbers) {
      currentTileGroups = currentTileGroups.filter((g) =>
        g.tiles.every((tile) => allowedNumbers.includes(tile.getNumber())),
      );
    }
    if (allowedTiles) {
      currentTileGroups = currentTileGroups.filter((g) =>
        g.tiles.every((tile) => allowedTiles.includes(tile)),
      );
    }

    if (requiredIttsuu && currentTileGroups.length > 0) {
      const firstSuit = currentTileGroups[0].tiles[0].getSuit();
      currentTileGroups = currentTileGroups.filter((g) =>
        g.tiles.every((tile) => tile.getSuit() === firstSuit),
      );
    }
    if (requiredTiles) {
      const flattenedCurrentTiles = currentTileGroups.flatMap((g) => g.tiles);
      if (
        requiredTiles.every((reqTile) =>
          flattenedCurrentTiles.some((t) => t.isEqual(reqTile)),
        )
      ) {
        currentTileGroups = currentTileGroups.filter((g) =>
          g.tiles.every((tile) =>
            requiredTiles.some((reqTile) =>
              tile.isEqual(reqTile, {
                ignoreRed: true,
                ignoreSuit: !!allowedSuits || !!requiredSuits,
                ignoreNumber: !!allowedNumbers || !!requiredNumbers,
              }),
            ),
          ),
        );
      }
    }
    if (requiredSuits) {
      const flattenedCurrentTiles = currentTileGroups.flatMap((g) => g.tiles);
      if (
        requiredSuits.every((reqSuit) =>
          flattenedCurrentTiles.some((t) => t.getSuit() === reqSuit),
        )
      ) {
        currentTileGroups = currentTileGroups.filter((g) =>
          g.tiles.every((tile) => requiredSuits.includes(tile.getSuit())),
        );
      }
    }
    if (requiredNumbers) {
      const flattenedCurrentTiles = currentTileGroups.flatMap((g) => g.tiles);
      if (
        requiredNumbers.every((reqNumber) =>
          flattenedCurrentTiles.some((t) => t.getNumber() === reqNumber),
        )
      ) {
        currentTileGroups = currentTileGroups.filter((g) =>
          g.tiles.every((tile) => requiredNumbers.includes(tile.getNumber())),
        );
      }
    }
    if (
      isOpen !== undefined &&
      this.tileGroups.some((g) => g.isOpen !== isOpen)
    ) {
      isValid = false;
    }

    if (currentTileGroups.length === 0) {
      return [false, [] as WithId<WithRegroupAble<CheckTilesGroup>>[]];
    }

    if (dynamicRequirement) {
      for (const entry of dynamicRequirement) {
        switch (entry) {
          case DynamicRequirementEntry.Jihai: {
            const jihai = this.infos.jihai;
            if (!jihai) {
              isValid = false;
            } else {
              currentTileGroups = currentTileGroups.filter((group) =>
                group.tiles.every((tile) => tile.isEqual(jihai)),
              );
            }
            break;
          }
          case DynamicRequirementEntry.Bakaze: {
            const bakaze = this.infos.bakaze;
            if (!bakaze) {
              isValid = false;
            } else {
              currentTileGroups = currentTileGroups.filter((group) =>
                group.tiles.every((tile) => tile.isEqual(bakaze)),
              );
            }
            break;
          }
          default:
            console.warn(`Unknown dynamic requirement entry: ${entry}`);
            isValid = false;
            break;
        }
      }
    }
    // *Need To Know What is this Condition*
    if (toIttsuu) {
      const firstSuit = currentTileGroups[0].tiles[0].getSuit();
      currentTileGroups = currentTileGroups.filter(
        (group) => group.tiles[0].getSuit() === firstSuit,
      );
    }

    let unitRepeatCount = unitRepeat || 1;
    if (unitRepeatCount < 1) unitRepeatCount = 1;

    const isIgnoreSuit = !!allowedSuits || !!requiredSuits;
    const isIgnoreNumber = !!allowedNumbers || !!requiredNumbers;

    if (minUnits) {
      const currentProcessingGroups = [...currentTileGroups];
      const previousProcessingUnitsGroups: WithId<
        WithRegroupAble<CheckTilesGroup>
      >[] = [];
      for (let i = 0; i < unitRepeatCount; i++) {
        for (const [unit, count] of Object.entries(minUnits)) {
          // For unitRepeat > 1, we need to allow the same groups to be selected multiple times
          // to compare if they are identical (like in Iipeikou)
          const selectedGroup = currentProcessingGroups.filter(
            (g) =>
              g.type ===
                SimpleUnitTypeToGroupType[
                  unit as unknown as MahjongSimpleUnits
                ] &&
              (unitRepeatCount === 1
                ? !matchedGroupIds.some((mg) => mg.id === g.id)
                : true),
          );

          // For unitRepeat, check if we have enough groups of this type
          if (selectedGroup.length < count) {
            isValid = false;
          }

          // For first iteration, just take the first 'count' groups
          // For subsequent iterations, take the next 'count' groups (if available)
          const startIndex = i * count;
          const currentSelection = selectedGroup.slice(
            startIndex,
            startIndex + count,
          );

          if (currentSelection.length < count) {
            isValid = false;
          }

          matchedGroupIds.push(...currentSelection);

          if (unitRepeatCount > 1 && i > 0) {
            const last = previousProcessingUnitsGroups.slice(
              previousProcessingUnitsGroups.length - count,
            );
            if (last.length === 0) {
              isValid = false;
              continue;
            }
            const curr = currentSelection;
            isValid =
              isValid &&
              last.length === curr.length &&
              last.every((tileGroup, index) =>
                tileGroup.tiles.every((tile) =>
                  curr[index].tiles.some((currTile) =>
                    currTile.isEqual(tile, {
                      ignoreRed: true,
                      ignoreSuit: isIgnoreSuit,
                      ignoreNumber: isIgnoreNumber,
                    }),
                  ),
                ),
              );
            // console.log(`Unit ${unit} is valid: ${isValid}`);
          }
          previousProcessingUnitsGroups.push(...currentSelection);
        }
      }
    }
    return [isValid, matchedGroupIds];
  }
}
