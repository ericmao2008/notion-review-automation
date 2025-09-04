#!/usr/bin/env node

// 分析 Review Target 问题
console.log('🔍 分析 Review Target 显示问题\n');

// 正确的映射
const CORRECT_TARGETS = {
  'D1': '能理解',
  'D3': '能表达', 
  'D7': '语法对',
  'D14': '能沟通',
  'D30': '熟练掌握',
  'Done': '已完成'
};

console.log('📋 正确的 Review Target 映射:');
Object.entries(CORRECT_TARGETS).forEach(([stage, target]) => {
  console.log(`   ${stage}: "${target}"`);
});
console.log('');

// 基于你提供的信息分析问题
const reportedIssues = [
  {
    file: '6-min-2025-09-04',
    stage: 'D1',
    currentTarget: '(空白)',
    expectedTarget: '能理解',
    issue: 'D1 阶段显示空白，应该是 "能理解"'
  },
  {
    file: '6-min-2025-09-02', 
    stage: 'D3',
    currentTarget: '主动回忆(背诵句子+造句)',
    expectedTarget: '能表达',
    issue: 'D3 阶段显示错误值，应该是 "能表达"'
  }
];

console.log('🚨 发现的问题:');
reportedIssues.forEach((issue, index) => {
  console.log(`\n${index + 1}. 文件: ${issue.file}`);
  console.log(`   阶段: ${issue.stage}`);
  console.log(`   当前显示: "${issue.currentTarget}"`);
  console.log(`   应该显示: "${issue.expectedTarget}"`);
  console.log(`   问题: ${issue.issue}`);
});

console.log('\n🔍 问题分析:');
console.log('1. D1 阶段显示空白 → 可能是字段类型问题或脚本未更新');
console.log('2. D3 阶段显示错误值 → 可能是旧值未清除或字段类型问题');
console.log('');

console.log('🛠️ 解决方案:');
console.log('1. 检查 Review Target 字段类型:');
console.log('   - 如果是 Formula → 改为 Select 或 Text');
console.log('   - 如果是 Select → 确保有正确的选项');
console.log('');
console.log('2. 手动修复当前值:');
console.log('   - D1 阶段: 设置为 "能理解"');
console.log('   - D3 阶段: 设置为 "能表达"');
console.log('');
console.log('3. 运行修复脚本 (需要 API token):');
console.log('   node scripts/fix-review-target-values.js');
console.log('');
console.log('4. 测试自动推进:');
console.log('   - 设置 D1 Score >= 70');
console.log('   - 运行: npm run advance');
console.log('   - 检查是否自动更新为 "能表达"');
console.log('');

console.log('✅ 分析完成！');
