import { Client } from '@notionhq/client';
import { Stage } from './review.js';
export declare function maybeAdvanceByScore(notion: Client, page: any, todayISO: string): Promise<{
    advanced: boolean;
    reason: string;
    to?: undefined;
    score?: undefined;
} | {
    advanced: boolean;
    to: Stage;
    score: number;
    reason?: undefined;
}>;
