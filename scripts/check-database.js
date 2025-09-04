#!/usr/bin/env node

import { Client } from '@notionhq/client';

// 从环境变量获取配置
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

async function checkDatabase() {
  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
    log('❌ NOTION_TOKEN and NOTION_DATABASE_ID environment variables are required');
    process.exit(1);
  }

  const notion = new Client({ auth: NOTION_TOKEN });

  try {
    log('🔍 Checking database schema...');
    
    const db = await notion.databases.retrieve({ database_id: NOTION_DATABASE_ID });
    
    log('📋 Database properties:');
    for (const [name, prop] of Object.entries(db.properties)) {
      log(`   ${name}: ${prop.type}`);
      if (prop.type === 'select' && prop.select?.options) {
        const options = prop.select.options.map(opt => opt.name).join(', ');
        log(`     Options: ${options}`);
      }
    }
    
    log('✅ Database schema check completed');
    
  } catch (error) {
    log(`❌ Error checking database: ${error.message}`);
    process.exit(1);
  }
}

// 运行检查
checkDatabase();
