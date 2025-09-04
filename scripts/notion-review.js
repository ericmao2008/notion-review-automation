#!/usr/bin/env node

import { Client } from '@notionhq/client';
import { DateTime } from 'luxon';

// 配置常量
const TZ = "Australia/Brisbane";
const DEFAULT_HOUR = 9;

// 从环境变量获取配置
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const DRY_RUN = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';

// 字段映射常量 - 匹配标准数据库结构
const FIELDS = {
  date: "Date",
  stage: "Review Stage", 
  nextReview: "Next Review Date",
  lastReview: "Last Review Date",
  reviewedToday: "Reviewed Today",
  nudgeCount: "Nudge Count",
  lastNudgeAt: "Last Nudge At",
  scoreD1: "D1 Score",
  scoreD3: "D3 Score", 
  scoreD7: "D7 Score",
  scoreD14: "D14 Score",
  scoreD30: "D30 Score"
};

// 阶段推进规则映射
const RULES = {
  D1:  { scoreProp: FIELDS.scoreD1,  nextStage: "D3",  days: 3  },
  D3:  { scoreProp: FIELDS.scoreD3,  nextStage: "D7",  days: 7  },
  D7:  { scoreProp: FIELDS.scoreD7,  nextStage: "D14", days: 14 },
  D14: { scoreProp: FIELDS.scoreD14, nextStage: "D30", days: 30 }
};

// 初始化 Notion 客户端
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

/**
 * 获取选择字段的值
 */
function getSelectValue(page, prop) {
  const property = page.properties[prop];
  if (!property || property.type !== 'select') {
    return null;
  }
  return property.select?.name || null;
}

/**
 * 获取数字字段的值
 */
function getNumber(page, prop) {
  const property = page.properties[prop];
  if (!property || property.type !== 'number') {
    return null;
  }
  return property.number;
}

/**
 * 获取日期字段的值
 */
function getDate(page, prop) {
  const property = page.properties[prop];
  if (!property || property.type !== 'date') {
    return null;
  }
  return property.date?.start || null;
}

/**
 * 获取复选框字段的值
 */
function getCheckbox(page, prop) {
  const property = page.properties[prop];
  if (!property || property.type !== 'checkbox') {
    return null;
  }
  return property.checkbox || false;
}

/**
 * 将基础日期加上指定天数，返回ISO格式（含时区）
 * @param {string} baseISO - 基础日期的ISO字符串
 * @param {number} daysToAdd - 要添加的天数
 * @param {boolean} keepHourFromBase - 是否保持基础日期的小时，否则使用DEFAULT_HOUR
 * @returns {string} 新的ISO日期字符串
 */
function toLocalDateISO(baseISO, daysToAdd, keepHourFromBase = false) {
  if (!baseISO) return null;
  
  let baseDate = DateTime.fromISO(baseISO, { zone: TZ });
  
  if (!baseDate.isValid) {
    console.warn(`Invalid base date: ${baseISO}`);
    return null;
  }
  
  // 添加天数
  let newDate = baseDate.plus({ days: daysToAdd });
  
  // 设置时间
  if (keepHourFromBase) {
    // 保持原时间
    newDate = newDate.set({
      hour: baseDate.hour,
      minute: baseDate.minute,
      second: baseDate.second
    });
  } else {
    // 使用默认时间
    newDate = newDate.set({
      hour: DEFAULT_HOUR,
      minute: 0,
      second: 0
    });
  }
  
  return newDate.toISO();
}

/**
 * 日志输出函数
 */
function log(level, message, ...args) {
  const levels = { error: 0, warn: 1, info: 2, debug: 3 };
  const currentLevel = levels[LOG_LEVEL] || levels.info;
  
  if (levels[level] <= currentLevel) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, ...args);
  }
}

/**
 * 更新页面属性
 */
async function updatePage(pageId, payload) {
  if (DRY_RUN) {
    log('info', `[DRY RUN] Would update page ${pageId}:`, JSON.stringify(payload, null, 2));
    return true;
  }
  
  try {
    await notion.pages.update({
      page_id: pageId,
      properties: payload
    });
    return true;
  } catch (error) {
    log('error', `Failed to update page ${pageId}:`, error.message);
    return false;
  }
}

/**
 * 处理单个页面
 */
async function processPage(page) {
  const pageId = page.id;
  const pageTitle = page.properties.Name?.title?.[0]?.plain_text || pageId;
  
  try {
    // 获取基础日期
    const baseDate = getDate(page, FIELDS.date);
    if (!baseDate) {
      log('warn', `⏭️  Skipping page "${pageTitle}" - missing Date field`);
      return { status: 'skipped', reason: 'missing_date' };
    }
    
    // 获取当前阶段
    const currentStage = getSelectValue(page, FIELDS.stage);
    
    // 获取今天的日期（用于Last Review Date）
    const today = DateTime.now().setZone(TZ).set({
      hour: DEFAULT_HOUR,
      minute: 0,
      second: 0
    }).toISO();
    
    let updatePayload = {};
    let action = 'no_change';
    
    if (!currentStage) {
      // 初始化：设置为D1阶段
      updatePayload[FIELDS.stage] = {
        select: { name: "D1" }
      };
      
      const nextReviewDate = toLocalDateISO(baseDate, 1);
      if (nextReviewDate) {
        updatePayload[FIELDS.nextReview] = {
          date: { start: nextReviewDate }
        };
      }
      
      // 如果存在Last Review Date字段，写入今天
      if (page.properties[FIELDS.lastReview]) {
        updatePayload[FIELDS.lastReview] = {
          date: { start: today }
        };
      }
      
      action = 'initialized';
      
    } else if (currentStage === 'D30') {
      // D30是终点，不需要进一步操作
      log('debug', `D30 stage reached for "${pageTitle}" - no further action needed`);
      action = 'no_change';
      
    } else if (RULES[currentStage]) {
      // 检查当前阶段分数
      const rule = RULES[currentStage];
      const score = getNumber(page, rule.scoreProp);
      
      if (score !== null && score >= 70) {
        // 推进到下一阶段
        updatePayload[FIELDS.stage] = {
          select: { name: rule.nextStage }
        };
        
        const nextReviewDate = toLocalDateISO(baseDate, rule.days);
        if (nextReviewDate) {
          updatePayload[FIELDS.nextReview] = {
            date: { start: nextReviewDate }
          };
        }
        
        // 写入Last Review Date
        if (page.properties[FIELDS.lastReview]) {
          updatePayload[FIELDS.lastReview] = {
            date: { start: today }
          };
        }
        
        action = 'advanced';
        
      } else {
        // 分数不足，不需要操作
        log('debug', `Score insufficient for "${pageTitle}" (${score} < 70) - no action needed`);
        action = 'no_change';
      }
    }
    
    // 执行更新
    if (Object.keys(updatePayload).length > 0) {
      const success = await updatePage(pageId, updatePayload);
      if (success) {
        log('info', `✅ ${action.toUpperCase()}: "${pageTitle}" (${currentStage || 'null'} → ${updatePayload[FIELDS.stage]?.select?.name || currentStage})`);
        return { status: 'updated', action };
      } else {
        return { status: 'error', reason: 'update_failed' };
      }
    } else {
      log('debug', `⏸️  No change: "${pageTitle}" (${currentStage})`);
      return { status: 'no_change' };
    }
    
  } catch (error) {
    log('error', `❌ Error processing page "${pageTitle}":`, error.message);
    return { status: 'error', reason: error.message };
  }
}

/**
 * 遍历数据库所有页面
 */
async function iterateDatabase(databaseId) {
  const results = {
    total: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    actions: {
      initialized: 0,
      advanced: 0,
      no_change: 0
    }
  };
  
  let hasMore = true;
  let startCursor = undefined;
  
  while (hasMore) {
    try {
      const response = await notion.databases.query({
        database_id: databaseId,
        start_cursor: startCursor,
        page_size: 100
      });
      
      for (const page of response.results) {
        results.total++;
        const result = await processPage(page);
        
        if (result.status === 'updated') {
          results.updated++;
          results.actions[result.action]++;
        } else if (result.status === 'skipped') {
          results.skipped++;
        } else if (result.status === 'error') {
          results.errors++;
        } else {
          results.actions.no_change++;
        }
      }
      
      hasMore = response.has_more;
      startCursor = response.next_cursor;
      
    } catch (error) {
      console.error('Error querying database:', error.message);
      break;
    }
  }
  
  return results;
}

/**
 * 主函数
 */
async function main() {
  log('info', '🚀 Starting Notion Review Automation...');
  log('info', `📅 Timezone: ${TZ}`);
  log('info', `⏰ Default hour: ${DEFAULT_HOUR}:00`);
  log('info', `📊 Log level: ${LOG_LEVEL}`);
  log('info', `🧪 Dry run mode: ${DRY_RUN ? 'ENABLED' : 'DISABLED'}`);
  log('info', '');
  
  // 检查环境变量
  if (!process.env.NOTION_TOKEN) {
    log('error', '❌ NOTION_TOKEN environment variable is required');
    process.exit(1);
  }
  
  if (!process.env.NOTION_DATABASE_ID) {
    log('error', '❌ NOTION_DATABASE_ID environment variable is required');
    process.exit(1);
  }
  
  try {
    const results = await iterateDatabase(process.env.NOTION_DATABASE_ID);
    
    log('info', '');
    log('info', '📊 Summary:');
    log('info', `   Total pages processed: ${results.total}`);
    log('info', `   Pages updated: ${results.updated}`);
    log('info', `   Pages skipped: ${results.skipped}`);
    log('info', `   Errors: ${results.errors}`);
    log('info', '');
    log('info', '📈 Actions breakdown:');
    log('info', `   Initialized (D1): ${results.actions.initialized}`);
    log('info', `   Advanced stages: ${results.actions.advanced}`);
    log('info', `   No changes: ${results.actions.no_change}`);
    
    if (results.errors > 0) {
      log('warn', '');
      log('warn', '⚠️  Some errors occurred. Check the logs above for details.');
      process.exit(1);
    }
    
    log('info', '');
    log('info', '✅ Automation completed successfully!');
    
  } catch (error) {
    log('error', '❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// 运行主函数
main();
