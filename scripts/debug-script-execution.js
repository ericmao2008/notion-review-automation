#!/usr/bin/env node

import { Client } from '@notionhq/client';

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
  console.error('❌ Please set NOTION_TOKEN and NOTION_DATABASE_ID environment variables');
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });

async function debugScriptExecution() {
  try {
    console.log('🔍 Debugging script execution...\n');
    
    // 查询所有页面
    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      page_size: 100
    });
    
    console.log(`📄 Found ${response.results.length} pages\n`);
    
    for (const page of response.results) {
      const props = page.properties;
      const title = props['Name']?.title?.[0]?.plain_text || 'Untitled';
      const currentStage = props['Review Stage']?.select?.name;
      const reviewTargetField = props['Review Target'];
      
      console.log(`📄 "${title}"`);
      console.log(`   Review Stage: ${currentStage}`);
      console.log(`   Review Target Field Type: ${reviewTargetField?.type || 'unknown'}`);
      console.log(`   Review Target Value: ${JSON.stringify(reviewTargetField)}`);
      
      // 检查分数
      const d1Score = props['D1 Score']?.number || 0;
      const d3Score = props['D3 Score']?.number || 0;
      const d7Score = props['D7 Score']?.number || 0;
      const d14Score = props['D14 Score']?.number || 0;
      const d30Score = props['D30 Score']?.number || 0;
      
      console.log(`   Scores: D1=${d1Score}, D3=${d3Score}, D7=${d7Score}, D14=${d14Score}, D30=${d30Score}`);
      
      // 分析为什么没有更新
      if (currentStage) {
        const scoreMap = {
          'D1': d1Score,
          'D3': d3Score,
          'D7': d7Score,
          'D14': d14Score,
          'D30': d30Score
        };
        
        const currentScore = scoreMap[currentStage];
        console.log(`   Current Stage Score: ${currentScore}`);
        
        if (currentScore >= 70) {
          console.log(`   ✅ Score >= 70, should advance`);
        } else {
          console.log(`   ❌ Score < 70, will not advance`);
        }
      }
      
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugScriptExecution();
