import { Client } from '@notionhq/client';
import { FIELD } from './schema.js';

export async function assertPropType(notion: Client, dbId: string, name: string, type: string) {
  const db: any = await notion.databases.retrieve({ database_id: dbId });
  const prop = db.properties[name];
  if (!prop) throw new Error(`Property "${name}" not found.`);
  if (prop.type !== type) throw new Error(`Property "${name}" must be ${type}, got ${prop.type}.`);
}

export async function validateDatabaseSchema(notion: Client, databaseId: string) {
  console.log('🔍 Validating database schema...');
  
  // 断言关键字段存在且类型正确
  await assertPropType(notion, databaseId, FIELD.next, 'date');
  await assertPropType(notion, databaseId, FIELD.stage, 'select');
  await assertPropType(notion, databaseId, FIELD.status, 'select');
  await assertPropType(notion, databaseId, FIELD.lastReview, 'date');
  await assertPropType(notion, databaseId, FIELD.date, 'date');
  
  // 验证分数字段
  for (const [stage, fieldName] of Object.entries(FIELD.score)) {
    await assertPropType(notion, databaseId, fieldName, 'number');
  }
  
  console.log('✅ Database schema validation passed');
}
