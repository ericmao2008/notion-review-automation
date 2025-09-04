#!/usr/bin/env node

// 调试 Review Target 问题
import { TARGET, nextStage, THRESHOLD } from '../apps/sixmin/dist/review.js';

console.log('🔍 Debugging Review Target Issue\n');

// 模拟你提到的两个文件的情况
const testCases = [
  {
    name: 'File 1 (D1 stage)',
    currentStage: 'D1',
    d1Score: 75, // 假设分数 >= 70
    expectedNextStage: 'D3',
    expectedTarget: '能表达'
  },
  {
    name: 'File 2 (D3 stage)', 
    currentStage: 'D3',
    d3Score: 80, // 假设分数 >= 70
    expectedNextStage: 'D7',
    expectedTarget: '语法对'
  }
];

console.log('📋 Current TARGET mapping:');
Object.entries(TARGET).forEach(([stage, target]) => {
  console.log(`   ${stage}: "${target}"`);
});
console.log('');

console.log('🧪 Testing advancement logic:\n');

testCases.forEach((testCase, index) => {
  console.log(`📄 ${testCase.name}`);
  console.log(`   Current Stage: ${testCase.currentStage}`);
  
  // 获取当前阶段的分数
  const scoreField = `${testCase.currentStage.toLowerCase()}Score`;
  const currentScore = testCase[scoreField];
  console.log(`   ${testCase.currentStage} Score: ${currentScore}`);
  
  if (currentScore >= THRESHOLD) {
    const nextStageValue = nextStage(testCase.currentStage);
    const nextTarget = TARGET[nextStageValue];
    
    console.log(`   ✅ Should advance: ${testCase.currentStage} → ${nextStageValue}`);
    console.log(`   📋 Review Target should be: "${nextTarget}"`);
    
    // 检查是否与预期一致
    if (nextStageValue === testCase.expectedNextStage && nextTarget === testCase.expectedTarget) {
      console.log(`   ✅ EXPECTED: Correct advancement and target`);
    } else {
      console.log(`   ❌ UNEXPECTED: Expected ${testCase.expectedNextStage} with "${testCase.expectedTarget}"`);
    }
  } else {
    console.log(`   ⏭️  Should NOT advance: score ${currentScore} < ${THRESHOLD}`);
    console.log(`   📋 Review Target should remain: "${TARGET[testCase.currentStage]}"`);
  }
  
  console.log('');
});

console.log('🔍 Possible issues with Review Target display:\n');
console.log('1. Field Type Issue:');
console.log('   - If Review Target is a Formula field, script cannot update it');
console.log('   - Should be Select or Rich Text field for script updates');
console.log('');
console.log('2. Field Name Issue:');
console.log('   - Field name must be exactly "Review Target" (case-sensitive)');
console.log('   - Check for extra spaces or different characters');
console.log('');
console.log('3. Select Options Issue:');
console.log('   - If using Select field, all target values must exist as options');
console.log('   - Required options: 能理解, 能表达, 语法对, 能沟通, 熟练掌握, 已完成');
console.log('');
console.log('4. Script Logic Issue:');
console.log('   - Check if maybeAdvanceByScore function is being called');
console.log('   - Verify the field update logic in notion-review.ts');
console.log('');

console.log('✅ Debug analysis completed!');
