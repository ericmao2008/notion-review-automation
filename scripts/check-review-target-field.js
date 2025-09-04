#!/usr/bin/env node

import { Client } from '@notionhq/client';

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
  console.error('❌ Please set NOTION_TOKEN and NOTION_DATABASE_ID environment variables');
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });

async function checkReviewTargetField() {
  try {
    console.log('🔍 Checking Review Target field configuration...\n');
    
    const database = await notion.databases.retrieve({
      database_id: NOTION_DATABASE_ID
    });
    
    const reviewTargetProp = database.properties['Review Target'];
    
    if (!reviewTargetProp) {
      console.error('❌ Review Target field not found in database');
      return;
    }
    
    console.log('📋 Review Target Field Configuration:');
    console.log(`   Type: ${reviewTargetProp.type}`);
    
    if (reviewTargetProp.type === 'select') {
      console.log('   Options:');
      reviewTargetProp.select.options.forEach(option => {
        console.log(`     - ${option.name} (${option.color})`);
      });
    } else if (reviewTargetProp.type === 'formula') {
      console.log(`   Formula: ${reviewTargetProp.formula.expression}`);
    } else if (reviewTargetProp.type === 'rich_text') {
      console.log('   Type: Rich Text (can accept any text)');
    }
    
    console.log('\n✅ Field check completed!');
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  }
}

checkReviewTargetField();
