#!/usr/bin/env node

import { Client } from '@notionhq/client';

// 从环境变量获取配置
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

// 解析命令行参数
const args = process.argv.slice(2);
const pageId = args.find(arg => arg.startsWith('--page='))?.split('=')[1];
const field = args.find(arg => arg.startsWith('--field='))?.split('=')[1];
const value = args.find(arg => arg.startsWith('--value='))?.split('=')[1];

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

async function updateScore() {
  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
    log('❌ NOTION_TOKEN and NOTION_DATABASE_ID environment variables are required');
    process.exit(1);
  }

  if (!pageId || !field || !value) {
    log('❌ Usage: node update-score.js --page=<page_id> --field=<field_name> --value=<value>');
    log('   Example: node update-score.js --page=262e666e-cf2c-81be-b501-ee168d3cfb90 --field="D3 Score" --value=75');
    process.exit(1);
  }

  const notion = new Client({ auth: NOTION_TOKEN });

  try {
    log(`🔄 Updating ${field} to ${value} for page ${pageId}...`);
    
    const properties = {};
    if (field.includes('Score')) {
      properties[field] = { number: parseFloat(value) };
    } else if (field === 'Review Stage') {
      properties[field] = { select: { name: value } };
    } else if (field === 'Status') {
      properties[field] = { select: { name: value } };
    } else if (field === 'Review Target') {
      properties[field] = { rich_text: [{ text: { content: value } }] };
    }

    await notion.pages.update({
      page_id: pageId,
      properties: properties
    });

    log(`✅ Successfully updated ${field} to ${value}`);
    
  } catch (error) {
    log(`❌ Error updating page: ${error.message}`);
    process.exit(1);
  }
}

// 运行更新
updateScore();
