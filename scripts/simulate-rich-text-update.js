#!/usr/bin/env node

// 模拟 Rich Text 字段的更新过程
import { TARGET, nextStage, THRESHOLD } from '../apps/sixmin/dist/review.js';

console.log('🧪 Simulating Rich Text Review Target Update\n');

// 模拟你的两个文件的情况
const testPages = [
  {
    id: 'page-1',
    title: '6-min-2025-09-04',
    currentStage: 'D1',
    d1Score: 0, // 空白分数
    currentTarget: '', // 空白
    expectedTarget: '能理解'
  },
  {
    id: 'page-2',
    title: '6-min-2025-09-02',
    currentStage: 'D3',
    d3Score: 79, // 有分数
    currentTarget: '主动回忆(背诵句子+造句)', // 错误值
    expectedTarget: '能表达'
  }
];

console.log('📋 Simulating Rich Text field updates:\n');

testPages.forEach((page, index) => {
  console.log(`📄 ${page.title}`);
  console.log(`   Current Stage: ${page.currentStage}`);
  console.log(`   Current Target: "${page.currentTarget}"`);
  console.log(`   Expected Target: "${page.expectedTarget}"`);
  
  // 检查是否需要修复当前值
  if (page.currentTarget !== page.expectedTarget) {
    console.log(`   🔧 Need to fix current value`);
    console.log(`   📝 Rich Text update: { rich_text: [{ text: { content: "${page.expectedTarget}" } }] }`);
  } else {
    console.log(`   ✅ Current value is correct`);
  }
  
  // 检查推进逻辑
  const scoreField = `${page.currentStage.toLowerCase()}Score`;
  const currentScore = page[scoreField];
  
  if (currentScore >= THRESHOLD) {
    const nextStageValue = nextStage(page.currentStage);
    const nextTarget = TARGET[nextStageValue];
    
    console.log(`   🚀 Would advance: ${page.currentStage} → ${nextStageValue}`);
    console.log(`   📝 Next Target: "${nextTarget}"`);
    console.log(`   📝 Rich Text update: { rich_text: [{ text: { content: "${nextTarget}" } }] }`);
  } else {
    console.log(`   ⏭️  Would NOT advance: score ${currentScore} < ${THRESHOLD}`);
  }
  
  console.log('');
});

console.log('🔍 Rich Text Field Update Process:');
console.log('1. Detect field type: rich_text');
console.log('2. Create payload: { rich_text: [{ text: { content: "value" } }] }');
console.log('3. Update via Notion API');
console.log('');

console.log('📋 Current Issues:');
console.log('1. D1 file: Blank target → Should be "能理解"');
console.log('2. D3 file: Wrong target → Should be "能表达"');
console.log('');

console.log('🛠️ Solutions:');
console.log('1. Manual fix in Notion (immediate)');
console.log('2. Run: node scripts/fix-rich-text-review-target.js (needs API token)');
console.log('3. Test advancement with D1 Score >= 70');
console.log('');

console.log('✅ Rich Text simulation completed!');
