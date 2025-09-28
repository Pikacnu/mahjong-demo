import { MahjongScoreCounter } from './scoreCounter';
import { MahjongYakuTypes } from '../typecheck';
import { WaitingType } from '../typecheck/yaku';

// 麻雀計分系統使用範例
console.log('=== 麻雀計分系統測試 ===\n');

// 範例1: 1番30符自摸（立直）
console.log('範例1: 1番30符自摸（立直）');
const example1 = new MahjongScoreCounter({
  hanCount: 1,
  isTsumo: true,
  yakuList: [MahjongYakuTypes.Riichi],
});

const result1 = example1.count();
const fu1 = example1.calculateFu();
console.log(`符數: ${fu1}符`);
console.log(`閒家: ${result1.nonDealer}點`);
console.log(`莊家: ${result1.dealer}點`);
console.log(`榮和: ${result1.ronScore}點\n`);

// 範例2: 2番25符榮和（七對子）
console.log('範例2: 2番25符榮和（七對子）');
const example2 = new MahjongScoreCounter({
  hanCount: 2,
  isTsumo: false,
  ronType: MahjongYakuTypes.Chiitoitsu,
});

const result2 = example2.count();
const fu2 = example2.calculateFu();
console.log(`符數: ${fu2}符`);
console.log(`榮和: ${result2.ronScore}點\n`);

// 範例3: 2番20符自摸（平和+立直）
console.log('範例3: 2番20符自摸（平和+立直）');
const example3 = new MahjongScoreCounter({
  hanCount: 2,
  isTsumo: true,
  yakuList: [MahjongYakuTypes.Pinfu, MahjongYakuTypes.Riichi],
});

const result3 = example3.count();
const fu3 = example3.calculateFu();
console.log(`符數: ${fu3}符`);
console.log(`閒家: ${result3.nonDealer}點`);
console.log(`莊家: ${result3.dealer}點`);
console.log(`榮和: ${result3.ronScore}點\n`);

// 範例4: 5番滿貫
console.log('範例4: 5番滿貫');
const example4 = new MahjongScoreCounter({
  hanCount: 5,
  isTsumo: true,
});

const result4 = example4.count();
console.log(`閒家: ${result4.nonDealer}點`);
console.log(`莊家: ${result4.dealer}點`);
console.log(`榮和: ${result4.ronScore}點\n`);

// 範例5: 13番役滿（國士無雙）
console.log('範例5: 13番役滿（國士無雙）');
const example5 = new MahjongScoreCounter({
  hanCount: 13,
  isTsumo: false,
  ronType: MahjongYakuTypes.KokushiMusou,
});

const result5 = example5.count();
console.log(`榮和: ${result5.ronScore}點\n`);

// 範例6: 符數計算測試（嵌張等待）
console.log('範例6: 符數計算測試（嵌張等待）');
const example6 = new MahjongScoreCounter({
  hanCount: 1,
  waitingType: WaitingType.Kanchan,
  yakuList: [MahjongYakuTypes.Riichi],
  isTsumo: false,
});

const fu6 = example6.calculateFu();
const result6 = example6.count();
console.log(`符數: ${fu6}符（基本20 + 嵌張2 -> 進位到30）`);
console.log(`榮和: ${result6.ronScore}點\n`);

console.log('=== 計分系統測試完成 ===');
