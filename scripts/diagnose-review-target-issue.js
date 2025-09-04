#!/usr/bin/env node

// 诊断 Review Target 问题的完整指南
console.log('🔍 Review Target 问题诊断指南\n');

console.log('📋 问题症状:');
console.log('   - 两个文件分别处于 D1 和 D3 阶段');
console.log('   - Review Target 值显示不正确');
console.log('   - 脚本逻辑测试显示正确');
console.log('');

console.log('🔍 可能的原因和解决方案:\n');

console.log('1. 📝 字段类型问题 (最可能)');
console.log('   ❌ 问题: Review Target 是 Formula 字段');
console.log('   ✅ 解决: 在 Notion 中将字段类型改为 Select 或 Rich Text');
console.log('   📋 步骤:');
console.log('      - 打开 Notion 数据库');
console.log('      - 点击 Review Target 列标题');
console.log('      - 选择 "Edit property"');
console.log('      - 将类型从 "Formula" 改为 "Select" 或 "Text"');
console.log('');

console.log('2. 🏷️  Select 选项缺失');
console.log('   ❌ 问题: Select 字段缺少必要的选项');
console.log('   ✅ 解决: 添加所有必需的选项');
console.log('   📋 必需选项:');
console.log('      - 能理解');
console.log('      - 能表达');
console.log('      - 语法对');
console.log('      - 能沟通');
console.log('      - 熟练掌握');
console.log('      - 已完成');
console.log('');

console.log('3. 📛 字段名称问题');
console.log('   ❌ 问题: 字段名称不匹配');
console.log('   ✅ 解决: 确保字段名称为 "Review Target" (区分大小写)');
console.log('   📋 检查:');
console.log('      - 没有多余的空格');
console.log('      - 没有特殊字符');
console.log('      - 大小写完全匹配');
console.log('');

console.log('4. 🔄 脚本未运行');
console.log('   ❌ 问题: 新系统脚本没有实际运行');
console.log('   ✅ 解决: 确保运行的是新系统');
console.log('   📋 命令:');
console.log('      - npm run advance (新系统)');
console.log('      - npm run run (旧系统)');
console.log('');

console.log('🧪 测试步骤:\n');

console.log('步骤 1: 检查字段类型');
console.log('   1. 在 Notion 中打开数据库');
console.log('   2. 查看 Review Target 列');
console.log('   3. 确认字段类型 (Select/Text/Formula)');
console.log('');

console.log('步骤 2: 如果是 Select 字段');
console.log('   1. 点击列标题 → Edit property');
console.log('   2. 检查是否有所有必需选项');
console.log('   3. 如果没有，手动添加缺失的选项');
console.log('');

console.log('步骤 3: 如果是 Formula 字段');
console.log('   1. 点击列标题 → Edit property');
console.log('   2. 将类型改为 Select 或 Text');
console.log('   3. 如果是 Select，添加所有必需选项');
console.log('');

console.log('步骤 4: 测试修复');
console.log('   1. 设置一个测试页面的分数 >= 70');
console.log('   2. 运行: npm run advance');
console.log('   3. 检查 Review Target 是否正确更新');
console.log('');

console.log('📞 如果问题仍然存在:');
console.log('   1. 运行: node scripts/check-current-data.js (需要 API token)');
console.log('   2. 检查具体的字段配置和当前值');
console.log('   3. 提供具体的错误信息或字段类型');
console.log('');

console.log('✅ 诊断指南完成！');
