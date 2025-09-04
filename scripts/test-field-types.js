#!/usr/bin/env node

// 测试不同字段类型的 Review Target 更新
import { TARGET, nextStage } from '../apps/sixmin/dist/review.js';

console.log('🧪 Testing Review Target field type handling\n');

// 模拟不同字段类型的页面
const testCases = [
  {
    name: 'Select Field',
    fieldType: 'select',
    currentStage: 'D1',
    nextStage: 'D3',
    expectedPayload: { select: { name: '能表达' } }
  },
  {
    name: 'Rich Text Field',
    fieldType: 'rich_text', 
    currentStage: 'D3',
    nextStage: 'D7',
    expectedPayload: { rich_text: [{ text: { content: '语法对' } }] }
  },
  {
    name: 'Formula Field (should skip)',
    fieldType: 'formula',
    currentStage: 'D7',
    nextStage: 'D14',
    expectedPayload: null // 不应该更新
  }
];

console.log('📋 Testing field type handling:\n');

testCases.forEach((testCase, index) => {
  console.log(`📄 Test ${index + 1}: ${testCase.name}`);
  console.log(`   Current Stage: ${testCase.currentStage}`);
  console.log(`   Next Stage: ${testCase.nextStage}`);
  console.log(`   Field Type: ${testCase.fieldType}`);
  
  const nextTarget = TARGET[testCase.nextStage];
  console.log(`   Target Value: "${nextTarget}"`);
  
  // 模拟字段类型检测和更新逻辑
  let updatePayload = null;
  
  if (testCase.fieldType === 'select') {
    updatePayload = { select: { name: nextTarget } };
  } else if (testCase.fieldType === 'rich_text') {
    updatePayload = { rich_text: [{ text: { content: nextTarget } }] };
  } else if (testCase.fieldType !== 'formula') {
    // 默认尝试 Select 类型
    updatePayload = { select: { name: nextTarget } };
  }
  
  console.log(`   Update Payload: ${JSON.stringify(updatePayload)}`);
  
  if (updatePayload && JSON.stringify(updatePayload) === JSON.stringify(testCase.expectedPayload)) {
    console.log(`   ✅ CORRECT: Payload matches expected`);
  } else if (updatePayload === null && testCase.expectedPayload === null) {
    console.log(`   ✅ CORRECT: Skipped formula field as expected`);
  } else {
    console.log(`   ❌ INCORRECT: Expected ${JSON.stringify(testCase.expectedPayload)}`);
  }
  
  console.log('');
});

console.log('🔍 Field Type Detection Logic:');
console.log('1. Select Field: { select: { name: "value" } }');
console.log('2. Rich Text Field: { rich_text: [{ text: { content: "value" } }] }');
console.log('3. Formula Field: Skip update (cannot be modified by script)');
console.log('4. Unknown Field: Default to Select type');
console.log('');

console.log('✅ Field type testing completed!');
