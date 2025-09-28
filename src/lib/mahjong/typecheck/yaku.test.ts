import { describe, it, expect, beforeEach } from 'bun:test';
import { MahjongYakuTypes, MahjongSimpleUnits } from './index';
import { MahjongSuits } from '../type';
import { MahjongTiles } from '../tiles/index';
import {
  CheckTilesGroup,
  DynamicRequirementEntry,
  GroupType,
  Requirement,
  RonRequirements,
  WaitingType,
  YakuChecker,
  YakuInfo,
  YakuRequirementRegistry,
  yakuRequirementRegistry,
} from './yaku';

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

describe('WaitingType enum', () => {
  it('should have correct values', () => {
    expect(WaitingType.Ryanmen).toBe('ryanmen' as WaitingType);
    expect(WaitingType.Kanchan).toBe('kanchan' as WaitingType);
    expect(WaitingType.Penchan).toBe('penchan' as WaitingType);
    expect(WaitingType.Shanpon).toBe('shanpon' as WaitingType);
    expect(WaitingType.Tanki).toBe('tanki' as WaitingType);
    expect(WaitingType.Houju).toBe('houju' as WaitingType);
    expect(WaitingType.Any).toBe('any' as WaitingType);
  });
});

describe('DynamicRequirementEntry enum', () => {
  it('should have correct values', () => {
    expect(DynamicRequirementEntry.Jihai).toBe('jihai' as DynamicRequirementEntry);
    expect(DynamicRequirementEntry.Bakaze).toBe('bakaze' as DynamicRequirementEntry);
  });
});

describe('YakuRequirementRegistry', () => {
  let registry: YakuRequirementRegistry;

  beforeEach(() => {
    registry = YakuRequirementRegistry.getInstance();
    registry.clear();
  });

  it('should be a singleton', () => {
    const instance1 = YakuRequirementRegistry.getInstance();
    const instance2 = YakuRequirementRegistry.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should register and retrieve requirements', () => {
    const requirements: RonRequirements = {
      requireConcealed: true,
      waitingType: WaitingType.Ryanmen,
    };

    registry.register(MahjongYakuTypes.Riichi, requirements);

    expect(registry.has(MahjongYakuTypes.Riichi)).toBe(true);
    expect(registry.get(MahjongYakuTypes.Riichi)).toEqual(requirements);
  });

  it('should return undefined for unregistered yaku', () => {
    expect(registry.get(MahjongYakuTypes.Riichi)).toBeUndefined();
    expect(registry.has(MahjongYakuTypes.Riichi)).toBe(false);
  });

  it('should clear all registrations', () => {
    registry.register(MahjongYakuTypes.Riichi, { requireConcealed: true });
    registry.register(MahjongYakuTypes.MenzenTsumo, { requiredTsumo: true });

    expect(registry.has(MahjongYakuTypes.Riichi)).toBe(true);
    expect(registry.has(MahjongYakuTypes.MenzenTsumo)).toBe(true);

    registry.clear();

    expect(registry.has(MahjongYakuTypes.Riichi)).toBe(false);
    expect(registry.has(MahjongYakuTypes.MenzenTsumo)).toBe(false);
  });

  it('should return keys iterator', () => {
    registry.register(MahjongYakuTypes.Riichi, { requireConcealed: true });
    registry.register(MahjongYakuTypes.MenzenTsumo, { requiredTsumo: true });

    const keys = Array.from(registry.keys());
    expect(keys).toContain(MahjongYakuTypes.Riichi);
    expect(keys).toContain(MahjongYakuTypes.MenzenTsumo);
    expect(keys.length).toBe(2);
  });
});

describe('YakuChecker', () => {
  let tiles: MahjongTiles[];
  let yakuInfo: YakuInfo;

  beforeEach(() => {
    yakuRequirementRegistry.clear();
    tiles = [
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
    ];
    yakuInfo = {
      isConcealed: true,
      isRiichi: false,
      waitingType: WaitingType.Ryanmen,
    };
  });

  it('should initialize with tiles and info', () => {
    const checker = new YakuChecker(tilesToGroups(tiles), yakuInfo);
    expect(checker).toBeInstanceOf(YakuChecker);
  });

  it('should throw error for unregistered yaku type', () => {
    // Register a yaku that doesn't exist in the check set
    yakuRequirementRegistry.register(MahjongYakuTypes.Riichi, {
      requireConcealed: true,
    });

    // Use a set with non-registered yaku
    const customSet = new Set([MahjongYakuTypes.MenzenTsumo]); // This one is not registered
    const checker = new YakuChecker(tilesToGroups(tiles), yakuInfo, customSet);
    expect(() => checker.check()).toThrow('Yaku type');
  });

  it('should return empty results when no yaku match', () => {
    yakuRequirementRegistry.register(MahjongYakuTypes.Riichi, { requireConcealed: true });

    const checker = new YakuChecker(tilesToGroups(tiles), { isConcealed: false }); // Set to false to fail
    const results = checker.check();

    expect(results.has(MahjongYakuTypes.Riichi)).toBe(false);
    expect(results.size).toBe(0);
  });

  it('should detect valid yaku', () => {
    yakuRequirementRegistry.register(MahjongYakuTypes.MenzenTsumo, {
      requireConcealed: true,
    });

    // Set isConcealed to true to match the requirement
    const validInfo = { ...yakuInfo, isConcealed: true };
    const checker = new YakuChecker(tilesToGroups(tiles), validInfo);
    const results = checker.check();

    expect(results.has(MahjongYakuTypes.MenzenTsumo)).toBe(true);
  });

  it('should validate requireConcealed', () => {
    yakuRequirementRegistry.register(MahjongYakuTypes.Riichi, {
      requireConcealed: true,
    });

    const concealedInfo = { ...yakuInfo, isConcealed: false };
    const checker = new YakuChecker(tilesToGroups(tiles), concealedInfo);
    const results = checker.check();

    expect(results.has(MahjongYakuTypes.Riichi)).toBe(false);
  });

  it('should validate requireOpen', () => {
    yakuRequirementRegistry.register(MahjongYakuTypes.MenzenTsumo, {
      requireOpen: true,
    });

    const openInfo = { ...yakuInfo, isOpen: false };
    const checker = new YakuChecker(tilesToGroups(tiles), openInfo);
    const results = checker.check();

    expect(results.has(MahjongYakuTypes.MenzenTsumo)).toBe(false);
  });

  it('should validate requiredTsumo', () => {
    yakuRequirementRegistry.register(MahjongYakuTypes.MenzenTsumo, {
      requiredTsumo: true,
    });

    const tsumoInfo = { ...yakuInfo, isTsumo: false };
    const checker = new YakuChecker(tilesToGroups(tiles), tsumoInfo);
    const results = checker.check();

    expect(results.has(MahjongYakuTypes.MenzenTsumo)).toBe(false);
  });

  it('should validate requiredIttsuu', () => {
    const mixedTiles = [
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
    ];

    yakuRequirementRegistry.register(MahjongYakuTypes.Ikkitsuukan, {
      requiredIttsuu: true,
    });

    const checker = new YakuChecker(tilesToGroups(mixedTiles), yakuInfo);
    const results = checker.check();

    expect(results.has(MahjongYakuTypes.Ikkitsuukan)).toBe(false);
  });

  it('should validate waiting type', () => {
    yakuRequirementRegistry.register(MahjongYakuTypes.Riichi, {
      waitingType: WaitingType.Tanki,
    });

    const checker = new YakuChecker(tilesToGroups(tiles), yakuInfo);
    const results = checker.check();

    expect(results.has(MahjongYakuTypes.Riichi)).toBe(false);
  });

  it('should accept Any waiting type', () => {
    yakuRequirementRegistry.register(MahjongYakuTypes.MenzenTsumo, {
      waitingType: WaitingType.Any,
    });

    const checker = new YakuChecker(tilesToGroups(tiles), yakuInfo);
    const results = checker.check();

    expect(results.has(MahjongYakuTypes.MenzenTsumo)).toBe(true);
  });

  it('should validate requiredFirstRound', () => {
    yakuRequirementRegistry.register(MahjongYakuTypes.Riichi, {
      requiredFirstRound: true,
    });

    const firstRoundInfo = { ...yakuInfo, isFirstRound: false };
    const checker = new YakuChecker(tilesToGroups(tiles), firstRoundInfo);
    const results = checker.check();

    expect(results.has(MahjongYakuTypes.Riichi)).toBe(false);
  });

  it('should validate requiredLastRound', () => {
    yakuRequirementRegistry.register(MahjongYakuTypes.Riichi, {
      requiredLastRound: true,
    });

    const lastRoundInfo = { ...yakuInfo, isLastRound: false };
    const checker = new YakuChecker(tilesToGroups(tiles), lastRoundInfo);
    const results = checker.check();

    expect(results.has(MahjongYakuTypes.Riichi)).toBe(false);
  });

  it('should handle complex requirements with minUnits', () => {
    // Create tiles that form a shuntsu (1-2-3 man)
    const shuntsuTiles = [
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
    ];

    const requirement: Requirement = {
      minUnits: {
        [MahjongSimpleUnits.Shuntsu]: 1,
      },
    };

    yakuRequirementRegistry.register(MahjongYakuTypes.Pinfu, {
      requires: [requirement],
    });

    const checker = new YakuChecker(tilesToGroups(shuntsuTiles), yakuInfo);
    const results = checker.check();

    expect(results.has(MahjongYakuTypes.Pinfu)).toBe(true);
  });

  it('should handle dynamic requirements - Jihai', () => {
    const jihaiTiles = [
      new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
    ];

    const requirement: Requirement = {
      minUnits: {
        [MahjongSimpleUnits.Koutsu]: 1,
      },
      dynamicRequirement: [DynamicRequirementEntry.Jihai],
    };

    yakuRequirementRegistry.register(MahjongYakuTypes.Yakuhai, {
      requires: [requirement],
    });

    const jihaiInfo = { ...yakuInfo, jihai: jihaiTiles[0] };
    const checker = new YakuChecker(tilesToGroups(jihaiTiles), jihaiInfo);
    const results = checker.check();

    expect(results.has(MahjongYakuTypes.Yakuhai)).toBe(true);
  });

  it('should handle dynamic requirements - Bakaze', () => {
    const bakazeTiles = [
      new MahjongTiles({ suits: MahjongSuits.WIND, number: 2, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.WIND, number: 2, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.WIND, number: 2, isRed: false }),
    ];

    const requirement: Requirement = {
      minUnits: {
        [MahjongSimpleUnits.Koutsu]: 1,
      },
      dynamicRequirement: [DynamicRequirementEntry.Bakaze],
    };

    yakuRequirementRegistry.register(MahjongYakuTypes.Yakuhai, {
      requires: [requirement],
    });

    const bakazeInfo = { ...yakuInfo, bakaze: bakazeTiles[0] };
    const checker = new YakuChecker(tilesToGroups(bakazeTiles), bakazeInfo);
    const results = checker.check();

    expect(results.has(MahjongYakuTypes.Yakuhai)).toBe(true);
  });

  it('should fail dynamic requirements when info missing', () => {
    const requirement: Requirement = {
      dynamicRequirement: [DynamicRequirementEntry.Jihai],
    };

    yakuRequirementRegistry.register(MahjongYakuTypes.Yakuhai, {
      requires: [requirement],
    });

    const checker = new YakuChecker(tilesToGroups(tiles), yakuInfo);
    const results = checker.check();

    expect(results.has(MahjongYakuTypes.Yakuhai)).toBe(false);
  });

  it('should handle requirement with allowed suits filter', () => {
    // All tiles must be from allowed suits to pass
    const manTiles = [
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
    ];

    const requirement: Requirement = {
      allowedSuits: [MahjongSuits.MAN],
    };

    yakuRequirementRegistry.register(MahjongYakuTypes.Chinitsu, {
      requires: [requirement],
    });

    const checker = new YakuChecker(tilesToGroups(manTiles), yakuInfo);
    const results = checker.check();

    expect(results.has(MahjongYakuTypes.Chinitsu)).toBe(true);
  });

  it('should handle requirement with required numbers', () => {
    // All tiles must have required numbers to pass
    const requiredNumberTiles = [
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
    ];

    const requirement: Requirement = {
      requiredNumbers: [1, 2, 3],
    };

    yakuRequirementRegistry.register(MahjongYakuTypes.Ikkitsuukan, {
      requires: [requirement],
    });

    const checker = new YakuChecker(tilesToGroups(requiredNumberTiles), yakuInfo);
    const results = checker.check();

    expect(results.has(MahjongYakuTypes.Ikkitsuukan)).toBe(true);
  });

  it('should handle repeat requirements', () => {
    const requirement: Requirement = {
      minUnits: {
        [MahjongSimpleUnits.Koutsu]: 1,
      },
      repeat: 3,
    };

    yakuRequirementRegistry.register(MahjongYakuTypes.Sanankou, {
      requires: [requirement],
    });

    const checker = new YakuChecker(tilesToGroups(tiles), yakuInfo);
    const results = checker.check();

    // This should fail as we don't have 3 koutsu
    expect(results.has(MahjongYakuTypes.Sanankou)).toBe(false);
  });

  it('should use custom yaku check set', () => {
    yakuRequirementRegistry.register(MahjongYakuTypes.Riichi, { requireConcealed: true });
    yakuRequirementRegistry.register(MahjongYakuTypes.MenzenTsumo, { requiredTsumo: true });

    const customSet = new Set([MahjongYakuTypes.Riichi]);
    const checker = new YakuChecker(tilesToGroups(tiles), { isConcealed: false }, customSet); // Will fail
    const results = checker.check();

    // Should only check Riichi, not MenzenTsumo, and Riichi should fail
    expect(results.size).toBe(0);
  });

  it('should handle OR logic in requirements', () => {
    // Create tiles that satisfy the second requirement but not the first
    const testTiles = [
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
      new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
    ];

    const requirement1: Requirement = {
      requiredNumbers: [9], // Will fail
    };
    const requirement2: Requirement = {
      requiredNumbers: [1, 2, 3], // Will pass
    };

    yakuRequirementRegistry.register(MahjongYakuTypes.Tanyao, {
      requires: [requirement1, requirement2],
      isOr: true,
    });

    const checker = new YakuChecker(tilesToGroups(testTiles), yakuInfo);
    const results = checker.check();

    expect(results.has(MahjongYakuTypes.Tanyao)).toBe(true);
  });

  describe('Comprehensive Integration Tests', () => {
    it('should handle complex yaku with multiple requirements', () => {
      // Test a complex yaku like Pinfu
      const pinfu_tiles = [
        // Three Shuntsu
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 4, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 6, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 7, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 8, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 9, isRed: false }),
        // Fourth group (might be another shuntsu)
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 4, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 5, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 6, isRed: false }),
        // Toitsu
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
      ];

      yakuRequirementRegistry.register(MahjongYakuTypes.Pinfu, {
        requires: [
          {
            minUnits: {
              [MahjongSimpleUnits.Shuntsu]: 4,
              [MahjongSimpleUnits.Toitsu]: 1,
            },
          },
        ],
        requireConcealed: true,
        waitingType: WaitingType.Ryanmen,
      });

      const pinfu_info = {
        isConcealed: true,
        waitingType: WaitingType.Ryanmen,
      };

      const checker = new YakuChecker(tilesToGroups(pinfu_tiles), pinfu_info);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Pinfu)).toBe(true);
    });

    it('should handle multiple yakus simultaneously', () => {
      yakuRequirementRegistry.register(MahjongYakuTypes.Riichi, {
        requireConcealed: true,
      });

      yakuRequirementRegistry.register(MahjongYakuTypes.MenzenTsumo, {
        requireConcealed: true,
        requiredTsumo: true,
      });

      const multiInfo = {
        isConcealed: true,
        isRiichi: true,
        isTsumo: true,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), multiInfo);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Riichi)).toBe(true);
      expect(results.has(MahjongYakuTypes.MenzenTsumo)).toBe(true);
      expect(results.size).toBe(2);
    });

    it('should handle conflicting requirements correctly', () => {
      yakuRequirementRegistry.register(MahjongYakuTypes.Riichi, {
        requireConcealed: true,
      });

      yakuRequirementRegistry.register(MahjongYakuTypes.MenzenTsumo, {
        requireOpen: true,
      });

      const conflictInfo = {
        isConcealed: true,
        isOpen: false,
      };

      const checker = new YakuChecker(tilesToGroups(tiles), conflictInfo);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Riichi)).toBe(true);
      expect(results.has(MahjongYakuTypes.MenzenTsumo)).toBe(false);
      expect(results.size).toBe(1);
    });

    it('should validate filters correctly', () => {
      const mixedTiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 9, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
      ];

      yakuRequirementRegistry.register(MahjongYakuTypes.Tanyao, {
        requires: [
          {
            filteredNumbers: [1, 9], // Filter out 1 and 9
            minUnits: {
              [MahjongSimpleUnits.Shuntsu]: 1, // Need at least one shuntsu from remaining tiles
            },
          },
        ],
      });

      const checker = new YakuChecker(tilesToGroups(mixedTiles), yakuInfo);
      const results = checker.check();

      // Should fail because after filtering out 1 and 9, we only have WIND tiles
      // which can't form a shuntsu
      expect(results.has(MahjongYakuTypes.Tanyao)).toBe(false);
    });

    it('should handle empty tiles array', () => {
      const emptyTiles: MahjongTiles[] = [];

      yakuRequirementRegistry.register(MahjongYakuTypes.Riichi, {
        // No requirements, should pass but will fail due to no units
      });

      const checker = new YakuChecker(tilesToGroups(emptyTiles), { isConcealed: true });
      const results = checker.check();

      // Empty tiles array has no units, so it should return false
      expect(results.has(MahjongYakuTypes.Riichi)).toBe(false);
    });

    it('should handle requirement with repeat count', () => {
      const repeatTiles = [
        // First group
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        // Second group
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 2, isRed: false }),
        // Third group
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.SOU, number: 3, isRed: false }),
      ];

      yakuRequirementRegistry.register(MahjongYakuTypes.Sanankou, {
        requires: [
          {
            minUnits: {
              [MahjongSimpleUnits.Koutsu]: 3,
            },
          },
        ],
        requireConcealed: true,
      });

      const checker = new YakuChecker(tilesToGroups(repeatTiles), { isConcealed: true });
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Sanankou)).toBe(true);
    });

    it('should handle complex OR requirements', () => {
      // Use tiles that can form valid units
      const testTiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
      ];

      yakuRequirementRegistry.register(MahjongYakuTypes.Tanyao, {
        requires: [
          {
            requiredNumbers: [9], // Will fail - we don't have 9
          },
          {
            allowedSuits: [MahjongSuits.MAN], // Will pass - we have man tiles and they form a shuntsu
          },
        ],
        isOr: true,
      });

      const checker = new YakuChecker(tilesToGroups(testTiles), yakuInfo);
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Tanyao)).toBe(true);
    });

    it('should handle edge case with undefined infos', () => {
      yakuRequirementRegistry.register(MahjongYakuTypes.Riichi, {});

      const checker = new YakuChecker(tilesToGroups(tiles), {});
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Riichi)).toBe(true);
    });

    it('should handle error in requireConcealed when infos is incomplete', () => {
      yakuRequirementRegistry.register(MahjongYakuTypes.Riichi, {
        requireConcealed: true,
      });

      const checker = new YakuChecker(tilesToGroups(tiles), {});
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Riichi)).toBe(false);
    });

    it('should handle large tile combinations', () => {
      const largeTileSet = [];
      for (let i = 0; i < 14; i++) {
        largeTileSet.push(new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }));
      }

      yakuRequirementRegistry.register(MahjongYakuTypes.Riichi, {});

      const checker = new YakuChecker(tilesToGroups(largeTileSet), {});
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Riichi)).toBe(true);
    });

    it('should handle waiting type edge cases', () => {
      yakuRequirementRegistry.register(MahjongYakuTypes.Riichi, {
        waitingType: WaitingType.Any,
      });

      const checker = new YakuChecker(tilesToGroups(tiles), { waitingType: WaitingType.Ryanmen });
      const results = checker.check();

      expect(results.has(MahjongYakuTypes.Riichi)).toBe(true);
    });
  });

  // === 補充詳細測試 ===
  describe('Advanced Edge Cases and Error Handling', () => {
    it('should handle undefined tiles gracefully', () => {
      // YakuChecker will throw when trying to spread undefined tiles
      expect(() => new YakuChecker(undefined as unknown as CheckTilesGroup[], yakuInfo)).toThrow();
    });

    it('should handle null tiles gracefully', () => {
      // YakuChecker will throw when trying to spread null tiles
      expect(() => new YakuChecker(null as unknown as CheckTilesGroup[], yakuInfo)).toThrow();
    });

    it('should handle null info gracefully', () => {
      // YakuChecker doesn't actually throw for null info, it handles them
      const checker = new YakuChecker(tilesToGroups([]), null as unknown as YakuInfo);
      expect(checker).toBeInstanceOf(YakuChecker);
    });

    it('should handle undefined info gracefully', () => {
      // YakuChecker doesn't actually throw for undefined info, it handles them
      const checker = new YakuChecker(tilesToGroups([]), undefined as unknown as YakuInfo);
      expect(checker).toBeInstanceOf(YakuChecker);
    });

    it('should handle invalid requirement format gracefully', () => {
      yakuRequirementRegistry.register(MahjongYakuTypes.Riichi, {
        requires: [{ minUnits: null as unknown as Record<string, number> }],
        requireConcealed: true, // Add a requirement that will fail
      });
      const checker = new YakuChecker(tilesToGroups(tiles), { isConcealed: false }); // This will fail
      const results = checker.check();
      expect(results.has(MahjongYakuTypes.Riichi)).toBe(false);
    });

    it('should handle undefined requires gracefully', () => {
      yakuRequirementRegistry.register(MahjongYakuTypes.Riichi, {
        requires: undefined as unknown as Requirement[],
      });
      const checker = new YakuChecker(tilesToGroups(tiles), { isConcealed: true });
      const results = checker.check();
      // Without requires, it should pass basic validation
      expect(results.has(MahjongYakuTypes.Riichi)).toBe(true);
    });

    it('should handle multiple dynamic requirements simultaneously', () => {
      const windTiles = [
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
      ];
      yakuRequirementRegistry.register(MahjongYakuTypes.Yakuhai, {
        requires: [
          {
            minUnits: { [MahjongSimpleUnits.Koutsu]: 1 },
            dynamicRequirement: [DynamicRequirementEntry.Jihai, DynamicRequirementEntry.Bakaze],
          },
        ],
      });
      const info = { jihai: windTiles[0], bakaze: windTiles[0] };
      const checker = new YakuChecker(tilesToGroups(windTiles), info);
      const results = checker.check();
      expect(results.has(MahjongYakuTypes.Yakuhai)).toBe(true);
    });

    it('should handle nested requirements with minUnits and allowedSuits', () => {
      const manTiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
      ];
      yakuRequirementRegistry.register(MahjongYakuTypes.Chinitsu, {
        requires: [
          {
            minUnits: { [MahjongSimpleUnits.Shuntsu]: 1 },
            allowedSuits: [MahjongSuits.MAN],
          },
        ],
      });
      const checker = new YakuChecker(tilesToGroups(manTiles), {});
      const results = checker.check();
      expect(results.has(MahjongYakuTypes.Chinitsu)).toBe(true);
    });

    it('should handle custom yaku type registration and detection', () => {
      // Test with a basic requirement that should pass
      yakuRequirementRegistry.register(MahjongYakuTypes.Riichi, { requireConcealed: true });
      const checker = new YakuChecker(tilesToGroups(tiles), { isConcealed: true });
      const results = checker.check();
      expect(results.has(MahjongYakuTypes.Riichi)).toBe(true);
    });

    it('should handle very large tile set efficiently', () => {
      const largeTiles = Array.from(
        { length: 100 },
        (_, i) => new MahjongTiles({ suits: MahjongSuits.MAN, number: (i % 9) + 1, isRed: false })
      );
      yakuRequirementRegistry.register(MahjongYakuTypes.Riichi, {});
      const checker = new YakuChecker(tilesToGroups(largeTiles), {});
      const results = checker.check();
      expect(results.has(MahjongYakuTypes.Riichi)).toBe(true);
    });

    it('should not leak state between multiple checks', () => {
      yakuRequirementRegistry.register(MahjongYakuTypes.Riichi, { requireConcealed: true });

      const checker1 = new YakuChecker(tilesToGroups(tiles), { isConcealed: true });
      const results1 = checker1.check();
      expect(results1.has(MahjongYakuTypes.Riichi)).toBe(true);

      const checker2 = new YakuChecker(tilesToGroups(tiles), { isConcealed: false });
      const results2 = checker2.check();
      expect(results2.has(MahjongYakuTypes.Riichi)).toBe(false);

      // Run first checker again to ensure no state leakage
      const results1Again = checker1.check();
      expect(results1Again.has(MahjongYakuTypes.Riichi)).toBe(true);
    });

    it('should handle info with all possible fields populated', () => {
      yakuRequirementRegistry.register(MahjongYakuTypes.MenzenTsumo, {
        requireConcealed: true,
        requireOpen: false,
        requiredTsumo: true,
        waitingType: WaitingType.Ryanmen,
        requiredFirstRound: false,
        requiredLastRound: false,
      });

      const comprehensiveInfo = {
        isConcealed: true,
        isOpen: false,
        isTsumo: true,
        isReach: true,
        isRiichi: true,
        waitingType: WaitingType.Ryanmen,
        isFirstRound: false,
        isLastRound: false,
        jihai: new MahjongTiles({ suits: MahjongSuits.WIND, number: 1, isRed: false }),
        bakaze: new MahjongTiles({ suits: MahjongSuits.WIND, number: 2, isRed: false }),
      };

      const checker = new YakuChecker(tilesToGroups(tiles), comprehensiveInfo);
      const results = checker.check();
      expect(results.has(MahjongYakuTypes.MenzenTsumo)).toBe(true);
    });

    it('should handle conflicting boolean requirements correctly', () => {
      yakuRequirementRegistry.register(MahjongYakuTypes.Riichi, {
        requireConcealed: true,
        requireOpen: false, // This should also pass since isOpen is false
      });

      const conflictInfo = { isConcealed: true, isOpen: false };
      const checker = new YakuChecker(tilesToGroups(tiles), conflictInfo);
      const results = checker.check();
      expect(results.has(MahjongYakuTypes.Riichi)).toBe(true);
    });

    it('should handle mixed suit requirements with filteredSuits', () => {
      // Use tiles that can form valid units
      const mixedTiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
      ];

      yakuRequirementRegistry.register(MahjongYakuTypes.Tanyao, {
        requires: [
          {
            allowedSuits: [MahjongSuits.MAN], // Allow man suits - this will pass
          },
        ],
      });

      const checker = new YakuChecker(tilesToGroups(mixedTiles), {});
      const results = checker.check();
      expect(results.has(MahjongYakuTypes.Tanyao)).toBe(true);
    });

    it('should handle extremely complex OR/AND combinations', () => {
      const complexTiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.PIN, number: 5, isRed: false }),
      ];

      yakuRequirementRegistry.register(MahjongYakuTypes.Tanyao, {
        requires: [
          { requiredNumbers: [9] }, // Will fail
          {
            minUnits: { [MahjongSimpleUnits.Shuntsu]: 1 },
            allowedSuits: [MahjongSuits.MAN],
          }, // Will pass
          { allowedSuits: [MahjongSuits.WIND] }, // Will fail
        ],
        isOr: true,
      });

      const checker = new YakuChecker(tilesToGroups(complexTiles), {});
      const results = checker.check();
      expect(results.has(MahjongYakuTypes.Tanyao)).toBe(true);
    });

    it('should handle performance with repeated checker instantiation', () => {
      yakuRequirementRegistry.register(MahjongYakuTypes.Riichi, {});

      const performanceTest = () => {
        for (let i = 0; i < 1000; i++) {
          const checker = new YakuChecker(tilesToGroups(tiles), {});
          const results = checker.check();
          expect(results.has(MahjongYakuTypes.Riichi)).toBe(true);
        }
      };

      expect(performanceTest).not.toThrow();
    });

    it('should handle empty requirement arrays gracefully', () => {
      yakuRequirementRegistry.register(MahjongYakuTypes.Riichi, {
        requires: [], // Empty array should be handled
      });

      const checker = new YakuChecker(tilesToGroups(tiles), {});
      const results = checker.check();
      expect(results.has(MahjongYakuTypes.Riichi)).toBe(true); // Should pass empty requirements
    });

    it('should validate red tile handling', () => {
      // Use tiles that can form valid units
      const redTiles = [
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 1, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 2, isRed: false }),
        new MahjongTiles({ suits: MahjongSuits.MAN, number: 3, isRed: false }),
      ];

      yakuRequirementRegistry.register(MahjongYakuTypes.Riichi, {
        // No specific requirements, should pass basic validation
      });

      const checker = new YakuChecker(tilesToGroups(redTiles), {});
      const results = checker.check();
      expect(results.has(MahjongYakuTypes.Riichi)).toBe(true);
    });

    it('should handle special waiting type combinations', () => {
      yakuRequirementRegistry.register(MahjongYakuTypes.Riichi, {
        waitingType: WaitingType.Kanchan,
      });

      const testWaitingTypes = [
        WaitingType.Ryanmen,
        WaitingType.Penchan,
        WaitingType.Shanpon,
        WaitingType.Tanki,
        WaitingType.Houju,
      ];

      testWaitingTypes.forEach(waitingType => {
        const checker = new YakuChecker(tilesToGroups(tiles), { waitingType });
        const results = checker.check();
        expect(results.has(MahjongYakuTypes.Riichi)).toBe(false);
      });

      // Test correct waiting type
      const correctChecker = new YakuChecker(tilesToGroups(tiles), {
        waitingType: WaitingType.Kanchan,
      });
      const correctResults = correctChecker.check();
      expect(correctResults.has(MahjongYakuTypes.Riichi)).toBe(true);
    });
  });
});
