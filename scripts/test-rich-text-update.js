#!/usr/bin/env node

// 测试 Rich Text 字段的 Review Target 更新
import { TARGET, nextStage } from '../apps/sixmin/dist/review.js';

console.log('🧪 Testing Rich Text Review Target Update\n');

// 模拟 Rich Text 字段的页面数据
const testCases = [
  {
    name: 'D1 → D3 (Rich Text)',
    currentStage: 'D1',
    fieldType: 'rich_text',
    expectedPayload: { rich_text: [{ text: { content: '能表达' } }] }
  },
  {
    name: 'D3 → D7 (Rich Text)',
    currentStage: 'D3', 
    fieldType: 'rich_text',
    expectedPayload: { rich_text: [{ text: { content: '语法对' } }] }
  }
];

console.log('📋 Testing Rich Text field updates:\n');

testCases.forEach((testCase, index) => {
  console.log(`📄 Test ${index + 1}: ${testCase.name}`);
  console.log(`   Current Stage: ${testCase.currentStage}`);
  console.log(`   Field Type: ${testCase.fieldType}`);
  
  const nextStageValue = nextStage(testCase.currentStage);
  const targetValue = TARGET[nextStageValue];
  
  console.log(`   Next Stage: ${nextStageValue}`);
  console.log(`   Target Value: "${targetValue}"`);
  
  // 模拟字段类型检测逻辑
  let updatePayload = null;
  
  if (testCase.fieldType === 'rich_text') {
    updatePayload = { rich_text: [{ text: { content: targetValue } }] };
  } else if (testCase.fieldType === 'select') {
    updatePayload = { select: { name: targetValue } };
  }
  
  console.log(`   Update Payload: ${JSON.stringify(updatePayload)}`);
  
  if (JSON.stringify(updatePayload) === JSON.stringify(testCase.expectedPayload)) {
    console.log(`   ✅ CORRECT: Rich Text payload matches expected`);
  } else {
    console.log(`   ❌ INCORRECT: Expected ${JSON.stringify(testCase.expectedPayload)}`);
  }
  
  console.log('');
});

console.log('🔍 Rich Text Field Update Format:');
console.log('   { rich_text: [{ text: { content: "value" } }] }');
console.log('');

console.log('📋 Current Review Target Values:');
Object.entries(TARGET).forEach(([stage, target]) => {
  console.log(`   ${stage}: "${target}"`);
});
console.log('');

console.log('✅ Rich Text testing completed!');
