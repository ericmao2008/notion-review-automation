import { Client } from '@notionhq/client';
export declare function assertPropType(notion: Client, dbId: string, name: string, type: string): Promise<void>;
export declare function validateDatabaseSchema(notion: Client, databaseId: string): Promise<void>;
