#!/usr/bin/env node

// 模拟脚本执行过程，找出为什么 Review Target 没有更新
import { TARGET, nextStage, THRESHOLD } from '../apps/sixmin/dist/review.js';

console.log('🔍 Simulating script execution to find the issue\n');

// 基于你提供的信息模拟页面数据
const mockPages = [
  {
    id: 'page-1',
    title: '6-min-2025-09-04',
    properties: {
      'Review Stage': { select: { name: 'D1' } },
      'Review Target': { rich_text: [] }, // 空白
      'D1 Score': { number: 0 }, // 空白分数
      'D3 Score': { number: 0 },
      'D7 Score': { number: 0 },
      'D14 Score': { number: 0 },
      'D30 Score': { number: 0 }
    }
  },
  {
    id: 'page-2', 
    title: '6-min-2025-09-02',
    properties: {
      'Review Stage': { select: { name: 'D3' } },
      'Review Target': { rich_text: [{ text: { content: '主动回忆(背诵句子+造句)' } }] }, // 错误值
      'D1 Score': { number: 79 }, // 有分数
      'D3 Score': { number: 0 },
      'D7 Score': { number: 0 },
      'D14 Score': { number: 0 },
      'D30 Score': { number: 0 }
    }
  }
];

console.log('📋 Simulating maybeAdvanceByScore function:\n');

mockPages.forEach((page, index) => {
  console.log(`📄 ${page.title}`);
  
  const p = page.properties;
  const stage = p['Review Stage']?.select?.name || 'D1';
  const reviewTargetField = p['Review Target'];
  
  console.log(`   Current Stage: ${stage}`);
  console.log(`   Review Target Field Type: ${reviewTargetField?.type}`);
  console.log(`   Review Target Current Value: ${JSON.stringify(reviewTargetField)}`);
  
  // 模拟 maybeAdvanceByScore 逻辑
  if (stage === 'Done') {
    console.log(`   ⏭️  Already Done, skipping`);
    return;
  }
  
  const scoreMap = {
    'D1': 'D1 Score',
    'D3': 'D3 Score', 
    'D7': 'D7 Score',
    'D14': 'D14 Score',
    'D30': 'D30 Score'
  };
  
  const scoreProp = scoreMap[stage];
  const scoreVal = Number(p[scoreProp]?.number ?? 0);
  
  console.log(`   Score Field: ${scoreProp}`);
  console.log(`   Score Value: ${scoreVal}`);
  
  if (scoreVal >= THRESHOLD) {
    const next = nextStage(stage);
    console.log(`   ✅ Score >= ${THRESHOLD}, advancing to ${next}`);
    
    // 模拟更新逻辑
    const props = {
      'Review Stage': { select: { name: next } },
      'Status': { select: { name: next === 'Done' ? 'Done' : 'Reviewing' } },
      'Last Review Date': { date: { start: new Date().toISOString() } }
    };
    
    if (next !== 'Done') {
      // 模拟 Next Review Date 更新
      const days = { D1: 2, D3: 4, D7: 7, D14: 16, D30: 0 }[stage];
      props['Next Review Date'] = { date: { start: '2025-09-06' } }; // 模拟日期
    } else {
      props['Next Review Date'] = { date: null };
    }
    
    // 模拟 Review Target 更新
    if (reviewTargetField?.type === 'rich_text') {
      props['Review Target'] = { rich_text: [{ text: { content: TARGET[next] } }] };
      console.log(`   📝 Would update Review Target to: "${TARGET[next]}" (rich_text)`);
    } else if (reviewTargetField?.type === 'select') {
      props['Review Target'] = { select: { name: TARGET[next] } };
      console.log(`   📝 Would update Review Target to: "${TARGET[next]}" (select)`);
    } else if (reviewTargetField?.type !== 'formula') {
      props['Review Target'] = { select: { name: TARGET[next] } };
      console.log(`   📝 Would update Review Target to: "${TARGET[next]}" (default select)`);
    } else {
      console.log(`   ⏭️  Review Target is formula, skipping update`);
    }
    
    console.log(`   📋 Update payload: ${JSON.stringify(props, null, 2)}`);
    
  } else {
    console.log(`   ❌ Score ${scoreVal} < ${THRESHOLD}, no advancement`);
  }
  
  console.log('');
});

console.log('🔍 Analysis:');
console.log('1. Page 1 (D1): Score = 0 < 70 → No advancement → Review Target not updated');
console.log('2. Page 2 (D3): Score = 79 >= 70 → Should advance → Review Target should update');
console.log('');
console.log('❓ Questions:');
console.log('1. Did you set D1 Score >= 70 for the D1 page?');
console.log('2. Did the script actually run the new system (npm run advance)?');
console.log('3. Are there any error messages in the script output?');
console.log('');
console.log('✅ Simulation completed!');
