export type Stage = 'D1'|'D3'|'D7'|'D14'|'D30'|'Done';
export const ORDER: Stage[] = ['D1','D3','D7','D14','D30','Done'];
export const THRESHOLD = 70;

// 推进间隔：按"当前阶段"决定下一次日期（D1完成后+2天进入D3，依此类推）
export const INTERVAL_DAYS: Record<Exclude<Stage,'Done'>, number> = {
  D1: 2, D3: 4, D7: 7, D14: 16, D30: 0
};

// 最终 Review Target 文案
export const TARGET: Record<Stage,string> = {
  D1: '能理解',
  D3: '能表达',
  D7: '语法对',
  D14: '能沟通',
  D30: '熟练掌握',
  Done: '已完成'
};

export function nextStage(s: Stage): Stage {
  const i = ORDER.indexOf(s);
  return i >= 0 && i < ORDER.length - 1 ? ORDER[i + 1] : 'Done';
}

export function addDaysISO(baseISO: string, days: number) {
  const d = new Date(baseISO); 
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
