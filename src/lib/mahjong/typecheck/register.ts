import { Checker, MahjongSimpleUnits, MahjongYakuTypes } from '.';
import { MahjongSuits } from '../type';
import {
  DynamicRequirementEntry,
  WaitingType,
  yakuRequirementRegistry,
} from './yaku';

export function register() {
  // ------------一番------------

  // 立直 (理論上是額外的判定就是)
  yakuRequirementRegistry.register(MahjongYakuTypes.Riichi, {
    requireConcealed: true,
    specialCondition({ infos }) {
      return !!infos.isRiichi;
    },
  });

  // 斷么九

  yakuRequirementRegistry.register(MahjongYakuTypes.Tanyao, {
    requires: [
      {
        filteredNumbers: [1, 9], // 1, 9 are not allowed
        allowedSuits: [MahjongSuits.MAN, MahjongSuits.PIN, MahjongSuits.SOU],
      },
    ],
  });

  // 門前清自摸和

  yakuRequirementRegistry.register(MahjongYakuTypes.MenzenTsumo, {
    requireConcealed: true,
    requiredTsumo: true,
  });

  // 自風役牌

  yakuRequirementRegistry.register(MahjongYakuTypes.Jihai, {
    requires: [
      {
        minUnits: {
          [MahjongSimpleUnits.Koutsu]: 1,
        },
        dynamicRequirement: [DynamicRequirementEntry.Jihai],
      },
    ],
  });

  // 場風役牌

  yakuRequirementRegistry.register(MahjongYakuTypes.Bakaze, {
    requires: [
      {
        minUnits: {
          [MahjongSimpleUnits.Koutsu]: 1,
        },
        dynamicRequirement: [DynamicRequirementEntry.Bakaze],
      },
    ],
  });

  // 三元牌

  yakuRequirementRegistry.register(MahjongYakuTypes.Sanzen, {
    requires: [
      {
        minUnits: {
          [MahjongSimpleUnits.Koutsu]: 1,
        },
        requiredSuits: [MahjongSuits.DRAGON],
      },
    ],
  });

  // 平和

  yakuRequirementRegistry.register(MahjongYakuTypes.Pinfu, {
    requires: [
      {
        minUnits: {
          [MahjongSimpleUnits.Shuntsu]: 3,
          [MahjongSimpleUnits.Toitsu]: 1,
          [MahjongSimpleUnits.RyanmenTatsu]: 1,
        },
        requiredSuits: [MahjongSuits.MAN, MahjongSuits.PIN, MahjongSuits.SOU],
      },
    ],
    requireConcealed: true,
    specialCondition({ suits, infos }) {
      if (infos.waitingType !== WaitingType.Ryanmen) {
        return false;
      }
      // 兩面搭子
      const filteredSuits = Object.values(suits)
        .filter((suit) => suit && suit.length >= 2)
        .filter(
          (suit) =>
            suit &&
            suit.some((tile) => tile.getNumber() >= 2 && tile.getNumber() <= 8),
        );
      return filteredSuits.some((tiles) => {
        if (!tiles) return false;
        for (let i = 0; i < tiles.length - 1; i++) {
          if (tiles[i].getNumber() + 1 === tiles[i + 1].getNumber()) {
            return true;
          }
        }
        return false;
      });
    },
  });

  // 一盃口

  yakuRequirementRegistry.register(MahjongYakuTypes.Iipeikou, {
    requires: [
      {
        minUnits: { [MahjongSimpleUnits.Shuntsu]: 1 },
        unitRepeat: 2,
      },
    ],
    requireConcealed: true,
  });

  // 槍槓

  yakuRequirementRegistry.register(MahjongYakuTypes.Chankan, {
    specialCondition() {
      console.warn('Chankan is not implemented yet');
      // 槍槓需要特殊的遊戲狀態判定，不只是牌型
      return false;
    },
  });

  // 嶺上開花

  yakuRequirementRegistry.register(MahjongYakuTypes.Rinsyan, {
    specialCondition({ tiles, suits, infos }) {
      return false;
      return (
        tiles.length === 14 &&
        Object.values(suits)
          .filter((suit) => Array.isArray(suit))
          .every(
            (suitTiles) =>
              suitTiles.length === 0 ||
              suitTiles.every((tile) => tile.isRedTile()),
          ) &&
        infos.isConcealed!
      );
    },
  });

  // 海底摸月

  yakuRequirementRegistry.register(MahjongYakuTypes.HaiteiTsumo, {
    requiredLastRound: true,
    requiredTsumo: true,
  });

  // 河底撈魚
  yakuRequirementRegistry.register(MahjongYakuTypes.HouteiRaoyui, {
    requiredLastRound: true,
  });

  // 一發

  yakuRequirementRegistry.register(MahjongYakuTypes.Ippatsu, {
    specialCondition({ infos }) {
      if (!infos.isRiichi!) return false;
      console.warn('Ippatsu is not implemented yet');
      return false;
    },
  });

  // ------------二番------------

  // 兩立直

  yakuRequirementRegistry.register(MahjongYakuTypes.DoubleRiichi, {
    requireConcealed: true,
    requiredFirstRound: true,
    specialCondition({ infos }) {
      return infos.isRiichi!;
    },
  });

  // 三色同刻

  yakuRequirementRegistry.register(MahjongYakuTypes.SanshokuDoukou, {
    requires: [
      {
        minUnits: { [MahjongSimpleUnits.Koutsu]: 1 },
        allowedSuits: [MahjongSuits.MAN, MahjongSuits.PIN, MahjongSuits.SOU],
        unitRepeat: 3,
        customCheckUnitOrder: [
          MahjongSimpleUnits.Koutsu,
          MahjongSimpleUnits.Kantsu,
          MahjongSimpleUnits.Shuntsu,
          MahjongSimpleUnits.Toitsu,
          MahjongSimpleUnits.RyanmenTatsu,
        ],
      },
    ],
  });

  // 三槓子

  yakuRequirementRegistry.register(MahjongYakuTypes.Sankantsu, {
    requires: [
      {
        minUnits: { [MahjongSimpleUnits.Kantsu]: 3 },
      },
    ],
  });

  // 對對和

  yakuRequirementRegistry.register(MahjongYakuTypes.Toitoihou, {
    requires: [
      {
        minUnits: {
          [MahjongSimpleUnits.Koutsu]: 4,
          [MahjongSimpleUnits.Toitsu]: 1,
        },
      },
      {
        minUnits: {
          [MahjongSimpleUnits.Koutsu]: 2,
          [MahjongSimpleUnits.Kantsu]: 2,
        },
      },
    ],
    isOr: true,
  });

  // 三暗刻

  yakuRequirementRegistry.register(MahjongYakuTypes.Sanankou, {
    requires: [
      {
        minUnits: {
          [MahjongSimpleUnits.Koutsu]: 3,
        },
        isOpen: false,
      },
    ],
  });

  // 小三元

  yakuRequirementRegistry.register(MahjongYakuTypes.Shousangen, {
    requires: [
      {
        minUnits: {
          [MahjongSimpleUnits.Koutsu]: 2,
          [MahjongSimpleUnits.Toitsu]: 1,
        },
        requiredSuits: [MahjongSuits.DRAGON],
        customCheckUnitOrder: [
          MahjongSimpleUnits.Koutsu,
          MahjongSimpleUnits.Toitsu,
          MahjongSimpleUnits.Shuntsu,
        ],
      },
    ],
    // Below Should be commented out one day
    /*
  specialCondition({ tiles }) {
    const usingTiles = tiles.filter(tile => tile.getSuit() === MahjongSuits.DRAGON);
    if (usingTiles.length < 3) return false;
    const checker = new Checker(usingTiles);
    const triplets = checker.checkUnitsByOrder([
      MahjongSimpleUnits.Koutsu,
      MahjongSimpleUnits.Toitsu,
    ]);
    return (
      triplets[MahjongSimpleUnits.Koutsu].length === 2 &&
      triplets[MahjongSimpleUnits.Toitsu].length === 1
    );
  },*/
  });

  // 混老頭

  yakuRequirementRegistry.register(MahjongYakuTypes.Honroutou, {
    requires: [
      {
        allowedSuits: [MahjongSuits.MAN, MahjongSuits.PIN, MahjongSuits.SOU],
        allowedNumbers: [1, 9],
      },
      {
        allowedSuits: [MahjongSuits.WIND, MahjongSuits.DRAGON],
        allowedNumbers: [1, 2, 3, 4],
      },
    ],
    specialCondition({ tiles }) {
      return tiles.every(
        (tile) =>
          (tile.getSuit() < 3 &&
            (tile.getNumber() === 1 || tile.getNumber() === 9)) ||
          tile.getSuit() >= 3,
      );
    },
  });

  // 七對子

  yakuRequirementRegistry.register(MahjongYakuTypes.Chiitoitsu, {
    requireConcealed: true,
    specialCondition({ tiles }) {
      const checker = new Checker(tiles);
      const pairs = checker.checkUnitsByOrder([
        MahjongSimpleUnits.Kantsu,
        MahjongSimpleUnits.Toitsu,
      ]);
      return (
        pairs[MahjongSimpleUnits.Toitsu].length +
          pairs[MahjongSimpleUnits.Kantsu].length ===
        7
      );
    },
  });

  // 混全帶么九

  yakuRequirementRegistry.register(MahjongYakuTypes.Chanta, {
    specialCondition({ tileGroups }) {
      // 混全帶么九：每個面子都必須包含終端牌(1,9)或字牌，且至少要有一個字牌
      const hasHonors = tileGroups.some((group) =>
        group.tiles.some((tile) => tile.getSuit() >= 3),
      );

      const allGroupsHaveTerminalsOrHonors = tileGroups.every((group) =>
        group.tiles.some(
          (tile) =>
            (tile.getSuit() < 3 &&
              (tile.getNumber() === 1 || tile.getNumber() === 9)) ||
            tile.getSuit() >= 3,
        ),
      );

      return hasHonors && allGroupsHaveTerminalsOrHonors;
    },
  });

  // 一氣通貫

  yakuRequirementRegistry.register(MahjongYakuTypes.Ikkitsuukan, {
    requires: [
      {
        minUnits: {
          [MahjongSimpleUnits.Shuntsu]: 3,
        },
        requiredNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        requiredIttsuu: true,
      },
    ],
  });

  // 三色同順

  yakuRequirementRegistry.register(MahjongYakuTypes.SanshokuDoujun, {
    requires: [
      {
        minUnits: {
          [MahjongSimpleUnits.Shuntsu]: 1,
        },
        allowedSuits: [MahjongSuits.MAN, MahjongSuits.PIN, MahjongSuits.SOU],
        unitRepeat: 3,
      },
    ],
    /*
  specialCondition({ suits, infos }) {
    const matchPerSuits = Object.values(suits).filter(
      (tiles): tiles is MahjongTiles[] =>
        !!(tiles && tiles !== undefined && tiles.length > 0 && tiles.length % 3 === 0)
    );
    if (matchPerSuits.length < 3) return false;
    const numbers = matchPerSuits[0].map(tile => tile.getNumber());

    return (
      matchPerSuits.every(
        tiles =>
          tiles.every(tile => numbers.includes(tile.getNumber())) &&
          tiles.every(tile => tile.getSuit() === matchPerSuits[0][0].getSuit())
      ) && infos.isConcealed!
    );
  },*/
  });

  // ------------三番------------

  // 二盃口
  yakuRequirementRegistry.register(MahjongYakuTypes.Ryanpeikou, {
    requires: [
      {
        minUnits: { [MahjongSimpleUnits.Shuntsu]: 1 },
        unitRepeat: 2,
        repeat: 2,
      },
    ],
    requireConcealed: true,
  });

  // 混一色
  yakuRequirementRegistry.register(MahjongYakuTypes.Honitsu, {
    specialCondition({ tiles }) {
      // 只能包含一種數字牌和字牌
      const suits = new Set(tiles.map((tile) => tile.getSuit()));
      const numberSuits = Array.from(suits).filter((suit) => suit < 3);
      const hasHonors = Array.from(suits).some((suit) => suit >= 3);

      // 必須只有一種數字牌，且可以有字牌
      return numberSuits.length === 1 && hasHonors;
    },
  });

  // 純全帶么九

  yakuRequirementRegistry.register(MahjongYakuTypes.Junchantaiyouku, {
    requires: [
      {
        minUnits: {
          [MahjongSimpleUnits.Toitsu]: 1,
          [MahjongSimpleUnits.Ippatsu]: 4,
        },
        requiredSuits: [MahjongSuits.MAN, MahjongSuits.PIN, MahjongSuits.SOU],
      },
    ],
    specialCondition({ tileGroups }) {
      // 純全帶么九：每個面子都必須包含1或9，且不能有字牌
      return tileGroups.every(
        (group) =>
          group.tiles.every((tile) => tile.getSuit() < 3) && // 不能有字牌
          group.tiles.some(
            (tile) => tile.getNumber() === 1 || tile.getNumber() === 9,
          ), // 必須包含1或9
      );
    },
  });

  // ------------六番------------

  // 清一色
  yakuRequirementRegistry.register(MahjongYakuTypes.Chinitsu, {
    specialCondition({ tiles }) {
      // 清一色：只能包含一種數字牌，不能有字牌
      const suits = new Set(tiles.map((tile) => tile.getSuit()));
      const numberSuits = Array.from(suits).filter((suit) => suit < 3);
      const hasHonors = Array.from(suits).some((suit) => suit >= 3);

      return numberSuits.length === 1 && !hasHonors;
    },
  });

  // ------------滿貫------------

  // 流局滿貫
  yakuRequirementRegistry.register(MahjongYakuTypes.RyuukyokuMankan, {
    requires: [
      {
        requiredSuits: [MahjongSuits.MAN, MahjongSuits.PIN, MahjongSuits.SOU],
        allowedNumbers: [1, 9],
      },
      {
        requiredSuits: [MahjongSuits.DRAGON, MahjongSuits.WIND],
        allowedNumbers: [1, 2, 3, 4],
      },
    ],
    requiredLastRound: true,
  });

  // ------------役滿------------

  // 天和

  yakuRequirementRegistry.register(MahjongYakuTypes.Tenhou, {
    specialCondition({ infos }) {
      // 天和：莊家第一巡環，門清，自摸
      return infos.isTsumo! && infos.isConcealed! && infos.isFirstRound!;
    },
  });

  // 地和

  yakuRequirementRegistry.register(MahjongYakuTypes.Chihou, {
    specialCondition({ infos }) {
      // 地和：閒家第一巡環，門清，自摸
      return infos.isTsumo! && infos.isConcealed! && infos.isFirstRound!;
    },
  });

  // 大三元
  yakuRequirementRegistry.register(MahjongYakuTypes.Daisangen, {
    requires: [
      {
        minUnits: { [MahjongSimpleUnits.Koutsu]: 3 },
        requiredSuits: [MahjongSuits.DRAGON],
        requiredNumbers: [1, 2, 3], // 三種龍牌都要有
      },
    ],
  });

  // 四暗刻
  yakuRequirementRegistry.register(MahjongYakuTypes.Suuankou, {
    requires: [
      {
        minUnits: { [MahjongSimpleUnits.Koutsu]: 4 },
      },
    ],
    requireConcealed: true,
  });

  // 字一色
  yakuRequirementRegistry.register(MahjongYakuTypes.Tsuuiisou, {
    requires: [
      {
        allowedSuits: [MahjongSuits.WIND, MahjongSuits.DRAGON], // 只能有字牌
      },
    ],
  });

  // 綠一色
  yakuRequirementRegistry.register(MahjongYakuTypes.Ryuuuiisou, {
    requires: [
      {
        minUnits: { [MahjongSimpleUnits.Koutsu]: 4 },
        allowedSuits: [MahjongSuits.SOU],
        allowedNumbers: [2, 3, 4, 6, 8],
      },
    ],
  });

  // 清老頭
  yakuRequirementRegistry.register(MahjongYakuTypes.Chinroutou, {
    requires: [
      {
        allowedSuits: [MahjongSuits.MAN, MahjongSuits.PIN, MahjongSuits.SOU],
        allowedNumbers: [1, 9], // 只能有終端牌
      },
    ],
  });

  yakuRequirementRegistry.register(MahjongYakuTypes.Chinroutou, {
    specialCondition({ tiles }) {
      // 清老頭：只有終端牌（1和9），不能有字牌
      return tiles.every(
        (tile) =>
          tile.getSuit() < 3 &&
          (tile.getNumber() === 1 || tile.getNumber() === 9),
      );
    },
  });

  // 國士無雙
  yakuRequirementRegistry.register(MahjongYakuTypes.KokushiMusou, {
    specialCondition({ tiles, infos }) {
      // 國士無雙：13種終端牌和字牌各一張加1對，必須門清
      if (!infos.isConcealed) return false;

      // 檢查是否有13種不同的終端牌和字牌
      const requiredTiles = [
        // 終端牌
        '0-1',
        '0-9', // 萬子 1,9
        '1-1',
        '1-9', // 筒子 1,9
        '2-1',
        '2-9', // 索子 1,9
        // 字牌
        '3-1',
        '3-2',
        '3-3',
        '3-4', // 風牌
        '4-1',
        '4-2',
        '4-3', // 三元牌
      ];

      const tileMap = new Map<string, number>();
      for (const tile of tiles) {
        const key = `${tile.getSuit()}-${tile.getNumber()}`;
        tileMap.set(key, (tileMap.get(key) || 0) + 1);
      }

      // 檢查是否每種終端牌和字牌都有且只有這些牌
      const presentTiles = Array.from(tileMap.keys());
      const hasAllRequired = requiredTiles.every((tile) => tileMap.has(tile));
      const hasOnlyRequired = presentTiles.every((tile) =>
        requiredTiles.includes(tile),
      );

      // 檢查牌數：總共14張牌，13種不同類型，其中一種2張其他12種各1張
      if (tiles.length !== 14) return false;
      if (tileMap.size !== 13) return false;

      const counts = Array.from(tileMap.values()).sort();
      const expectedCounts = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2]; // 12個1，1個2

      const isValidPattern =
        counts.length === expectedCounts.length &&
        counts.every((count, index) => count === expectedCounts[index]);

      return hasAllRequired && hasOnlyRequired && isValidPattern;
    },
  });

  // 小四喜
  yakuRequirementRegistry.register(MahjongYakuTypes.Shousuushi, {
    requires: [
      {
        minUnits: {
          [MahjongSimpleUnits.Koutsu]: 3,
          [MahjongSimpleUnits.Toitsu]: 1,
        },
        requiredSuits: [MahjongSuits.WIND],
      },
    ],
  });

  // 四槓子
  yakuRequirementRegistry.register(MahjongYakuTypes.Suukantsu, {
    requires: [
      {
        minUnits: { [MahjongSimpleUnits.Kantsu]: 4 },
        isOpen: true,
      },
    ],
  });

  // 九蓮寶燈
  yakuRequirementRegistry.register(MahjongYakuTypes.ChuurenPoutou, {
    requires: [
      {
        minUnits: {
          [MahjongSimpleUnits.Shuntsu]: 3,
          [MahjongSimpleUnits.Koutsu]: 1,
          [MahjongSimpleUnits.Toitsu]: 1,
        },
        allowedSuits: [MahjongSuits.MAN, MahjongSuits.PIN, MahjongSuits.SOU],
        requiredNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        requiredIttsuu: true,
      },
    ],
    requireConcealed: true,
  });

  // ------------雙倍役滿------------

  // 四暗刻単騎
  yakuRequirementRegistry.register(MahjongYakuTypes.SuuankouTanki, {
    requires: [
      {
        minUnits: {
          [MahjongSimpleUnits.Koutsu]: 4,
          [MahjongSimpleUnits.Toitsu]: 1,
        },
        isOpen: false,
      },
    ],
    requireConcealed: true,
    waitingType: WaitingType.Tanki,
  });

  // 國士無雙十三面
  yakuRequirementRegistry.register(MahjongYakuTypes.KokushiMusouJyuusanmen, {
    requires: [
      {
        requiredSuits: [MahjongSuits.MAN, MahjongSuits.PIN, MahjongSuits.SOU],
        requiredNumbers: [1, 9],
      },
      {
        requiredSuits: [MahjongSuits.WIND, MahjongSuits.DRAGON],
        requiredNumbers: [1, 2, 3, 4],
      },
      {
        minUnits: { [MahjongSimpleUnits.Toitsu]: 1 },
      },
    ],
    requireConcealed: true,
    waitingType: WaitingType.Any,
    requiredHandsTiles: [
      {
        requiredSuits: [MahjongSuits.MAN, MahjongSuits.PIN, MahjongSuits.SOU],
        requiredNumbers: [1, 9],
      },
      {
        requiredSuits: [MahjongSuits.WIND, MahjongSuits.DRAGON],
        requiredNumbers: [1, 2, 3, 4],
      },
    ],
  });

  // 純正九蓮寶燈

  yakuRequirementRegistry.register(MahjongYakuTypes.JyunseiChuurenPoutou, {
    requires: [
      {
        minUnits: {
          [MahjongSimpleUnits.Shuntsu]: 3,
          [MahjongSimpleUnits.Koutsu]: 1,
          [MahjongSimpleUnits.Toitsu]: 1,
        },
        requiredIttsuu: true,
        allowedSuits: [MahjongSuits.MAN, MahjongSuits.PIN, MahjongSuits.SOU],
        requiredNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
    ],
    requireConcealed: true,
    requiredHandsTiles: [
      {
        minUnits: {
          [MahjongSimpleUnits.Shuntsu]: 2,
          [MahjongSimpleUnits.Koutsu]: 2,
        },
        allowedSuits: [MahjongSuits.MAN, MahjongSuits.PIN, MahjongSuits.SOU],
        requiredNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
    ],
  });

  // 大四喜
  yakuRequirementRegistry.register(MahjongYakuTypes.Daisuushi, {
    requires: [
      {
        minUnits: {
          [MahjongSimpleUnits.Koutsu]: 4,
          [MahjongSimpleUnits.Toitsu]: 1,
        },
        requiredSuits: [MahjongSuits.WIND],
      },
    ],
  });

  // ------------特殊役------------

  // 流局役

  // 四風連打

  yakuRequirementRegistry.register(MahjongYakuTypes.SuufuuRenda, {
    specialCondition({ infos }) {
      // 四風連打：同一巡中連續四家打出相同的風牌
      if (
        !infos.usedTileHistory ||
        infos.usedTileHistory.length < 4 ||
        !Array.isArray(infos.usedTileHistory)
      )
        return false;
      const length = infos.usedTileHistory.length;
      console.log('SuufuuRenda--');
      const targetTiles = infos.usedTileHistory.slice(length - 4, length);
      const firstSuit = targetTiles[0].getSuit();
      const firstNumber = targetTiles[0].getNumber();
      if (firstSuit !== 3) return false; // 必須是風牌
      if (
        !targetTiles.every(
          (tile) =>
            tile.getSuit() === firstSuit && tile.getNumber() === firstNumber,
        )
      )
        return false; // 四張牌必須相同
      return true;
    },
  });

  // 四槓散了

  yakuRequirementRegistry.register(MahjongYakuTypes.Suukansanra, {
    specialCondition({ infos }) {
      // 四槓散了：四槓子後流局
      if (!infos.isLastRound) return false;
      console.info(
        'Suukansanra is not implemented yet,Need Addition Game State like UsedActionList',
      );
      return false; // 需要額外的遊戲狀態判定
    },
  });

  // 九種九牌

  yakuRequirementRegistry.register(MahjongYakuTypes.KyuuShuKyuuHai, {
    specialCondition({ tiles, infos }) {
      // 九種九牌：第一循環中手牌中有九種不同的終端牌和字牌
      if (!infos.isFirstRound || infos.isAnyOneOpen) return false;

      // 終端牌和字牌的種類
      const terminalAndHonorTiles = new Set(
        tiles
          .filter(
            (tile) =>
              (tile.getSuit() < 3 &&
                (tile.getNumber() === 1 || tile.getNumber() === 9)) ||
              tile.getSuit() >= 3,
          )
          .map((tile) => `${tile.getSuit()}-${tile.getNumber()}`),
      );

      return terminalAndHonorTiles.size >= 9;
    },
  });
}
