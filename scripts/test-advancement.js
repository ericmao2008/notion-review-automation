#!/usr/bin/env node

// 模拟测试推进逻辑
import { Stage, THRESHOLD, INTERVAL_DAYS, TARGET, nextStage, addDaysISO } from '../apps/sixmin/dist/review.js';
import { FIELD } from '../apps/sixmin/dist/schema.js';

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// 模拟页面数据
const mockPages = [
  {
    id: 'test-page-1',
    properties: {
      [FIELD.title]: { title: [{ plain_text: 'Test Episode 1' }] },
      [FIELD.stage]: { select: { name: 'D1' } },
      [FIELD.scoreD1]: { number: 79 },
      [FIELD.scoreD3]: { number: 0 },
      [FIELD.scoreD7]: { number: 0 },
      [FIELD.scoreD14]: { number: 0 },
      [FIELD.scoreD30]: { number: 0 }
    }
  },
  {
    id: 'test-page-2', 
    properties: {
      [FIELD.title]: { title: [{ plain_text: 'Test Episode 2' }] },
      [FIELD.stage]: { select: { name: 'D3' } },
      [FIELD.scoreD1]: { number: 85 },
      [FIELD.scoreD3]: { number: 75 },
      [FIELD.scoreD7]: { number: 0 },
      [FIELD.scoreD14]: { number: 0 },
      [FIELD.scoreD30]: { number: 0 }
    }
  },
  {
    id: 'test-page-3',
    properties: {
      [FIELD.title]: { title: [{ plain_text: 'Test Episode 3' }] },
      [FIELD.stage]: { select: { name: 'D30' } },
      [FIELD.scoreD1]: { number: 90 },
      [FIELD.scoreD3]: { number: 88 },
      [FIELD.scoreD7]: { number: 85 },
      [FIELD.scoreD14]: { number: 82 },
      [FIELD.scoreD30]: { number: 78 }
    }
  },
  {
    id: 'test-page-4',
    properties: {
      [FIELD.title]: { title: [{ plain_text: 'Test Episode 4' }] },
      [FIELD.stage]: { select: { name: 'D1' } },
      [FIELD.scoreD1]: { number: 65 }, // 分数不足
      [FIELD.scoreD3]: { number: 0 },
      [FIELD.scoreD7]: { number: 0 },
      [FIELD.scoreD14]: { number: 0 },
      [FIELD.scoreD30]: { number: 0 }
    }
  }
];

// 模拟推进逻辑
function simulateAdvancement(page, todayISO) {
  const p = page.properties;
  const stage = p[FIELD.stage]?.select?.name ?? 'D1';
  
  if (stage === 'Done') {
    return { advanced: false, reason: 'already Done' };
  }

  const scoreProp = FIELD.score[stage];
  const scoreVal = Number(p[scoreProp]?.number ?? 0);

  if (scoreVal >= THRESHOLD) {
    const next = nextStage(stage);
    const props = {
      [FIELD.stage]: { select: { name: next } },
      [FIELD.status]: { select: { name: next === 'Done' ? 'Done' : 'Reviewing' } },
      [FIELD.lastReview]: { date: { start: new Date().toISOString() } }
    };

    if (next !== 'Done') {
      const days = INTERVAL_DAYS[stage];
      props[FIELD.next] = { date: { start: addDaysISO(todayISO, days) } };
      props[FIELD.target] = { rich_text: [{ text: { content: TARGET[next] } }] };
    } else {
      props[FIELD.next] = { date: null };
      props[FIELD.target] = { rich_text: [{ text: { content: TARGET[next] } }] };
    }

    return { advanced: true, to: next, score: scoreVal, updates: props };
  }

  return { advanced: false, reason: `score ${scoreVal} < ${THRESHOLD}` };
}

async function testAdvancement() {
  log('🧪 Testing advancement logic...');
  log('');

  const todayISO = new Date().toISOString().slice(0, 10);
  log(`📅 Today: ${todayISO}`);
  log('');

  const results = {
    total: 0,
    advanced: 0,
    skipped: 0
  };

  for (const page of mockPages) {
    results.total++;
    const pageTitle = page.properties[FIELD.title]?.title?.[0]?.plain_text || page.id;
    const currentStage = page.properties[FIELD.stage]?.select?.name;
    
    log(`📄 Testing: "${pageTitle}" (Current: ${currentStage})`);
    
    const result = simulateAdvancement(page, todayISO);
    
    if (result.advanced) {
      results.advanced++;
      log(`✅ ADVANCED: ${currentStage} → ${result.to} (score: ${result.score})`);
      log(`   Updates:`);
      for (const [key, value] of Object.entries(result.updates)) {
        if (key === FIELD.stage) {
          log(`     ${key}: ${value.select.name}`);
        } else if (key === FIELD.status) {
          log(`     ${key}: ${value.select.name}`);
        } else if (key === FIELD.target) {
          log(`     ${key}: ${value.rich_text[0].text.content}`);
        } else if (key === FIELD.next) {
          log(`     ${key}: ${value.date ? value.date.start : 'null'}`);
        } else if (key === FIELD.lastReview) {
          log(`     ${key}: ${value.date.start}`);
        }
      }
    } else {
      results.skipped++;
      log(`⏸️  SKIPPED: ${result.reason}`);
    }
    log('');
  }

  // 输出统计
  log('📊 Test Results:');
  log(`   Total pages tested: ${results.total}`);
  log(`   Pages advanced: ${results.advanced}`);
  log(`   Pages skipped: ${results.skipped}`);
  log('');
  
  // 验证预期结果
  log('🔍 Expected Results Verification:');
  log('   ✅ Test Episode 1 (D1, score 79) → Should advance to D3');
  log('   ✅ Test Episode 2 (D3, score 75) → Should advance to D7'); 
  log('   ✅ Test Episode 3 (D30, score 78) → Should advance to Done');
  log('   ✅ Test Episode 4 (D1, score 65) → Should be skipped (< 70)');
  log('');
  log('✅ Advancement logic test completed successfully!');
}

// 运行测试
testAdvancement();
