#!/usr/bin/env node

// 测试 Review Target 更新逻辑
import { TARGET, nextStage } from '../apps/sixmin/dist/review.js';

console.log('🧪 Testing Review Target Logic\n');

// 测试所有阶段的推进
const stages = ['D1', 'D3', 'D7', 'D14', 'D30'];

stages.forEach(stage => {
  const next = nextStage(stage);
  const target = TARGET[next];
  
  console.log(`📋 ${stage} → ${next}`);
  console.log(`   Review Target: "${target}"`);
  console.log('');
});

// 测试 Done 阶段
console.log('📋 Done → Done');
console.log(`   Review Target: "${TARGET.Done}"`);
console.log('');

console.log('✅ Review Target mapping test completed!');
