#!/usr/bin/env node

import { Client } from '@notionhq/client';

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
  console.error('❌ Please set NOTION_TOKEN and NOTION_DATABASE_ID environment variables');
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });

// 正确的 Review Target 映射
const CORRECT_TARGETS = {
  'D1': '能理解',
  'D3': '能表达', 
  'D7': '语法对',
  'D14': '能沟通',
  'D30': '熟练掌握',
  'Done': '已完成'
};

async function fixReviewTargetValues() {
  try {
    console.log('🔧 Fixing Review Target values...\n');
    
    // 查询所有页面
    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      page_size: 100
    });
    
    console.log(`📄 Found ${response.results.length} pages to check\n`);
    
    let fixedCount = 0;
    
    for (const page of response.results) {
      const props = page.properties;
      const title = props['Name']?.title?.[0]?.plain_text || 'Untitled';
      const currentStage = props['Review Stage']?.select?.name;
      const currentTarget = props['Review Target'];
      
      if (!currentStage) {
        console.log(`⏭️  Skipping "${title}" - no Review Stage`);
        continue;
      }
      
      const expectedTarget = CORRECT_TARGETS[currentStage];
      if (!expectedTarget) {
        console.log(`⏭️  Skipping "${title}" - unknown stage: ${currentStage}`);
        continue;
      }
      
      // 检查当前 Review Target 值
      let currentTargetValue = '';
      if (currentTarget?.select?.name) {
        currentTargetValue = currentTarget.select.name;
      } else if (currentTarget?.rich_text?.[0]?.text?.content) {
        currentTargetValue = currentTarget.rich_text[0].text.content;
      }
      
      console.log(`📄 "${title}" (${currentStage})`);
      console.log(`   Current Target: "${currentTargetValue}"`);
      console.log(`   Expected Target: "${expectedTarget}"`);
      
      if (currentTargetValue !== expectedTarget) {
        console.log(`   🔧 Fixing...`);
        
        // 确定字段类型并更新
        let updatePayload = {};
        
        if (currentTarget?.type === 'select') {
          updatePayload = { select: { name: expectedTarget } };
        } else if (currentTarget?.type === 'rich_text') {
          updatePayload = { rich_text: [{ text: { content: expectedTarget } }] };
        } else {
          // 默认尝试 select
          updatePayload = { select: { name: expectedTarget } };
        }
        
        try {
          await notion.pages.update({
            page_id: page.id,
            properties: {
              'Review Target': updatePayload
            }
          });
          
          console.log(`   ✅ Fixed to: "${expectedTarget}"`);
          fixedCount++;
        } catch (error) {
          console.log(`   ❌ Error: ${error.message}`);
        }
      } else {
        console.log(`   ✅ Already correct`);
      }
      
      console.log('');
    }
    
    console.log(`🎉 Fixed ${fixedCount} pages`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixReviewTargetValues();
