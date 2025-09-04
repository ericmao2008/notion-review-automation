#!/usr/bin/env node

import { Client } from '@notionhq/client';
import { maybeAdvanceByScore } from './notion-review.js';
import { validateDatabaseSchema } from './validation.js';
import { FIELD } from './schema.js';

// 从环境变量获取配置
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const DRY_RUN = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';

function log(level: string, message: string, ...args: any[]) {
  const levels = { error: 0, warn: 1, info: 2, debug: 3 };
  const currentLevel = levels[LOG_LEVEL as keyof typeof levels] || levels.info;
  
  if (levels[level as keyof typeof levels] <= currentLevel) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, ...args);
  }
}

async function scanAndAdvancePages() {
  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
    log('error', '❌ NOTION_TOKEN and NOTION_DATABASE_ID environment variables are required');
    process.exit(1);
  }

  const notion = new Client({ auth: NOTION_TOKEN });
  const todayISO = new Date().toISOString().slice(0, 10);
  
  log('info', '🚀 Starting score-based advancement scan...');
  log('info', `📅 Today: ${todayISO}`);
  log('info', `📊 Log level: ${LOG_LEVEL}`);
  log('info', `🧪 Dry run mode: ${DRY_RUN ? 'ENABLED' : 'DISABLED'}`);
  log('info', '');

  try {
    // 验证数据库结构
    await validateDatabaseSchema(notion, NOTION_DATABASE_ID);
    log('info', '');

    // 查询所有未完成的页面
    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      filter: {
        property: FIELD.stage,
        select: {
          does_not_equal: 'Done'
        }
      },
      page_size: 100
    });

    log('info', `📄 Found ${response.results.length} pages to check`);
    log('info', '');

    const results = {
      total: 0,
      advanced: 0,
      skipped: 0,
      errors: 0
    };

    // 处理每个页面
    for (const page of response.results) {
      results.total++;
      const pageTitle = (page as any).properties?.[FIELD.title]?.title?.[0]?.plain_text || page.id;
      
      try {
        if (DRY_RUN) {
          log('info', `[DRY RUN] Would check page: "${pageTitle}"`);
          continue;
        }

        const result = await maybeAdvanceByScore(notion, page, todayISO);
        
        if (result.advanced) {
          results.advanced++;
          log('info', `✅ ADVANCED: "${pageTitle}" (${result.to}, score: ${result.score})`);
        } else {
          results.skipped++;
          log('debug', `⏸️  SKIPPED: "${pageTitle}" - ${result.reason}`);
        }
        
      } catch (error) {
        results.errors++;
        log('error', `❌ ERROR: "${pageTitle}" - ${(error as Error).message}`);
      }
    }

    // 输出统计
    log('info', '');
    log('info', '📊 Summary:');
    log('info', `   Total pages checked: ${results.total}`);
    log('info', `   Pages advanced: ${results.advanced}`);
    log('info', `   Pages skipped: ${results.skipped}`);
    log('info', `   Errors: ${results.errors}`);
    
    if (results.errors > 0) {
      log('warn', '');
      log('warn', '⚠️  Some errors occurred. Check the logs above for details.');
      process.exit(1);
    }
    
    log('info', '');
    log('info', '✅ Score-based advancement completed successfully!');
    
  } catch (error) {
    log('error', '❌ Fatal error:', (error as Error).message);
    process.exit(1);
  }
}

// 运行主函数
scanAndAdvancePages();
