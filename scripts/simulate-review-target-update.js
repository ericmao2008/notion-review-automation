#!/usr/bin/env node

// 模拟 Review Target 更新过程
import { TARGET, nextStage, THRESHOLD } from '../apps/sixmin/dist/review.js';

console.log('🧪 Simulating Review Target Update Process\n');

// 模拟页面数据
const mockPages = [
  {
    id: 'test-page-1',
    title: 'Test Episode 1',
    currentStage: 'D1',
    d1Score: 79,
    expectedNextStage: 'D3',
    expectedTarget: '能表达'
  },
  {
    id: 'test-page-2', 
    title: 'Test Episode 2',
    currentStage: 'D3',
    d3Score: 85,
    expectedNextStage: 'D7',
    expectedTarget: '语法对'
  },
  {
    id: 'test-page-3',
    title: 'Test Episode 3', 
    currentStage: 'D7',
    d7Score: 72,
    expectedNextStage: 'D14',
    expectedTarget: '能沟通'
  },
  {
    id: 'test-page-4',
    title: 'Test Episode 4',
    currentStage: 'D14', 
    d14Score: 88,
    expectedNextStage: 'D30',
    expectedTarget: '熟练掌握'
  },
  {
    id: 'test-page-5',
    title: 'Test Episode 5',
    currentStage: 'D30',
    d30Score: 75,
    expectedNextStage: 'Done',
    expectedTarget: '已完成'
  },
  {
    id: 'test-page-6',
    title: 'Test Episode 6',
    currentStage: 'D1',
    d1Score: 65, // 低于阈值
    expectedNextStage: 'D1', // 不推进
    expectedTarget: '能理解' // 保持当前
  }
];

// 模拟推进逻辑
function simulateAdvancement(page) {
  const { currentStage, d1Score, d3Score, d7Score, d14Score, d30Score } = page;
  
  // 获取当前阶段的分数
  const scoreMap = {
    'D1': d1Score || 0,
    'D3': d3Score || 0, 
    'D7': d7Score || 0,
    'D14': d14Score || 0,
    'D30': d30Score || 0
  };
  
  const currentScore = scoreMap[currentStage];
  
  if (currentScore >= THRESHOLD) {
    const nextStageValue = nextStage(currentStage);
    const nextTarget = TARGET[nextStageValue];
    
    return {
      advanced: true,
      from: currentStage,
      to: nextStageValue,
      score: currentScore,
      target: nextTarget
    };
  } else {
    return {
      advanced: false,
      from: currentStage,
      to: currentStage,
      score: currentScore,
      target: TARGET[currentStage],
      reason: `score ${currentScore} < ${THRESHOLD}`
    };
  }
}

// 测试每个页面
mockPages.forEach((page, index) => {
  console.log(`📄 Test ${index + 1}: ${page.title}`);
  console.log(`   Current Stage: ${page.currentStage}`);
  console.log(`   Score: ${page[`${page.currentStage.toLowerCase()}Score`] || 0}`);
  
  const result = simulateAdvancement(page);
  
  if (result.advanced) {
    console.log(`   ✅ ADVANCED: ${result.from} → ${result.to}`);
    console.log(`   📋 Review Target: "${result.target}"`);
  } else {
    console.log(`   ⏭️  SKIPPED: ${result.reason}`);
    console.log(`   📋 Review Target: "${result.target}" (unchanged)`);
  }
  
  // 验证预期结果
  const expected = {
    nextStage: page.expectedNextStage,
    target: page.expectedTarget
  };
  
  if (result.to === expected.nextStage && result.target === expected.target) {
    console.log(`   ✅ EXPECTED: Correct advancement and target`);
  } else {
    console.log(`   ❌ UNEXPECTED: Expected ${expected.nextStage} with "${expected.target}"`);
  }
  
  console.log('');
});

console.log('✅ Review Target simulation completed!');
