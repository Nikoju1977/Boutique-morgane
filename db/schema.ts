import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
export const siteSettings = sqliteTable('site_settings', {
  id: integer('id').primaryKey(),
  content: text('content').notNull(),
  revision: integer('revision').notNull().default(0),
  updatedAt: text('updated_at').notNull(),
});
