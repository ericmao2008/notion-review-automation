export type Stage = 'D1' | 'D3' | 'D7' | 'D14' | 'D30' | 'Done';
export declare const ORDER: Stage[];
export declare const THRESHOLD = 70;
export declare const INTERVAL_DAYS: Record<Exclude<Stage, 'Done'>, number>;
export declare const TARGET: Record<Stage, string>;
export declare function nextStage(s: Stage): Stage;
export declare function addDaysISO(baseISO: string, days: number): string;
