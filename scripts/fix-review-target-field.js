#!/usr/bin/env node

import { Client } from '@notionhq/client';

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
  console.error('❌ Please set NOTION_TOKEN and NOTION_DATABASE_ID environment variables');
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });

async function fixReviewTargetField() {
  try {
    console.log('🔍 Checking and fixing Review Target field...\n');
    
    // 获取数据库信息
    const database = await notion.databases.retrieve({
      database_id: NOTION_DATABASE_ID
    });
    
    const reviewTargetProp = database.properties['Review Target'];
    
    if (!reviewTargetProp) {
      console.error('❌ Review Target field not found in database');
      return;
    }
    
    console.log('📋 Current Review Target Field:');
    console.log(`   Type: ${reviewTargetProp.type}`);
    
    if (reviewTargetProp.type === 'select') {
      console.log('   Current Options:');
      reviewTargetProp.select.options.forEach(option => {
        console.log(`     - ${option.name} (${option.color})`);
      });
      
      // 检查是否包含所有需要的选项
      const requiredOptions = ['能理解', '能表达', '语法对', '能沟通', '熟练掌握', '已完成'];
      const currentOptions = reviewTargetProp.select.options.map(opt => opt.name);
      
      console.log('\n🔍 Checking required options...');
      const missingOptions = requiredOptions.filter(opt => !currentOptions.includes(opt));
      
      if (missingOptions.length > 0) {
        console.log('❌ Missing options:', missingOptions);
        console.log('📝 Please manually add these options to the Review Target field in Notion:');
        missingOptions.forEach(opt => {
          console.log(`   - ${opt}`);
        });
      } else {
        console.log('✅ All required options are present');
      }
      
    } else if (reviewTargetProp.type === 'formula') {
      console.log('⚠️  Review Target is a Formula field');
      console.log('   This means the script cannot update it directly');
      console.log('   Consider changing it to a Select field for script updates');
      
    } else if (reviewTargetProp.type === 'rich_text') {
      console.log('✅ Review Target is Rich Text - script can update it');
      
    } else {
      console.log(`⚠️  Unexpected field type: ${reviewTargetProp.type}`);
    }
    
    console.log('\n📋 Expected Review Target values:');
    console.log('   D1 → "能理解"');
    console.log('   D3 → "能表达"'); 
    console.log('   D7 → "语法对"');
    console.log('   D14 → "能沟通"');
    console.log('   D30 → "熟练掌握"');
    console.log('   Done → "已完成"');
    
    console.log('\n✅ Field check completed!');
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  }
}

fixReviewTargetField();
