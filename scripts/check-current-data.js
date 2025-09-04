#!/usr/bin/env node

import { Client } from '@notionhq/client';

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
  console.error('❌ Please set NOTION_TOKEN and NOTION_DATABASE_ID environment variables');
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });

async function checkCurrentData() {
  try {
    console.log('🔍 Checking current Notion database data...\n');
    
    // 获取数据库结构
    const database = await notion.databases.retrieve({
      database_id: NOTION_DATABASE_ID
    });
    
    console.log('📋 Database Properties:');
    Object.keys(database.properties).forEach(propName => {
      const prop = database.properties[propName];
      console.log(`   ${propName}: ${prop.type}`);
    });
    console.log('');
    
    // 查询所有页面
    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      page_size: 100
    });
    
    console.log(`📄 Found ${response.results.length} pages:\n`);
    
    response.results.forEach((page, index) => {
      const props = page.properties;
      const title = props['Name']?.title?.[0]?.plain_text || 'Untitled';
      const stage = props['Review Stage']?.select?.name || 'Unknown';
      const reviewTarget = props['Review Target'];
      const d1Score = props['D1 Score']?.number || 0;
      const d3Score = props['D3 Score']?.number || 0;
      const d7Score = props['D7 Score']?.number || 0;
      const d14Score = props['D14 Score']?.number || 0;
      const d30Score = props['D30 Score']?.number || 0;
      
      console.log(`📄 Page ${index + 1}: ${title}`);
      console.log(`   Review Stage: ${stage}`);
      console.log(`   Review Target: ${JSON.stringify(reviewTarget)}`);
      console.log(`   Scores: D1=${d1Score}, D3=${d3Score}, D7=${d7Score}, D14=${d14Score}, D30=${d30Score}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  }
}

checkCurrentData();
