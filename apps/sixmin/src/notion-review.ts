import { Client } from '@notionhq/client';
import { FIELD } from './schema.js';
import { Stage, THRESHOLD, INTERVAL_DAYS, TARGET, nextStage, addDaysISO } from './review.js';

export async function maybeAdvanceByScore(notion: Client, page: any, todayISO: string) {
  const p: any = page.properties;
  const stage = (p[FIELD.stage]?.select?.name ?? 'D1') as Stage;
  if (stage === 'Done') return { advanced: false, reason: 'already Done' };

  const scoreProp = FIELD.score[stage as keyof typeof FIELD.score];
  const scoreVal = Number(p[scoreProp]?.number ?? 0);

  if (scoreVal >= THRESHOLD) {
    const next = nextStage(stage);
    const props: any = {
      [FIELD.stage]: { select: { name: next } },
      [FIELD.status]: { select: { name: next === 'Done' ? 'Done' : 'Reviewing' } },
      [FIELD.lastReview]: { date: { start: new Date().toISOString() } }
    };

    if (next !== 'Done') {
      const days = INTERVAL_DAYS[stage as Exclude<Stage,'Done'>];
      props[FIELD.next] = { date: { start: addDaysISO(todayISO, days) } };
      // 根据字段类型设置 Review Target
      if (p[FIELD.target]?.type === 'select') {
        props[FIELD.target] = { select: { name: TARGET[next] } };
      } else if (p[FIELD.target]?.type === 'rich_text') {
        props[FIELD.target] = { rich_text: [{ text: { content: TARGET[next] } }] };
      } else if (p[FIELD.target]?.type !== 'formula') {
        // 默认尝试 Select 类型
        props[FIELD.target] = { select: { name: TARGET[next] } };
      }
    } else {
      props[FIELD.next] = { date: null };
      // 根据字段类型设置 Review Target (Done 阶段)
      if (p[FIELD.target]?.type === 'select') {
        props[FIELD.target] = { select: { name: TARGET[next] } };
      } else if (p[FIELD.target]?.type === 'rich_text') {
        props[FIELD.target] = { rich_text: [{ text: { content: TARGET[next] } }] };
      } else if (p[FIELD.target]?.type !== 'formula') {
        // 默认尝试 Select 类型
        props[FIELD.target] = { select: { name: TARGET[next] } };
      }
    }

    await notion.pages.update({ page_id: page.id, properties: props });
    return { advanced: true, to: next, score: scoreVal };
  }

  return { advanced: false, reason: `score ${scoreVal} < ${THRESHOLD}` };
}
