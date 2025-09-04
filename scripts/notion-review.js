#!/usr/bin/env node

import { Client } from '@notionhq/client';
import { DateTime } from 'luxon';

// 配置常量
const TZ = "Australia/Brisbane";
const DEFAULT_HOUR = 9;

// 字段映射常量 - 集中管理所有 Notion 属性名
const FIELDS = {
  date: "Date",
  stage: "Review Stage", 
  nextReview: "Next Review Date",
  calendarDate: "Calendar Date",
  lastReview: "Last Review Date",
  scoreD1: "#D1 Score",
  scoreD3: "#D3 Score", 
  scoreD7: "#D7 Score",
  scoreD14: "#D14 Score"
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
 * 更新页面属性
 */
async function updatePage(pageId, payload) {
  try {
    await notion.pages.update({
      page_id: pageId,
      properties: payload
    });
    return true;
  } catch (error) {
    console.error(`Failed to update page ${pageId}:`, error.message);
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
      console.log(`⏭️  Skipping page "${pageTitle}" - missing Date field`);
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
        updatePayload[FIELDS.calendarDate] = {
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
      // D30是终点，只同步Calendar Date
      const nextReviewDate = getDate(page, FIELDS.nextReview);
      if (nextReviewDate) {
        updatePayload[FIELDS.calendarDate] = {
          date: { start: nextReviewDate }
        };
        action = 'synced_calendar';
      }
      
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
          updatePayload[FIELDS.calendarDate] = {
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
        // 分数不足，只同步Calendar Date
        const nextReviewDate = getDate(page, FIELDS.nextReview);
        if (nextReviewDate) {
          updatePayload[FIELDS.calendarDate] = {
            date: { start: nextReviewDate }
          };
          action = 'synced_calendar';
        }
      }
    }
    
    // 执行更新
    if (Object.keys(updatePayload).length > 0) {
      const success = await updatePage(pageId, updatePayload);
      if (success) {
        console.log(`✅ ${action.toUpperCase()}: "${pageTitle}" (${currentStage || 'null'} → ${updatePayload[FIELDS.stage]?.select?.name || currentStage})`);
        return { status: 'updated', action };
      } else {
        return { status: 'error', reason: 'update_failed' };
      }
    } else {
      console.log(`⏸️  No change: "${pageTitle}" (${currentStage})`);
      return { status: 'no_change' };
    }
    
  } catch (error) {
    console.error(`❌ Error processing page "${pageTitle}":`, error.message);
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
      synced_calendar: 0,
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
  console.log('🚀 Starting Notion Review Automation...');
  console.log(`📅 Timezone: ${TZ}`);
  console.log(`⏰ Default hour: ${DEFAULT_HOUR}:00`);
  console.log('');
  
  // 检查环境变量
  if (!process.env.NOTION_TOKEN) {
    console.error('❌ NOTION_TOKEN environment variable is required');
    process.exit(1);
  }
  
  if (!process.env.NOTION_DATABASE_ID) {
    console.error('❌ NOTION_DATABASE_ID environment variable is required');
    process.exit(1);
  }
  
  try {
    const results = await iterateDatabase(process.env.NOTION_DATABASE_ID);
    
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Total pages processed: ${results.total}`);
    console.log(`   Pages updated: ${results.updated}`);
    console.log(`   Pages skipped: ${results.skipped}`);
    console.log(`   Errors: ${results.errors}`);
    console.log('');
    console.log('📈 Actions breakdown:');
    console.log(`   Initialized (D1): ${results.actions.initialized}`);
    console.log(`   Advanced stages: ${results.actions.advanced}`);
    console.log(`   Synced calendar: ${results.actions.synced_calendar}`);
    console.log(`   No changes: ${results.actions.no_change}`);
    
    if (results.errors > 0) {
      console.log('');
      console.log('⚠️  Some errors occurred. Check the logs above for details.');
      process.exit(1);
    }
    
    console.log('');
    console.log('✅ Automation completed successfully!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// 运行主函数
main();
