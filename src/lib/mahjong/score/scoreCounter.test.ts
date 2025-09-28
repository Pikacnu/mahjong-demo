import { describe, test, expect } from 'bun:test';
import { MahjongScoreCounter } from './scoreCounter';
import { MahjongYakuTypes } from '../typecheck';
import { WaitingType } from '../typecheck/yaku';

// 測試麻雀計分系統
describe('MahjongScoreCounter', () => {
  test('1番30符 自摸', () => {
    const counter = new MahjongScoreCounter({
      hanCount: 1,
      isTsumo: true,
      yakuList: [MahjongYakuTypes.Riichi],
    });

    const result = counter.count();
    expect(result.nonDealer).toBe(300);
    expect(result.dealer).toBe(500);
    expect(result.ronScore).toBe(1100); // 修正：300*2 + 500 = 1100（自摸總分數）
  });

  test('2番25符 七對子榮和', () => {
    const counter = new MahjongScoreCounter({
      hanCount: 2,
      isTsumo: false,
      ronType: MahjongYakuTypes.Chiitoitsu,
    });

    const result = counter.count();
    expect(result.ronScore).toBe(1600);
    expect(result.nonDealer).toBe(0);
    expect(result.dealer).toBe(0);
  });

  test('平和自摸 20符', () => {
    const counter = new MahjongScoreCounter({
      hanCount: 2,
      isTsumo: true,
      ronType: MahjongYakuTypes.Pinfu,
    });

    const fu = counter.calculateFu();
    expect(fu).toBe(20);

    const result = counter.count();
    expect(result.nonDealer).toBe(400);
    expect(result.dealer).toBe(700);
    expect(result.ronScore).toBe(1500); // 修正：400*2 + 700 = 1500（2番20符自摸）
  });

  test('5番滿貫', () => {
    const counter = new MahjongScoreCounter({
      hanCount: 5,
      isTsumo: true,
    });

    const result = counter.count();
    expect(result.nonDealer).toBe(2000);
    expect(result.dealer).toBe(4000);
    expect(result.ronScore).toBe(8000);
  });

  test('13番國士無雙', () => {
    const counter = new MahjongScoreCounter({
      hanCount: 13,
      isTsumo: false,
      ronType: MahjongYakuTypes.KokushiMusou,
    });

    const result = counter.count();
    expect(result.ronScore).toBe(32000);
  });

  test('符數計算 - 嵌張等待', () => {
    const counter = new MahjongScoreCounter({
      hanCount: 1,
      waitingType: WaitingType.Kanchan,
      yakuList: [MahjongYakuTypes.Riichi],
    });

    const fu = counter.calculateFu();
    expect(fu).toBe(30); // 基本20 + 嵌張2 + 榮和0 -> 22 -> 進位到30
  });
});
